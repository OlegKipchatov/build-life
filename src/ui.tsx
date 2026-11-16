import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react";
import type { EntityType } from "./model";
export type Screen =
  | { kind: "task"; id?: string; milestone?: string; step?: string; date?: string; skill?: string }
  | { kind: "entity"; type: Exclude<EntityType, "task">; id?: string }
  | { kind: "step"; milestone: string; id?: string }
  | { kind: "manager" }
  | { kind: "name" }
  | { kind: "skill"; id: string }
  | { kind: "confirm"; title: string; message: string; label?: string; danger?: boolean; action: () => boolean };
const Context = createContext<{
  screen: Screen | null;
  depth: number;
  finish: () => void;
  setDirty: (v: boolean) => void;
  pendingClose: boolean;
  cancelClose: () => void;
  discard: () => void;
  managerTab: string;
  setManagerTab: (v: string) => void;
  managerView: string;
  setManagerView: (v: string) => void;
  expandedSteps: string[];
  setExpandedSteps: (v: string[]) => void;
  open: (s: Screen) => void;
  close: () => void;
  back: () => void;
} | null>(null);
export const UIProvider = ({ children }: { children: ReactNode }) => {
  const [stack, setStack] = useState<Screen[]>([]);
  const [dirty, setDirty] = useState(false);
  const [pending, setPending] = useState<"back" | "close" | null>(null);
  const [managerTab, setManagerTab] = useState("attribute");
  const [managerView, setManagerView] = useState("active");
  const [expandedSteps, setExpandedSteps] = useState<string[]>([]);
  const finish = () => { setDirty(false); setPending(null); setStack(v => v.slice(0, -1)); };
  const leave = (all: boolean) => {
    if (dirty) setPending(all ? "close" : "back");
    else { setPending(null); setStack(v => all ? [] : v.slice(0, -1)); }
  };
  useEffect(() => {
    if (!dirty) return;
    const guard = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [dirty]);
  return (
    <Context
      value={{
        screen: stack.at(-1) || null,
        depth: stack.length, finish, setDirty, pendingClose: !!pending,
        cancelClose: () => setPending(null),
        discard: () => { setStack(v => pending === "close" ? [] : v.slice(0, -1)); setDirty(false); setPending(null); },
        managerTab, setManagerTab, managerView, setManagerView, expandedSteps, setExpandedSteps,
        open: (s) => { setDirty(false); setStack((v) => [...v, s]); },
        close: () => leave(true),
        back: () => leave(false),
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

export const useDraftProtection = (value: unknown) => {
  const serialized = JSON.stringify(value);
  const initial = useRef(serialized);
  const { setDirty } = useUI();
  useEffect(() => { setDirty(serialized !== initial.current); }, [serialized, setDirty]);
  useEffect(() => () => setDirty(false), [setDirty]);
};
