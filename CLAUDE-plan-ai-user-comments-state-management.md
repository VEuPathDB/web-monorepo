# Plan: AI Provenance State Management for User Comments

## Background

User comments can be AI-generated. We need to capture:

1. Whether a comment was AI-generated (presence/absence of `aiProvenance` field)
2. How much the author reviewed or edited the AI content before submitting (`reviewLevel`)

`reviewLevel` is editable by the comment author when returning to the edit form.

## Design

Optional nested object on the comment. Absence = human-written. Presence = AI-generated.

```ts
export type AiReviewLevel = 'unreviewed' | 'reviewed' | 'edited';

export interface AiProvenance {
  reviewLevel: AiReviewLevel;
}
```

| `aiProvenance`                  | Meaning                                               |
| ------------------------------- | ----------------------------------------------------- |
| absent / `undefined`            | Human-written                                         |
| `{ reviewLevel: 'unreviewed' }` | AI-generated, not carefully checked before submitting |
| `{ reviewLevel: 'reviewed' }`   | AI-generated, author read and confirmed accuracy      |
| `{ reviewLevel: 'edited' }`     | AI-generated, author made substantive changes         |

Default `reviewLevel` when first marking a comment as AI-generated: `'unreviewed'`.

## Files to Change

### 1. `packages/sites/genomics-site/webapp/wdkCustomization/js/client/types/userCommentTypes.ts`

Add two new exported types:

```ts
export type AiReviewLevel = 'unreviewed' | 'reviewed' | 'edited';

export interface AiProvenance {
  reviewLevel: AiReviewLevel;
}
```

Add `aiProvenance?: AiProvenance` to `UserCommentFormFields` (propagates to `UserCommentPostRequest` via extension):

```ts
export interface UserCommentFormFields {
  // ...existing fields...
  aiProvenance?: AiProvenance;
}
```

Add `aiProvenance?: AiProvenance` to `UserCommentGetResponse` (optional so key can be absent for old/human-written comments — no backwards-compat breakage):

```ts
export interface UserCommentGetResponse {
  // ...existing fields...
  aiProvenance?: AiProvenance;
}
```

### 2. `packages/sites/genomics-site/webapp/wdkCustomization/js/client/storeModules/UserCommentFormStoreModule.ts`

In `getResponseToPostRequest` (currently lines 103–123), add one line so `aiProvenance` is carried forward verbatim when a comment is loaded for editing:

```ts
const getResponseToPostRequest = (
  userCommentGetResponse: UserCommentGetResponse,
  categoryChoices: CategoryChoice[]
): UserCommentPostRequest => ({
  // ...existing mappings...
  aiProvenance: userCommentGetResponse.aiProvenance,
});
```

No reducer changes needed — `updateFormFields` already does a spread merge over `userCommentPostRequest`.

### 3. `packages/sites/genomics-site/webapp/wdkCustomization/js/client/service/UserCommentsService.ts`

**No changes.** `postUserComment` already serialises the full `UserCommentPostRequest` via `JSON.stringify`. `getUserComment` already returns raw JSON. Both are correct once the types are updated.

### 4. `packages/sites/genomics-site/webapp/wdkCustomization/js/client/actions/UserCommentFormActions.ts`

**No changes.** `updateFormFields` accepts `Partial<UserCommentPostRequest>`, which covers the new field automatically.

## Notes

- The `'unreviewed'` default is established by the UI when it first sets `aiProvenance` (e.g. dispatching `updateFormFields({ aiProvenance: { reviewLevel: 'unreviewed' } })`). The store's initial state has `userCommentPostRequest: undefined`; absent `aiProvenance` = human-written, which is the correct default before any UI interaction.
- `aiProvenance` does not need a raw form field mirror (`UserCommentRawFormFields`) — raw fields only exist for multi-value comma-separated textboxes.
- UI implementation (form field component, show view display) is out of scope for this plan.
