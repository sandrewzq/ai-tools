# React TypeScript Platform Design

## Goal

Migrate the AI tools site from a static HTML and vanilla JavaScript implementation to a Vite, React, and TypeScript application while keeping GitHub Pages static deployment.

The migration is a full platform rewrite. All existing tools remain available in the first React version, and the new platform adds product-level navigation and personalization features.

## Current Context

The project is currently a static tool collection with:

- A thin `app.js` entry that initializes hash routing.
- Tool registration split across `index.html`, `src/core/router.js`, `src/core/registry.js`, and `src/shared/dom-cache.js`.
- Tool implementations under `src/tools/*`, usually split into data, render, and index modules.
- A few Node tests that verify tool data logic and integration mapping.

The main maintenance problem is duplicated registration and DOM wiring. Adding or changing a tool requires edits in several unrelated files.

## Scope

In scope:

- Introduce Vite, React, and TypeScript.
- Replace the static multi-tool HTML page with a React application root.
- Convert all current tools to React components.
- Keep existing tool behavior unless a change is required by the new architecture.
- Add search, categories, unified tool pages, favorites, recent tools, and local preferences.
- Keep output as static files that can be deployed to GitHub Pages.
- Preserve or improve logic tests for parser, formatter, converter, and generator functions.

Out of scope:

- Backend services.
- User accounts or cloud sync.
- Server-side rendering.
- New tools beyond the existing tool set.
- A compatibility layer that mounts old DOM-based tools inside React.

## Architecture

The application will use this structure:

```text
src/
  app/
    App.tsx
    routes.tsx
    tool-registry.ts
  components/
    AppShell.tsx
    ToolCard.tsx
    ToolLayout.tsx
    SearchBox.tsx
  hooks/
    useFavorites.ts
    useRecentTools.ts
    usePreferences.ts
  tools/
    speed-test/
      meta.ts
      Tool.tsx
      logic.ts
    json-formatter/
      meta.ts
      Tool.tsx
      logic.ts
  shared/
    storage.ts
    clipboard.ts
    format.ts
    validation.ts
```

`tool-registry.ts` becomes the single source of truth for tools. It provides each tool's id, route, title, category, description, tags, and React component loader. Home cards, navigation, search, category filters, favorites, recent tools, and route validation all read from this registry.

Each tool directory owns its own UI and logic. It exports metadata and a React tool component. Shared behavior moves to `src/shared`, and tools must not directly import from other tool directories.

`index.html` becomes a Vite shell with a root element. The existing hardcoded tool views and manual DOM selectors are removed.

## Tool Model

Each tool has a typed metadata contract:

```ts
export type ToolMeta = {
  id: string;
  route: string;
  title: string;
  category: ToolCategory;
  description: string;
  tags: string[];
};
```

The registry stores tools as typed definitions:

```ts
export type ToolDefinition = {
  meta: ToolMeta;
  Component: React.LazyExoticComponent<React.ComponentType>;
};
```

Routes are derived from the registry. Invalid routes fall back to the home page.

## Product Experience

The home page becomes a real workbench:

- Search tools by title, description, category, and tags.
- Filter by category.
- Pin or unpin favorite tools.
- Show recently used tools.
- Keep a complete all-tools section.

The app shell provides consistent navigation and responsive layout. Tool pages use a shared `ToolLayout` with title, description, actions, status area, and content slots.

Preferences are local only. The first version supports theme preference and density preference. Default landing section is not included in the migration.

## Data Flow And Local Storage

The app remains fully client-side.

Local storage keys are namespaced, for example:

- `ai-tools:favorites`
- `ai-tools:recent`
- `ai-tools:preferences`

Storage helpers validate and normalize data before returning it to React hooks. Broken or incompatible stored values fall back to defaults instead of breaking app startup.

Recent tools update when a tool route is opened. Favorites update through explicit user actions.

## Error Handling

Tool-level errors render inside the tool page instead of throwing to the whole app.

Shared helpers cover:

- Clipboard success and failure.
- Local storage read and write failures.
- Parse, validation, and conversion errors.
- Network errors in the model speed test.

The React app includes a top-level error boundary so a broken tool does not blank the entire site.

## Testing

The migration keeps the current Node test approach for pure logic and adds registry-focused checks.

Required verification:

- Unit tests for important parser, formatter, converter, and generator logic.
- Registry tests that assert every registered tool has required metadata and a component.
- Build verification with `npm run build`.
- Manual browser smoke test for home search, favorites, recent tools, and representative tools from different categories.

## Deployment

Vite builds the app into `dist/`.

The GitHub Pages deployment remains static. If the repository is published under a subpath, Vite `base` must be configured so built assets resolve correctly.

The existing local `server.js` proxy can be kept only if it still serves a useful local development need for the speed test tool. It is not required for the static production build.

## Migration Strategy

This is a one-time full migration:

1. Add Vite, React, TypeScript, and project scripts.
2. Replace the old static HTML shell with a React root.
3. Build the app shell, registry, routing, home workbench, and local storage hooks.
4. Convert all existing tools to React components.
5. Move reusable business logic into typed `logic.ts` or shared modules.
6. Remove old DOM cache, manual router mappings, and static tool view markup.
7. Update tests and run build verification.

The implementation should avoid adding new tools during the migration. The goal is platform stability and parity first.
