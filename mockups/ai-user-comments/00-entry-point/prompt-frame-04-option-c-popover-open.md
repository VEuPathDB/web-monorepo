# Frame 04 — Option C: popover open (shared across options B and C)

Continue with the same PlasmoDB chrome and style established in the previous frame.

**Base**: use `mockup-frame-03-option-c-text-link-popover-closed.png` with the popover now open. Also refer to `base-active-popover.png` (uploaded alongside the base screenshots) for the exact popover visual style — plain white rectangle, subtle drop shadow, no arrow, no border.

**Popover open**: a small white popover panel appears immediately below and left-aligned with the "Add a comment" trigger. The popover contains exactly two options, stacked vertically, with comfortable padding (≈12px horizontal, 8px vertical per item):

1. **"Add a comment"** — plain dark gray text, no icon
2. **"Add an AI-assisted comment from a publication"** — plain dark gray text, followed immediately by a small teal rounded pill badge with white text **"Beta"**

Both options are plain text items (not buttons) that behave as links — teal on hover. A thin light-gray separator line sits between the two items. The popover is just wide enough to contain the longer second option without wrapping (approximately 310px wide).

The "Add a comment ✏️ ▾" trigger link remains visible behind/above the popover.

## Annotations

- ① **Popover panel** — plain white rectangle, subtle drop shadow, no arrow; appears on click of the trigger link
- ② **"Add a comment"** — navigates to the standard comment form (existing flow)
- ③ **"Add an AI-assisted comment from a publication" + Beta badge** — navigates to the new AI-assisted wizard
- ④ **Thin separator** — visual divider between the two options

Save as: `mockup-frame-04-option-c-popover-open.png`
