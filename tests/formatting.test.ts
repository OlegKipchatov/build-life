import { expect, test } from "vitest";
import { formatDate, taskCount } from "../src/model";
test.each([
  [0, "0 задач"],
  [1, "1 задача"],
  [2, "2 задачи"],
  [5, "5 задач"],
  [11, "11 задач"],
  [21, "21 задача"],
])("Склонение счётчика %s", (count, expected) => {
  expect(taskCount(count, "ru")).toBe(expected);
});
test("Английский счётчик использует единственное число", () => {
  expect(taskCount(1, "en")).toBe("1 task");
});
test("Дата отображается в русской локали", () => {
  expect(formatDate("2027-03-01", "ru")).toBe(
    new Intl.DateTimeFormat("ru", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(2027, 2, 1, 12)),
  );
});
