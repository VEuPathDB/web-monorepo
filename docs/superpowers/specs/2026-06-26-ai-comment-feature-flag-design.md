# AI-Assisted Comment Creation — Feature Flag Design

**Date:** 2026-06-26
**Branch:** `feature-ai-user-comments`
**Status:** Approved (brainstorming)

## Problem

The AI-assisted comment creation feature ships with no on/off switch. Today the
"Add AI-assisted comment (Beta)" button, its `/user-comments/ai-gene-publication/add`
form, and the backend `AiGenePublicationCommentService` endpoints are all
unconditionally enabled. We need a single feature flag that:

- Hides the button and locks down the form on the **frontend**.
- Makes the **backend** refuse to generate or publish AI-assisted comments.

This lets us enable the feature per-site/per-environment (initially genomics-site
only, beta) without code changes.

## Approach: one conifer `modelprop`, two-pronged gate

A single conifer-managed `modelprop` is the source of truth. Conifer already
feeds modelprops to **both** consumers:

- **Frontend** — `appBase.html.j2` renders `window.__SITE_CONFIG__`, consumed by
  `packages/libs/web-common/src/config.ts`. Precedent: `AI_EXPRESSION_QUALTRICS_ID`
  → `aiExpressionQualtricsId`.
- **Backend** — `getWdkModel().getProperties().get("…")`. Precedent:
  `WEBSERVICEMIRROR`, `OPENAI_API_KEY`, `CLAUDE_API_KEY`.

Naming: `ALLOW_AI_ASSISTED_COMMENT_CREATION` (UPPER_SNAKE modelprop) on the
backend/conifer; `allowAiAssistedCommentCreation` (camelCase) on the wire and in
frontend config.

**Defaulting:** the conifer base (`default.yml`) sets the flag **on** (`'true'`),
so deployments get the feature by default and a site opts _out_ by overriding to
`'false'`. Every downstream fallback, however, fails **safe to off** — the Jinja
`|default('false')`, the `config.ts` `= false` default, and the dev webpack
`=== 'true'` all yield off when the value is absent/misconfigured. So the feature
is on when explicitly `'true'` and off otherwise.

**Critical — string equality:** both gates compare against the literal string
`"true"` (Jinja `"true" === "…"`; Java `"true".equals(…)`). The conifer value
**must be the quoted string `'true'`**, matching `eda.enabled: "true"`. A bare
YAML boolean (`true`/`yes`/`on`) renders through Jinja as `True`/`False`
(capitalized), and `'1'` is not `'true'` — any of these would silently leave the
feature **off**.

### Decisions (locked)

| Decision                         | Choice                                                                                                                                                                                                            |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Backend endpoints gated          | **Creation only** — `POST submit` and `POST {job-id}/publish`. `GET {job-id}` (poll) and `DELETE {job-id}` (cancel) stay open so in-flight/cached jobs resolve cleanly. With `submit` blocked, no new jobs start. |
| Backend response when gated      | **403 Forbidden** (`javax.ws.rs.ForbiddenException`).                                                                                                                                                             |
| Frontend route behavior when off | **Guard the route** — render a "not currently enabled" notice instead of the controller (handles deep-links/bookmarks).                                                                                           |
| Frontend button when off         | **Show AI button only when on; otherwise no add-comment button.** The vanilla "Add a comment" button stays commented out as it is today (beta-demo state).                                                        |
| Display of existing AI comments  | **Out of scope / untouched.** The gate covers creation only; existing AI comments and their provenance still render.                                                                                              |

## Components & changes

### 1. Conifer — source of truth

**File:** `EbrcWebsiteCommon/Model/lib/conifer/roles/conifer/vars/default.yml`

Add to the existing `modelprop:` block, **on by default** — it is flipped to
`'false'` only in special circumstances (specific environments/sites/incidents):

```yaml
modelprop:
  ...
  ALLOW_AI_ASSISTED_COMMENT_CREATION: 'true'
```

The value **must be the quoted string `'true'`** (not bare `true`/`yes`/`on`/`1`):
both the Jinja template and the Java check do a strict equality against `"true"`,
and a YAML boolean renders through Jinja as `True`/`False`, which would silently
disable the feature. This mirrors the existing `eda.enabled: "true"`.

### 2. Backend gate — `AiGenePublicationCommentService.java`

**File:** `ApiCommonWebsite/Service/src/main/java/org/apidb/apicommon/service/services/ai/AiGenePublicationCommentService.java`

Add a private helper and call it at the top of the two creation endpoints:

```java
import javax.ws.rs.ForbiddenException;

private void requireAiCommentCreationEnabled() {
  if (!"true".equals(getWdkModel().getProperties().get("ALLOW_AI_ASSISTED_COMMENT_CREATION")))
    throw new ForbiddenException("AI-assisted comment creation is not enabled on this site");
}
```

