import { createContext, useContext, useState, type ReactNode } from "react";
import type { EntityType } from "./model";
export type Screen =
  | { kind: "task"; id?: string; milestone?: string; step?: string }
  | { kind: "entity"; type: Exclude<EntityType, "task">; id?: string }
  | { kind: "step"; milestone: string; id?: string }
  | { kind: "manager" }
  | { kind: "skill"; id: string }
  | { kind: "confirm"; title: string; message: string; action: () => boolean };
const Context = createContext<{
  screen: Screen | null;
  open: (s: Screen) => void;
  close: () => void;
  back: () => void;
} | null>(null);
export const UIProvider = ({ children }: { children: ReactNode }) => {
  const [stack, setStack] = useState<Screen[]>([]);
  return (
    <Context
      value={{
        screen: stack.at(-1) || null,
        open: (s) => setStack((v) => [...v, s]),
        close: () => setStack([]),
        back: () => setStack((v) => v.slice(0, -1)),
      }}
    >
      {children}
    </Context>
  );
};
export const useUI = () => {
  const c = useContext(Context);
  if (!c) throw new Error("Missing UIProvider");
  return c;
};
