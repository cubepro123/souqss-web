import { useEffect, useState } from "react";

const KEY = "souqss:data-saver";
const EVT = "souqss:data-saver-change";

export function getDataSaver(): boolean {
  if (typeof window === "undefined") return false;
  try { return localStorage.getItem(KEY) === "1"; } catch { return false; }
}

export function setDataSaver(on: boolean) {
  try { localStorage.setItem(KEY, on ? "1" : "0"); } catch {}
  window.dispatchEvent(new CustomEvent(EVT, { detail: on }));
}

export function useDataSaver(): [boolean, (on: boolean) => void] {
  const [on, setOn] = useState<boolean>(() => getDataSaver());
  useEffect(() => {
    const handler = (e: Event) => setOn(Boolean((e as CustomEvent).detail));
    const storage = (e: StorageEvent) => { if (e.key === KEY) setOn(e.newValue === "1"); };
    window.addEventListener(EVT, handler);
    window.addEventListener("storage", storage);
    return () => {
      window.removeEventListener(EVT, handler);
      window.removeEventListener("storage", storage);
    };
  }, []);
  return [on, setDataSaver];
}