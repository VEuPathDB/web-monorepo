# AI-Assisted Comment Feature Flag Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a single feature flag, `allowAiAssistedCommentCreation`, that gates AI-assisted comment _creation_ on both the frontend (button + form route) and backend (submit + publish endpoints), sourced from one conifer modelprop.

**Architecture:** One conifer modelprop `ALLOW_AI_ASSISTED_COMMENT_CREATION` is the single source of truth. Conifer feeds it to the frontend via `appBase.html.j2` → `window.__SITE_CONFIG__` → `web-common/config.ts`, and to the backend via `getWdkModel().getProperties()`. The frontend hides the button and guards the form route; the backend returns 403 from the two creation endpoints. Display of existing AI comments is untouched.

**Tech Stack:** Conifer (Ansible/Jinja2 YAML), Java JAX-RS (ApiCommonWebsite Service), TypeScript/React (web-monorepo: web-common lib + genomics-site), Webpack DefinePlugin.

**Spec:** `docs/superpowers/specs/2026-06-26-ai-comment-feature-flag-design.md`

## Global Constraints

- **Flag name:** `ALLOW_AI_ASSISTED_COMMENT_CREATION` (UPPER_SNAKE) in conifer/backend; `allowAiAssistedCommentCreation` (camelCase) on the wire and in frontend config.
- **String equality, not boolean:** Both gates compare against the literal string `"true"` (Jinja `"true" === "…"`; Java `"true".equals(…)`). The conifer value **must be the quoted string `'true'`** — a bare YAML boolean (`true`/`yes`/`on`) renders through Jinja as `True`/`False` and silently disables the feature. `'1'` is not `'true'`.
- **Default on, fail safe off:** Conifer base defaults `'true'` (flipped to `'false'` only in special circumstances). Every downstream fallback (Jinja `|default('false')`, `config.ts = false`, dev webpack `=== 'true'`) yields off when absent/misconfigured.
- **Backend gating = creation only:** Gate `POST submit` and `POST {job-id}/publish` only. Leave `GET {job-id}` and `DELETE {job-id}` open. Gated response is **403** (`javax.ws.rs.ForbiddenException`).
- **Frontend off-state:** When the flag is off, render no add-comment button (the vanilla "Add a comment" button stays commented out), and the `/add` route renders a "not enabled" notice.
- **No change** to display of existing AI comments or their provenance.
- **No real unit-test runner** for `web-common` or `genomics-site` (genomics-site has no jest; `web-common`'s `test` script is a no-op). Frontend verification is `compile:check` + a manual dev-server toggle. Backend verification is module compilation.
- **Library rebuild rule:** genomics-site imports the _built_ `@veupathdb/web-common/lib/config`. After editing `web-common/src/config.ts`, rebuild web-common before type-checking genomics-site.
- **Three repos:** web-monorepo (`/home/maccallr/Desktop/EDA/web-monorepo`), EbrcWebsiteCommon (`/home/maccallr/work/ai-wdk/project_home/EbrcWebsiteCommon`), ApiCommonWebsite (`/home/maccallr/work/ai-wdk/project_home/ApiCommonWebsite`). Each task commits in its own repo.

---

### Task 1: Backend gate — 403 on submit & publish when disabled

**Files:**

- Modify: `ApiCommonWebsite/Service/src/main/java/org/apidb/apicommon/service/services/ai/AiGenePublicationCommentService.java` (imports ~line 7-17; `submit` ~line 61; `publish` ~line 134; add private helper near `isBlank` ~line 183)

**Interfaces:**

- Consumes: `getWdkModel().getProperties()` (inherited `Map<String,String>` from `AbstractWdkService`).
- Produces: private method `void requireAiCommentCreationEnabled()` — throws `javax.ws.rs.ForbiddenException` (→ HTTP 403) when the modelprop is not exactly `"true"`. Called by `submit()` and `publish()`.

- [ ] **Step 1: Add the `ForbiddenException` import**

In the `javax.ws.rs.*` import block (the imports already include `BadRequestException`, `Consumes`, `DELETE`, …), add:

```java
import javax.ws.rs.ForbiddenException;
```

Keep imports alphabetically ordered (place it after `DELETE` / before `GET`, matching the existing ordering).

- [ ] **Step 2: Add the private gate helper**

Add this method alongside the other private helpers (e.g. directly above the existing `private static boolean isBlank(String s)` near line 183):

```java
  /**
   * Feature gate for AI-assisted comment <em>creation</em>. Backed by the
   * {@code ALLOW_AI_ASSISTED_COMMENT_CREATION} modelprop (a string; see conifer
   * default.yml). Enabled only when explicitly {@code "true"}; any other value
   * (including absent) disables. Guards the two creation endpoints (submit,
   * publish); status/cancel remain open so in-flight/cached jobs resolve.
   */
  private void requireAiCommentCreationEnabled() {
    if (!"true".equals(getWdkModel().getProperties().get("ALLOW_AI_ASSISTED_COMMENT_CREATION")))
      throw new ForbiddenException("AI-assisted comment creation is not enabled on this site");
  }
```

- [ ] **Step 3: Call the gate first in `submit`**

In `public Response submit(AiGenePublicationRequest body)`, add the gate as the first statement (before `fetchUser()`):

```java
  public Response submit(AiGenePublicationRequest body) throws WdkModelException {
    requireAiCommentCreationEnabled(); // 403 when feature disabled
    User user = fetchUser(); // 401 for guests
    SyncPrelude prelude = new SyncPrelude(getWdkModel(), JobRegistry.instance(), getCommentFactory());
    // ...unchanged...
```

- [ ] **Step 4: Call the gate first in `publish`**

In `public Response publish(@PathParam(JOB_ID_PARAM) String jobId, PublishRequest body)`, add the gate as the first statement (before `fetchUser()`):

```java
  public Response publish(@PathParam(JOB_ID_PARAM) String jobId, PublishRequest body)
      throws WdkModelException {
    requireAiCommentCreationEnabled(); // 403 when feature disabled
    User user = fetchUser(); // 401 for guests
    // ...unchanged...
```

Do **not** modify `getStatus` or `cancel`.

- [ ] **Step 5: Compile the Service module**

Run the project's standard Java build for the Service module and confirm it compiles cleanly. Use the team's normal wrapper if there is one; otherwise:

Run: `cd /home/maccallr/work/ai-wdk/project_home/ApiCommonWebsite && mvn -q -pl Service -am compile`
Expected: BUILD SUCCESS, no compilation errors referencing `AiGenePublicationCommentService` or `ForbiddenException`.

(If the team uses a `bld`/GUS build wrapper instead of bare maven, run that against `ApiCommonWebsite/Service`. The success criterion is the same: the module compiles.)

- [ ] **Step 6: Commit**

```bash
cd /home/maccallr/work/ai-wdk/project_home/ApiCommonWebsite
git add Service/src/main/java/org/apidb/apicommon/service/services/ai/AiGenePublicationCommentService.java
git commit -m "feat(ai-comments): gate submit/publish behind ALLOW_AI_ASSISTED_COMMENT_CREATION

Returns 403 from the two creation endpoints when the modelprop is not 'true'.
Status (GET) and cancel (DELETE) remain open so in-flight/cached jobs resolve.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: Conifer — source of truth + frontend wiring

**Files:**

- Modify: `EbrcWebsiteCommon/Model/lib/conifer/roles/conifer/vars/default.yml` (`modelprop:` block, ~line 152-179)
- Modify: `EbrcWebsiteCommon/Model/lib/conifer/roles/conifer/templates/EbrcWebsiteCommon/appBase.html.j2` (`siteConfig` block, after the `aiExpressionQualtricsId` line ~63)

**Interfaces:**

- Produces: modelprop `ALLOW_AI_ASSISTED_COMMENT_CREATION` (string `'true'`) — read by Task 1 (backend) and rendered into `window.__SITE_CONFIG__.allowAiAssistedCommentCreation` (boolean) consumed by Tasks 3-5 (frontend).

- [ ] **Step 1: Add the modelprop to conifer defaults**

In `default.yml`, inside the `modelprop:` block, add the flag. Place it next to the other AI/OpenAI props — e.g. immediately after the `OPENAI_API_KEY:` line:

```yaml
OPENAI_API_KEY:
ALLOW_AI_ASSISTED_COMMENT_CREATION: 'true'
```

The value **must** be the quoted string `'true'` (not bare `true`). This mirrors `eda.enabled: "true"`.

- [ ] **Step 2: Render it into `window.__SITE_CONFIG__`**

In `appBase.html.j2`, inside the `{% block siteConfig %}` … `{% endblock %}` block, add a line directly after the existing `aiExpressionQualtricsId:` line (~line 63):

```jinja
        aiExpressionQualtricsId: "{{ modelprop.AI_EXPRESSION_QUALTRICS_ID|default('') }}",
        allowAiAssistedCommentCreation: "true" === "{{ modelprop.ALLOW_AI_ASSISTED_COMMENT_CREATION|default('false') }}",
```

The `|default('false')` keeps absence fail-safe to off; the strict `"true" === "…"` yields a real JS boolean.

- [ ] **Step 3: Sanity-check the template renders to a boolean**

This is a visual/manual check (no conifer render harness here). Confirm the added line, when the modelprop is `'true'`, produces `allowAiAssistedCommentCreation: "true" === "true",` (→ `true`), and when `'false'` produces `"true" === "false",` (→ `false`). Confirm the value is quoted `'true'` in `default.yml` (so Jinja emits `true`, not `True`).

Run: `cd /home/maccallr/work/ai-wdk/project_home/EbrcWebsiteCommon && grep -n "ALLOW_AI_ASSISTED_COMMENT_CREATION" Model/lib/conifer/roles/conifer/vars/default.yml Model/lib/conifer/roles/conifer/templates/EbrcWebsiteCommon/appBase.html.j2`
Expected: two matches — `default.yml` showing `'true'` (quoted), and the j2 showing the `"true" === "{{ modelprop.ALLOW_AI_ASSISTED_COMMENT_CREATION|default('false') }}"` line.

- [ ] **Step 4: Commit**

```bash
cd /home/maccallr/work/ai-wdk/project_home/EbrcWebsiteCommon
git add Model/lib/conifer/roles/conifer/vars/default.yml \
        Model/lib/conifer/roles/conifer/templates/EbrcWebsiteCommon/appBase.html.j2
git commit -m "feat(ai-comments): add ALLOW_AI_ASSISTED_COMMENT_CREATION modelprop

Source of truth for the AI-assisted comment creation feature flag. Defaults on
('true'); flipped to 'false' only in special circumstances. Rendered into
window.__SITE_CONFIG__.allowAiAssistedCommentCreation for the frontend and read
by AiGenePublicationCommentService on the backend.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: Frontend config plumbing (web-common + dev webpack + .env.sample)

**Files:**

- Modify: `packages/libs/web-common/src/config.ts` (destructure, after `showSubscriptionProds = false,` ~line 41)
- Modify: `packages/sites/genomics-site/webpack.config.local.mjs` (DefinePlugin `__SITE_CONFIG__`, after `showSubscriptionProds:` ~line 68)
- Modify: `packages/sites/genomics-site/.env.sample` (after `SHOW_SUBSCRIPTION_PRODS=true` ~line 63)

**Interfaces:**

- Consumes: `window.__SITE_CONFIG__.allowAiAssistedCommentCreation` (from Task 2, boolean at runtime).
- Produces: named export `allowAiAssistedCommentCreation: boolean` from `@veupathdb/web-common/lib/config` — consumed by Tasks 4 and 5.

- [ ] **Step 1: Add the export to `config.ts`**

In `packages/libs/web-common/src/config.ts`, add `allowAiAssistedCommentCreation` to the destructured export, after `showSubscriptionProds = false,`:

```ts
  showSubscriptionProds = false,
  allowAiAssistedCommentCreation = false,
} = window.__SITE_CONFIG__;
```

- [ ] **Step 2: Add the dev-server var to `webpack.config.local.mjs`**

In `packages/sites/genomics-site/webpack.config.local.mjs`, in the `webpack.DefinePlugin` `'window.__SITE_CONFIG__'` object, add a line after `showSubscriptionProds:`:

```js
        showSubscriptionProds: process.env.SHOW_SUBSCRIPTION_PRODS === 'true',
        allowAiAssistedCommentCreation: process.env.ALLOW_AI_ASSISTED_COMMENT_CREATION === 'true',
```

- [ ] **Step 3: Document the var in `.env.sample`**

In `packages/sites/genomics-site/.env.sample`, add after the `SHOW_SUBSCRIPTION_PRODS=true` line:

```bash
SHOW_SUBSCRIPTION_PRODS=true

# Enables AI-assisted comment creation (button + form + backend). Defaults off
# in local dev unless set to true here.
ALLOW_AI_ASSISTED_COMMENT_CREATION=true
```

- [ ] **Step 4: Rebuild web-common so the new export is in `lib/`**

genomics-site imports the built lib, so rebuild it.

Run: `cd /home/maccallr/Desktop/EDA/web-monorepo && yarn nx build-npm-modules @veupathdb/web-common`
Expected: build succeeds; `packages/libs/web-common/lib/config.d.ts` now declares `allowAiAssistedCommentCreation`.

Verify: `grep -n allowAiAssistedCommentCreation packages/libs/web-common/lib/config.d.ts`
Expected: one match showing the new export.

- [ ] **Step 5: Type-check genomics-site (baseline — picks up the new export)**

Run: `cd /home/maccallr/Desktop/EDA/web-monorepo && yarn nx compile:check @veupathdb/genomics-site`
Expected: passes (no errors). This confirms the export resolves before Tasks 4-5 consume it.

- [ ] **Step 6: Commit**

```bash
cd /home/maccallr/Desktop/EDA/web-monorepo
git add packages/libs/web-common/src/config.ts \
        packages/sites/genomics-site/webpack.config.local.mjs \
        packages/sites/genomics-site/.env.sample
git commit -m "feat(ai-comments): plumb allowAiAssistedCommentCreation through frontend config

Adds the config export to web-common, the dev-server env var to genomics-site
webpack config, and documents ALLOW_AI_ASSISTED_COMMENT_CREATION in .env.sample.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

(Do not commit `packages/libs/web-common/lib/` build artifacts unless the repo tracks them — check `git status`; if `lib/` is gitignored, only the three source files above are staged.)

---

### Task 4: Frontend gate — comment-section button

**Files:**

- Modify: `packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/common/UserComments.jsx` (the `addCommentLink` function, lines 37-72)

**Interfaces:**

- Consumes: `allowAiAssistedCommentCreation` from `@veupathdb/web-common/lib/config` (Task 3).
- Produces: no new export; `addCommentLink(getLink, getAiLink)` keeps the same signature and call sites.

- [ ] **Step 1: Import the flag**

At the top of `UserComments.jsx`, after the existing imports (`react`, `react-router-dom`), add:

```jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { allowAiAssistedCommentCreation } from '@veupathdb/web-common/lib/config';
```

- [ ] **Step 2: Gate the AI button in `addCommentLink`**

Replace the body of the `if (getAiLink) { … }` branch so that the AI button renders only when the flag is on; when off, render only the default component (no add-comment button — the vanilla button stays commented out). The full updated function:

```jsx
export function addCommentLink(getLink, getAiLink) {
  return function UserCommentsSection(props) {
    let link = getLink(props);

    if (getAiLink) {
      if (!allowAiAssistedCommentCreation) {
        // Feature off: render no add-comment button. The vanilla "Add a comment"
        // button remains commented out (beta-demo state); see the legacy branch.
        return (
          <div>
            <props.DefaultComponent {...props} />
          </div>
        );
      }
      let aiLink = getAiLink(props);
      return (
        <div>
          <div style={buttonRowStyle}>
            {/* Vanilla "Add a comment" button hidden for the AI-comments beta
                demo. Restore for production:
            <a href={link} style={buttonStyle}>
              Add a comment <i className="fa fa-comment" />
            </a>
            */}
            <Link to={aiLink} style={buttonStyle}>
              Add AI-assisted comment <span style={betaPillStyle}>Beta</span>
            </Link>
          </div>
          <props.DefaultComponent {...props} />
        </div>
      );
    }

    return (
      <div>
        <p>
          <a href={link}>
            Add a comment <i className="fa fa-comment" />
          </a>
        </p>
        <props.DefaultComponent {...props} />
      </div>
    );
  };
}
```

- [ ] **Step 3: Type-check genomics-site**

Run: `cd /home/maccallr/Desktop/EDA/web-monorepo && yarn nx compile:check @veupathdb/genomics-site`
Expected: passes.

- [ ] **Step 4: Manual behavior check (dev server)**

Start the dev server twice, toggling the env var, and view a gene record's "User Comments" section.

- Off: `ALLOW_AI_ASSISTED_COMMENT_CREATION=false yarn nx start @veupathdb/genomics-site` → the comments section shows **no** "Add AI-assisted comment" button.
- On: `ALLOW_AI_ASSISTED_COMMENT_CREATION=true yarn nx start @veupathdb/genomics-site` → the "Add AI-assisted comment (Beta)" button appears.

(If a full dev-server run isn't practical in the execution environment, note that and rely on the compile:check gate plus code review of the branch logic.)

- [ ] **Step 5: Commit**

```bash
cd /home/maccallr/Desktop/EDA/web-monorepo
git add packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/common/UserComments.jsx
git commit -m "feat(ai-comments): hide AI-assisted comment button when flag is off

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 5: Frontend gate — `/add` route guard

**Files:**

- Modify: `packages/sites/genomics-site/webapp/wdkCustomization/js/client/userCommentRoutes.tsx` (imports ~line 1-11; the `/user-comments/ai-gene-publication/add` route, lines 14-23)

**Interfaces:**

- Consumes: `allowAiAssistedCommentCreation` from `@veupathdb/web-common/lib/config` (Task 3).
- Produces: no new export; `userCommentRoutes` keeps the same shape.

- [ ] **Step 1: Import the flag**

Add to the imports in `userCommentRoutes.tsx` (alongside the existing `@veupathdb/wdk-client` import):

```tsx
import {
  RouteEntry,
  parseQueryString,
} from '@veupathdb/wdk-client/lib/Core/RouteEntry';
import { allowAiAssistedCommentCreation } from '@veupathdb/web-common/lib/config';
```

- [ ] **Step 2: Guard the route component**

Replace the `/user-comments/ai-gene-publication/add` route entry's `component` so it renders a notice when the flag is off:

```tsx
  {
    path: '/user-comments/ai-gene-publication/add',
    requiresLogin: true,
    component: (props: RouteComponentProps<{}>) => {
      if (!allowAiAssistedCommentCreation) {
        return (
          <div style={{ padding: '2em' }}>
            AI-assisted comments are not currently enabled on this site.
          </div>
        );
      }
      const { stableId = '', jobId } = parseQueryString(props);
      return (
        <AiGenePublicationAddController stableId={stableId} jobId={jobId} />
      );
    },
  },
```

Leave the other routes (`/user-comments/add`, `/edit`, `/show`) unchanged.

- [ ] **Step 3: Type-check genomics-site**

Run: `cd /home/maccallr/Desktop/EDA/web-monorepo && yarn nx compile:check @veupathdb/genomics-site`
Expected: passes.

- [ ] **Step 4: Manual behavior check (dev server)**

With `ALLOW_AI_ASSISTED_COMMENT_CREATION=false`, navigate directly to `/a/app/user-comments/ai-gene-publication/add?stableId=PF3D7_0100100` (a deep link). Expected: the "AI-assisted comments are not currently enabled on this site." notice, not the form. With the var `=true`, the form (controller) loads as before.

(If a full dev-server run isn't practical, note that and rely on compile:check + code review.)

- [ ] **Step 5: Commit**

```bash
cd /home/maccallr/Desktop/EDA/web-monorepo
git add packages/sites/genomics-site/webapp/wdkCustomization/js/client/userCommentRoutes.tsx
git commit -m "feat(ai-comments): guard AI gene-publication add route when flag is off

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Final verification (after all tasks)

- [ ] **Frontend type-check passes:** `cd /home/maccallr/Desktop/EDA/web-monorepo && yarn nx compile:check @veupathdb/genomics-site` → no errors.
- [ ] **Backend compiles:** Service module builds cleanly (Task 1, Step 5).
- [ ] **End-to-end manual toggle (optional but recommended):** With the dev server and `ALLOW_AI_ASSISTED_COMMENT_CREATION=false`: no button, deep-link shows notice, and a direct `POST /user-comments/ai-gene-publication` returns 403. With `=true`: button visible, form loads, submit/publish work as before.
- [ ] **Existing AI comments still display** in both states (the gate is creation-only).