- `submit(...)` — call `requireAiCommentCreationEnabled()` first (before/after
  `fetchUser()`; either order is fine — keep it as the first business check).
- `publish(...)` — call `requireAiCommentCreationEnabled()` first.
- `getStatus(...)` and `cancel(...)` — **unchanged** (left open by design).

`ForbiddenException` maps to HTTP 403 via JAX-RS. The frontend gates the button
and route, so a 403 is a defense-in-depth backstop rather than a normal path.

### 3. Frontend config plumbing

**a. `packages/libs/web-common/src/config.ts`** — add to the destructure
(boolean default, same pattern as `requireLogin`/`useEda`):

```ts
allowAiAssistedCommentCreation = false,
```

**b. `EbrcWebsiteCommon/Model/lib/conifer/roles/conifer/templates/EbrcWebsiteCommon/appBase.html.j2`**
— add inside the `siteConfig` block (alongside `aiExpressionQualtricsId`):

```jinja
allowAiAssistedCommentCreation: "true" === "{{ modelprop.ALLOW_AI_ASSISTED_COMMENT_CREATION|default('false') }}",
```

**c. `packages/sites/genomics-site/webpack.config.local.mjs`** — add to the
`DefinePlugin` `__SITE_CONFIG__` object (dev server):

```js
allowAiAssistedCommentCreation: process.env.ALLOW_AI_ASSISTED_COMMENT_CREATION === 'true',
```

Also document the new var in the genomics-site `.env.sample` so local devs can
enable it.

### 4. Frontend gate — button

**File:** `packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/common/UserComments.jsx`

Import the flag and render the AI button only when enabled. When `getAiLink` is
provided but the flag is off, render only `<props.DefaultComponent>` (no
add-comment button — vanilla button stays commented out as today):

```jsx
import { allowAiAssistedCommentCreation } from '@veupathdb/web-common/lib/config';

export function addCommentLink(getLink, getAiLink) {
  return function UserCommentsSection(props) {
    let link = getLink(props);

    if (getAiLink) {
      if (!allowAiAssistedCommentCreation) {
        // Feature off: no add-comment button (vanilla button intentionally
        // suppressed during the AI beta).
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
            <Link to={aiLink} style={buttonStyle}>
              Add AI-assisted comment <span style={betaPillStyle}>Beta</span>
            </Link>
          </div>
          <props.DefaultComponent {...props} />
        </div>
      );
    }

    // ...existing legacy vanilla-button branch unchanged...
  };
}
```

### 5. Frontend gate — route guard

**File:** `packages/sites/genomics-site/webapp/wdkCustomization/js/client/userCommentRoutes.tsx`

In the `/user-comments/ai-gene-publication/add` route component, check the flag
and render a brief notice when off (guards deep-links/bookmarks):

```tsx
import { allowAiAssistedCommentCreation } from '@veupathdb/web-common/lib/config';

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
    return <AiGenePublicationAddController stableId={stableId} jobId={jobId} />;
  },
},
```

## Data flow

```
conifer default.yml  ALLOW_AI_ASSISTED_COMMENT_CREATION ('true' by default; 'false' to disable)
        │
        ├── appBase.html.j2 ──> window.__SITE_CONFIG__.allowAiAssistedCommentCreation (boolean)
        │        └── config.ts ──> UserComments.jsx (button)  +  userCommentRoutes.tsx (route guard)
        │
        └── getWdkModel().getProperties() ──> AiGenePublicationCommentService
                                                 submit()  → 403 if off
                                                 publish() → 403 if off
```

## Testing

- **Backend:** with the prop unset/`false`, `POST /user-comments/ai-gene-publication`
  and `POST …/{job-id}/publish` return 403; `GET`/`DELETE` still behave. With
  `true`, all four behave as before.
- **Frontend (genomics-site has no jest — verify via `compile:check` + dev server):**
  - Flag off (`ALLOW_AI_ASSISTED_COMMENT_CREATION` unset): no AI button on a gene
    record's comments section; navigating to `/user-comments/ai-gene-publication/add`
    shows the "not enabled" notice.
  - Flag on (`ALLOW_AI_ASSISTED_COMMENT_CREATION=true` in the dev `.env`): AI
    button appears; form loads and works as today.
  - `yarn nx compile:check @veupathdb/genomics-site` passes.

## Notes / non-goals

- No change to the display of existing AI comments or their provenance.
- No backend response-body shaping beyond the default `ForbiddenException`
  message; the frontend gates ahead of it, so the 403 body isn't surfaced in
  normal use.
- The conifer default is `'true'` (feature on); it is flipped to `'false'` only
  in special circumstances (specific environments/sites/incidents). Every
  downstream fallback nonetheless fails safe to off.
