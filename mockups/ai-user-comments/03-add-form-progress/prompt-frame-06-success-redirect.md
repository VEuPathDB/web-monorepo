# Frame 06 — Add form: generating complete / transitioning to review

> **⚠️ NEEDS FULL REWRITE** — this frame pre-dates the review-on-approval pivot (2026-06-02).
> The old design redirected to `/user-comments/edit?commentId=…` and showed "Comment draft created!".
> In the current design there is **no redirect** and **no comment is created** at this point.
> Instead, the controller transitions `phase` from `polling` to `review` in-place: the breadcrumb
> advances to step 3 and the review-and-publish form replaces the progress view on the same page.
> This frame should therefore be regenerated to show either:
> (a) A brief "Generation complete — loading your review…" flash still on step 2, OR
> (b) The very first render of the review form at step 3 (which is covered by frame 08).
> Option (b) means this frame may be redundant. Discuss with team before regenerating.

Continue with the same PlasmoDB chrome, page heading, and layout established in the previous frames.

**Base**: same as `mockup-frame-05-progress.png` with the following changes:

### Breadcrumb trail

The breadcrumb advances to step 3 as the review form appears — there is no intermediate redirect:

- ① Publication source — mid-grey circle, normal weight, full opacity (completed)
- → mid-grey arrow
- ② Generating comment — mid-grey circle, normal weight, full opacity (completed)
- → mid-grey arrow
- ③ **Review & publish** — deep maroon circle, **bold** label, full opacity (active)

### Content — Generation complete view

**Stage checklist**: all stages now show a ✓ green tick (done), including "Persisting" at the bottom (no "Validating" stage). No spinner, no pending circles — the list is entirely green ticks.

**Success message box** — replaces the footer row. A visually distinct box below the checklist with a light green background, thin green border, and a checkmark icon on the left:

> **Generation complete!**
> Loading your review form…

Beside or below the message text: a small subtle spinner (thin ring, teal colour).

The Cancel button is gone.

## Annotations

- ① **Breadcrumb advances to step 3** — transitions in-place as the review form loads; no page navigation
- ② **All stages complete** — every stage shows a green tick; "Persisting" confirms the AI output has been cached server-side
- ③ **No comment created yet** — the comment row is only written when the user clicks Publish on the review form

Save as: `mockup-frame-06-success-redirect.png`
