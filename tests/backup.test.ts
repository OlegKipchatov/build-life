import { describe, it, expect } from "vitest";
import { parseBackup, serializeBackup, restoreData } from "../src/backup";
import { freshData } from "../src/model";
describe("Резервная копия", () => {
  it("сохраняет профиль, связи, иконки и историю", () => {
    const data = freshData();
    data.xp = 120;
    data.skills.push({ id: "s", name: "Код", icon: "code", xp: 120, attributes: ["a"], status: "completed" });
    data.attributes.push({ id: "a", name: "Интеллект", xp: 100 });
    data.tasks.push({ id: "t", name: "Практика", repeat: "weekly", days: [1,3], difficulty: "hard", skill: "s", completions: ["2026-11-16"] });
    expect(parseBackup(serializeBackup(data))).toEqual(data);
  });
  it("принимает старую веху без шагов", () => {
    const data = { ...freshData(), milestones: [{ id: "m", name: "Цель", status: "completed" }] };
    expect(parseBackup(JSON.stringify(data)).milestones[0]).toMatchObject({ status: "completed", steps: [] });
  });
  it.each([
    { tasks: null },
    { xp: -1 },
    { language: "xx" },
    { startedAt: "2026-02-30" },
    { tasks: [{ id: "t", name: "Test", repeat: "weekly", difficulty: "easy", days: [7] }] },
    { skills: [{ id: "s", name: "A" }, { id: "s", name: "B" }] },
    { milestones: [{ id: "m", name: "A", steps: [null] }] },
  ])("отклоняет повреждённые данные %j", patch => {
    expect(() => parseBackup(JSON.stringify({ ...freshData(), ...patch }))).toThrow();
  });
  it("не принимает будущую версию", () => {
    expect(() => parseBackup(JSON.stringify({ app: "BuildLife", version: 2, data: freshData() }))).toThrow();
  });
  it("оставляет исходную копию перед восстановлением", () => {
    const values = new Map([["buildlife-v1", '{"name":"Старый"}']]);
    restoreData({ getItem: key => values.get(key) ?? null, setItem: (key, value) => { values.set(key, value); } }, freshData());
    expect(values.get("buildlife-before-import")).toBe('{"name":"Старый"}');
  });
  it("не заменяет исходные данные, если резервирование не удалось", () => {
    const values = new Map([["buildlife-v1", "original"]]);
    try { restoreData({ getItem: key => values.get(key) ?? null, setItem: () => { throw new Error("quota"); } }, freshData()); } catch {}
    expect(values.get("buildlife-v1")).toBe("original");
  });
});
