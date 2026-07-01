import { useEffect, useMemo, useState } from "react";
import { isStringArray, readJson, writeJson } from "../shared/storage";

const KEY = "ai-tools:favorites";

export function useFavorites(validIds: string[]) {
  const validSet = useMemo(() => new Set(validIds), [validIds]);
  const [favorites, setFavorites] = useState<string[]>(() =>
    readJson(KEY, [], isStringArray).filter((id) => validSet.has(id)),
  );

  useEffect(() => {
    writeJson(KEY, favorites);
  }, [favorites]);

  function toggleFavorite(id: string) {
    if (!validSet.has(id)) return;
    setFavorites((current) => (current.includes(id) ? current.filter((item) => item !== id) : [id, ...current]));
  }

  return { favorites, toggleFavorite, isFavorite: (id: string) => favorites.includes(id) };
}
