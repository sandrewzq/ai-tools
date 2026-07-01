import { useEffect, useMemo, useState } from "react";
import { isStringArray, readJson, writeJson } from "../shared/storage";

const KEY = "ai-tools:recent";
const LIMIT = 8;

export function useRecentTools(validIds: string[]) {
  const validSet = useMemo(() => new Set(validIds), [validIds]);
  const [recentTools, setRecentTools] = useState<string[]>(() =>
    readJson(KEY, [], isStringArray).filter((id) => validSet.has(id)),
  );

  useEffect(() => {
    writeJson(KEY, recentTools);
  }, [recentTools]);

  function markRecent(id: string) {
    if (!validSet.has(id)) return;
    setRecentTools((current) => [id, ...current.filter((item) => item !== id)].slice(0, LIMIT));
  }

  return { recentTools, markRecent };
}
