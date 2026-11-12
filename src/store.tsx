import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { migrate, freshData, type Data } from "./model";
export const STORAGE_KEY = "buildlife-v1";
export const readData = (storage: Pick<Storage, "getItem">): Data =>
  migrate(JSON.parse(storage.getItem(STORAGE_KEY) || "null"));
export const persistData = (storage: Pick<Storage, "setItem">, data: Data) =>
  storage.setItem(STORAGE_KEY, JSON.stringify(data));
type Store = {
  data: Data;
  update: (recipe: (data: Data) => void) => boolean;
  error: string;
  ui: (ru: string, en: string) => string;
};
const Context = createContext<Store | null>(null);
export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [error, setError] = useState("");
  const [data, setData] = useState(() => {
    try {
      return readData(localStorage);
    } catch {
      return freshData();
    }
  });
  const [blocked] = useState(() => {
    try {
      readData(localStorage);
      return false;
    } catch {
      return true;
    }
  });
  const [holder] = useState(() => ({ current: data }));
  const update = useCallback(
    (recipe: (data: Data) => void) => {
      if (blocked) {
        setError(
          "Не удалось прочитать сохранённые данные. Они не перезаписаны.",
        );
        return false;
      }
      const next = structuredClone(holder.current);
      recipe(next);
      try {
        persistData(localStorage, next);
        holder.current = next;
        setData(next);
        setError("");
        return true;
      } catch {
        setError(
          "Не удалось сохранить изменения. Проверь доступ к хранилищу и свободное место.",
        );
        return false;
      }
    },
    [blocked, holder],
  );
  useEffect(() => {
    if (blocked)
      setError("Сохранённые данные недоступны. Они не перезаписаны.");
    else update(() => {});
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        try {
          const next = readData(localStorage);
          holder.current = next;
          setData(next);
        } catch {
          setError("Не удалось обновить данные из другой вкладки.");
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [blocked, holder, update]);
  useEffect(() => {
    const query = matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      document.documentElement.dataset.theme =
        data.theme === "system"
          ? query.matches
            ? "dark"
            : "light"
          : data.theme;
      document.documentElement.classList.toggle(
        "dark",
        document.documentElement.dataset.theme === "dark",
      );
      document.documentElement.lang = data.language;
    };
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, [data.theme, data.language]);
  return (
    <Context
      value={{
        data,
        update,
        error,
        ui: (ru, en) => (data.language === "en" ? en : ru),
      }}
    >
      {children}
    </Context>
  );
};
export const useStore = () => {
  const c = useContext(Context);
  if (!c) throw new Error("Missing StoreProvider");
  return c;
};
