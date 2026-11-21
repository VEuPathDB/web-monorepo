# Timeline in the Map Filter Bar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the map's timeline off the map into a compact strip in a one-row filter bar, fold overflowing filter chips into "+N more", and restore the old header's count (subset + time window + marker-config filter).

**Architecture:** Pure helpers (tag label, bar layout maths, count tooltip) are unit-tested. `MapTypePlugin` gains `markerConfigFilterFuncs`; `MapAnalysis` uses it for the count and for one shared timeline, and the three plugins' `TimeSliderComponent`s are deleted. `MapFilterBar` owns layout measurement and the settings pop-over's open state, and renders the timeline through a render prop.

**Tech Stack:** React 17 + TypeScript, Emotion `css` prop, Material-UI v4 (`Popover`, `@material-ui/icons`), visx (`TimeSlider`), Jest via `veupathdb-react-scripts test`.

**Spec:** `docs/superpowers/specs/2026-11-21-map-filter-bar-timeline-design.md`

## Global Constraints

- New files are `.ts`/`.tsx`; no `any`, no `@ts-ignore` (repo `CLAUDE.md`).
- Filter bar is one 40px row whatever the number of filters; it may get a second row only at phone widths (bar < 700px), and only for the timeline.
- Timeline width depends only on the bar's width: `clamp(round(0.32 × barWidth), 200, 380)` px inline; full width (bar − 32px) on the second row below 700px.
- Timeline strip is 30px tall, tick labels 9px.
- Pink tag: background `#fde2e8`, text `#8a2846`, 11px, pill; not a chip, no ✕.
- Settings button uses MUI `Tune` icon; pop-over header "Timeline" with ✕ (`PanelHeader`); closes on Esc and click-away.
- No "Clear window" control; clearing stays click-outside-the-window on the timeline.
- Saved `timeSliderConfig` shape (`variable`, `active`, `selectedRange`) is unchanged.
- Timeline, its buttons, the tag, and the time-window and marker-config filters' effect on the count all follow `canDrawMarkers` (`activePlugin != null && activeVariableIsOnLineage`).
- `FilterChipList` (shared core component) is not modified.
- Map UI must never scroll the page or resize the map except on window resize / panel open-close.

## Review Focus

