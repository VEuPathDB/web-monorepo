# Map filter bar, round 2: count on the right, bar-level help, step buttons — design

Date: 2026-11-22
Status: approved in conversation
Branch: `ccr-27b00449-g2d3sx`
Builds on: `docs/superpowers/specs/2026-11-21-map-filter-bar-timeline-design.md`
(everything there still holds unless changed below)
Mockups: `.superpowers/brainstorm/253925-1795336084/content/` —
`filter-bar-count-placement-v2.html` (option A), `filter-bar-help-v4.html`
(option 2), `timeline-step-styles.html` (option A),
`timeline-step-buttons.html` (option B placement)

## Why

Looking at the first version in the browser: the timeline wanted more room,
and the count read oddly between the Filters button and the chips. The bar's
logic is _filters + timeline window → what's on the map_, so the count
belongs at the end. The timeline's own (?) made the bar lopsided (nothing
similar for filters or count), and the step arrows were buried in the
settings pop-over although stepping is the main repeat action once data is
cached.

## Decisions (user)

1. **Layout A:** Filters button, chips (+N more) │ timeline group │ count │ (?).
2. **More timeline room:** up to 40% of the bar.
3. **One (?) for the whole bar**, at the far right after its own divider,
   soft outlined round style; it replaces the timeline's hover help icon.
4. **Step buttons move** (not added) from the settings pop-over onto the
   strip, **together** beside the sliders button (less mouse travel when
   stepping repeatedly), greyed out when no window has been drawn.
5. **Plain chevrons** (‹ ›), styled like the sliders button.

## Design

### Row (40px, one row)

`[Filters (n)] [chips… +N more] │ [tag] [strip] [‹] [›] [sliders] │ [count] │ [?]`

- Dividers: 1px `#e0e0e0`, inset 6px top and bottom.
- **Timeline group width** (strip + ‹ › + sliders): `clamp(round(0.40 ×
barWidth), 200, 520)` px, still a function of the bar width only. The
  strip gets the group width minus the three 30px buttons and gaps.
- **Pink tag** sits just before the group, _outside_ its fixed width, so its
  space comes from the chips area (Claude's call: the strip must not resize
  under the cursor mid-drag; the cost is that chips may refold when a window
  first appears/clears or the label changes resolution). Max width ~130px,
  ellipsis, exact dates in its tooltip; clicking it still opens settings.
- **Count** at the right, 14px, unchanged content/tooltip/faded-while-pending.
- **(?)** last: 26px outlined circle, primary colour, `#e8eef4` fill while
  its panel is open.
- No date variable / markers can't be drawn: tag, timeline group and its
  divider are omitted; chips get the space.
- Phone widths (bar < 700px): row 1 = Filters, chips, count, (?); row 2 =
  tag + timeline group, full width.

### Step buttons

- MUI `ChevronLeft` / `ChevronRight` as `IconButton`s matching the sliders
  button (30×26, same hover).
- Behaviour as today's pop-over arrows: step the window by its own length
  (`newArrowRange`, leap-day aware); disabled when there's no window, the
  timeline is off, or the step would leave the data range.
- Tooltip (Claude's call): enabled → `Step back: <label>` /
  `Step forward: <label>` where `<label>` is `formatTimeWindowLabel` of the
  range it lands on; disabled → `Draw a window on the timeline first`,
  `The timeline is switched off`, or `No more data in this direction`.
- The settings pop-over loses its Step row (Date, Window, Apply remain) and
  gains a `How the timeline works` link at the bottom that closes it and
  opens the bar's help panel.

### Help panel

- Click (?) → MUI `Popover` anchored to it (bottom-right), ~460px, header
  `How this bar works` + ✕; closes on ✕, Esc, click-away.
- Sections, numbered:
  1. **Filters** — "Narrow the data to what you're interested in. _Add or
     edit filters_ (link: opens the filter sheet, closes the panel); click a
     chip to change it, ✕ to remove it. They're saved with your analysis and
     apply everywhere."
  2. **Timeline** (only when the timeline is shown) — "Black bars show when
     there's data. Drag a window to show only that time; click outside it to
     clear. It's temporary and map-only. ‹ › step the window by its length;
     the sliders button changes the date variable, sets exact dates or turns
     it off."
  3. **Count** — "<Entities> on the map: those matching your filters, inside
     the timeline window, with data for the marker variable (<name>). Hover
     it for the details." (the window and variable clauses only when they
     apply; numbering follows the sections shown).
- While open, matching numbered pins (16px primary circles) overlay the
  Filters button, the timeline group and the count — absolutely positioned,
  taking no space, so nothing reflows.
- The old timeline `HelpIcon` and its help text are removed.

## Left to the builder

Exact pixel nudges, the pins' offsets, how the help panel's content is
split into components, and test placement for the pure helpers (step
availability, tooltip text, layout widths).
