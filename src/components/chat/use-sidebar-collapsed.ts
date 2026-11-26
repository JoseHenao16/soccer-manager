"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

const KEY = "pizarra:sidebar-collapsed";
const EVENT = "pizarra:sidebar-collapsed";

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange); // otras pestañas
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

const read = () => {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
};

/**
 * Estado "historial contraído" en escritorio, persistido en localStorage.
 * useSyncExternalStore evita el desajuste de hidratación: en el servidor siempre
 * vale false y en el cliente lee la preferencia guardada.
 * Atajo de teclado: Ctrl/Cmd + B.
 */
export function useSidebarCollapsed() {
  const collapsed = useSyncExternalStore(subscribe, read, () => false);

  const setCollapsed = useCallback((value: boolean) => {
    try {
      localStorage.setItem(KEY, value ? "1" : "0");
    } catch {
      /* modo privado sin storage: solo se pierde la persistencia */
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);

  const toggle = useCallback(() => setCollapsed(!read()), [setCollapsed]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b" && !e.altKey && !e.shiftKey) {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle]);

  return { collapsed, toggle };
}
