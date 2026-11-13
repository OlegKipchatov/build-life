import { useState } from "react";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { Button } from "@heroui/react";
import { useStore } from "../store";
import { useUI } from "../ui";
import {
  formatDate,
  taskCount,
  canComplete,
  completeMilestone,
  milestoneProgress,
  moveStep,
  orderedSteps,
  removeStep,
  setStep,
  stateOf,
  type Milestone,
  type Step,
} from "../model";
import {
  Header,
  Action,
  Empty,
  Progress,
  Filters,
  EntityMenu,
  Menu,
} from "../components/Common";
import { Icon } from "../components/Icon";
import { TaskRow } from "./Tasks";
import s from "../App.module.css";
export const Milestones = () => {
  const { data, ui } = useStore();
  const { open } = useUI();
  const [view, setView] = useState("active");
  const list = data.milestones.filter((m) => stateOf(m) === view);
  return (
    <>
      <Header title={ui("Вехи", "Milestones")}>
        <Action
          label={ui("Новая веха", "New milestone")}
          onPress={() => open({ kind: "entity", type: "milestone" })}
        />
      </Header>
      <Filters
        value={view}
        onChange={setView}
        items={[
          ["active", ui("Активные", "Active")],
          ["completed", ui("Достигнутые", "Achieved")],
          ["archived", ui("Архив", "Archive")],
        ]}
      />
      <div className={s.goals}>
        {list.map((m) => {
          const p = milestoneProgress(m);
          return (
            <Link
              key={m.id}
              to="/milestones/$id"
              params={{ id: m.id }}
              className={`${s.goal} ${m.status === "completed" ? s.achieved : ""}`}
            >
              <div className={s.goalTop}>
                <span className={s.symbol} data-color={m.color || "green"}>
                  <Icon
                    name={
                      m.status === "completed" ? "trophy" : m.icon || "target"
                    }
                  />
                </span>
                <div>
                  <h2>{m.name}</h2>
                  {m.targetDate && (
                    <small>{formatDate(m.targetDate, data.language)}</small>
                  )}
                  {m.status === "completed" && (
                    <small>{ui("Достижение", "Achievement")}</small>
                  )}
                </div>
                <Icon name="chevron" />
              </div>
              {p.total > 0 ? (
                <>
                  <Progress
                    value={p.percent}
                    label={ui("Прогресс вехи", "Milestone progress")}
                  />
                  <div className={s.progressCaption}>
                    <span>
                      {p.completed} {ui("из", "of")} {p.total}{" "}
                      {ui("шагов", "steps")}
                    </span>
                    <strong>{p.percent}%</strong>
                  </div>
                </>
              ) : (
                <small>{ui("Добавь первый шаг", "Add your first step")}</small>
              )}
            </Link>
          );
        })}
      </div>
      {!list.length && (
        <Empty>{ui("Здесь пока нет вех", "No milestones here yet")}</Empty>
      )}
    </>
  );
};
const StepItem = ({ step, m }: { step: Step; m: Milestone }) => {
  const { data, update, ui } = useStore();
  const { open } = useUI();
  const [expanded, setExpanded] = useState(false);
  const tasks = data.tasks.filter(
    (t) => t.milestone === m.id && t.stepId === step.id,
  );
  const locked = m.status === "archived";
  const ordered = orderedSteps(m),
    index = ordered.findIndex((x) => x.id === step.id);
  const edit = (action: (milestone: Milestone) => void) =>
    update((d) => {
      const target = d.milestones.find((x) => x.id === m.id);
      if (target) action(target);
    });
  return (
    <div className={s.step}>
      <div className={`${s.stepTop} ${step.completed ? s.done : ""}`}>
        <Button
          className={s.check}
          variant="tertiary"
          isIconOnly
          isDisabled={locked}
          aria-pressed={step.completed}
          aria-label={
            step.completed
              ? ui("Открыть шаг заново", "Reopen step")
              : ui("Выполнить шаг", "Complete step")
          }
          onPress={() =>
            edit((target) => {
              setStep(target, step.id, !step.completed);
            })
          }
        >
          {step.completed ? <Icon name="check" /> : <span />}
        </Button>
        <button
          className={s.stepTitle}
          aria-expanded={expanded}
          onClick={() => setExpanded(!expanded)}
        >
          <strong>{step.name}</strong>
          <small>{taskCount(tasks.length, data.language)}</small>
        </button>
        <Button
          isIconOnly
          variant="tertiary"
          aria-label={
            expanded
              ? ui("Свернуть задачи", "Collapse tasks")
              : ui("Развернуть задачи", "Expand tasks")
          }
          aria-expanded={expanded}
          onPress={() => setExpanded(!expanded)}
        >
          <Icon name={expanded ? "up" : "down"} />
        </Button>
        {!locked && (
          <Menu
            items={[
              {
                label: ui("Изменить", "Edit"),
                icon: "edit",
                action: () =>
                  open({ kind: "step", milestone: m.id, id: step.id }),
              },
              ...(index > 0
                ? [
                    {
                      label: ui("Выше", "Move up"),
                      icon: "up",
                      action: () =>
                        edit((target) => {
                          moveStep(target, step.id, -1);
                        }),
                    },
                  ]
                : []),
              ...(index < ordered.length - 1
                ? [
                    {
                      label: ui("Ниже", "Move down"),
                      icon: "down",
                      action: () =>
                        edit((target) => {
                          moveStep(target, step.id, 1);
                        }),
                    },
                  ]
                : []),
              {
                label: ui("Удалить", "Delete"),
                icon: "trash",
                danger: true,
                action: () =>
                  open({
                    kind: "confirm",
                    title: ui("Удалить шаг?", "Delete step?"),
                    message: ui(
                      "Связанные задачи сохранятся.",
                      "Linked tasks will be kept.",
                    ),
                    action: () =>
                      update((d) => {
                        const goal = d.milestones.find((x) => x.id === m.id);
                        if (goal) removeStep(d, goal, step.id);
                      }),
                  }),
              },
            ]}
          />
        )}
      </div>
      {expanded && (
        <div className={s.stepTasks}>
          {tasks.map((t) => (
            <TaskRow key={t.id} task={t} inGoal />
          ))}
          {!locked && (
            <Button
              variant="tertiary"
              className={s.inlineAdd}
              onPress={() =>
                open({ kind: "task", milestone: m.id, step: step.id })
              }
            >
              <Icon name="plus" />
              {ui("Добавить задачу", "Add task")}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
export const MilestoneDetail = () => {
  const { id } = useParams({ from: "/milestones/$id" });
  const navigate = useNavigate();
  const { data, update, ui } = useStore();
  const { open } = useUI();
  const [celebrate, setCelebrate] = useState(false);
  const m = data.milestones.find((x) => x.id === id);
  if (!m)
    return (
      <>
        <Header
          title={ui("Веха не найдена", "Milestone not found")}
          back={() => navigate({ to: "/milestones" })}
        />
        <Empty>
          {ui(
            "Веха могла быть удалена.",
            "This milestone may have been deleted.",
          )}
        </Empty>
      </>
    );
  const p = milestoneProgress(m);
  return (
    <>
      <Header title={m.name} back={() => navigate({ to: "/milestones" })}>
        <EntityMenu type="milestone" entity={m} />
      </Header>
      {(m.description || m.targetDate || m.status === "archived" || m.status === "completed") && <div className={s.goalIntro}>
        <div>
          {m.description && <p>{m.description}</p>}
          {m.targetDate && (
            <small>
              {ui("Цель к", "Target date")}{" "}
              {formatDate(m.targetDate, data.language)}
            </small>
          )}
          {m.status === "archived" && (
            <small>{ui("В архиве", "Archived")}</small>
          )}
          {m.status === "completed" && (
            <small>
              {ui("Достигнута", "Achieved")}
              {m.completedAt
                ? " · " +
                  new Date(m.completedAt).toLocaleDateString(data.language)
                : ""}
            </small>
          )}
        </div>
      </div>}
      <section className={s.panel}>
        <div className={s.progressCaption}>
          <h2>{ui("Прогресс", "Progress")}</h2>
          {p.total > 0 && <strong>{p.percent}%</strong>}
        </div>
        {p.total > 0 ? (
          <>
            <Progress
              value={p.percent}
              label={ui("Прогресс вехи", "Milestone progress")}
            />
            <p className={s.muted}>
              {p.completed} {ui("из", "of")} {p.total}{" "}
              {ui("шагов выполнено", "steps complete")}
            </p>
          </>
        ) : (
          <p className={s.muted}>
            {ui(
              "Добавь первый шаг к цели",
              "Add your first step toward the goal",
            )}
          </p>
        )}
      </section>
      {canComplete(m) && (
        <section className={s.ready}>
          <Icon name="trophy" />
          <div>
            <strong>{ui("Все шаги выполнены!", "All steps complete!")}</strong>
            <p>
              {ui(
                "Можно зафиксировать достижение.",
                "You can now record your achievement.",
              )}
            </p>
          </div>
          <Button
            onPress={() => {
              let completed = false;
              const saved = update((d) => {
                const target = d.milestones.find((x) => x.id === id);
                if (target) completed = completeMilestone(target);
              });
              if (saved && completed) setCelebrate(true);
            }}
          >
            {ui("Завершить веху", "Complete milestone")}
          </Button>
        </section>
      )}
      {celebrate && m.status === "completed" && (
        <div role="status" className={s.achievement}>
          <Icon name="trophy" />
          {ui("Достижение зафиксировано!", "Achievement recorded!")}
        </div>
      )}
      <section className={s.stepsSection}>
        <h2>
          {ui("Шаги", "Steps")} <span className={s.counter}>{p.total}</span>
        </h2>
        {orderedSteps(m).map((step) => (
          <StepItem key={step.id} m={m} step={step} />
        ))}
        {!m.steps.length && (
          <Empty>
            {ui(
              "Разбей цель на конкретные результаты.",
              "Break your goal into concrete outcomes.",
            )}
          </Empty>
        )}
      </section>
      {data.tasks.some((t) => t.milestone === m.id && !t.stepId) && (
        <section className={s.panel}>
          <h2>{ui("Задачи без шага", "Tasks without a step")}</h2>
          {data.tasks
            .filter((t) => t.milestone === m.id && !t.stepId)
            .map((t) => (
              <TaskRow key={t.id} task={t} inGoal />
            ))}
        </section>
      )}
      {m.status !== "archived" && (
        <div className={s.fabAnchor}>
          <Menu
            fab
            label={ui("Добавить шаг или задачу", "Add step or task")}
            items={[
              {
                label: ui("Новый шаг", "New step"),
                icon: "milestones",
                action: () => open({ kind: "step", milestone: m.id }),
              },
              {
                label: ui("Новая задача", "New task"),
                icon: "tasks",
                action: () => open({ kind: "task", milestone: m.id }),
              },
            ]}
          />
        </div>
      )}
    </>
  );
};
