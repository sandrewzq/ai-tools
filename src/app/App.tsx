import { Suspense, useEffect, useState } from "react";
import { AppShell } from "../components/AppShell";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { HomeWorkbench } from "../components/HomeWorkbench";
import { useFavorites } from "../hooks/useFavorites";
import { usePreferences } from "../hooks/usePreferences";
import { useRecentTools } from "../hooks/useRecentTools";
import { getToolByRoute, HOME_ROUTE, normalizeRoute } from "./routes";
import { toolIds, tools } from "./tool-registry";

function readRoute() {
  return normalizeRoute(window.location.hash.slice(1));
}

export function App() {
  const [route, setRoute] = useState(readRoute);
  const favorites = useFavorites(toolIds);
  const recent = useRecentTools(toolIds);
  const { preferences, setPreferences } = usePreferences();
  const selectedTool = getToolByRoute(route);

  useEffect(() => {
    function syncRoute() {
      setRoute(readRoute());
    }

    window.addEventListener("hashchange", syncRoute);
    return () => window.removeEventListener("hashchange", syncRoute);
  }, []);

  useEffect(() => {
    if (selectedTool) recent.markRecent(selectedTool.meta.id);
  }, [selectedTool?.meta.id]);

  function navigate(nextRoute: string) {
    window.location.hash = nextRoute === HOME_ROUTE ? HOME_ROUTE : nextRoute;
    setRoute(normalizeRoute(nextRoute));
  }

  const content = selectedTool ? (
    <ErrorBoundary>
      <Suspense fallback={<div className="loading-state">正在加载工具...</div>}>
        <selectedTool.Component />
      </Suspense>
    </ErrorBoundary>
  ) : (
    <HomeWorkbench
      tools={tools}
      favoriteIds={favorites.favorites}
      recentIds={recent.recentTools}
      isFavorite={favorites.isFavorite}
      onOpen={navigate}
      onToggleFavorite={favorites.toggleFavorite}
    />
  );

  return (
    <AppShell route={route} tools={tools} preferences={preferences} onNavigate={navigate} onPreferencesChange={setPreferences}>
      {content}
    </AppShell>
  );
}
