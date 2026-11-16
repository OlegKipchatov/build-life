import { migrate, type Data } from "./model";

const record = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const validDate = (v: unknown) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && Number.isFinite(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v;
export const serializeBackup = (data: Data) => JSON.stringify({ app: "BuildLife", version: 1, exportedAt: new Date().toISOString(), data }, null, 2);
export const parseBackup = (text: string): Data => {
  const root: unknown = JSON.parse(text);
  if (!record(root)) throw new Error("Неверный формат файла");
  if (root.app !== undefined && (root.app !== "BuildLife" || root.version !== 1)) throw new Error("Неподдерживаемая версия копии");
  const value = root.app ? root.data : root;
  if (!record(value) || typeof value.name !== "string" || !value.name.trim() || typeof value.xp !== "number" || !Number.isFinite(value.xp) || value.xp < 0) throw new Error("Повреждён профиль");
  if (value.startedAt && !validDate(value.startedAt)) throw new Error("Неверная дата начала");
  if (value.theme !== undefined && !["system", "light", "dark"].includes(String(value.theme))) throw new Error("Неверная тема");
  if (value.language !== undefined && !["ru", "en"].includes(String(value.language))) throw new Error("Неверный язык");
  for (const key of ["tasks", "milestones", "skills", "attributes"]) {
    const list = value[key];
    if (!Array.isArray(list)) throw new Error("В копии отсутствуют коллекции");
    const ids = new Set<string>();
    for (const e of list) {
      if (!record(e) || typeof e.id !== "string" || !e.id || ids.has(e.id) || typeof e.name !== "string") throw new Error("Повреждена запись");
      ids.add(e.id);
      if (e.xp !== undefined && (typeof e.xp !== "number" || !Number.isFinite(e.xp) || e.xp < 0)) throw new Error("Неверное значение XP");
      for (const status of [e.status, e.statusBeforeArchive]) if (status !== undefined && !["active", "done", "completed", "archived"].includes(String(status))) throw new Error("Неверный статус");
      for (const field of ["icon", "attribute", "skill", "milestone", "stepId", "description", "color"]) if (e[field] !== undefined && typeof e[field] !== "string") throw new Error("Неверное поле записи");
      if (e.attributes !== undefined && (!Array.isArray(e.attributes) || !e.attributes.every(x => typeof x === "string"))) throw new Error("Неверные связи");
      for (const field of ["date", "targetDate", "completedDate"]) if (e[field] && !validDate(e[field])) throw new Error("Неверная дата");
      if (key === "tasks") {
        if (!["once", "daily", "weekly", "half", "year"].includes(String(e.repeat)) || !["easy", "medium", "hard"].includes(String(e.difficulty))) throw new Error("Неверное расписание задачи");
        if (e.days !== undefined && (!Array.isArray(e.days) || !e.days.every(x => Number.isInteger(x) && x >= 0 && x <= 6))) throw new Error("Неверные дни недели");
        if (e.completions !== undefined && (!Array.isArray(e.completions) || !e.completions.every(validDate))) throw new Error("Неверная история выполнения");
      }
      if (key === "milestones" && e.steps !== undefined) {
        if (!Array.isArray(e.steps)) throw new Error("Неверные шаги");
        const steps = new Set<string>();
        for (const step of e.steps) {
          if (!record(step) || typeof (step.name ?? step.title) !== "string" || (step.completed !== undefined && typeof step.completed !== "boolean")) throw new Error("Повреждён шаг");
          if (step.id !== undefined) {
            if (typeof step.id !== "string" || !step.id || steps.has(step.id)) throw new Error("Неверный идентификатор шага");
            steps.add(step.id);
          }
        }
      }
    }
  }
  return migrate(structuredClone(value));
};
export const restoreData = (storage: Pick<Storage, "getItem" | "setItem">, data: Data) => {
  const previous = storage.getItem("buildlife-v1");
  if (previous !== null) storage.setItem("buildlife-before-import", previous);
  storage.setItem("buildlife-v1", JSON.stringify(data));
};
