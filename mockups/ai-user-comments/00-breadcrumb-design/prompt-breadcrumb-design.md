# Breadcrumb design — AI comment flow step indicator

## Purpose

Design-iteration prompt to establish the visual style of the horizontal breadcrumb trail used across the AI-assisted comment flow. The approved result (`mockup-breadcrumb-design.png`) will be uploaded as a reference image in every subsequent ChatGPT mockup session.

## What to create

A clean white panel (~800 × 220 px, no browser chrome) showing the same three-step breadcrumb in three distinct states, stacked vertically with a thin light-grey dividing line between each row. A small grey label sits above each row.

### Breadcrumb structure (identical across all rows)

```
[①] Publication source  →  [②] Generating comment  →  [③] Review & publish
```

- The numbered circles follow a "step indicator" style: a circular border (~25 px diameter), bold number inside, no fill.
- The `→` arrows between steps are mid-grey (e.g. #999), same size as the surrounding label text.
- The whole breadcrumb is left-aligned, with generous horizontal spacing between items.

---

### Row 1 — "Step 1 active"

Label above row: _Step 1 active_

| Element                         | Style                                                                            |
| ------------------------------- | -------------------------------------------------------------------------------- |
| ① circle + "Publication source" | Circle border and number in deep maroon (~#6b1a21); label **bold**, full opacity |
| → arrow                         | Mid-grey, full opacity                                                           |
| ② circle + "Generating comment" | Full element at ~45% opacity (faded)                                             |
| → arrow                         | ~45% opacity (faded)                                                             |
| ③ circle + "Review & publish"   | Full element at ~45% opacity (faded)                                             |

---

### Row 2 — "Step 2 active"

Label above row: _Step 2 active_

| Element                         | Style                                                                                      |
| ------------------------------- | ------------------------------------------------------------------------------------------ |
| ① circle + "Publication source" | Circle border and number in mid-grey (#888); label normal weight, full opacity (completed) |
| → arrow                         | Mid-grey, full opacity                                                                     |
| ② circle + "Generating comment" | Circle border and number in deep maroon (~#6b1a21); label **bold**, full opacity (active)  |
| → arrow                         | Mid-grey, full opacity                                                                     |
| ③ circle + "Review & publish"   | Full element at ~45% opacity (faded)                                                       |

---

### Row 3 — "Step 3 active"

Label above row: _Step 3 active_

| Element                         | Style                                                                                      |
| ------------------------------- | ------------------------------------------------------------------------------------------ |
| ① circle + "Publication source" | Circle border and number in mid-grey (#888); label normal weight, full opacity (completed) |
| → arrow                         | Mid-grey, full opacity                                                                     |
| ② circle + "Generating comment" | Circle border and number in mid-grey (#888); label normal weight, full opacity (completed) |
| → arrow                         | Mid-grey, full opacity                                                                     |
| ③ circle + "Review & publish"   | Circle border and number in deep maroon (~#6b1a21); label **bold**, full opacity (active)  |

---

No annotations, no browser chrome — just the three rows on a clean white background.

Save as: `mockup-breadcrumb-design.png`
