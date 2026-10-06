import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

// Unidades seleccionadas para armar una propuesta (persisten en el navegador).
const KEY = "vos:selection";
const MAX = 6;
type Selection = { ids: string[]; toggle: (id: string) => void; clear: () => void; has: (id: string) => boolean; full: boolean };
const SelectionContext = createContext<Selection>({ ids: [], toggle: () => {}, clear: () => {}, has: () => false, full: false });

function read(): string[] {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]") as string[]; } catch { return []; }
}

export function SelectionProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>(read);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(ids)); } catch { /* sin almacenamiento */ } }, [ids]);
  const value: Selection = {
    ids,
    toggle: (id) => setIds((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : cur.length >= MAX ? cur : [...cur, id])),
    clear: () => setIds([]),
    has: (id) => ids.includes(id),
    full: ids.length >= MAX,
  };
  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>;
}

export const useSelection = () => useContext(SelectionContext);
