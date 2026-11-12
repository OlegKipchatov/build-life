import { Button, Dropdown } from "@heroui/react";
import type { ReactNode } from "react";
import { Icon } from "./Icon";
import { useStore } from "../store";
import { useUI } from "../ui";
import {
  archiveEntity,
  collection,
  removeEntity,
  type EntityType,
  type Entity,
  progression,
} from "../model";
import s from "../App.module.css";
export const Action = ({
  icon = "plus",
  label,
  onPress,
}: {
  icon?: string;
  label: string;
  onPress: () => void;
}) => (
  <Button className={s.headerAction} aria-label={label} onPress={onPress}>
    <Icon name={icon} />
    <span>{label}</span>
  </Button>
);
export const Header = ({
  title,
  children,
  back,
}: {
  title: string;
  children?: ReactNode;
  back?: () => void;
}) => (
  <header className={`${s.header} ${back ? s.detailHeader : ""}`}>
    {back && (
      <Button
        variant="secondary"
        isIconOnly
        aria-label="Назад / Back"
        onPress={back}
      >
        <Icon name="back" />
      </Button>
    )}
    <h1>{title}</h1>
    {children}
  </header>
);
export const Progress = ({
  value,
  label = "XP",
}: {
  value: number | null;
  label?: string;
}) => (
  <div
    className={s.bar}
    role={value === null ? undefined : "progressbar"}
    aria-label={label}
    aria-valuemin={0}
    aria-valuemax={100}
    aria-valuenow={value ?? undefined}
  >
    <span style={{ width: `${Math.min(100, Math.max(0, value || 0))}%` }} />
  </div>
);
export const EntityLevel = ({ entity }: { entity: Entity }) => {
  const { ui } = useStore();
  const p = progression(entity);
  return (
    <span className={s.level}>
      {p ? `${ui("Ур.", "Lv.")} ${p.level}` : "—"}
    </span>
  );
};
export const Empty = ({ children }: { children: ReactNode }) => (
  <p className={s.empty}>{children}</p>
);
export const Menu = ({
  items,
  label,
  fab = false,
}: {
  items: {
    label: string;
    icon: string;
    action: () => void;
    danger?: boolean;
  }[];
  label?: string;
  fab?: boolean;
}) => {
  const { ui } = useStore();
  return (
    <Dropdown>
      <Dropdown.Trigger
        className={fab ? s.fab : s.more}
        aria-label={label || ui("Действия", "Actions")}
      >
        <Icon name={fab ? "plus" : "more"} />
      </Dropdown.Trigger>
      <Dropdown.Popover placement={fab ? "top end" : "bottom end"}>
        <Dropdown.Menu aria-label={label || ui("Действия", "Actions")}>
          {items.map((item, i) => (
            <Dropdown.Item
              key={i}
              id={String(i)}
              textValue={item.label}
              className={item.danger ? s.danger : ""}
              onAction={item.action}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
};
export const EntityMenu = ({
  type,
  entity,
}: {
  type: EntityType;
  entity: Entity;
}) => {
  const { update, ui } = useStore();
  const { open } = useUI();
  const items = [
    {
      label: ui("Изменить", "Edit"),
      icon: "edit",
      action: () =>
        open(
          type === "task"
            ? { kind: "task", id: entity.id }
            : { kind: "entity", type, id: entity.id },
        ),
    },
    {
      label:
        entity.status === "archived"
          ? ui("Восстановить", "Restore")
          : ui("Заархивировать", "Archive"),
      icon: entity.status === "archived" ? "restore" : "archive",
      action: () =>
        update((d) => {
          const e = d[collection[type]].find((x) => x.id === entity.id);
          if (e) archiveEntity(e, type);
        }),
    },
  ];
  if (type === "skill" && entity.status !== "archived")
    items.splice(1, 0, {
      label:
        entity.status === "completed"
          ? ui("Вернуть в активные", "Reopen")
          : ui("Завершить", "Complete"),
      icon: "check",
      action: () =>
        update((d) => {
          const e = d.skills.find((x) => x.id === entity.id);
          if (e) e.status = e.status === "completed" ? "active" : "completed";
        }),
    });
  return (
    <Menu
      items={[
        ...items,
        {
          label: ui("Удалить", "Delete"),
          icon: "trash",
          danger: true,
          action: () =>
            open({
              kind: "confirm",
              title: ui("Удалить запись?", "Delete item?"),
              message: entity.name,
              action: () => update((d) => removeEntity(d, type, entity.id)),
            }),
        },
      ]}
    />
  );
};
export const Filters = ({
  value,
  onChange,
  items,
}: {
  value: string;
  onChange: (v: string) => void;
  items: [string, string][];
}) => (
  <div className={s.filters}>
    {items.map(([id, label]) => (
      <Button
        key={id}
        variant={value === id ? "primary" : "tertiary"}
        size="sm"
        aria-pressed={value === id}
        onPress={() => onChange(id)}
      >
        {label}
      </Button>
    ))}
  </div>
);
