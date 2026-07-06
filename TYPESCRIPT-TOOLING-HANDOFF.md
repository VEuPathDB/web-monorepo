# TypeScript / tooling standardization — handoff runbook

> **Audience:** a Claude Code Web session (or developer) whose environment
> **can fetch Yarn 4** (i.e. `repo.yarnpkg.com` is reachable, so
> `corepack yarn` works and you can run a full install + typecheck).
>
> The session that opened branch `claude/session-ayl1y5` **could not** do
> this — the agent proxy blocked `repo.yarnpkg.com`, so corepack couldn't
> download Yarn 4, `yarn install` never ran, and nothing could be
> typechecked. That session made only the one change that needed no
> install (see "Already done" below) and left the rest for you.

---

## ✅ STATUS UPDATE — Tasks A & B completed (branch `claude/typescript-tooling-handoff-jsw8ku`)

A follow-up session (env **could** fetch Yarn 4.12.0) completed the
standardization. Summary of what landed on top of `ba3ff42`:

- **Task A done.** Every workspace lib/site package now declares
  `"typescript": "^4.9.5"` (15 packages). `yarn.lock` regenerated via
  `yarn install --mode=update-lockfile` — the four distinct TS resolutions
  (4.3.4, 4.3.5, 4.5.5, and the `^4.x`→4.9.5 group) collapsed into a single
  `typescript@npm:4.9.5`. Net lockfile change: +17 / −77 lines, TS-only.
- **Task B done.** `noImplicitReturns: true` was **already** true on this
  (main-based) branch — the `update-form` regression was never merged here,
  so nothing to restore; it is kept true. Adopted `skipLibCheck: true` in
  `site-tsconfig` (matching the lib config) — required so the sites'
  `tsc --noEmit` doesn't choke on dangling JSDoc type refs in generated
  `.d.ts` (e.g. `ReduxMiddleware`, `ClientPlugin`). `jsx` left as `"react"`
  (the `react-jsx` swap is optional and was skipped to keep the diff small).
- **Code fixes for 4.9.5** (compiler jumped 4.3→4.9 for
  components/coreui/wdk-client/web-common): three `unknown`-typed `catch`
  variables narrowed, one `in`-operator guard (`typeof … === 'object'`),
  and one `Seq.last()` → `FilteredCountState` cast. See the git diff.

### ⚠️ New environment blocker discovered: git-hosted deps are egress-blocked

This env fetches Yarn 4 and npm packages fine, but the org egress policy
**403s every third-party `git+https` GitHub clone** (even `facebook/react`;
only the in-scope `veupathdb` repo is reachable). Two deps are affected:

- `tidytree` → `github.com/d-callan/TidyTree.git` (dep of `components`)
- `patristic` → `github.com/CDCgov/patristic.git` (transitive, via tidytree)

Consequences and how they were worked around:

- `yarn install --immutable` **cannot fully link** node_modules — it fails
  only at the **Fetch** step on those two clones (the Resolution step passes
  clean, so the lockfile is proven consistent). To get a working
  node_modules for validation, `tidytree` was temporarily dropped from
  `components/package.json`, linked with `--no-immutable`, then reverted.
  `components` typechecks fine without it because there is a local ambient
  `declare module 'tidytree'` in
  `src/components/tidytree/tidytree.d.ts`, and `patristic` has no source
  imports in `components`.
- **Validation method:** all 11 libs were built to `lib/` in topological
  order and all 4 sites `tsc --noEmit`-checked, using the root **4.9.5**
  compiler directly (`node_modules/typescript/bin/tsc`). Everything passes
  clean. This mirrors CI's model (ts-loader `exclude: /node_modules/`, so
  sites consume built lib `.d.ts`, not lib source).
- **Not verified here** (needs an env that can fetch those git repos):
  a full `yarn install --immutable` end-to-end, and the full webpack site
  builds. Both are expected to pass — the lockfile Resolution step is clean
  and every package typechecks at 4.9.5 — but a maintainer should run the
  real CI once to be certain.

---

## 0. Prerequisites — confirm before you start

```bash
corepack yarn --version        # must print 4.12.0 (NOT 1.22.x)
```

If that fails to download Yarn 4, your environment has the same network
restriction and you cannot complete this runbook — stop and report it.

The repo enforces `enableImmutableInstalls: true` (see `.yarnrc.yml`), so:

- **Every dependency change in a `package.json` must be accompanied by a
  regenerated `yarn.lock`.** Never hand-edit the lockfile for real
  dependency version bumps — run Yarn and commit what it produces.
- `.yarnrc.yml` explicitly warns against "accidental mass upgrades" and
  wants upgrades "intentional and reviewed." Do the work **one package at
  a time**, typecheck each, and keep the diff minimal.

## 1. Already done on this branch (`claude/session-ayl1y5`)

Commit `ba3ff42` — corrected a stale peer-dependency range:

- `packages/configs/site-tsconfig/package.json`
- `packages/configs/base-webpack-config/package.json`

Both declared `"typescript": "3.7"` as a **peer** dependency. Every
consumer runs TS 4.x, so the constraint was unsatisfiable and produced
peer warnings on install. Changed to `">=4"`, with the two matching peer
echoes in `yarn.lock` updated in lockstep (peer echoes are verbatim, so
that hand-edit is safe). **Verify** this is still consistent:

```bash
corepack yarn install --immutable   # must pass with no lockfile changes
```

If it wants to modify the lockfile, reconcile before doing anything else.

## 2. Background — why this work exists

