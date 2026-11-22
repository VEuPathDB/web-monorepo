# Filter Bar Round 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-lay the map filter bar as Filters/chips │ timeline │ count │ (?), give the timeline up to 40% of the bar, replace the timeline's help icon with one help panel for the whole bar, and move the step buttons from the settings pop-over onto the strip.

**Architecture:** Pure helpers (layout widths, step-button state, help sections) are unit-tested; `TimeSliderQuickFilter` gains the step buttons and loses its `HelpIcon`; `TimelineSettings` loses its Step row and gains a help link; `MapFilterBar` is reordered and gains a `FilterBarHelp` pop-over with overlay pins.

**Tech Stack:** React 17 + TypeScript, Emotion `css`, MUI v4 (`Popover`, `@material-ui/icons`), Jest via `veupathdb-react-scripts test`.

**Spec:** `docs/superpowers/specs/2026-11-22-filter-bar-layout-v2-design.md` (builds on `docs/superpowers/specs/2026-11-21-map-filter-bar-timeline-design.md`)

## Global Constraints

- New files `.ts`/`.tsx`; no `any`, no `@ts-ignore` (repo `CLAUDE.md`).
- Bar is one 40px row; second row only at bar width < 700px (timeline group only).
- Timeline group width (strip + ‹ › + sliders) = `clamp(round(0.40 × barWidth), 200, 520)`, from the bar width only.
- Pink tag outside the group's fixed width, max ~130px, ellipsis, exact dates in tooltip.
- Dividers 1px `#e0e0e0`, inset 6px top/bottom. Count 14px at the right. (?) 26px outlined circle in the primary colour, `#e8eef4` fill while open, after its own divider.
- Step buttons: MUI `ChevronLeft`/`ChevronRight` in the map `IconButton` (as the sliders button); tooltips exactly `Step back: <label>`, `Step forward: <label>`, `Draw a window on the timeline first`, `The timeline is switched off`, `No more data in this direction`.
- Help panel header `How this bar works`; settings link text `How the timeline works`.
- Dev site serves eda's compiled `lib/`: run `yarn workspace @veupathdb/eda build-npm-modules` before any Chromium check.

## Review Focus