1. **Filters whose chip renders nothing** (`FilterChipList` skips filters whose entity/variable isn't found) — "+N more" must count only chips that render, never show "+0 more", and never leave a blank gap. Pinned in Task 2 (`visibleChipCount` zero-width test) and Task 5 step 4.
2. **Dragging the window repeatedly** — the count is debounced 2s by `useSpecificEntityCounts`; the bar must show "…" while pending, not a stale number that looks final. Task 4 step 6.
3. **Timeline variable with no metadata / no date variable in the study** — no timeline, no empty 200–380px gap; chips use the space. Task 6 step 6.
4. **Window resize across the 700px breakpoint while the settings pop-over is open** — the pop-over must re-anchor or close, not float detached. Task 6 step 5 (MUI `Popover` re-positions on anchor move; close it when `placement` changes).
5. **Removing the last overflowing filter from inside the "+N more" pop-over** — the pop-over must close when no hidden chips remain rather than show an empty list. Task 5 step 4.

---

### Task 1: Time-window tag label

**Files:**

- Create: `packages/libs/eda/src/lib/map/analysis/utils/timeWindowLabel.ts`
- Test: `packages/libs/eda/src/lib/map/analysis/utils/timeWindowLabel.test.ts`

**Interfaces:**

- Produces: `formatTimeWindowLabel(range: { start: string; end: string }): string` — inputs are `YYYY-MM-DD` (as in `timeSliderConfig.selectedRange`); parse by splitting the string (no `Date`, no time zones). En dash `–`, English month abbreviations `Jan`…`Dec`.

Rule: `months = (ey − sy) × 12 + (em − sm) − (ed < sd ? 1 : 0)`. `months ≥ 24` → years; `months ≥ 2` → month + year; else days. Don't repeat shared year/month; if both ends render the same, show one.

- [ ] **Step 1: Write the failing test**

```ts
import { formatTimeWindowLabel as f } from './timeWindowLabel';

describe('formatTimeWindowLabel', () => {
  it('uses years for windows of two years or more', () => {
    expect(f({ start: '2016-01-01', end: '2018-01-01' })).toBe('2016–2018');
    expect(f({ start: '2016-03-01', end: '2018-08-31' })).toBe('2016–2018');
  });
  it('uses months for windows of two months to two years', () => {
    expect(f({ start: '2016-06-15', end: '2018-03-01' })).toBe(
      'Jun 2016–Mar 2018'
    );
    expect(f({ start: '2016-01-01', end: '2017-12-31' })).toBe(
      'Jan 2016–Dec 2017'
    );
    expect(f({ start: '2016-03-01', end: '2016-08-15' })).toBe('Mar–Aug 2016');
  });
  it('uses days for shorter windows, without repeating shared parts', () => {
    expect(f({ start: '2016-03-03', end: '2016-03-14' })).toBe('3–14 Mar 2016');
    expect(f({ start: '2016-02-28', end: '2016-03-03' })).toBe(
      '28 Feb–3 Mar 2016'
    );
    expect(f({ start: '2015-12-20', end: '2016-01-05' })).toBe(
      '20 Dec 2015–5 Jan 2016'
    );
  });
  it('shows a single value when both ends are the same', () => {
    expect(f({ start: '2016-03-03', end: '2016-03-03' })).toBe('3 Mar 2016');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/libs/eda && CI=true yarn test --watchAll=false src/lib/map/analysis/utils/timeWindowLabel`
Expected: FAIL — cannot find module `./timeWindowLabel`.

- [ ] **Step 3: Implement `formatTimeWindowLabel` in `timeWindowLabel.ts`**

- [ ] **Step 4: Run test to verify it passes** (same command). Expected: 4 passed.

- [ ] **Step 5: Commit**

```bash
git add packages/libs/eda/src/lib/map/analysis/utils/timeWindowLabel*
git commit -m "Add an abbreviated label for the map timeline window"
```

---

### Task 2: Filter bar layout maths

**Files:**

- Create: `packages/libs/eda/src/lib/map/analysis/layout/filterBarLayout.ts`
- Test: `packages/libs/eda/src/lib/map/analysis/layout/filterBarLayout.test.ts`

**Interfaces:**

- Produces:

  - `export const TIMELINE_MIN_WIDTH = 200; export const TIMELINE_MAX_WIDTH = 380; export const TIMELINE_BELOW_BREAKPOINT = 700;`
  - `export interface TimelineLayout { placement: 'inline' | 'below'; width: number }`
  - `timelineLayout(barWidth: number): TimelineLayout` — `barWidth < 700` → `{ placement: 'below', width: barWidth − 32 }`; else `{ placement: 'inline', width: clamp(Math.round(0.32 × barWidth), 200, 380) }`.
  - `visibleChipCount(chipWidths: number[], available: number, moreButtonWidth: number, gap: number): number` — if every chip fits (sum of widths + gaps between non-zero chips ≤ available) return `chipWidths.length`; otherwise the largest `k` whose first `k` chips + gaps + `gap` + `moreButtonWidth` fit. Zero-width entries (chips that render nothing) take no space and no gap.

- [ ] **Step 1: Write the failing test**

```ts
import { timelineLayout, visibleChipCount } from './filterBarLayout';

describe('timelineLayout', () => {
  it('scales with the bar between 200 and 380px', () => {
    expect(timelineLayout(1440)).toEqual({ placement: 'inline', width: 380 });
    expect(timelineLayout(1000)).toEqual({ placement: 'inline', width: 320 });
    expect(timelineLayout(700)).toEqual({ placement: 'inline', width: 224 });
  });
  it('moves below the chips on phone widths', () => {
    expect(timelineLayout(699)).toEqual({ placement: 'below', width: 667 });
    expect(timelineLayout(360)).toEqual({ placement: 'below', width: 328 });
  });
});

describe('visibleChipCount', () => {
  it('shows every chip when they all fit, without a more button', () => {
    expect(visibleChipCount([100, 100, 100], 400, 70, 8)).toBe(3);
  });
  it('leaves room for the more button when some do not fit', () => {
    expect(visibleChipCount([100, 100, 100, 100], 400, 70, 8)).toBe(3);
    expect(visibleChipCount([150, 150, 150], 300, 70, 8)).toBe(1);
    expect(visibleChipCount([400], 300, 70, 8)).toBe(0);
  });
  it('handles no chips and chips that render nothing', () => {
    expect(visibleChipCount([], 300, 70, 8)).toBe(0);
    expect(visibleChipCount([100, 0, 100], 208, 70, 8)).toBe(3);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/libs/eda && CI=true yarn test --watchAll=false src/lib/map/analysis/layout/filterBarLayout`
Expected: FAIL — cannot find module.

- [ ] **Step 3: Implement both functions and constants in `filterBarLayout.ts`**

- [ ] **Step 4: Run test to verify it passes.** Expected: 5 passed.

- [ ] **Step 5: Commit**

```bash
git add packages/libs/eda/src/lib/map/analysis/layout/filterBarLayout*
git commit -m "Add layout maths for the map filter bar's chips and timeline"
```

---

### Task 3: Compact options on `TimeSlider`

**Files:**

- Modify: `packages/libs/components/src/components/plotControls/TimeSlider.tsx` (props type ~L20-47, `axisBottomTickLabelProps` ~L83-88, `AxisBottom numTicks` ~L228)
- Modify: `packages/libs/components/src/stories/plotControls/TimeSlider.stories.tsx` (add a compact story)

**Interfaces:**

- Produces: two optional `TimeSliderProps`: `tickLabelFontSize?: number` (default `10`), `numTicks?: number` (default `width > 520 ? 10 : 5`, today's rule). Defaults leave today's rendering unchanged.

- [ ] **Step 1: Add the two props and use them** for `fontSize` in `axisBottomTickLabelProps` and `numTicks` on `AxisBottom`.

- [ ] **Step 2: Add a `Compact` story** rendering the existing story data at `width={380} height={30} tickLabelFontSize={9} numTicks={5}`.

- [ ] **Step 3: Build components so eda sees the new props**

Run: `yarn workspace @veupathdb/components build-npm-modules`
Expected: exits 0; `packages/libs/components/lib/components/plotControls/TimeSlider.d.ts` contains `tickLabelFontSize`.

- [ ] **Step 4: Commit**

```bash
git add packages/libs/components/src/components/plotControls/TimeSlider.tsx packages/libs/components/src/stories/plotControls/TimeSlider.stories.tsx
git commit -m "Let TimeSlider set its tick label size and tick count"
```

---

### Task 4: Count = subset + time window + marker-config filter

**Files:**

- Modify: `packages/libs/eda/src/lib/map/analysis/littleFilters.ts` (export a func type)
- Modify: `packages/libs/eda/src/lib/map/analysis/mapTypes/types.ts:88-102` (`MapTypePlugin`)
- Modify: `packages/libs/eda/src/lib/map/analysis/mapTypes/plugins/{Donut,Bar,Bubble}MarkerMapType.tsx` (plugin object; their `TimeSliderComponent` uses the new field instead of the private `timeSliderFilterFuncs`)
- Modify: `packages/libs/eda/src/lib/map/analysis/MapAnalysis.tsx:433-441` (counts), `:872-890` (`MapFilterBar` props)
- Modify: `packages/libs/eda/src/lib/map/analysis/layout/MapFilterBar.tsx:90-102` (tooltip from prop)
- Create: `packages/libs/eda/src/lib/map/analysis/layout/mapCountTooltip.ts`
- Test: `packages/libs/eda/src/lib/map/analysis/layout/mapCountTooltip.test.ts`

**Interfaces:**

- Produces:
  - `littleFilters.ts`: `export type LittleFilterFunc = (props: UseLittleFiltersFuncProps) => Filter[];`
  - `MapTypePlugin.markerConfigFilterFuncs: LittleFilterFunc[]` — donut and bar `[pieOrBarMarkerConfigLittleFilter]`, bubble `[markerConfigLittleFilter]`, each a module-level constant (stable identity for `useLittleFilters`).
  - `mapCountTooltip(args: { entityName: string; timeWindow?: { start: string; end: string; variableName: string }; markerVariableName?: string }): string`
  - `MapFilterBar` prop `countTooltip: string` (replaces the hard-coded `title`).
  - In `MapAnalysis` (top level, after `activePlugin`): `const canDrawMarkers = activePlugin != null && activeVariableIsOnLineage;` (move the existing one at ~L822 up and reuse it), and `timelineFilters` (subset + marker-config) and `mapCountFilters` (subset + marker-config + `timeSliderLittleFilter`), both `[]`-little-filters when `!canDrawMarkers`; and `timeWindow: { start: string; end: string } | undefined` — the config's `selectedRange` when `canDrawMarkers` and the config has `variable`, `active` and `selectedRange`, else `undefined`. Task 5 consumes `timeWindow`; Task 6 consumes `timelineFilters` and `canDrawMarkers`.

Note: the spec shows the "chosen values" wording only when the marker is custom-configured. Plugins expose no "is custom-configured" predicate, so — like the old header — the plan always shows it, worded conditionally.

- [ ] **Step 1: Write the failing tooltip test**

```ts
import { mapCountTooltip } from './mapCountTooltip';

describe('mapCountTooltip', () => {
  it('lists only the subset filters by default', () => {
    expect(mapCountTooltip({ entityName: 'Regions' })).toBe(
      'Regions that:\n• satisfy all your filters\nout of all Regions in the study'
    );
  });
  it('adds the time window and marker variable when they apply', () => {
    expect(
      mapCountTooltip({
        entityName: 'Regions',
        timeWindow: {
          start: '2016-01-01',
          end: '2018-01-01',
          variableName: 'Month',
        },
        markerVariableName: 'Area covered',
      })
    ).toBe(
      'Regions that:\n• satisfy all your filters\n' +
        '• are within the timeline window (Month, 2016-01-01 to 2018-01-01)\n' +
        '• have data for Area covered (and the chosen values, if the markers are custom-configured)\n' +
        'out of all Regions in the study'
    );
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `cd packages/libs/eda && CI=true yarn test --watchAll=false src/lib/map/analysis/layout/mapCountTooltip`
Expected: FAIL — cannot find module.

- [ ] **Step 3: Implement `mapCountTooltip`.** Run the test again. Expected: 2 passed.

- [ ] **Step 4: Add `LittleFilterFunc`, `MapTypePlugin.markerConfigFilterFuncs`, set it in the three plugins**, and make each plugin's `TimeSliderComponent` call `useLittleFilters(..., plugin.markerConfigFilterFuncs)` in place of its private `timeSliderFilterFuncs` (delete those constants).

- [ ] **Step 5: Compute the count in `MapAnalysis`.** Funcs arrays via `useMemo` on `[activePlugin, canDrawMarkers]`: `timelineFuncs = canDrawMarkers ? activePlugin.markerConfigFilterFuncs : []`, `countFuncs = canDrawMarkers ? [...timelineFuncs, timeSliderLittleFilter] : []` (use one module-level empty array constant). Count with `useSpecificEntityCounts(mapCountFilters, geoEntityList)` where `geoEntityList = useMemo(() => [geoConfig.entity], [geoConfig.entity])`. Pass its `value` as `MapFilterBar`'s `filteredCounts` (keep the existing `filteredCounts` for its other users at ~L651-689). Build `timeWindow` and `countTooltip` after `overlayVariable` is defined (~L791, uses the existing `findEntityAndVariable` from ~L303). `countTooltip` = `mapCountTooltip` with: entity plural display name; `timeWindow` (above) plus `variableName` from `findEntityAndVariable(config.variable)`; `markerVariableName` = `overlayVariable?.displayName` when `canDrawMarkers`.

- [ ] **Step 6: Show "…" while the count is pending.** In `MapFilterBar`, add prop `countPending: boolean` and render `…` when true (pass the hook's `pending`).

- [ ] **Step 7: Type check**

Run: `yarn workspace @veupathdb/eda build-npm-modules`
Expected: exits 0.

- [ ] **Step 8: Check in Chromium** at `http://localhost:8080/a/app/workspace/maps/EDAUD_xt8851doht0Bo/new`: switch the timeline to a Monthly account date variable, drag a window — count drops (e.g. "3 of 4 Regions") after ~2s, showing "…" meanwhile; turn the timeline off — count returns.

- [ ] **Step 9: Commit**

```bash
git add packages/libs/eda/src/lib/map/analysis
git commit -m "Count map data with the time window and marker variable, as the old header did"
```

---

### Task 5: One-row filter bar with folding chips and a timeline slot

**Files:**

- Modify: `packages/libs/eda/src/lib/map/analysis/layout/MapFilterBar.tsx` (rewrite of render; keep `variableLinkConfig`)
- Modify: `packages/libs/eda/src/lib/map/analysis/MapAnalysis.tsx:872-890` (new props)

**Interfaces:**

- Consumes: `timelineLayout`, `visibleChipCount` (Task 2); `formatTimeWindowLabel` (Task 1); `countTooltip`, `countPending` (Task 4).
- Produces — new `MapFilterBar` props:

  - `timeWindow?: { start: string; end: string }` — tag shown iff set.
  - `renderTimeline?: (args: { width: number; settingsOpen: boolean; onSettingsOpenChange: (open: boolean) => void }) => ReactNode` — slot omitted entirely (no reserved width) when undefined.
  - Internal state: `settingsOpen` (lifted here so the tag can open it); closed whenever `timelineLayout(...).placement` changes.

- [ ] **Step 1: Lay out the row**: Filters button → count (+ tag) → chips area (`flex: 1; minWidth: 0`) → divider + timeline slot (width from `timelineLayout(barWidth).width` when `inline`). Height 40px. When `placement === 'below'`, render the slot as a second row at full width. Measure `barWidth` with a `ResizeObserver` on the bar element.

- [ ] **Step 2: Tag.** A `<button>` styled per Global Constraints, text `formatTimeWindowLabel(timeWindow)`, `title={`${start} to ${end}`}`, `onClick={() => setSettingsOpen(true)}`.

- [ ] **Step 3: Chip folding.** Render an off-screen measuring row (`position: absolute; visibility: hidden; white-space: nowrap; pointer-events: none`, `aria-hidden`) with each filter in its own `<span>` containing `<FilterChipList filters={[filter]} …/>`, and a measured "+N more" button. Recompute `visibleChipCount(widths, chipsAreaWidth, moreWidth, 8)` on filter change and on chips-area resize. Render `<FilterChipList filters={filters.slice(0, k)} …/>` plus, when some rendered chips are hidden, a `+{hiddenRenderedCount} more ▾` button. With no filters, keep "No filters: showing all data".

- [ ] **Step 4: "+N more" pop-over.** MUI `Popover` anchored to the button, listing `<FilterChipList filters={filters} …/>` (every filter, wrapping, max-width ~420px). Close it when the hidden-rendered count reaches 0. Never render "+0 more".

- [ ] **Step 5: Pass `timeWindow` (computed in Task 4 step 5) from `MapAnalysis`;** leave `renderTimeline` undefined for now (Task 6 supplies it). The floating timeline still renders on the map until Task 6.

- [ ] **Step 6: Type check** — `yarn workspace @veupathdb/eda build-npm-modules`, exits 0.

- [ ] **Step 7: Check in Chromium**: add filters until they overflow — bar stays 40px, map doesn't move, "+N more" lists all, ✕ inside removes a filter and the pop-over closes when nothing is hidden; drag a timeline window — pink tag appears with the abbreviated label; resize the window — chips fold/unfold without flicker.

- [ ] **Step 8: Commit**

```bash
git add packages/libs/eda/src/lib/map/analysis
git commit -m "Keep the map filter bar to one row, folding extra chips into a pop-over"
```

---

### Task 6: Compact timeline and settings pop-over in the bar

**Files:**

- Modify: `packages/libs/eda/src/lib/map/analysis/TimeSliderQuickFilter.tsx` (becomes the compact strip)
- Create: `packages/libs/eda/src/lib/map/analysis/TimelineSettings.tsx` (pop-over contents)
- Modify: `packages/libs/eda/src/lib/map/analysis/MapAnalysis.tsx` (supply `renderTimeline`; delete the floating wrapper at ~L1035-1055)
- Modify: `packages/libs/eda/src/lib/map/analysis/mapTypes/types.ts` (delete `MapTypeTimeSliderProps`, `TimeSliderComponent`, unused imports)
- Modify: `packages/libs/eda/src/lib/map/analysis/mapTypes/plugins/{Donut,Bar,Bubble}MarkerMapType.tsx` (delete `TimeSliderComponent` and now-unused imports)

**Interfaces:**

- Consumes: `timelineFilters`, `canDrawMarkers` (Task 4); `renderTimeline` args (Task 5); `TimeSlider` `tickLabelFontSize`/`numTicks` (Task 3).
- Produces:

  - `TimeSliderQuickFilter` props: `{ studyId: string; entities: StudyEntity[]; filters: Filter[] | undefined; starredVariables: VariableDescriptor[]; toggleStarredVariable: (v: VariableDescriptor) => void; config: NonNullable<AppState['timeSliderConfig']>; updateConfig: (c: NonNullable<AppState['timeSliderConfig']>) => void; width: number; settingsOpen: boolean; onSettingsOpenChange: (open: boolean) => void }` (drops `siteInformation` and the `minimized` state/tab).
  - `TimelineSettings` props: `{ entities; starredVariables; toggleStarredVariable; config; updateConfig; extendedDisplayRange: { start: string; end: string } | undefined; onClose: () => void }`. Moves `newArrowRange`/`countLeapDays` and the arrow-disabling effect here from `TimeSliderQuickFilter`.

- [ ] **Step 1: Compact strip.** Row of: `TimeSlider` at `width={width - 56}` (room for two 24px buttons + gap), `height={30}`, `tickLabelFontSize={9}`, `numTicks={Math.max(2, Math.floor((width - 56) / 65))}`, existing colours/brush/disabled behaviour; then `IconButton` (ref used as anchor, `title="Timeline settings"`, `active={settingsOpen}`) with `<Tune />`; then the existing `HelpIcon`. While loading, a `<Spinner size={16} />` centred in a box of the slider's width × 30px.

- [ ] **Step 2: Settings pop-over.** MUI `Popover` (`open={settingsOpen}`, anchor = settings button, `anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}`, `transformOrigin={{ vertical: 'top', horizontal: 'right' }}`, `onClose={() => onSettingsOpenChange(false)}` — covers Esc and click-away) containing `PanelHeader title="Timeline" onClose=…` and `TimelineSettings`: rows **Date** (`InputVariables` as today), **Window** (`AxisRangeControl` as today), **Step** (◀ ▶ as today), **Apply** (`Toggle` as today). Width ~340px.

- [ ] **Step 3: Help text.** Replace the "Expand the panel with the tab or click here" paragraph with: "Open the timeline settings with the sliders button to change the date variable, set start and end dates precisely, step the window forwards and backwards, or turn the timeline filter on and off." Replace the "currently disabled… expand the panel and click on the toggle" note with "…open the timeline settings and switch it on." (shown when `!active`).

- [ ] **Step 4: Wire into the bar.** In `MapAnalysis`, pass `renderTimeline` only when `canDrawMarkers && appState.timeSliderConfig?.variable != null`, rendering `TimeSliderQuickFilter` with `filters={timelineFilters}`, `starredVariables` and `toggleStarredVariable` (`useToggleStarredVariable(analysisState)`), `config`/`updateConfig={setTimeSliderConfig}`, and the render-prop args. Delete the floating wrapper and the plugins' `TimeSliderComponent`s, `MapTypeTimeSliderProps` and the `TimeSliderComponent` field.

- [ ] **Step 5: Pop-over across the breakpoint.** Confirm (Chromium, devtools resize) that crossing 700px with the settings pop-over open closes it (Task 5's placement-change reset) rather than leaving it detached.

- [ ] **Step 6: No-timeline cases.** In Chromium, with a marker variable off the location entity's lineage (switch "Place markers by" to an entity the marker variable isn't on), confirm no timeline, no tag, count without the window, and no reserved gap in the bar.

- [ ] **Step 7: Type check and tests**

Run: `yarn workspace @veupathdb/eda build-npm-modules` — exits 0.
Run: `cd packages/libs/eda && CI=true yarn test --watchAll=false src/lib/map` — all pass.

- [ ] **Step 8: Check in Chromium** at wide, ~1000px and phone widths: timeline 30px in the bar, nothing timeline-related on the map, legend uncovered; drag/clear window; sliders button opens the pop-over, ✕/Esc/click-away close it; tag click opens it; switching off greys the strip and drops the tag.

- [ ] **Step 9: Commit**

```bash
git add packages/libs/eda/src/lib/map/analysis
git commit -m "Move the map timeline into the filter bar with a settings pop-over"
```

---

### Task 7: Update the redesign doc

**Files:**

- Modify: `packages/libs/eda/docs/map-redesign.md` (§2 layout diagram and table rows "Filter bar" and "Time slider"; the overflow note about the 750px time slider under "The map must not move"; plugin pieces list near "`LegendComponent`, `TimeSliderComponent`"; remove the known issue "Legend and time slider can overlap…")

- [ ] **Step 1: Edit the doc** to describe: one-row bar with count, tag, folding chips and the compact timeline; `markerConfigFilterFuncs` in place of `TimeSliderComponent`; count = subset + time window + marker-config filter.

- [ ] **Step 2: Commit**

```bash
git add packages/libs/eda/docs/map-redesign.md
git commit -m "Describe the filter-bar timeline in the map redesign doc"
```