- Shared config `packages/configs/site-tsconfig/tsconfig.json` is extended
  by all four sites: `clinepi-site`, `genomics-site`, `mbio-site`,
  `ortho-site`. Sites bundle library source (wdk-client, user-datasets,
  eda, …) via `ts-loader` using the **site** tsconfig, so this one file
  governs how the whole client tree typechecks.
- The separate lib config `packages/configs/tsconfig/tsconfig.json`
  already uses `jsx: "react-jsx"` and `skipLibCheck: true`.
- Branch `update-form` bumped 5 packages (`web-common` + 4 sites) from
  `~4.3.5` to `^4.5.4`. In `yarn.lock`, `^4.5.4` dedupes into the group
  that resolves to **TypeScript 4.9.5**, so those packages actually jump
  **4.3.5 → 4.9.5**. That compiler jump is what forced `update-form` to
  add `skipLibCheck` and (regrettably) flip `noImplicitReturns` off in the
  shared site tsconfig.

### Current TypeScript version drift (on `main`)

Eight specifiers resolving to four real versions:

| Declared spec                             | Resolves to | Packages                                                                                                |
| ----------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------- |
| `^4.0.3` / `^4.3.4` / `^4.4.4` / `^4.5.4` | **4.9.5**   | eda, http-utils, study-data-access, multi-blast, preferred-organisms, blast-summary-view, user-datasets |
| `~4.3.5`                                  | **4.3.5**   | wdk-client, web-common, clinepi-site, genomics-site, mbio-site, ortho-site                              |
| `4.3.4` (pinned)                          | 4.3.4       | components                                                                                              |
| `4.5.5` (pinned)                          | 4.5.5       | coreui                                                                                                  |

**Target: standardize everything on 4.9.5** — it's already the
majority-resolved version and the one `update-form` validated for the
sites, so it minimizes new lockfile entries.

## 3. Task A — standardize TypeScript to 4.9.5

Do this **incrementally**, typechecking after each package. Suggested
order (lowest risk first — the caret-range packages already resolve to
4.9.5, so start with the ones that actually change resolution):

`web-common` → `wdk-client` → `components` → `coreui` → the four sites.

For each package:

1. Edit its `package.json` `devDependencies.typescript` to `"^4.9.5"`.
2. Run `corepack yarn install` (regenerates `yarn.lock` — commit it).
3. Typecheck that package (see §5). Fix any new errors 4.9.5 surfaces
   (common ones going 4.3→4.9: stricter `catch` variable typing under
   `useUnknownInCatchVariables`, tighter template-literal / narrowing
   inference, `override` keyword expectations).
4. Commit package + lockfile + any code fixes together.

Optional but cleaner once all packages match: add a single source of
truth so drift can't recur — a root `resolutions.typescript: "4.9.5"` in
the top-level `package.json`. Run install, confirm the lockfile collapses
to one `typescript` resolution, and typecheck the sites again.

**Do not** try to force 4.9.5 via lockfile hand-edits — always let Yarn
regenerate.

## 4. Task B — fix `noImplicitReturns` in the shared site tsconfig

`update-form` changed `packages/configs/site-tsconfig/tsconfig.json` from
`noImplicitReturns: true` to `false`. That weakens a safety check for all
four sites (and everything they bundle) to work around what is almost
certainly one or two functions missing an explicit `return`.

Preferred fix:

1. Keep `noImplicitReturns: true` in the shared config.
2. Build/typecheck the sites (§5) and read the `TS7030: Not all code
paths return a value` errors.
3. Add the missing explicit `return` / `return undefined` in those
   functions instead of disabling the check globally.

If a genuine case can't be fixed cleanly, disable it locally at the call
site, not repo-wide.

While you're in that file, the other two `update-form` edits are correct
and worth keeping / adopting on `main`: `jsx: "react-jsx"` and
`skipLibCheck: true` (both already match the lib config). Confirm the
sites still compile after adopting them.

## 5. Validating a typecheck

There's no root `typecheck` script. Options, in order of preference:

```bash
# Per-package, if the package has a build/tsc script:
corepack yarn workspace @veupathdb/web-common run build   # or its tsc script

# Or invoke tsc directly against a package's tsconfig, no emit:
corepack yarn dlx typescript@4.9.5 tsc -p packages/libs/web-common --noEmit

# Full site build (slowest, most representative — this is what CI does):
corepack yarn workspace @veupathdb/clinepi-site run build
```

Inspect each `package.json` `scripts` block for the exact build/typecheck
command it defines; names vary across packages.

## 6. Guardrails / definition of done

- [x] `corepack yarn install --immutable` Resolution step passes with no
      lockfile change; it only fails at the Fetch step on the two
      egress-blocked git deps (see the STATUS UPDATE blocker note). A
      maintainer on an unrestricted network should confirm the full
      `--immutable` install once.
- [x] TypeScript bumps committed together with the regenerated `yarn.lock`
      and the 4.9.5 code fixes — every package typechecks at 4.9.5.
- [x] All four sites `tsc --noEmit`-clean under 4.9.5 with
      `noImplicitReturns: true` (kept) and `skipLibCheck: true` (adopted).
      Full webpack site builds still need running on an unrestricted env.
- [x] Changes are intentional and reviewable (per `.yarnrc.yml`); the
      lockfile diff is TS-only. Task A + Task B are small enough to ship
      together.
- [x] Husky/Prettier confirmed working: `postinstall` ran `husky install`
      (`.husky/_/` present, `core.hooksPath=.husky`); `.husky/pre-commit`
      → `yarn lint-staged` → `prettier --write`. All edited source files
      pass `prettier --check`.
