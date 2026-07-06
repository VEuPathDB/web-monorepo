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

| Declared spec | Resolves to | Packages |
|---|---|---|
| `^4.0.3` / `^4.3.4` / `^4.4.4` / `^4.5.4` | **4.9.5** | eda, http-utils, study-data-access, multi-blast, preferred-organisms, blast-summary-view, user-datasets |
| `~4.3.5` | **4.3.5** | wdk-client, web-common, clinepi-site, genomics-site, mbio-site, ortho-site |
| `4.3.4` (pinned) | 4.3.4 | components |
| `4.5.5` (pinned) | 4.5.5 | coreui |

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

- [ ] `corepack yarn install --immutable` passes at every commit.
- [ ] Each TypeScript bump committed together with its regenerated
      `yarn.lock` and any code fixes — no bump left unvalidated.
- [ ] All four sites build clean under the target TS with
      `noImplicitReturns: true` restored.
- [ ] Keep changes intentional and reviewable (per `.yarnrc.yml`); if the
      full standardization is large, split Task A and Task B into separate
      PRs.
- [ ] Husky/Prettier already work as-is (`.husky/pre-commit` →
      `yarn lint-staged` → `prettier --write`); no change needed there —
      just confirm the hook runs after your first local install.
