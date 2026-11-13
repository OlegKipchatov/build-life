import { useState, type ReactNode } from "react";
import { Button } from "@heroui/react";
import { Header } from "../components/Common";
import { Field, Choice } from "../components/Fields";
import { useUI } from "../ui";
import { Icon } from "../components/Icon";
import { useStore } from "../store";
import type { Data } from "../model";
import s from "../App.module.css";
export const NameForm = ({ onSaved, actions }: { onSaved?: () => void; actions?: ReactNode }) => {
  const { data, update, ui } = useStore();
  const [name, setName] = useState(data.name);
  const [saved, setSaved] = useState(false);
  return (
    <form
      id="editor-form"
      className={s.form}
      onSubmit={(e) => {
        e.preventDefault();
        if (name.trim()) {
          const success = update((d) => { d.name = name.trim(); });
          setSaved(success);
          if (success) onSaved?.();
        }
      }}
    >
      <Field
        label={ui("Имя персонажа", "Character name")}
        value={name}
        onChange={(v) => {
          setName(v);
          setSaved(false);
        }}
        maxLength={40}
        required
      />
      {actions || <Button type="submit">{ui("Сохранить имя", "Save name")}</Button>}
      {saved && (
        <small role="status">{ui("Имя сохранено", "Name saved")}</small>
      )}
    </form>
  );
};
export const NameSetting = () => {
  const { data, ui } = useStore();
  const { open } = useUI();
  return <button className={s.nameSetting} onClick={() => open({ kind: "name" })}>
    <span><small>{ui("Имя персонажа", "Character name")}</small><strong>{data.name}</strong></span>
    <Icon name="edit" />
  </button>;
};
export const Settings = () => {
  const { data, update, ui } = useStore();
  return (
    <>
      <Header title={ui("Настройки", "Settings")} />
      <section className={s.panel}>
        <NameSetting />
      </section>
      <section className={`${s.panel} ${s.form}`}>
        <Choice
          label={ui("Тема приложения", "App theme")}
          value={data.theme}
          onChange={(theme) =>
            update((d) => {
              d.theme = theme as Data["theme"];
            })
          }
          options={[
            ["system", ui("Системная", "System")],
            ["light", ui("Светлая", "Light")],
            ["dark", ui("Тёмная", "Dark")],
          ]}
        />
        <Choice
          label={ui("Язык", "Language")}
          value={data.language}
          onChange={(language) =>
            update((d) => {
              d.language = language as Data["language"];
            })
          }
          options={[
            ["ru", "Русский"],
            ["en", "English"],
          ]}
        />
      </section>
      <p className={s.muted}>
        {ui(
          "Данные хранятся в этом браузере и не синхронизируются между устройствами.",
          "Data is stored in this browser and is not synced across devices.",
        )}
      </p>
    </>
  );
};
