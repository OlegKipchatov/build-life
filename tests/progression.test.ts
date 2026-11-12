import { expect, test } from "vitest";
import {
  freshData,
  toggleTask,
  dateKey,
  addStep,
  linkTask,
  milestoneProgress,
  archiveEntity,
  due,
  progression,
  migrate,
  removeEntity,
  type Task,
} from "../src/model";
import { persistData, readData } from "../src/store";
const fixture = () => {
  const d = freshData();
  d.attributes.push({ id: "a", name: "Интеллект", xp: 0, icon: "brain" });
  d.skills.push({
    id: "s",
    name: "Код",
    xp: 90,
    attributes: ["a"],
    icon: "code",
  });
  d.tasks.push({
    id: "t",
    name: "Задача",
    difficulty: "easy",
    repeat: "once",
    skill: "s",
  });
  return d;
};
test("Task activity advances skill and linked attribute at level boundary", () => {
  const d = fixture();
  toggleTask(d, "t");
  expect([d.xp, d.skills[0].xp, d.attributes[0].xp]).toEqual([10, 100, 100]);
});
test("Reopening reverses the same XP and skill-level contribution", () => {
  const d = fixture();
  toggleTask(d, "t");
  toggleTask(d, "t");
  expect([d.xp, d.skills[0].xp, d.attributes[0].xp]).toEqual([0, 90, 0]);
});
test("Recurring linked task retains history without completing its step", () => {
  const d = fixture();
  d.milestones.push({ id: "m", name: "Goal", steps: [] });
  addStep(d.milestones[0], "step", "Result");
  const t = d.tasks[0];
  t.repeat = "daily";
  t.completions = ["2020-01-01"];
  linkTask(d, t, "m", "step");
  toggleTask(d, t.id);
  expect(t.completions).toEqual(["2020-01-01", dateKey()]);
  expect(milestoneProgress(d.milestones[0]).percent).toBe(0);
  toggleTask(d, t.id);
  expect(t.completions).toEqual(["2020-01-01"]);
});
test("Completed milestone archive/restore retains achievement", () => {
  const m = {
    id: "m",
    name: "Goal",
    status: "completed" as const,
    completedAt: "old",
  };
  archiveEntity(m, "milestone");
  archiveEntity(m, "milestone");
  expect(m.status).toBe("completed");
  expect(m.completedAt).toBe("old");
});
test("Completed one-time task restores without awarding XP again", () => {
  const d = fixture();
  toggleTask(d, "t");
  archiveEntity(d.tasks[0], "task");
  archiveEntity(d.tasks[0], "task");
  expect(d.tasks[0].status).toBe("done");
  expect(d.xp).toBe(10);
});
test("Half-year recurrence clamps dates to the target month", () => {
  const t = {
    id: "t",
    name: "T",
    repeat: "half",
    difficulty: "easy",
    date: "2026-08-31",
  } as Task;
  expect(due(t, "2027-02-28")).toBe(true);
  expect(due(t, "2027-02-27")).toBe(false);
});
test("Persistence preserves selected icons and unknown legacy fields", () => {
  let value = "";
  const storage = {
    setItem: (_k: string, v: string) => {
      value = v;
    },
    getItem: () => value,
  };
  const d = fixture();
  d.legacy = { value: 42 };
  persistData(storage, d);
  expect(readData(storage)).toEqual(d);
});
test("Missing progression differs from zero XP", () => {
  expect(progression({ id: "a", name: "A" })).toBeNull();
  expect(progression({ id: "a", name: "A", xp: 0 })).toEqual({
    level: 1,
    current: 0,
  });
});
test("Removing an attribute clears links but preserves skill progress", () => {
  const d = fixture();
  removeEntity(d, "attribute", "a");
  expect(d.skills[0].attributes).toEqual([]);
  expect(d.skills[0].xp).toBe(90);
});
test("Migration of legacy icons and records is idempotent", () => {
  const d = migrate({
    tasks: [],
    milestones: [{ id: "m", name: "Old", status: "completed" }],
    attributes: [{ id: "a", name: "A", icon: "brain", xp: 25 }],
  });
  expect(migrate(JSON.parse(JSON.stringify(d)))).toEqual(d);
  expect(d.milestones[0].status).toBe("completed");
});
test("Storage failures propagate without pretending to save", () => {
  expect(() =>
    persistData(
      {
        setItem: () => {
          throw new Error("full");
        },
      },
      freshData(),
    ),
  ).toThrow("full");
  expect(() => readData({ getItem: () => "{invalid" })).toThrow();
});