1. **Tag appearing/changing resolution mid-drag** — the strip must not change width (chips may refold). Task 4 step 6.
2. **Stepping repeatedly** — each click must use the latest window (no stale closure stepping from an old range twice). Task 3 step 5.
3. **No timeline** (no date variable / markers can't be drawn) — help panel shows 2 sections numbered 1–2, no timeline pin, no orphan divider. Task 4 tests + step 6.
4. **Help panel open while the bar re-lays out** (window resize across 700px) — pins and panel must not float detached; close the panel on placement change, as the settings pop-over does. Task 4 step 4.
5. **"How the timeline works" link** — settings pop-over must close before the help panel opens (never two pop-overs at once). Task 3 step 4 / Task 4 step 4.

---

### Task 1: Wider timeline group

**Files:**

- Modify: `packages/libs/eda/src/lib/map/analysis/layout/filterBarLayout.ts`
- Test: `packages/libs/eda/src/lib/map/analysis/layout/filterBarLayout.test.ts`

**Interfaces:**

- Produces: `TIMELINE_MAX_WIDTH = 520`; `timelineLayout` inline width `clamp(Math.round(0.40 × barWidth), 200, 520)` (breakpoint and `below` rule unchanged).

- [ ] **Step 1: Update the `timelineLayout` test expectations**

```ts
expect(timelineLayout(1440)).toEqual({ placement: 'inline', width: 520 });
expect(timelineLayout(1000)).toEqual({ placement: 'inline', width: 400 });
expect(timelineLayout(700)).toEqual({ placement: 'inline', width: 280 });
// below-breakpoint cases unchanged: 699 → 667, 360 → 328
```

(test name: `scales with the bar between 200 and 520px`)

- [ ] **Step 2: Run** `cd packages/libs/eda && CI=true yarn test --watchAll=false src/lib/map/analysis/layout/filterBarLayout` — Expected: FAIL (380 ≠ 520).
- [ ] **Step 3: Change the factor to 0.40 and the max to 520.**
- [ ] **Step 4: Run again** — Expected: 5 passed.
- [ ] **Step 5: Commit** `git commit -m "Give the map timeline up to 40% of the filter bar"`

---

### Task 2: Step-button state

**Files:**

- Create: `packages/libs/eda/src/lib/map/analysis/utils/timelineStep.ts` (move `newArrowRange`, `isLeapYear`, `countLeapDays` here from `TimelineSettings.tsx`, unchanged)
- Test: `packages/libs/eda/src/lib/map/analysis/utils/timelineStep.test.ts`

**Interfaces:**

- Produces:

  - `export type DateRange = { start: string; end: string }`
  - `export function newArrowRange(range: DateRange, arrow: 'left' | 'right'): DateRange`
  - `export interface StepButtonState { enabled: boolean; tooltip: string; range?: DateRange }`
  - `export function stepButtons(args: { selectedRange?: DateRange; dataRange?: DateRange; active: boolean }): { back: StepButtonState; forward: StepButtonState }` — no window → both disabled `Draw a window on the timeline first`; inactive → both disabled `The timeline is switched off`; otherwise each is disabled `No more data in this direction` when stepping a whole window-length would start before `dataRange.start` / end after `dataRange.end` (today's rule from `TimelineSettings`), else enabled with `range = newArrowRange(...)` and tooltip `Step back: ${formatTimeWindowLabel(range)}` / `Step forward: …`.

- [ ] **Step 1: Write the failing test**

```ts
import { stepButtons } from './timelineStep';

const dataRange = { start: '2015-01-01', end: '2021-01-01' };

describe('stepButtons', () => {
  it('is disabled until a window is drawn', () => {
    const { back, forward } = stepButtons({ dataRange, active: true });
    expect(back).toEqual({
      enabled: false,
      tooltip: 'Draw a window on the timeline first',
    });
    expect(forward).toEqual({
      enabled: false,
      tooltip: 'Draw a window on the timeline first',
    });
  });
  it('is disabled while the timeline is switched off', () => {
    const selectedRange = { start: '2018-01-01', end: '2019-01-01' };
    expect(
      stepButtons({ selectedRange, dataRange, active: false }).back
    ).toEqual({
      enabled: false,
      tooltip: 'The timeline is switched off',
    });
  });
  it('names where each step lands', () => {
    const selectedRange = { start: '2018-01-01', end: '2019-01-01' };
    const { back, forward } = stepButtons({
      selectedRange,
      dataRange,
      active: true,
    });
    expect(back).toEqual({
      enabled: true,
      tooltip: 'Step back: Jan 2017–Jan 2018',
      range: { start: '2017-01-01', end: '2018-01-01' },
    });
    expect(forward).toEqual({
      enabled: true,
      tooltip: 'Step forward: Jan 2019–Jan 2020',
      range: { start: '2019-01-01', end: '2020-01-01' },
    });
  });
  it('stops at the end of the data', () => {
    const selectedRange = { start: '2019-01-01', end: '2021-01-01' };
    const { back, forward } = stepButtons({
      selectedRange,
      dataRange,
      active: true,
    });
    expect(back.enabled).toBe(true);
    expect(forward).toEqual({
      enabled: false,
      tooltip: 'No more data in this direction',
    });
  });
});
```

- [ ] **Step 2: Run** `cd packages/libs/eda && CI=true yarn test --watchAll=false src/lib/map/analysis/utils/timelineStep` — Expected: FAIL, module not found.
- [ ] **Step 3: Create `timelineStep.ts`** (moved functions + `stepButtons`). Leave `TimelineSettings.tsx` untouched in this task (Task 3 removes its copies).
- [ ] **Step 4: Run again** — Expected: 4 passed.
- [ ] **Step 5: Commit** `git commit -m "Add step-button state for the map timeline"`

---

### Task 3: Step buttons on the strip; Step row out of the pop-over

**Files:**

- Modify: `packages/libs/eda/src/lib/map/analysis/TimeSliderQuickFilter.tsx`
- Modify: `packages/libs/eda/src/lib/map/analysis/TimelineSettings.tsx`
- Modify: `packages/libs/eda/src/lib/map/analysis/layout/MapFilterBar.tsx` (`TimelineSlotProps` only)

**Interfaces:**

- Consumes: `stepButtons`, `newArrowRange` (Task 2); `timelineLayout` (Task 1).
- Produces:

  - `TimelineSlotProps` gains `onShowHelp: () => void`.
  - `TimeSliderQuickFilter` props gain `onShowHelp: () => void` (from the slot); its `width` is now the whole group (strip + ‹ › + sliders).
  - `TimelineSettings` props: drop `extendedDisplayRange`; add `onShowHelp: () => void`.

- [ ] **Step 1: Strip.** Order: strip, ‹, ›, sliders. `BUTTONS_WIDTH` = three 30px `IconButton`s + gaps (measure; ~100). Delete the `HelpIcon`, the `helpText` block and their imports.
- [ ] **Step 2: Step buttons.** `const { back, forward } = stepButtons({ selectedRange, dataRange: extendedDisplayRange, active })`; render `IconButton title={back.tooltip} disabled={!back.enabled} onClick={() => back.range && updateConfig({ ...config, selectedRange: back.range })}` with `<ChevronLeft />`, same for forward with `<ChevronRight />`.
- [ ] **Step 3: Pop-over.** In `TimelineSettings` delete the Step row, `ArrowButton`, the arrow-disabling `useMemo`, and the moved helpers; add a bottom link `How the timeline works` (button styled as a link) calling `onClose()` then `onShowHelp()`.
- [ ] **Step 4: Wire `onShowHelp`** through `TimelineSlotProps` (MapFilterBar passes a no-op until Task 4).
- [ ] **Step 5: Type check, test, check.** `yarn workspace @veupathdb/eda build-npm-modules` → exit 0; `CI=true yarn test --watchAll=false src/lib/map` → all pass. In Chromium: draw a window, click › three times quickly — the window moves three whole steps (no repeats of the same step); tooltips name the landing range; buttons grey with the right tooltip with no window / timeline off / at the data's end.
- [ ] **Step 6: Commit** `git commit -m "Move the timeline's step buttons onto the strip"`

---

### Task 4: Re-laid bar with a help panel for the whole bar

**Files:**

- Modify: `packages/libs/eda/src/lib/map/analysis/layout/MapFilterBar.tsx`
- Create: `packages/libs/eda/src/lib/map/analysis/layout/filterBarHelp.ts` (pure)
- Create: `packages/libs/eda/src/lib/map/analysis/layout/FilterBarHelp.tsx` (pop-over contents)
- Test: `packages/libs/eda/src/lib/map/analysis/layout/filterBarHelp.test.ts`
- Modify: `packages/libs/eda/src/lib/map/analysis/MapAnalysis.tsx` (`markerVariableName` prop)
- Modify: `packages/libs/eda/docs/map-redesign.md` (Filter bar / Time slider rows, diagram)

**Interfaces:**

- Consumes: `TimelineSlotProps.onShowHelp` (Task 3); `timelineLayout` (Task 1).
- Produces:

  - `filterBarHelpSections(args: { entityName: string; showTimeline: boolean; windowApplies: boolean; markerVariableName?: string }): { key: 'filters' | 'timeline' | 'count'; number: number }[]`
  - `countHelpText(args: { entityName: string; windowApplies: boolean; markerVariableName?: string }): string`
  - `MapFilterBar` prop `markerVariableName?: string` (MapAnalysis passes `overlayVariable?.displayName` when `canDrawMarkers`).

- [ ] **Step 1: Write the failing test**

```ts
import { countHelpText, filterBarHelpSections } from './filterBarHelp';

describe('filterBarHelpSections', () => {
  it('numbers filters, timeline and count', () => {
    expect(
      filterBarHelpSections({
        entityName: 'Regions',
        showTimeline: true,
        windowApplies: false,
      })
    ).toEqual([
      { key: 'filters', number: 1 },
      { key: 'timeline', number: 2 },
      { key: 'count', number: 3 },
    ]);
  });
  it('drops the timeline section, and renumbers, without a timeline', () => {
    expect(
      filterBarHelpSections({
        entityName: 'Regions',
        showTimeline: false,
        windowApplies: false,
      })
    ).toEqual([
      { key: 'filters', number: 1 },
      { key: 'count', number: 2 },
    ]);
  });
});

describe('countHelpText', () => {
  it('names what the count includes', () => {
    expect(
      countHelpText({
        entityName: 'Regions',
        windowApplies: true,
        markerVariableName: 'Area covered',
      })
    ).toBe(
      'Regions on the map: those matching your filters, inside the timeline window, with data for the marker variable (Area covered). Hover it for the details.'
    );
    expect(
      countHelpText({
        entityName: 'Regions',
        windowApplies: false,
        markerVariableName: 'Area covered',
      })
    ).toBe(
      'Regions on the map: those matching your filters, with data for the marker variable (Area covered). Hover it for the details.'
    );
    expect(countHelpText({ entityName: 'Regions', windowApplies: false })).toBe(
      'Regions on the map: those matching your filters. Hover it for the details.'
    );
  });
});
```

- [ ] **Step 2: Run** `cd packages/libs/eda && CI=true yarn test --watchAll=false src/lib/map/analysis/layout/filterBarHelp` — Expected: FAIL, module not found.
- [ ] **Step 3: Implement `filterBarHelp.ts`.** Run again — Expected: 3 passed.
- [ ] **Step 4: Re-lay `MapFilterBar`** per the spec's row: Filters, chips, divider, tag (outside the group, `maxWidth: 130`, ellipsis), timeline group (width `layout.width − SLOT_INSET`), divider, count (14px), divider, (?) button. State `helpOpen`; close it (and settings) when `layout.placement` changes; `onShowHelp` in the slot sets `helpOpen`. Phone placement: row 1 Filters, chips, count, (?); row 2 tag + group. No timeline: omit tag, group and its divider.
- [ ] **Step 5: `FilterBarHelp`** — MUI `Popover` anchored to (?) (`anchorOrigin` bottom/right, `transformOrigin` top/right), 460px, `PanelHeader title="How this bar works"`, sections from `filterBarHelpSections` with the spec's copy (Filters has an `Add or edit filters` link that calls `onOpenFilters()` and closes the panel; Count uses `countHelpText`). While open, render pins (16px primary circles, `position: absolute`, no layout effect) on the Filters button, timeline group and count, numbered from the same sections.
- [ ] **Step 6: Build, test, check.** `yarn workspace @veupathdb/eda build-npm-modules` → exit 0; `CI=true yarn test --watchAll=false src/lib/map` → all pass. In Chromium: row order and dividers as the mockup; drag a window — the strip doesn't change width when the tag appears; (?) opens the panel with pins and nothing reflows; "Add or edit filters" opens the filter sheet; "How the timeline works" closes settings and opens the panel; narrow the bar below 700px with the panel open — it closes; layout matches the phone rule.
- [ ] **Step 7: Update `map-redesign.md`** (diagram row, Filter bar and Time slider table rows).
- [ ] **Step 8: Commit** `git commit -m "Re-lay the map filter bar with one help panel for the whole bar"`
