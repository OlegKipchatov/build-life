import { useState } from "react";
import { Button } from "@heroui/react";
import { useStore } from "../store";
import { useUI } from "../ui";
import {
  formatDate,
  dateKey,
  done,
  due,
  toggleTask,
  xpValue,
  type Task,
} from "../model";
import {
  Header,
  Action,
  Empty,
  EntityMenu,
  Filters,
} from "../components/Common";
import { Icon } from "../components/Icon";
import s from "../App.module.css";
export const TaskRow = ({
  task,
  date = dateKey(),
  inGoal = false,
}: {
  task: Task;
  date?: string;
  inGoal?: boolean;
}) => {
  const { data, update, ui } = useStore();
  const checked =
    task.repeat === "once" && inGoal
      ? task.status === "done" || (task.status === "archived" && task.wasDone)
      : done(task, date);
  const milestone = data.milestones.find((m) => m.id === task.milestone);
  return (
    <div className={`${s.task} ${checked ? s.done : ""}`}>
      <Button
        variant="tertiary"
        className={s.check}
        isIconOnly
        aria-label={
          checked
            ? ui("Отменить выполнение", "Undo completion")
            : ui("Выполнить задачу", "Complete task")
        }
        aria-pressed={!!checked}
        isDisabled={task.status === "archived" || date !== dateKey()}
        onPress={() =>
          update((d) => {
            toggleTask(d, task.id, date);
          })
        }
      >
        {checked ? <Icon name="check" /> : <span />}
      </Button>
      <div className={s.taskText}>
        <strong>{task.name}</strong>
        <small>
          {milestone?.name || ui("Без вехи", "No milestone")} ·{" "}
          {ui(
            {
              once: "Один раз",
              daily: "Ежедневно",
              weekly: "По дням недели",
              half: "Раз в полгода",
              year: "Раз в год",
            }[task.repeat],
            {
              once: "One time",
              daily: "Daily",
              weekly: "Weekly",
              half: "Every six months",
              year: "Yearly",
            }[task.repeat],
          )}
          {task.date ? ` · ${formatDate(task.date, data.language)}` : ""}
        </small>
        <span className={s.xp}>+{xpValue(task)} XP</span>
      </div>
      <EntityMenu type="task" entity={task} />
    </div>
  );
};
export const Tasks = () => {
  const { data, ui } = useStore();
  const { open } = useUI();
  const [date, setDate] = useState(dateKey());
  const [offset, setOffset] = useState(0);
  const [filter, setFilter] = useState("active");
  const start = new Date(dateKey() + "T12:00:00");
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7) + offset * 7);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
  const list = data.tasks.filter((t) => due(t, date));
  const library = data.tasks.filter((t) =>
    filter === "archived"
      ? t.status === "archived"
      : filter === "done"
        ? t.status !== "archived" &&
          (t.repeat === "once" ? t.status === "done" : done(t))
        : t.status !== "archived" &&
          !(t.repeat === "once" && t.status === "done"),
  );
  const week = (delta: number) => {
    setOffset(offset + delta);
    const d = new Date(start);
    d.setDate(d.getDate() + delta * 7);
    setDate(dateKey(d));
  };
  const locale = data.language === "en" ? "en-US" : "ru-RU";
  return (
    <>
      <Header title={ui("Задачи", "Tasks")}>
        <Action
          label={ui("Новая задача", "New task")}
          onPress={() => open({ kind: "task" })}
        />
      </Header>
      <section className={s.panel}>
        <h2>
          {date === dateKey()
            ? ui("Задачи на сегодня", "Tasks for today")
            : new Intl.DateTimeFormat(locale, {
                day: "numeric",
                month: "long",
              }).format(new Date(date + "T12:00:00"))}
          <span className={s.counter}>
            {list.filter((t) => done(t, date)).length} / {list.length}
          </span>
        </h2>
        <div className={s.calendar}>
          <Button
            isIconOnly
            variant="tertiary"
            aria-label={ui("Предыдущая неделя", "Previous week")}
            onPress={() => week(-1)}
          >
            <Icon name="back" />
          </Button>
          {days.map((d) => (
            <Button
              key={dateKey(d)}
              className={s.day}
              variant={dateKey(d) === date ? "primary" : "tertiary"}
              aria-pressed={dateKey(d) === date}
              aria-label={new Intl.DateTimeFormat(locale, {
                dateStyle: "full",
              }).format(d)}
              onPress={() => setDate(dateKey(d))}
            >
              <small>
                {new Intl.DateTimeFormat(locale, { weekday: "short" }).format(
                  d,
                )}
              </small>
              <strong>{d.getDate()}</strong>
            </Button>
          ))}
          <Button
            isIconOnly
            variant="tertiary"
            aria-label={ui("Следующая неделя", "Next week")}
            onPress={() => week(1)}
          >
            <Icon name="chevron" />
          </Button>
        </div>
        {list.length ? (
          list.map((t) => <TaskRow key={t.id} task={t} date={date} />)
        ) : (
          <Empty>{ui("Задач на этот день нет", "No tasks for this day")}</Empty>
        )}
      </section>
      <section className={s.panel}>
        <h2>{ui("Все задачи", "All tasks")}</h2>
        <Filters
          value={filter}
          onChange={setFilter}
          items={[
            ["active", ui("В работе", "In progress")],
            ["done", ui("Выполнено", "Done")],
            ["archived", ui("В архиве", "Archived")],
          ]}
        />
        {library.length ? (
          library.map((t) => <TaskRow key={t.id} task={t} inGoal />)
        ) : (
          <Empty>{ui("Здесь пока пусто", "Nothing here yet")}</Empty>
        )}
      </section>
    </>
  );
};
