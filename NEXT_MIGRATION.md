# Next.js Migration — Architecture Notes and Learning Plan

## Table of Contents

1. [Overview](#1-overview)
2. [Current Architecture Summary](#2-current-architecture-summary)
   - [The Stack](#the-stack)
   - [Why `wdk-client` Is the Central Challenge](#why-wdk-client-is-the-central-challenge)
   - [The Component-Wrappers System](#the-component-wrappers-system)
3. [Key Next.js Concepts for This Migration](#3-key-nextjs-concepts-for-this-migration)
   - [File-System Routing vs React Router](#file-system-routing-vs-react-router)
   - [Server Components vs Client Components](#server-components-vs-client-components)
   - [The layout / page / loading / not-found Pattern](#the-layout--page--loading--not-found-pattern)
   - [SSR Strategy: Start Client-Rendered](#ssr-strategy-start-client-rendered)
   - [The Providers Pattern](#the-providers-pattern)
4. [Architectural Mappings](#4-architectural-mappings)
   - [Root.tsx Becomes layout.tsx + Providers](#roottsx-becomes-layouttsx--providers)
   - [Component-Wrappers Become a ComponentRegistry Context](#component-wrappers-become-a-componentregistry-context)
   - [WDK Routes Become File-System Routes](#wdk-routes-become-file-system-routes)
   - [Redux Store Modules — Deferred](#redux-store-modules--deferred)
   - [Ownership Mapping Table](#ownership-mapping-table)
5. [Mickey Mouse Apps — Build Plan](#5-mickey-mouse-apps--build-plan)
   - [Monorepo Setup](#monorepo-setup)
   - [Directory Structure](#directory-structure)
   - [Step-by-Step Build Instructions](#step-by-step-build-instructions)
   - [What Each Piece Teaches](#what-each-piece-teaches)
   - [Suggested Additions](#suggested-additions)
6. [Coexistence with the Existing Monorepo](#6-coexistence-with-the-existing-monorepo)
   - [Yarn 4 Workspace Setup](#yarn-4-workspace-setup)
   - [Shared Dependencies](#shared-dependencies)
   - [Cross-Boundary Imports](#cross-boundary-imports)
   - [TypeScript Configuration](#typescript-configuration)
   - [NX](#nx)
   - [The Migration Gradient](#the-migration-gradient)
7. [Future Migration — Pointers Only](#7-future-migration--pointers-only)
   - [Phased Approach](#phased-approach)
   - [What Stays Client-Rendered Forever](#what-stays-client-rendered-forever)

---

## 1. Overview

This document captures architectural analysis and a concrete learning plan for a potential migration of the VEuPathDB web monorepo from the current Webpack/React Router/Redux stack to Next.js.

**What this document covers:**

- An honest assessment of the current architecture and why migration is non-trivial
- Explanations of key Next.js concepts, pitched at a developer experienced with React but new to Next.js
- A mapping between current architectural patterns and their Next.js equivalents
- A step-by-step plan for building two bare-bones "mickey mouse" Next.js apps as a learning exercise within the existing monorepo
- Notes on monorepo coexistence — running old and new side-by-side

**What this document does not cover:**

- A full migration plan (premature until the learning exercise is complete)
- Backend/API changes (the WDK service layer is out of scope for now)
- Deployment infrastructure

**Why Next.js?** The current stack is a Webpack 5 SPA with client-side rendering for everything. Next.js would provide per-route code splitting, server-side rendering for public pages (gene records, study listings — pages that are cited in papers and indexed by search engines), faster builds via Turbopack, and a modern deployment model. The sites would remain React applications; Next.js is the framework that runs them.

---

## 2. Current Architecture Summary

### The Stack

The monorepo contains four website packages and eleven shared library packages:

| Layer                        | Packages                                                                                                                                                                                   |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Sites (Webpack entry points) | `genomics-site`, `clinepi-site`, `mbio-site`, `ortho-site`                                                                                                                                 |
| Shared libs                  | `wdk-client`, `web-common`, `eda`, `coreui`, `components`, `http-utils`, `multi-blast`, `preferred-organisms`, `study-data-access`, `user-datasets`, `blast-summary-view`                  |
| Build configs                | `base-webpack-config`, `site-webpack-config`, `site-babel-config`, `site-tsconfig`, `eslint-config`, `prettier-config`, `react-scripts`, `cra-template`, `tsconfig`, `browserslist-config` |

Key technology choices:

- **React 18** (`^18.3.1`) — pinned via root `resolutions`
- **React Router v5** (`^5.1.2`) — the pre-data-router API, using `<Router history={...}>` with a custom history object
- **Redux + redux-observable** — RxJS-based epics for async state management
- **Webpack 5** (`^5.84.1`) — with custom per-site configs
- **Yarn 4** (`4.12.0`) with `node-modules` linker
- **Node 24** (via Volta)

### Why `wdk-client` Is the Central Challenge

`wdk-client` (`packages/libs/wdk-client`) is not a component library in the conventional sense. It is an **application framework** — it owns the application shell, the Redux store, the routing, the middleware, and the auth model. Everything else in the monorepo plugs into it.

Specifically, `wdk-client` owns:

**The application shell** (`src/Core/Root.tsx`): A class component that renders the Redux `<Provider>`, the React Router `<Router>`, two React Contexts (`WdkDependenciesContext` and `PluginContext`), auth gating (reading a JWT from the `Authorization` cookie), a global `document.addEventListener('click', ...)` handler for intercepting non-React-Router links, the `<Page>` layout wrapper, and a login modal.

**The Redux store** (`src/Core/Store.ts`): Creates the Redux store with `createStore()`, wires up `redux-observable` epic middleware, injects `EpicDependencies` (service, transitioner, param store), and connects Redux DevTools.

**15+ store modules** (`src/StoreModules/`): `QuestionStoreModule`, `RecordStoreModule`, `BasketStoreModule`, `DownloadFormStoreModule`, `RouterStoreModule`, etc. Each module has a reducer and an RxJS epic that encodes domain logic. You cannot use any of this domain logic without buying into the entire Redux/observable machinery.

**343 lines of route definitions** (`src/Core/routes.tsx`): Route paths with controller components — `/search/:recordClass/:question`, `/record/:recordClass/*`, `/workspace/strategies`, etc. The library defines what pages exist, which is an application concern.

**Custom middleware** (`src/Core/WdkMiddleware.ts`): A thunk-like system on top of Redux where action creators can return thunks, arrays, or Promises. This is application infrastructure.

**The bootstrap function** (`src/Core/main.js`): `initialize(options)` takes `rootUrl`, `endpoint`, `wrapRoutes`, `wrapStoreModules`, `pluginConfig`, etc. and boots the entire application. Sites call this function — they don't compose their own application from parts.

In a Next.js world, all of these responsibilities shift to the application layer (file-system routes, `layout.tsx`, server components for data fetching). The question of what to do with `wdk-client` — rewrite it as a proper library of components and hooks, wrap it, or abandon it — is the hardest decision in the migration and must be made by a human before any automated translation can begin.

### The Component-Wrappers System

The monorepo has a hierarchical component override system that allows customisation at three levels:

1. **`wdk-client`** defines base components and controllers, each wrapped with the `wrappable()` HOC (`src/Utils/ComponentUtils.tsx`). This HOC adds a static `wrapComponent(factory)` method to each component.

2. **`web-common`** (`packages/libs/web-common/src/component-wrappers/`) provides cross-site VEuPathDB defaults — Header, Footer, RecordPage, UserProfileController, etc.

3. **Each site** (e.g. `clinepi-site/webapp/js/client/component-wrappers/`) provides site-specific overrides — custom IndexController, SiteHeader, RecordHeading, etc.

The mechanism is **global mutation**. The `wrappable()` HOC creates a class that holds the component in a closure:

```ts
// ComponentUtils.tsx (simplified)
export function wrappable(Component) {
  return class Wrapper extends React.Component {
    static wrapComponent(factory) {
      Component = factory(Component); // mutates the closure permanently
    }
    render() {
      return <Component {...this.props} />;
    }
  };
}
```

At boot time, `wrapComponents(dict)` in `main.js` iterates over a `{ ComponentName: factory }` dictionary, looks up each name in the `Components` or `Controllers` exports, and calls `wrapComponent`. `web-common` calls this first, then the site calls it again. Each factory receives the current component and returns a new one:

```ts
// Replace entirely:
SiteHeader: () => MySiteHeader,

// Compose with the default:
RecordController: (Default) => (props) => <Wrapper><Default {...props} /></Wrapper>,

// Wrap with Redux connect:
DownloadFormController: compose(withRestrictionHandler(...), availableStudyGuard(...)),
```

The clinepi-site's `component-wrappers/index.js` is a good example of the full range — it exports ~15 overrides including simple replacements, `compose()` chains with Redux `connect()`, and conditional wrapping based on feature flags.

This system is incompatible with Next.js because:

- There is no "boot" phase where imperative setup code runs — server components render per-request in isolation
- Mutating module-level closures is a data race when modules are cached across server requests
- The `window` and `document` references inside many wrappers crash at import time on the server
- React Server Components cannot be wrapped by client HOCs that use Redux `connect()`

---

## 3. Key Next.js Concepts for This Migration

### File-System Routing vs React Router

In the current app, routes are defined programmatically — `wdk-client/src/Core/routes.tsx` is a 343-line array of `{ path, component, exact, requiresLogin }` objects, rendered inside a `<Switch>`. Sites can modify routes via `wrapRoutes()`.

In Next.js, routes are determined by the file system. Each file named `page.tsx` inside the `app/` directory becomes a route:

```
app/
  page.tsx                          → /
  about/page.tsx                    → /about
  gene/[geneId]/page.tsx            → /gene/AGAP001234
  search/[recordClass]/page.tsx     → /search/GeneRecordClasses.GeneRecordClass
```

Dynamic segments use `[brackets]`. There is no `<Route>` component, no `<Switch>`, no route array. The file system _is_ the router.

This is a fundamental mental model shift, not a syntactic one. You cannot mechanically translate a `routes.tsx` array into `page.tsx` files — you need to understand the intent of each route.

### Server Components vs Client Components

This is the biggest conceptual change from the current SPA. In the current app, everything runs in the browser. In Next.js App Router, **everything is a server component by default**. You opt _into_ client rendering with the `'use client'` directive at the top of a file.

**Server components** (the default):

- Run on the server at request time (or build time for static pages)
- Can be `async` — they can `await fetch(...)` directly in the component body
- Cannot use hooks (`useState`, `useEffect`, `useContext`, etc.)
- Cannot use browser APIs (`window`, `document`, `localStorage`)
- Their code is never sent to the browser — zero JS bundle impact

**Client components** (`'use client'`):

- Hydrated in the browser, work like normal React components
- Can use hooks, event handlers, browser APIs
- Their code is included in the JS bundle
- Everything in the current `wdk-client` is effectively a client component

The boundary between server and client is a **file-level** decision. A server component can render a client component as a child, passing data down as props. A client component cannot import or render a server component directly (though it can accept one as `children`).

In practice for this codebase: data fetching pages (gene record, study listing) would be server components that pass data down to client components for interactivity. The EDA analysis tools, notebooks, and volcano plots would be entirely `'use client'`.

### The layout / page / loading / not-found Pattern

Next.js has special file names within each route directory:

- **`page.tsx`** — The page content for that route. Required for the route to exist.
- **`layout.tsx`** — Wraps the page and all child routes. Persists across navigations (does not re-render when child routes change). This is where you put headers, sidebars, providers.
- **`loading.tsx`** — Shown automatically while the page's async data is loading (uses React Suspense under the hood). One file, zero config.
- **`not-found.tsx`** — Shown when `notFound()` is called from a page or when no route matches.

Layouts nest automatically. A `layout.tsx` in `app/` wraps everything. A `layout.tsx` in `app/gene/` wraps all gene sub-routes. This maps naturally to the current `<Page>` wrapper — the root layout is the app shell (header, footer, providers), and sub-layouts handle section-specific chrome.

### SSR Strategy: Start Client-Rendered

For the initial port, the goal is a **client-rendered app that is structurally identical to the current one**, but running in Next.js. This gives you:

- Per-route JS bundles instead of one monolithic webpack output
- Lazy loading at the route level
- Faster rebuilds (Turbopack)
- A foundation to add SSR incrementally

You achieve client-rendered mode by putting `'use client'` on your page components. Next.js still handles routing and code splitting — you just don't get SSR benefits yet.

SSR is then added incrementally for specific high-value pages:

- **Public gene/protein record pages** — cited in papers, crawled by search engines
- **Study/dataset listing pages** — public discovery pages
- **Organism pages** — reference pages

These become `async` server components that fetch their own data. The EDA analysis tools, notebooks, basket/strategy workspace, and user-specific pages stay `'use client'` forever — they're inherently stateful and user-specific, with no SSR value.

### The Providers Pattern

React Context providers are client components (they use `createContext`, which is a React hook primitive). But in Next.js, your root `layout.tsx` is a server component by default. The standard resolution is a thin client wrapper:

```tsx
// components/Providers.tsx
'use client';
import { ComponentRegistryContext } from '@veupathdb/shared-ui';

export function Providers({ registry, children }) {
  return (
    <ComponentRegistryContext.Provider value={registry}>
      {children}
    </ComponentRegistryContext.Provider>
  );
}
```

```tsx
// app/layout.tsx — server component
import { Providers } from './components/Providers';
import { registry } from './componentOverrides';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers registry={registry}>{children}</Providers>
      </body>
    </html>
  );
}
```

The server component computes or imports the initial values, passes them to the thin `Providers` client wrapper, and the children render correctly from the first byte. This is the idiomatic Next.js approach for any context-based dependency injection.

---

## 4. Architectural Mappings

### Root.tsx Becomes layout.tsx + Providers

The current `Root.tsx` (a class component) does six things:

1. Wraps everything in a Redux `<Provider store={...}>`
2. Wraps everything in `<Router history={...}>`
3. Provides `WdkDependenciesContext` and `PluginContext`
4. Checks auth state from a cookie
5. Renders the `<Page>` layout (header, footer, content area)
6. Installs a global click handler for link interception

In Next.js:

- (1) Redux `<Provider>` moves into a `Providers` client wrapper (or is eliminated if you move to server components / React Query)
- (2) `<Router>` is eliminated — Next.js handles routing
- (3) Contexts move into the `Providers` wrapper
- (4) Auth can be read from cookies server-side via `cookies()` from `next/headers` — no flash of unauthenticated state
- (5) `<Page>` layout becomes the root `layout.tsx`
- (6) Global click handler is eliminated — Next.js `<Link>` handles client-side navigation

### Component-Wrappers Become a ComponentRegistry Context

The globally-mutable `wrappable()` / `wrapComponents()` pattern is replaced by an explicit, typed React Context:

```tsx
// shared-ui/src/context/ComponentRegistry.tsx
import { createContext, useContext } from 'react';

export type ComponentRegistry = {
  Header: React.ComponentType;
  RecordPage: React.ComponentType<RecordPageProps>;
  AnswerController: React.ComponentType<AnswerControllerProps>;
  // ... etc
};

const defaultRegistry: ComponentRegistry = {
  Header: DefaultHeader,
  RecordPage: DefaultRecordPage,
  AnswerController: DefaultAnswerController,
};

export const ComponentRegistryContext = createContext(defaultRegistry);
export const useComponents = () => useContext(ComponentRegistryContext);
```

The three-tier override chain becomes explicit object spreading in each site's layout:

```tsx
// genomics-site layout.tsx
const registry = {
  ...wdkDefaults,
  ...webCommonOverrides,
  ...genomicsOverrides,
};

<Providers registry={registry}>{children}</Providers>;
```

Shared components consume the registry via hook:

```tsx
function PageShell() {
  const { Header } = useComponents();
  return <Header />;
}
```

The HOC composition pattern survives as-is — site overrides reference the default via import rather than receiving it as a factory argument:

```tsx
// genomics componentOverrides.ts
import { DefaultAnswerController } from '@veupathdb/shared-ui';

export const genomicsOverrides = {
  AnswerController: (props) => (
    <OrganismFilter>
      <DefaultAnswerController {...props} />
    </OrganismFilter>
  ),
};
```

Benefits over the current system: no global mutation, the override chain is visible in each site's `layout.tsx`, TypeScript enforces that overrides match the expected component interface, and different subtrees can have different registries.

**Caveat**: `useComponents()` is a client-side hook. Server components cannot call it. For server-rendered pages, use direct imports. In practice, the components in the registry (Header, Footer, Nav, interactive page variants) are all client-rendered anyway.

### WDK Routes Become File-System Routes

The 343-line route array in `wdk-client/src/Core/routes.tsx` becomes a directory structure. For example:

| Current route path                      | Next.js file                                          |
| --------------------------------------- | ----------------------------------------------------- |
| `/`                                     | `app/page.tsx`                                        |
| `/search/:recordClass/:question`        | `app/search/[recordClass]/[question]/page.tsx`        |
| `/search/:recordClass/:question/result` | `app/search/[recordClass]/[question]/result/page.tsx` |
| `/record/:recordClass/*`                | `app/record/[recordClass]/[...primaryKey]/page.tsx`   |
| `/workspace/strategies`                 | `app/workspace/strategies/page.tsx`                   |
| `/user/login`                           | `app/user/login/page.tsx`                             |
| `/user/profile`                         | `app/user/profile/page.tsx`                           |
| `/user/registration`                    | `app/user/registration/page.tsx`                      |

Dynamic segments use `[param]`, catch-all segments use `[...param]`. The `exact` flag becomes implicit — a `page.tsx` matches its exact path, and a `layout.tsx` wraps all child routes.

Route-level auth (`requiresLogin`) moves to Next.js middleware:

```tsx
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('Authorization');
  const isGuest = parseIsGuest(token?.value);
  if (isGuest && requiresAuth(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/user/login', request.url));
  }
}
```

### Redux Store Modules — Deferred

The 15+ Redux store modules and their RxJS epics are the most complex part of the codebase to migrate. This is **not part of the learning exercise** and should be deferred until after the mickey mouse apps are complete.

The eventual direction is: domain logic currently in store modules (record fetching, question execution, strategy management) would move to React hooks backed by TanStack Query or similar, with the WDK service as the data source. Server components would handle the initial data fetch; client components would handle mutations and real-time state.

For the initial port, it is entirely valid to keep Redux as-is inside `'use client'` components. The Redux store works fine in client components — it just can't participate in server rendering.

### Ownership Mapping Table

| Concern              | Current owner                               | Next.js owner                                   |
| -------------------- | ------------------------------------------- | ----------------------------------------------- |
| Application shell    | `wdk-client` `Root.tsx`                     | `layout.tsx` + `Providers`                      |
| Routing              | `wdk-client` `routes.tsx` + React Router v5 | File-system (`app/` directory)                  |
| Redux store creation | `wdk-client` `Store.ts`                     | App creates its own store (or eliminates Redux) |
| Component overrides  | `wrappable()` global mutation               | `ComponentRegistryContext`                      |
| Auth gating          | `Root.tsx` cookie parsing + `<Switch>`      | `middleware.ts` + `cookies()`                   |
| Data fetching        | Redux epics + `WdkService`                  | Server components (SSR) or React Query (client) |
| Link interception    | `Root.tsx` global click handler             | Next.js `<Link>` component                      |
| Code splitting       | Manual `React.lazy()` (if any)              | Automatic per-route                             |
| Build                | Webpack 5 + custom configs                  | Next.js (Turbopack)                             |

---

## 5. Mickey Mouse Apps — Build Plan

Two bare-bones, text-only Next.js apps built inside the existing monorepo as a learning exercise.

### Monorepo Setup

Add two new top-level directories alongside `packages/`:

- `next-packages/` — shared libraries for Next.js apps (analogous to `packages/libs/`)
- `next-apps/` — Next.js application packages (analogous to `packages/sites/`)

Update the root `package.json` workspaces to include them:

```json
"workspaces": [
  "packages/libs/*",
  "packages/configs/*",
  "packages/sites/*",
  "next-packages/*",
  "next-apps/*"
]
```

### Directory Structure

```
web-monorepo/
  next-packages/
    shared-ui/
      package.json
      tsconfig.json
      src/
        index.ts
        context/
          ComponentRegistry.tsx    ← createContext + useComponents hook
        components/
          DefaultHeader.tsx        ← plain text default header
          Page.tsx                 ← layout shell that uses useComponents()
  next-apps/
    mickey-mouse-genomics/
      package.json
      tsconfig.json
      next.config.ts
      app/
        layout.tsx                 ← root layout, wires up registry + GenomicsHeader
        page.tsx                   ← homepage with links
        about/
          page.tsx                 ← static about page
        gene/[geneId]/
          page.tsx                 ← async server component, SSR gene record
          loading.tsx              ← loading state
          not-found.tsx            ← 404 for unknown genes
      components/
        Providers.tsx              ← 'use client' context wrapper
        GenomicsHeader.tsx         ← site-specific header
        componentOverrides.ts      ← registry overrides
    mickey-mouse-clinepi/
      package.json
      tsconfig.json
      next.config.ts
      app/
        layout.tsx                 ← root layout, wires up registry + ClinEpiHeader
        page.tsx                   ← homepage with links
        about/
          page.tsx                 ← static about page
        study/[studyId]/
          page.tsx                 ← 'use client' placeholder for EDA
      components/
        Providers.tsx              ← 'use client' context wrapper
        ClinEpiHeader.tsx          ← site-specific header
        componentOverrides.ts      ← registry overrides
```

### Step-by-Step Build Instructions

#### Step 1: Add workspace globs to root `package.json`

Edit the root `package.json` to add the `next-packages/*` and `next-apps/*` workspace globs. No other changes to root config.

#### Step 2: Create `next-packages/shared-ui`

This is a minimal package that exports the `ComponentRegistry` context and a `DefaultHeader` component. It represents the eventual shared layer that replaces the `web-common` + `wdk-client` combination.

**`package.json`:**

```json
{
  "name": "@veupathdb/shared-ui",
  "version": "0.1.0",
  "private": true,
  "main": "src/index.ts",
  "dependencies": {
    "react": "^18.0.0"
  }
}
```

**`src/context/ComponentRegistry.tsx`:**

```tsx
'use client';
import { createContext, useContext } from 'react';

export type ComponentRegistry = {
  Header: React.ComponentType;
};

export const defaultRegistry: ComponentRegistry = {
  Header: () => (
    <header>
      <strong>Default VEuPathDB Header</strong>
    </header>
  ),
};

export const ComponentRegistryContext =
  createContext<ComponentRegistry>(defaultRegistry);
export const useComponents = () => useContext(ComponentRegistryContext);
```

**`src/components/Page.tsx`:**

```tsx
'use client';
import { useComponents } from '../context/ComponentRegistry';

export function Page({ children }: { children: React.ReactNode }) {
  const { Header } = useComponents();
  return (
    <div>
      <Header />
      <main>{children}</main>
      <footer>VEuPathDB Footer</footer>
    </div>
  );
}
```

This `Page` component is the key teaching moment — it uses `useComponents()` to render a site-specific `Header` without knowing which site it's in. This is the replacement for the `wrappable()` pattern.

#### Step 3: Create `next-apps/mickey-mouse-genomics`

**`package.json`:**

```json
{
  "name": "@veupathdb/mickey-mouse-genomics",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --port 3001",
    "build": "next build"
  },
  "dependencies": {
    "@veupathdb/shared-ui": "workspace:^",
    "next": "^15",
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0"
  }
}
```

**`components/GenomicsHeader.tsx`:**

```tsx
export function GenomicsHeader() {
  return (
    <header>
      <strong>VectorBase Genomics</strong> — Mickey Mouse Edition
    </header>
  );
}
```

**`components/componentOverrides.ts`:**

```tsx
import { ComponentRegistry, defaultRegistry } from '@veupathdb/shared-ui';
import { GenomicsHeader } from './GenomicsHeader';

export const genomicsRegistry: ComponentRegistry = {
  ...defaultRegistry,
  Header: GenomicsHeader,
};
```

**`components/Providers.tsx`:**

```tsx
'use client';
import { ComponentRegistryContext } from '@veupathdb/shared-ui';
import { ComponentRegistry } from '@veupathdb/shared-ui';

export function Providers({
  registry,
  children,
}: {
  registry: ComponentRegistry;
  children: React.ReactNode;
}) {
  return (
    <ComponentRegistryContext.Provider value={registry}>
      {children}
    </ComponentRegistryContext.Provider>
  );
}
```

**`app/layout.tsx`:**

```tsx
import { Providers } from '../components/Providers';
import { genomicsRegistry } from '../components/componentOverrides';
import { Page } from '@veupathdb/shared-ui';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers registry={genomicsRegistry}>
          <Page>{children}</Page>
        </Providers>
      </body>
    </html>
  );
}
```

**`app/page.tsx`:**

```tsx
import Link from 'next/link';

export default function Home() {
  return (
    <div>
      <h1>VectorBase Genomics — Home</h1>
      <ul>
        <li>
          <Link href="/about">About</Link>
        </li>
        <li>
          <Link href="/gene/AGAP001234">Gene: AGAP001234</Link>
        </li>
      </ul>
    </div>
  );
}
```

**`app/about/page.tsx`:**

```tsx
export default function About() {
  return (
    <div>
      <h1>About VectorBase</h1>
      <p>This is a mickey mouse learning exercise for Next.js migration.</p>
    </div>
  );
}
```

**`app/gene/[geneId]/page.tsx`** — This is the SSR teaching moment:

```tsx
import { notFound } from 'next/navigation';

// Simulated server-side data fetch
async function fetchGene(geneId: string) {
  // Artificial delay to demonstrate loading.tsx
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Hardcoded gene data (would be a WDK API call in the real app)
  if (geneId === 'AGAP001234') {
    return {
      id: 'AGAP001234',
      name: 'AgaP-GSTE2',
      description: 'Glutathione S-transferase epsilon 2',
      location: '3R:28,590,952..28,592,657 (+)',
      organism: 'Anopheles gambiae PEST',
    };
  }
  return null;
}

// This is an async server component — it runs on the server, not in the browser
export default async function GenePage({
  params,
}: {
  params: Promise<{ geneId: string }>;
}) {
  const { geneId } = await params;
  const gene = await fetchGene(geneId);

  if (!gene) notFound();

  return (
    <div>
      <h1>Gene: {gene.id}</h1>
      <dl>
        <dt>Name</dt>
        <dd>{gene.name}</dd>
        <dt>Description</dt>
        <dd>{gene.description}</dd>
        <dt>Location</dt>
        <dd>{gene.location}</dd>
        <dt>Organism</dt>
        <dd>{gene.organism}</dd>
      </dl>
    </div>
  );
}
```

**`app/gene/[geneId]/loading.tsx`:**

```tsx
export default function Loading() {
  return <p>Loading gene record...</p>;
}
```

**`app/gene/[geneId]/not-found.tsx`:**

```tsx
export default function NotFound() {
  return (
    <div>
      <h1>Gene not found</h1>
      <p>The requested gene does not exist in this database.</p>
    </div>
  );
}
```

#### Step 4: Create `next-apps/mickey-mouse-clinepi`

Same structure as genomics, with two differences:

**`components/ClinEpiHeader.tsx`:**

```tsx
export function ClinEpiHeader() {
  return (
    <header>
      <strong>ClinEpiDB</strong> — Mickey Mouse Edition
    </header>
  );
}
```

**`app/study/[studyId]/page.tsx`** — A `'use client'` component to contrast with the server-rendered gene page:

```tsx
'use client';
import { useState } from 'react';

export default function StudyPage({ params }: { params: { studyId: string } }) {
  const [showMessage, setShowMessage] = useState(false);

  return (
    <div>
      <h1>EDA Study: {params.studyId}</h1>
      <p>This page would contain the EDA analysis interface.</p>
      <p>
        It is a client component because EDA is inherently interactive and
        stateful.
      </p>
      <button onClick={() => setShowMessage(!showMessage)}>
        {showMessage ? 'Hide' : 'Show'} details
      </button>
      {showMessage && (
        <p>
          The full EDA analysis tools would render here — volcano plots,
          notebooks, subsetting, etc.
        </p>
      )}
    </div>
  );
}
```

The homepage links to `/study/DS_0ad509829e` (or any placeholder study ID).

### What Each Piece Teaches

| Piece                                             | Migration concept it teaches                                                             |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `shared-ui/ComponentRegistry.tsx`                 | The `wrappable()` / `wrapComponents()` replacement pattern                               |
| `shared-ui/Page.tsx` with `useComponents()`       | How a shared component renders site-specific variants without knowing which site it's in |
| `Providers.tsx`                                   | The standard Next.js pattern for context in a server component tree                      |
| `layout.tsx` wiring up the registry               | How the three-tier override chain becomes explicit object spreading                      |
| `gene/[geneId]/page.tsx` (async server component) | SSR data fetching — the biggest mental model shift from the current SPA                  |
| `study/[studyId]/page.tsx` (`'use client'`)       | The client/server boundary — where `'use client'` lives and why                          |
| `loading.tsx`                                     | Automatic Suspense integration — one file, zero config                                   |
| `not-found.tsx` + `notFound()`                    | Error boundary pattern, replacing WDK's `NotFoundController`                             |
| Two apps sharing `shared-ui`                      | How `workspace:^` and the monorepo enable code sharing across Next.js apps               |

### Suggested Additions

Once the basic apps are running, two optional additions deepen understanding:

**1. Add a second component to the registry** — e.g. a `Footer` component with a site-specific override. This reinforces that the registry scales to any number of swappable slots.

**2. Add a `next.config.ts` with `transpilePackages`** — Required to make Next.js transpile the `@veupathdb/shared-ui` workspace package correctly:

```ts
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@veupathdb/shared-ui'],
};

export default nextConfig;
```

This is a common monorepo gotcha — Next.js doesn't transpile workspace packages by default.

---

## 6. Coexistence with the Existing Monorepo

### Yarn 4 Workspace Setup

Yarn 4 workspaces are purely path-based. Adding `"next-packages/*"` and `"next-apps/*"` to the root `workspaces` array makes everything under those paths part of the workspace graph. One `yarn install` picks up everything. The existing lockfile gains new entries for `next`, but nothing existing is disturbed.

The `.yarnrc.yml` has `enableImmutableInstalls: true`, which prevents `yarn install` from modifying the lockfile on a plain install. This is fine — when you add Next.js as a dependency via `yarn add next`, it modifies the lockfile intentionally. The flag only blocks _accidental_ lockfile drift.

### Shared Dependencies

The root `package.json` already pins React 18 via `resolutions`:

```json
"resolutions": {
  "react": "^18.0.0",
  "react-dom": "^18.0.0",
  "@types/react": "^18.0.0",
  "@types/react-dom": "^18.0.0"
}
```

The Next.js apps declare `react` and `react-dom` as dependencies, but Yarn deduplicates them to the single resolved version. There will be exactly one copy of React in `node_modules`, shared by old and new apps.

### Cross-Boundary Imports

A Next.js app in `next-apps/genomics-site` can import from any existing workspace package:

```json
"@veupathdb/eda": "workspace:^",
"@veupathdb/web-common": "workspace:^",
"@veupathdb/wdk-client": "workspace:^"
```

Yarn resolves these to the local packages. This is how the incremental port works — new Next.js pages can import existing lib code while it is migrated piece by piece.

For the mickey mouse apps, **do not import from existing `packages/libs/` packages**. The learning exercise should use only `@veupathdb/shared-ui` to keep things simple. Cross-boundary imports become relevant in the real port.

### TypeScript Configuration

The existing `@veupathdb/site-tsconfig` is tuned for Webpack/CRA builds. **Do not modify it** — the existing sites depend on it as-is.

Each Next.js app gets its own `tsconfig.json`. Next.js generates a sensible default on first `next dev` run. The key settings it needs:

```json
{
  "compilerOptions": {
    "jsx": "preserve",
    "module": "esnext",
    "moduleResolution": "bundler",
    "strict": true,
    "paths": { "@/*": ["./src/*"] }
  }
}
```

If this becomes repetitive across multiple Next.js apps, create a `next-packages/next-tsconfig` package (~10 lines) that apps extend. But for two mickey mouse apps, just let Next.js generate the config.

### NX

The root `package.json` has `nx: 16.3.2` as a devDependency. If NX is being used for task orchestration (build caching, affected-project detection), the Next.js apps should be added to `nx.json`. If NX is largely unused, ignore it — Next.js has its own `next dev` and `next build` commands.

### The Migration Gradient

The coexistence model means there is never a "big bang" cutover:

```
packages/sites/genomics-site       ← production, webpack, untouched
next-apps/mickey-mouse-genomics    ← learning sandbox
next-apps/genomics-site            ← eventual real port (can import workspace:^ libs)
```

Both the old webpack dev server (`yarn workspace @veupathdb/genomics-site start`) and `next dev` can run simultaneously on different ports. The real port can import existing `@veupathdb/eda` or `@veupathdb/web-common` components as needed — they are workspace packages, available immediately.

---

## 7. Future Migration — Pointers Only

This section is deliberately brief. The full migration plan should be revisited once the mickey mouse apps are complete and Next.js concepts are familiar.

### Phased Approach

| Phase                          | Rendering                        | What you gain                                             |
| ------------------------------ | -------------------------------- | --------------------------------------------------------- |
| **1 — Direct port**            | Client-rendered (SPA-equivalent) | Modern tooling, code splitting, maintainable architecture |
| **2 — Public pages**           | SSR at route level               | SEO, faster FCP for gene/dataset/organism pages           |
| **3 — Chrome hydration**       | Server-computed initial state    | No auth flash, faster LCP                                 |
| **EDA / notebooks / analysis** | Stays client-rendered forever    | Inherently stateful, user-specific, no SSR value          |

### What Stays Client-Rendered Forever

Some parts of the app are fundamentally interactive client applications:

- EDA analysis tools (subsetting, visualizations)
- Notebooks
- Volcano plots
- Basket / strategy workspace
- User profile / settings

These will always be `'use client'` components. Next.js handles mixed rendering within the same app naturally — this is a feature, not a compromise.

### Prerequisites Before Starting the Real Port

These decisions must be made by a human before automated migration can begin:

1. **The `wdk-client` fate** — Rewrite as a proper library (components + hooks)? Wrap it? Abandon it? This shapes everything else.
2. **Redux strategy** — Keep as-is in client components? Migrate to TanStack Query? Go server-first? Can be decided per-feature.
3. **Complete route inventory** — All URLs, dynamic segments, access rules, mapped to file-system routes.
4. **API surface map** — All backend endpoints consumed, to understand the data fetching layer.
5. **URL parity plan** — These URLs appear in published papers and are indexed by NCBI, Google Scholar, etc. Next.js redirects/rewrites can preserve them, but it requires upfront mapping.
