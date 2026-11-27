# Timeline in the map filter bar — design

Date: 2026-11-21
Status: design, pending approval
Branch: `ccr-27b00449-g2d3sx` (follows the full-screen map redesign,
`packages/libs/eda/docs/map-redesign.md`)
Mockups: `.superpowers/brainstorm/228550-1795302447/content/filter-bar-layout-v2.html`
(option A is the chosen layout)

## Why

In the redesigned full-screen map the timeline (`TimeSliderQuickFilter`)
floats bottom-centre over the map at a fixed 750px. At ordinary window
widths it covers the legend (pinned bottom-left), crowds the scale bar,
and shows a stray vertical scrollbar (its wrapper's `overflowX: auto`
makes the other axis `auto` too, and the content is 3px taller than the
box). `map-redesign.md` already lists the overlap as a known issue.

The timeline is both a visualisation (when is there data?) and a filter.
It is short and wide, which is the shape of the filter bar. Moving it
there, in a more compact form, takes it off the map entirely.

Separately, the redesign's filter-bar count ("4 of 4 Regions") counts
subset filters only. Before the redesign the header count ("Showing: 4
Regions", `MapTypeHeaderStudyDetails.tsx` on `main`) also reflected the
timeline window and the marker variable (has data for it / chosen values
if custom-configured), and its tooltip said so. This design restores
that, minus the viewport.

## Goals

- The timeline lives in the filter bar, about 30px tall, and nothing
  timeline-related floats over the map any more.
- The filter bar is one fixed-height row (40px) regardless of how many
  filters there are: adding or removing a filter never resizes the map.
- The count matches the old header again: it includes the timeline window
  and the has-marker-variable (marker-config) filter, and says so.
- Every control from today's expanded timeline panel stays available,
  behind a settings button.

## Non-goals

- Making the timeline window a first-class filter. It never appeared as a
  chip or in the Filters sheet, and still won't. It stays a "little
  filter" applied to markers, records/counts and option lists, exactly as
  today (`markerDataFilterFuncs`, `selectionFilterFuncs`,
  `visibleOptionFilterFuncs` in `mapTypes/shared.tsx`).
- Changing the shared `FilterChipList` (also used by the workspace,
  notebooks and `GlobalFiltersDialog`).
- Changing what the timeline's bars mean or how its data is fetched.

## Anti-goals

- The map changing size when a filter is added or removed.
- The count jumping around the bar as chips come and go.
- A long pink tag (e.g. two full day-resolution dates) eating the chips'
  space.
- Hiding filters with no visible sign that more exist.

## Constraints

- `TimeSlider` (`packages/libs/components/src/components/plotControls/TimeSlider.tsx`)
  is used only by the map and its Storybook story, so it can gain props
  freely. Its defaults must not change behaviour for the story.
- Saved analyses keep their `timeSliderConfig` (`variable`, `active`,
  `selectedRange`) unchanged: no app-state migration.
- The map UI must never scroll the page or change the map's size except
  from window resizes and panels opening/closing (`MapAnalysis.tsx`
  layout comments; `MapResizeObserver`).
- Studies with no date variable suitable for the timeline show no
  timeline (today `TimeSliderQuickFilter` returns `null` when
  `variable == null`).

## Approaches considered

1. **Plugins keep supplying the timeline; `MapAnalysis` renders it into a
   slot in `MapFilterBar`.** Smallest change at first sight; keeps
   `MapTypePlugin.TimeSliderComponent` and its three near-identical
   implementations. Initially chosen, then dropped: the count also needs
   each plugin's marker-config filter, so the plugin interface has to
   change anyway, which removes this option's only advantage.
2. **Lift the timeline out of the plugins** — chosen. Each plugin supplies
   only its marker-config filter functions (new `MapTypePlugin` field,
   e.g. `markerConfigFilterFuncs`: donut and bar
   `[pieOrBarMarkerConfigLittleFilter]`, bubble
   `[markerConfigLittleFilter]`). `MapAnalysis` uses that field for both
   the count and one shared timeline in the bar. The three
   `TimeSliderComponent`s (and `MapTypeTimeSliderProps`) are deleted, and
   the count and the timeline's bars can't drift apart.
3. **A new timeline component** instead of adapting `TimeSlider`. Rejected:
   `TimeSlider` already takes width and height and has no other users; the
   compact look needs a couple of extra props.

The choice of approach was left to Claude; the user picked the visual
layout (A).

## Design

### Filter bar layout (mockup option A)

```
┌────────────────────────────────────────────────────────────────────────────────┐
│ [⧩ Filters (5)]  3 of 4 Regions ‹2016–2018›  (chip ✕)(chip ✕)(chip ✕)[+2 more ▾] │ ▮▮▮▮▮[▒▒▒▒]▮▮▮  ⫶ ? │
└────────────────────────────────────────────────────────────────────────────────┘
   fixed               fixed                    flexible, folds overflow          timeline, fixed-ish
```

Left to right in one 40px row:

1. **Filters button** — unchanged.
2. **Count** — moves from the far right to directly after the Filters
   button, so its position never depends on the chips. Followed by the
   pink time-window tag when applicable (below).
3. **Chips** — as many as fit, in filter order, then a **"+N more ▾"**
   button when some don't fit. "+N more" opens a pop-over listing _every_
   filter chip (same click-to-edit and ✕-to-remove behaviour as in the
   bar). With no filters: "No filters: showing all data", as today.
4. **Timeline** — compact strip, then the **settings button** (sliders
   icon, MUI `Tune`, as used by the tool rail's Map button and the
   legend's "Change marker settings") and the **help button** ("?",
   today's `HelpIcon` and help text, updated for the new controls). A thin
   divider separates it from the chips.

The floating timeline wrapper in `MapAnalysis.tsx` (the absolutely
positioned `div` around `activePlugin.TimeSliderComponent`, bottom-centre
of the map) is removed.

### Count

- Value: location-entity count with, as in the old header:
  1. **subset filters**;
  2. **the timeline little filter** (`timeSliderLittleFilter`, which
     already returns `[]` when the timeline is off, has no window, or has
     no variable);
  3. **the active marker style's marker-config little filter**
     (`pieOrBarMarkerConfigLittleFilter` for donut and bar, bubble's
     `markerConfigLittleFilter`) — the same filter the timeline's bars
     already use. By default it is just "has a value for the marker
     variable" (a `stringSet` of the whole vocabulary, or a `numberRange`
     / date range over the full range); when the marker is
     custom-configured it narrows to the chosen values (donut/bar selected
     values without "All other values"; bubble numerator ∪ denominator
     values), as the old header's "appropriate values" bullet described.
- The total ("of 4") stays the unfiltered location-entity count. So
  "3 of 4 Regions" when one region is outside the window or has no value
  for the marker variable.
- Not included (unlike the old header): the viewport. The Selection panel
  already covers "what's in view / selected"; including the viewport would
  change the bar on every pan.
- **Plumbing:** only the plugins know their marker-config filter today
  (each plugin's private `timeSliderFilterFuncs`). The new
  `MapTypePlugin.markerConfigFilterFuncs` field (see Approaches) exposes
  it; `MapAnalysis` applies subset + timeline + that field via
  `useLittleFilters` for the count, and passes subset + that field to the
  shared timeline for its bars, as each plugin does today.
- Tooltip: like the old header's — the count is the Regions (entity
  display name) that satisfy all your filters; that are within the
  timeline window (only while a window is applied, with the exact dates
  and the date variable's name); that have data for the marker variable
  (named); and that have the chosen values, if the marker is
  custom-configured (only when it is).
- The Filters sheet's own counts are unchanged (they reflect subset
  filters only). That difference is accepted; the tag and tooltip explain
  it.

### Pink time-window tag

Shown after the count only while the timeline little filter is in effect
(variable set, `active`, `selectedRange` set). Styled as in the mockup: a
small pill, pink background (`#fde2e8`-ish), dark pink text, 11px — not a
chip, no ✕.

Text is abbreviated by the window's length:

| Window length | Format                       | Example                              |
| ------------- | ---------------------------- | ------------------------------------ |
| ≥ 2 years     | years                        | `2016–2018`                          |
| ≥ 2 months    | month + year                 | `Mar 2016–Aug 2018`                  |
| shorter       | days (collapse shared parts) | `3–14 Mar 2016`, `28 Feb–3 Mar 2016` |

Same-year/same-month parts are not repeated (`Mar–Aug 2016`,
`3–14 Mar 2016`). If start and end render identically (e.g. `2016–2016`),
show the single value (`2016`). Exact ISO dates go in the tag's tooltip.
Clicking the tag opens the timeline settings pop-over.

### Compact timeline

- `TimeSlider` rendered about 30px tall (bars, axis line, 9px tick
  labels), same "has data" bars, same drag-a-window brush (pink), same
  grey look when switched off (window kept but ignored), same
  click-outside-the-window to clear.
- Width: fills the space it's given, from about 380px down to about
  200px; fewer ticks when narrow (today's rule is 10 ticks above 520px,
  else 5; at these widths use about one tick per 60–70px). Width must be
  measured (e.g. `ResizeObserver`) rather than fixed.
- `TimeSlider` gains whatever optional props this needs (e.g. tick label
  font size, margins, tick count); defaults keep today's rendering.
- While loading: a small spinner in the timeline's slot, at the slot's
  size, so the bar doesn't reflow.

### Timeline settings pop-over

Opened by the sliders button (or the pink tag). Anchored below the
timeline. Header "Timeline" with ✕ top-right (as `PanelHeader`); also
closes on Esc and on clicking elsewhere. Contents, top to bottom — all
existing controls from today's expanded panel, with today's behaviour:

- **Date** — the date-variable picker (`InputVariables` with
  `timeSliderVariableConstraints`). Changing it resets the window and
  turns the timeline on, as today.
- **Window** — exact start/end (`AxisRangeControl`, `valueType="date"`).
- **Step** — ◀ ▶ step the window by its own length, disabled at the ends
  (today's `newArrowRange` and disabling logic).
- **Apply** — the on/off toggle.

No "Clear window" control: clearing stays as today (click the timeline
outside the window). The settings button shows a pressed state while the
pop-over is open. Today's `minimized` expand/collapse tab and its
`useState` go away.

### Narrow windows

The timeline's width depends **only on the bar's width, never on the
chips** (Claude's call, from the "nothing changes when filters change"
anti-goal; it also keeps measurement one-way: timeline width first, chips
fold into what's left).

1. The timeline's width is a function of the bar width: about 380px on
   wide bars, shrinking towards about 200px as the window narrows.
2. Chips get the remaining space and fold into "+N more" when they don't
   fit, at any width. Adding or removing a filter never changes the
   timeline's width or ticks. The minimum is zero visible chips plus
   "+N more".
3. At phone widths (when even that doesn't fit — roughly under 700px),
   the timeline moves to a second row of the bar, full width. This is the
   one case where the bar's height varies, and it varies with window
   width, never with the number of filters.

### When markers can't be drawn

Today the floating timeline renders only when `canDrawMarkers` is true
(`MapAnalysis.tsx`: an active plugin exists and the marker variable is on
the location entity's lineage). In the bar, the **timeline, its settings
and help buttons, the pink tag, and the window's and marker-config
filter's effect on the count all follow `canDrawMarkers` together**
(Claude's call): when markers can't be drawn, the timeline slot is empty,
there's no tag, and the count uses subset filters only (the marker-config
filter would otherwise apply to a variable that isn't being shown). `timeSliderConfig` is left untouched, so the window
comes back when markers do. This avoids a tag for a window that can't be
seen, changed or cleared.

### Narrow-window detail

The count and the pink tag never fold; the tag may be dropped before the
count if space is extremely tight (builder's call on the exact rule).

## Files likely touched

- `packages/libs/eda/src/lib/map/analysis/layout/MapFilterBar.tsx` — new
  layout, chip folding, "+N more" pop-over, timeline slot, tag.
- `packages/libs/eda/src/lib/map/analysis/TimeSliderQuickFilter.tsx` —
  compact strip + settings pop-over; drops the minimized panel.
- `packages/libs/components/src/components/plotControls/TimeSlider.tsx` —
  optional props for the compact look.
- `packages/libs/eda/src/lib/map/analysis/MapAnalysis.tsx` — count query
  with the timeline and marker-config filters, render the shared timeline
  into the bar, remove the floating wrapper.
- `packages/libs/eda/src/lib/map/analysis/mapTypes/types.ts` — add
  `markerConfigFilterFuncs` to `MapTypePlugin`; remove
  `TimeSliderComponent` and `MapTypeTimeSliderProps`.
- `mapTypes/plugins/{Donut,Bar,Bubble}MarkerMapType.tsx` — set
  `markerConfigFilterFuncs`; delete their `TimeSliderComponent`s.
- `packages/libs/eda/docs/map-redesign.md` — update the layout diagram,
  the Filter bar / Time slider rows, and remove the overlap known issue.

## Left to the builder

- How chips are measured and folded (e.g. render the full list off-screen
  to measure, then render `FilterChipList` with the visible slice; or
  measure the rendered chips). Must not flicker or loop on resize.
- Pop-over implementation (MUI `Popover`/`Popper` are available via
  `@material-ui/core`; no pop-over exists in the map UI yet).
- Exact pixel sizes, colours, and the phone-width breakpoint, within the
  mockup's look.
- Date formatting helper and its unit tests (the tag formats above are the
  spec; locale is English month abbreviations).
- Wording updates to the "?" help text.
- Whether the count query reuses `useEntityCounts` with extra filters.

## Verification

- Visual check in Chromium at the dev URL
  (`/a/app/workspace/maps/EDAUD_xt8851doht0Bo/new`) at wide, ~1000px and
  phone widths, with a monthly-account date variable selected so the
  timeline has data (as on QA).
- Count changes when a window is dragged, returns when the timeline is
  turned off, and the tag appears/disappears accordingly.
- Adding filters until they overflow: bar height unchanged, "+N more"
  lists all of them, ✕ in the pop-over removes the filter.
- Unit tests for the tag date formatter.
- `yarn workspace @veupathdb/eda build-npm-modules` passes.
