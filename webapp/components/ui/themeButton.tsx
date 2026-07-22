"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-8 w-20" />;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="bg-zinc-800 dark:bg-zinc-200 text-zinc-100 dark:text-zinc-900 flex items-center justify-center rounded-md h-8 px-3 text-sm font-medium hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors"
    >
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}