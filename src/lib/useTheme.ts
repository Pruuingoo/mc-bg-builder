"use client";

import { useEffect, useState } from "react";

type Theme = "dark" | "light";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const saved = localStorage.getItem("mc-bg-theme") as Theme | null;
    if (saved) {
      applyTheme(saved);
    } else {
      const pref = window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark";
      applyTheme(pref);
    }
  }, []);

  function applyTheme(t: Theme) {
    setTheme(t);
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem("mc-bg-theme", t);
  }

  function toggle() {
    applyTheme(theme === "dark" ? "light" : "dark");
  }

  return { theme, toggle };
}
