# Frame 06 — Add form: generating complete / transitioning to review

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
> Get ready to review and publish…

Beside or below the message text: a small subtle spinner (thin ring, teal colour).

The Cancel button is gone.

## Annotations

- ① **Breadcrumb advances to step 3** — transitions in-place as the review form loads; no page navigation
- ② **All stages complete** — every stage shows a green tick; "Persisting" confirms the AI output has been cached server-side
- ③ **Spinner** — three second delay before progressing to the review form

Save as: `mockup-frame-06-success-redirect.png`
