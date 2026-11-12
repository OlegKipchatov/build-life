import {
  Input,
  Label,
  TextField,
  TextArea,
  Select,
  ListBox,
  FieldError,
} from "@heroui/react";
import { createContext, useContext, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useStore } from "../store";
export const FooterTarget = createContext<HTMLDivElement | null>(null);
import s from "../App.module.css";
export const Field = ({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  maxLength = 120,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: "text" | "date";
  required?: boolean;
  maxLength?: number;
}) => (
  <TextField
    className={s.field}
    isRequired={required}
    type={type}
    value={value}
    onChange={onChange}
  >
    <Label>{label}</Label>
    <Input className={s.input} maxLength={maxLength} />
    <FieldError />
  </TextField>
);
export const Area = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) => (
  <TextField className={s.field} value={value} onChange={onChange}>
    <Label>{label}</Label>
    <TextArea className={s.input} rows={3} maxLength={600} />
  </TextField>
);
export const Choice = ({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) => (
  <Select
    className={s.field}
    value={value}
    onChange={(v) => onChange(String(v ?? ""))}
  >
    <Label>{label}</Label>
    <Select.Trigger className={s.input}>
      <Select.Value />
      <Select.Indicator />
    </Select.Trigger>
    <Select.Popover>
      <ListBox>
        {options.map(([id, text]) => (
          <ListBox.Item key={id} id={id} textValue={text}>
            {text}
            <ListBox.ItemIndicator />
          </ListBox.Item>
        ))}
      </ListBox>
    </Select.Popover>
  </Select>
);
export const MultiChoice = ({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
  options: [string, string][];
}) => {
  const { ui } = useStore();
  return (
    <Select
      placeholder={ui("Выберите характеристики", "Select attributes")}
      selectionMode="multiple"
      className={s.field}
      value={value}
      onChange={(v) => onChange(v.map(String))}
    >
      <Label>{label}</Label>
      <Select.Trigger className={s.input}>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <ListBox>
          {options.map(([id, text]) => (
            <ListBox.Item key={id} id={id} textValue={text}>
              {text}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
};
export const FormActions = ({ children }: { children: ReactNode }) => {
  const target = useContext(FooterTarget);
  const actions = <div className={s.formActions}>{children}</div>;
  return target ? createPortal(actions, target) : actions;
};
