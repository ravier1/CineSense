"use client";

import { useEffect, useState } from "react";

type Theme = "dark" | "light";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const saved = window.localStorage.getItem("cinesense-theme") as Theme | null;
    const nextTheme = saved === "light" || saved === "dark" ? saved : "dark";
    document.documentElement.dataset.theme = nextTheme;
    setTheme(nextTheme);
  }, []);

  function toggleTheme() {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem("cinesense-theme", nextTheme);
    setTheme(nextTheme);
  }

  return <button className="theme-toggle" type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}><span aria-hidden="true">{theme === "dark" ? "☼" : "☾"}</span><span>{theme === "dark" ? "Light" : "Dark"}</span></button>;
}
