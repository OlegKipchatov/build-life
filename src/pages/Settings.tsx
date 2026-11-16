import { useState, type ReactNode } from "react";
import { Button } from "@heroui/react";
import { Header } from "../components/Common";
import { Field, Choice } from "../components/Fields";
import { useUI, useDraftProtection } from "../ui";
import { Icon } from "../components/Icon";
import { useStore } from "../store";
import type { Data } from "../model";
import { parseBackup, serializeBackup } from "../backup";
import { dateKey } from "../model";
import s from "../App.module.css";
export const NameForm = ({ onSaved, actions }: { onSaved?: () => void; actions?: ReactNode }) => {
  const { data, update, ui } = useStore();
  const [name, setName] = useState(data.name);
  useDraftProtection(name);
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
      <BackupSettings />
      <p className={s.muted}>
        {ui(
          "Данные хранятся в этом браузере и не синхронизируются между устройствами.",
          "Data is stored in this browser and is not synced across devices.",
        )}
      </p>
    </>
  );
};

const BackupSettings = () => {
  const { data, restore, ui } = useStore();
  const [candidate, setCandidate] = useState<Data | null>(null);
  const [message, setMessage] = useState("");
  const read = (text: string) => {
    try { setCandidate(parseBackup(text)); setMessage(""); }
    catch { setCandidate(null); setMessage(ui("Не удалось прочитать копию. Проверь формат и версию файла. Данные не изменены.", "Invalid or unsupported backup. No data was changed.")); }
  };
  return <section className={s.panel}>
    <h2>{ui("Резервная копия", "Backup")}</h2>
    <p className={s.muted}>{ui("Сохрани копию для переноса на другое устройство или восстановления.", "Save a copy to transfer or restore your progress.")}</p>
    <Button variant="secondary" onPress={() => {
      const url = URL.createObjectURL(new Blob([serializeBackup(data)], { type: "application/json" }));
      const a = document.createElement("a"); a.href = url; a.download = "buildlife-" + dateKey() + ".json"; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }}>{ui("Скачать копию", "Download backup")}</Button>
    <p><label>{ui("Восстановить из файла", "Restore from file")}<input className={s.backupInput} type="file" accept=".json,application/json" onChange={async e => {
      const file = e.target.files?.[0]; e.target.value = ""; if (!file) return;
      if (file.size > 10 * 1024 * 1024) { setMessage(ui("Файл слишком большой", "File is too large")); return; }
      try { read(await file.text()); } catch { setMessage(ui("Не удалось открыть файл", "Could not open file")); }
    }} /></label></p>
    <Button variant="tertiary" onPress={() => {
      const previous = localStorage.getItem("buildlife-before-import");
      if (previous) read(previous); else setMessage(ui("Предыдущей копии пока нет", "No previous backup yet"));
    }}>{ui("Вернуться к данным до импорта", "Restore pre-import data")}</Button>
    {candidate && <div className={s.unsaved}>
      <strong>{candidate.name} · {candidate.xp} XP</strong>
      <p>{candidate.tasks.length} {ui("задач", "tasks")} · {candidate.milestones.length} {ui("вех", "milestones")} · {candidate.skills.length} {ui("навыков", "skills")} · {candidate.attributes.length} {ui("характеристик", "attributes")}</p>
      <p>{ui("Текущие данные будут заменены. Перед заменой сохраним копию для возврата.", "Current data will be replaced. A recovery copy is saved first.")}</p>
      <Button onPress={() => { if (restore(candidate)) { setCandidate(null); setMessage(ui("Данные восстановлены", "Data restored")); } }}>{ui("Заменить данные и восстановить", "Replace and restore")}</Button>
      <Button variant="secondary" onPress={() => setCandidate(null)}>{ui("Отмена", "Cancel")}</Button>
    </div>}
    {message && <p role="status">{message}</p>}
  </section>;
};
