import { useEffect, useState } from "react";
import { readJson, writeJson } from "../shared/storage";

export type Preferences = {
  theme: "light" | "dark";
  density: "comfortable" | "compact";
};

const KEY = "ai-tools:preferences";
const DEFAULTS: Preferences = { theme: "light", density: "comfortable" };

function isPreferences(value: unknown): value is Preferences {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    (record.theme === "light" || record.theme === "dark") &&
    (record.density === "comfortable" || record.density === "compact")
  );
}

export function usePreferences() {
  const [preferences, setPreferences] = useState<Preferences>(() => readJson(KEY, DEFAULTS, isPreferences));

  useEffect(() => {
    writeJson(KEY, preferences);
    document.documentElement.dataset.theme = preferences.theme;
    document.documentElement.dataset.density = preferences.density;
  }, [preferences]);

  return { preferences, setPreferences };
}
