# Frame 06 — Add form: success / redirecting state

Continue with the same PlasmoDB chrome, page heading, and layout established in the previous frames.

**Base**: same as `mockup-frame-05-progress.png` with the following changes:

### Breadcrumb trail

Unchanged from frame 05 — step 2 remains active. The breadcrumb only advances to step 3 once the user lands on the edit page:

- ① Publication source — mid-grey circle, normal weight, full opacity (completed)
- → mid-grey arrow
- ② **Generating comment** — deep maroon circle, **bold** label, full opacity (active)
- → mid-grey arrow
- ③ Review & publish — faded, ~45% opacity (future)

### Content — Success / redirect view

**Stage checklist**: all stages now show a ✓ green tick (done), including "Creating comment" at the bottom. No spinner, no pending circles — the list is entirely green ticks.

**Success message box** — replaces the footer row. A visually distinct box below the checklist with a light green background, thin green border, and a checkmark icon on the left:

> **Comment draft created!**
> Taking you to the review page…

Beside or below the message text: a small subtle spinner (thin ring, teal colour) indicating the redirect is in progress.

**Fallback link** — small text directly below the message box:

> If you are not redirected automatically, [click here to continue to the review page](#) (the bracketed text is a teal underlined link)

The Cancel button is gone.

## Annotations

- ① **Breadcrumb stays on step 2** — the add page owns steps 1 and 2 throughout its lifetime; step 3 only becomes active once the user lands on the edit page
- ② **All stages complete** — every stage shows a green tick; "Creating comment" confirms the draft comment row has been persisted
- ③ **Auto-redirect** — navigation to `/user-comments/edit?commentId=…` happens automatically; no user action required
- ④ **Fallback link** — in case the redirect is delayed or blocked, the user can navigate manually

Save as: `mockup-frame-06-success-redirect.png`
