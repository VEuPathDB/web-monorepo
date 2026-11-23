# Full-screen map redesign

Status: phase 1 implemented on branch `ccr-27b00449-g2d3sx` (not yet tested
against a live back end). This document records what changed, why, how it
fits with the regular EDA workspace, and the plan for phase 2.

Code lives in `src/lib/map/analysis/` unless stated otherwise.

## 1. Problems with the previous UI

- **Configuration was buried.** Choosing a marker style meant opening
  _Configure Map › Single Variable Maps › Donuts/Bar plots/Bubbles_ in a
  side navigation menu. The style was a menu item rather than a setting.
- **Drawers covered the map.** Every side-nav item opened a drawer up to
  70vw wide over the map, so the effect of a change couldn't be seen while
  making it.
- **Floating panels got lost.** Legends and "supporting plots" were
  draggable panels with saved positions. A gear icon on the legend reopened
  settings.
- **Selecting markers showed nothing.** A selection only affected the
  supporting plots (and the mega-study list). Snackbars explained this after
  the fact. Zooming to another aggregation level cancelled the selection.
- **There was no way to see the records** behind a marker, or copy its
  coordinates.
- **One geo-entity was assumed.** The location entity was guessed from the
  marker variable (`findLeastAncestralGeoConfig`) and stored per marker
  type, so it could disagree between the markers, the viewport filter and
  the selection filter.
- **"Project" (mega-study) listing was bolted on.** It used the hard-coded
  `Study` root entity (`EUPATH_0000605` / `OBI_0001622`), which will no
  longer exist.

## 2. New layout

```
┌──────────────────────────────────────────────────────────────────────┐
│ logo │ Map · Study name / Analysis name (editable) │ Open in Dataset │
│      │                                             │ Explorer │Share │  MapTopBar
├──────────────────────────────────────────────────────────────────────┤
│ [Filters (2)] chip +2 │ ‹2016–18› ▮▮[▒▒]▮ ‹ › ⫶ │ 1,234 of 5,678 │ ? │  MapFilterBar
├────┬───────────────┬─────────────────────────────────┬───────────────┤
│Map │ Map settings  │ [Lasso][Clear][Records] hint    │ Selection     │
│Filt│ Place markers │                                 │ counts        │
│Down│ by: [Houses▾] │            M A P                │ locations     │
│Note│ Marker style  │                                 │ ⧉ copy ↗ map  │
│    │ (◔)(▥)(●)     │                                 │ [Filter to    │
│    │ Colour by …   │ ┌Legend──┐                      │  selection]   │
│Anal│ …             │ └────────┘                      │ Records table │
│Stdy│               │                                 │               │
└────┴───────────────┴─────────────────────────────────┴───────────────┘
 ToolRail MapSettingsPanel (docked)                      SelectionPanel (docked)
```

| Piece             | File                                         | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ----------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Top bar           | `layout/MapTopBar.tsx`                       | Replaces `MapHeader`. Site logo, study, editable analysis name, link to the Dataset Explorer (same analysis id), Share.                                                                                                                                                                                                                                                                                                                                                                           |
| Filter bar        | `layout/MapFilterBar.tsx`                    | Always visible, one 40px row whatever the number of filters (a second row only for the timeline, when the bar is under ~830px and the rest of the row would not fit beside it). Filters button and chips (extra ones fold into a "+N more" pop-over) │ pink time-window tag + timeline │ count (location entity: subset + timeline window + marker-config filter) │ (?). The (?) opens one help panel for the whole bar, with numbered pins on its parts while open (`layout/FilterBarHelp.tsx`). |
| Tool rail         | `layout/ToolRail.tsx`                        | Labelled icon buttons: Map, Filter, Download, Notes, Analyses, Study.                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Map settings      | `layout/MapSettingsPanel.tsx`                | **Docked beside the map, not over it** (400px). Order follows the decisions: location entity, marker style, then the style's own settings (the existing `*MarkerConfigurationMenu`s). Open/closed state is saved (`isSidePanelExpanded`).                                                                                                                                                                                                                                                         |
| Sheets            | `layout/Sheet.tsx`                           | Page-like content (Filter/Subsetting, Download, Notes, My analyses, Study details, Share) slides over the map. It closes with ✕, Escape or a click on the dimmed map. Not saved in the analysis.                                                                                                                                                                                                                                                                                                  |
| Legend            | `layout/LegendCard.tsx`                      | Fixed bottom-left, collapsible, never draggable. Its tune button opens the settings panel.                                                                                                                                                                                                                                                                                                                                                                                                        |
| Selection toolbar | `selection/MapSelectionToolbar.tsx`          | Lasso / Clear / Records buttons and a one-line hint of the gestures (replaces the snackbars).                                                                                                                                                                                                                                                                                                                                                                                                     |
| Selection panel   | `selection/SelectionPanel.tsx`               | Docked right (460px). See §3.                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Time slider       | `TimeSliderQuickFilter` + `TimelineSettings` | A compact strip in the filter bar with ‹ › step buttons (by the window's length) and a sliders button; the group is 40% of the bar's width (200–520px, less if the rest of the row needs the room; from the bar's width only). The sliders button (or the pink tag) opens a pop-over with the date variable, exact dates and on/off switch.                                                                                                                                                       |
| Context popup     | `selection/MapContextPopup.tsx`              | Right-click a marker or any point. See §4.                                                                                                                                                                                                                                                                                                                                                                                                                                                        |

`MapAnalysis.tsx` composes these pieces.

**The map must not move unless the user moves it:**

- `MapResizeObserver` handles container resizes: a panel opening or
  closing, or a bar changing height. Leaflet's default `invalidateSize()`
  keeps the map _centre_ fixed, which made every marker jump sideways when
  a panel opened. The observer resizes without panning, then pans by
  however far the container's top-left corner moved. On-screen positions
  stay unchanged (checked in headless Chromium).
- The root and the map area are `overflow: hidden`. The hint text or the
  legend can't overflow and toggle a page scrollbar, which would resize
  the map. The filter bar never changes height when filters are added or
  removed: extra chips fold into a pop-over.
- Fit-to-markers is a one-shot on first load at the default view
  (`InitialFitProps`). Previously it re-ran after any re-render while the
  saved view was still the default, such as a selection click or
  marker-type switch.
- **Zoom to data** (zoom control button) goes back to the default world
  view, which fetches markers for all data, then re-arms the one-shot fit
  (`MapVEuMap` `onZoomToData`). The fit is armed only once the world view's
  bounds have arrived, so it fits the new markers, not the old zoomed-in
  ones.
- **The map always fits the window.** The layout is absolutely positioned
  inside its slot, so it never sets the page's height. Otherwise
  `.wdk-PageContent` (a flex item with the default `min-height: auto`)
  grew to fit long docked-panel content. On laptops the page then
  scrolled, and the map's bottom edge, with the legend pinned to it, was
  below the screen. The legend card's height limit also keeps its header
  visible on short maps.
- **Lasso disables map dragging.** `SemanticMarkers` unmounts the
  ctrl-drag `AreaSelect` while the lasso is armed. `AreaSelect`'s teardown
  and re-enable (on most re-renders) and its key-up/blur handlers
  unconditionally re-enabled dragging, so the lasso gesture panned the map
  (reproduced and fix verified in headless Chromium).

### Map type plugins

`mapTypes/types.ts` has a smaller `MapTypePlugin` interface:
`type`, `displayName`, `Icon`, `ConfigPanelComponent`, `MapLayerComponent`,
`LegendComponent`, `markerConfigFilterFuncs` (the marker configuration's
little filters, used by the map count and the shared timeline in the
filter bar). These were removed: `TimeSliderComponent` (one shared
timeline replaces the three near-identical ones),
`MapOverlayComponent` (floating legend + plots + studies) and
`MapTypeHeaderDetails` (mega-study counts). Each plugin receives the
resolved `geoConfig` explicitly and, for its layer, a `selection` prop
(`MapSelectionProps`). It renders markers through the shared
`SelectableMarkers` (`mapTypes/shared.tsx`), so every marker type gets
identical selection behaviour. Geohash semantic zooming is unchanged:
`SemanticMarkers` + `geohashAnimation`, and aggregation level from zoom via
`GeoConfig.zoomLevelToAggregationLevel`.

### One marker variable for all styles

The marker style buttons change **only the style**. Previously each style
kept its own variable, so switching style could silently change what the
map showed.

- **Shared by all styles:** the marker variable. Every style accepts the
  same variables (all use the `standalone-map` app's `map-markers`
  constraints), so a variable never has to change on a style switch.
- **Shared by donuts and bar plots:** the chosen values (`selectedValues`),
  which mean the same thing in both.
- **Per style:** settings that don't depend on the variable (binning,
  counts option, bar count/proportion and log scale, bubble mean/median),
  and the bubbles' numerator/denominator values. Changing the variable
  clears the variable-specific values (chosen values, numerator and
  denominator) in every style.
- **Storage is unchanged:** `markerConfigurations` still holds one
  configuration per style. `utils/markerConfigurations.ts` (unit tested)
  keeps them in agreement on every update. On a style switch, older
  analyses with a different variable per style adopt the current one.
  Hoisting the variable to a top-level `appState` field would be cleaner.
  It's worth doing if phase 2 plots need it (§8).
- **Why:** plots (§8) will offer "colour by the marker variable". With a
  variable per style, that would depend on the current style. That
  coupling is what made the old map's style-owned plots confusing.
- **Future: a more "dashboardy" map.** Per-style variables were a weak way
  of keeping several views at once. If the map moves towards a dashboard,
  where people flip between prepared views, that needs explicit saved
  views or bookmarks of the map/analysis state. Saved analyses (the
  Analyses list) already do this, but switching views would need to be
  much more immediate: one click on the map, without leaving it.

## 3. Selection model and records

### Selections are geohash prefix sets

Every marker is a geohash cell (its id is the geohash at the current
aggregation level). A finer geohash always starts with the geohash of the
cell that contains it. So a selection is stored as a **set of geohash
prefixes** of the location entity (`appState.selection = { geoEntityId,
prefixes }`). The operations are in `utils/geohashSelection.ts` (unit
tested): normalise, add, remove (splitting a coarser cell into its remaining
siblings), intersect, and classify markers.

Consequences:

- **Selections survive zooming.** Zoom in on a selected cell and all its
  sub-markers are selected. Zoom out and the containing marker is drawn
  _partly selected_ (dashed ring, `.partial-highlight-marker` in
  `MapVEu.scss`). The old "selection cancelled because aggregation level
  changed" snackbar is gone.
- **One filter describes the selection:** `stringPrefixSet` on the location
  entity's finest geohash variable (`selectionLittleFilter`). That is
  exactly the filter the regular EDA lasso filter (`GeoCoordFilter`)
  produces (see `geo-coordinate-filtering.md`).

### Gestures

| Gesture               | Effect                                                                              |
| --------------------- | ----------------------------------------------------------------------------------- |
| Click a marker        | Replace the selection with it (click again to deselect)                             |
| Ctrl/⌘-click          | Add / remove                                                                        |
| Ctrl/⌘-drag a box     | Add markers whose centre is inside                                                  |
| Lasso tool, then drag | Replace with markers whose centre is inside (hold Ctrl/⌘/Shift to add); Esc cancels |
| Click empty map       | Clear                                                                               |
| Right-click marker    | Popup: coordinates, "Show records", "Zoom in"                                       |

The lasso selects **markers whose centre is inside the shape**, consistent
with box selection. A precise area cover was considered and rejected. Users
draw around marker icons, and a coarse marker's records can lie far from a
small loop drawn around its icon. Precise area filtering stays available as
the EDA lasso _filter_ (and "Filter to selection", below).

The components library gained opt-in props to support this (all backward
compatible; existing callers are unaffected):

- `SemanticMarkers`: `onSelectionGesture(ids, 'add'|'remove'|'replace')`
  (when given, selected ids are **not** pruned on zoom),
  `partiallySelectedMarkers`, `onMarkerContextMenu`, `lassoActive` and
  `onLassoDeactivated`.
- `BoundsDriftMarker` (+ Donut/Chart/Bubble markers pass them through):
  the same three marker-level props.
- New `LassoSelect.tsx` (one-shot leaflet-lasso; swallows the trailing
  map click) and `utils/pointInPolygon.ts` (tested).

### Selection panel

- **Summary:** record counts for every entity on the location entity's
  lineage (§5), for the selection, or for the **visible map area** when
  nothing is selected. The panel is useful from the first click and teaches
  what it is for.
- **Selected locations:** each selected marker in view with its coordinates
  (≈ when the marker's records don't share one position), copy, Google
  Maps and zoom-to.
- **Records:** pick an entity on the lineage (remembered as
  `appState.recordsEntityId`). The table shows a page of records (25 at a
  time) from the subsetting `tabular` endpoint.
  - Columns are the entity's ID column(s) plus its **featured variables**
    (`isFeatured`, minus those hidden from download). If an entity has no
    featured variables, the first five displayable variables are shown and
    the table says so (`utils/geoEntities.ts › recordColumns`).
  - When the records are of the location entity, a Location column shows
    each record's own lat/long with copy and Google Maps links.
  - Sorting is not offered: the back end no longer supports it for tabular
    previews (see `SubsetDownloadModal`).
- **Filters used for records/counts** (`selectionFilterFuncs`): subset
  filters, the time slider, and the selection (or the viewport). As with the
  old supporting plots, the marker configuration's value filter is _not_
  applied.
- **Filter to selection** (`selection/filterToSelection.ts`, tested):
  1. Adds the `stringPrefixSet` filter. If a geo filter on that variable
     already exists, the new filter is the intersection, so a coarse marker
     can't widen it.
  2. Writes `GeoCoordFilter`'s UI state (key `entity/lat/long`): one
     rectangle per cell, inset 1% so a later edit doesn't pull in
     neighbouring cells, and capped at 200 rectangles. It also sets the
     current map view, so the filter is **editable in the regular EDA
     workspace**.
  3. Clears the selection.

### Peek under the markers

Hold **H**, or press and hold the eye button in the legend header, to hide
the markers and see the map underneath. They come back on release.

- **Documentation:** the shortcut is in the eye button's tooltip ("Hide
  markers while held (or hold H)"). It's discoverable without taking new
  screen space, and usable without a keyboard. While hidden, the icon
  switches to "eye crossed out" and shows as pressed.
- **Can't get stuck:** markers return on key-up, on window blur and when
  the tab is hidden. H is ignored in form fields and with Ctrl/⌘/Alt.
  Nothing is saved (`layout/useHoldKey.ts`, unit tested).
- **Implementation:** a CSS class hides the Leaflet marker and popup panes,
  so markers aren't unmounted, re-fetched or re-animated.
- A keyboard-shortcuts help sheet ("?") can come later, when there are
  more shortcuts.

## 4. Coordinates

`utils/coordinates.ts` (tested) formats `lat, lng` in decimal degrees with
5 decimals (~1 m), wraps longitudes into ±180, builds Google Maps search
URLs, and copies with a fallback for insecure contexts. `layout/ui.tsx ›
Coordinates` is the single control used everywhere: right-click popup
(marker or any map point), selected locations list, and records table.

## 5. Multiple geo-entities

- The **location entity** is explicit: `appState.geoEntityId`, chosen with
  "Place markers by" in Map settings (shown only when the study has more
  than one geo-entity). Existing analyses resolve it in this order: saved
  value, then the legacy per-marker `geoEntityId`, then the least ancestral
  geo-entity on the marker variable's path (`resolveGeoConfig`).
- Data can be shown on those markers only from the entity's **lineage**:
  its ancestors, itself and its descendants (`lineageEntities`). Variables
  outside it are disabled in the marker variable pickers via
  `InputVariables.additionalDisabledVariables`.
- Switching entity resets off-lineage marker variables to that entity's
  default variable, and clears the selection and the records entity. An
  effect also repairs an off-lineage variable found on load.
- Everything (markers, viewport filter, selection filter, counts, records,
  Filter to selection) uses the same resolved `geoConfig`
  (`getActiveGeoConfig`).

## 6. Removed

- Mega-study "project" listing: `SubStudies.tsx`,
  `mapTypes/MapTypeHeaderStudyDetails.tsx`, `studyDetailsPanelConfig`, and
  the `STUDIES_ENTITY_ID`/`STUDY_ID_VARIABLE_ID` constants.
- Floating visualisations and legends: `DraggableVisualization.tsx`,
  `DraggableLegendPanel.tsx`, `MapVizManagement.tsx/.scss`,
  `hooks/standaloneVizPlugins.ts`, and `useFloatingPanelHandlers`. Phase 2
  restores plots in a different form (§8).
- Old navigation: `MapSideNavigation.tsx`, `MapSidePanel.tsx`,
  `MapHeader.tsx/.scss`, `MarkerConfiguration/MapTypeConfigurationMenu.tsx`
  and `MarkerConfigurationSelector.tsx`.
- Marker-selection snackbars (`useSelectedMarkerSnackbars`).

`FloatingDiv.tsx` and `hooks/plugins/*` stay: the regular EDA visualisations
(`FloatingLayout`, Histogram/Lineplot/Scatterplot) import them.

## 7. Saved state and compatibility

`appState.ts` holds only io-ts codecs (unit tested against a pre-redesign
saved state); `useAppState.ts` holds the hook. The key is unchanged
(`@@mapApp@@`).

- Removed fields are ignored on decode: `studyDetailsPanelConfig`,
  `isSubsetPanelOpen`, and per-marker `legendPanelConfig`,
  `visualizationPanelConfig`, `activeVisualizationId`, `selectedMarkers`.
  They remain in old analyses until the map state is next written.
- New optional fields: `geoEntityId`, `selection`, `recordsEntityId`,
  `baseLayer` (the chosen tile layer is now saved).
  `isSidePanelExpanded` is now optional and defaults to open.
- Visualisations created by the old map stay in the analysis descriptor,
  untouched. The phase 1 map simply doesn't show them.

## 8. Phase 2: plots and derived variables (brief for the next session)

Status: a brief for the next design session, not a plan. It replaces the
earlier plan (a Plots tab in the Selection panel, plots stored as
visualisations tagged with an `applicationContext`). That plan is still a
reasonable starting point for _where plots go_, but the work now starts
with derived variables.

### The killer app

Insecticide resistance: percent mortality is shown on the markers. The
user sees an east–west difference with a mountain range as the dividing
line, and wants to know whether it holds through time. They draw **two (or
more) regions**. The regions become a categorical variable ("East", "West").
That variable is the overlay on a time-series plot, so both regions' trends
show at once.

Percent mortality needs no zero-filling (below), so the killer app doesn't
depend on the zero-filling machinery or the bug found in it. The same
region variable should work as the overlay for any plot type.

### Decisions so far

- **Derived variables become first-class, in both the regular EDA
  workspace and the map.** A new main workspace tab to the right of
  "Browse and Subset", provisionally **"Create variables"**, manages them.
  The map gets the same thing as a tool-rail item. Derived variables are
  saved with the analysis (but see storage, below).
- **Recoding first.** Other derived-variable types come later. Multiple
  geo-regions are treated as a recoding (see "Regions as a variable" for
  how that maps onto the back end).
- **Map selections:** a single selection stays as it is, with "Filter to
  selection". New: **several selections**, plus a "Create variable" button
  with a short explanation that the variable can colour/overlay plots.
- **Overlaps: leaning towards forbidding** overlapping geo-regions,
  overlapping categories in a recoding, and overlapping continuous ranges,
  in both the UI and the server. To be discussed.
- **One colour scheme is no longer a rule.** The old map forced every plot
  to use the marker colours (one legend on the page). Docked plots can have
  their own legends; consistency is preferred, not enforced. An explicit
  "colour by the marker variable" option remains a good idea.

### What exists today

**Derived variables in the back end** (`service-eda`), unused by the front
end:

- Plugins under `merge/plugins/`. Transforms: `CategoricalRecoding`,
  `Concatenation`, `ContinuousNumericToOrdinal`, `EcmaScriptExpressionEval`,
  `UnitConversion`, `BodyMassIndex`, `AdvancedSubset` (union/intersect/minus
  of 1/0 variables), `RelativeObservation*`. Reductions: `SubsetMembership`
  (1/0: is the record in the subset defined by `subsetFilters`), `Sum`,
  `Mean`, `SingleNumericVarReduction`. Config types are in
  `schema/library.raml`.
- **Storage:** one row per variable in the user database's
  `derived_variables` table (`user/model/UserDataFactory.java`,
  `DerivedVariableRow`). Each row holds a UUID `variable_id`, `user_id`,
  `dataset_id`, `entity_id`, `display_name`, `description`, `function_name`,
  `config` (plugin-specific JSON, e.g. `CategoricalRecodingConfig`) and
  `provenance` (`copiedFrom`, `copyDate`). The analysis stores only the ids,
  in `descriptor.derivedVariables: string[]`. So "saved with the analysis"
  really means "owned by the user, referenced by the analysis": one variable
  can be shared by several of the same user's analyses.
- **API** (`/derived-variables/{project-id}`): list the user's variables
  (GET), create one (POST), and fetch one by id (GET `/{id}`). PATCH changes
  only the display name and description. **There is no delete, and the
  definition (`function_name`, `config`) can't be edited.** Editing would
  mean creating a new variable and swapping the id in the analysis, and old
  ones are left behind unused.
- **Use in requests:** the data service doesn't look up variables by id.
  Each plot request carries the full definitions inline
  (`derivedVariables: DerivedVariableSpec[]`: entity id, the stored id as
  `variableId`, `functionName`, `displayName`, `config`). Variable pickers
  get type, shape and values from POST `/derived-variables/metadata/variables`
  (study id plus the same specs). So the client would fetch the analysis's
  definitions by id on load and send them with every request.
- **Copying analyses:** when an analysis is copied to another user,
  `ImportAnalysisService.copyDerivedVariables` copies the definitions to the
  new owner, recording `provenance`. It reuses a copy the new owner already
  has, matching the original's id or its `copiedFrom`. A copy for the same
  user keeps pointing at the same rows.
- The alternative, keeping definitions inside the analysis descriptor with
  no separate store, would be simpler but give up reuse across analyses.
  That's a question for the next session.
- Values are computed in the merge layer. So they should be usable in plots,
  map markers and downloads, but **probably not in subsetting** (filters,
  counts, Browse and Subset distributions). To verify.
- Front end: `DataClient/types.ts` has `// TO DO` for the field,
  `ScatterplotVisualization` sends `derivedVariables: []`, and
  `useAnalysis` has a `setDerivedVariables` setter that nothing calls.

**Regions as a variable.** `CategoricalRecoding` maps **exact values** of
one input variable (`rules: [{ inputValues, outputValue }]`,
`unmappedValue`). Map selections are geohash **prefixes at mixed levels**
(§3). Options:

1. Expand each prefix to the study's finest geohash variable and recode
   that. No back-end change, but the value lists can be long: 462 values in
   the Maryland test study, possibly tens of thousands in a megastudy.
2. Add prefix matching to recoding rules (back-end change).
3. One `SubsetMembership` per region (its filter is the region's
   `stringPrefixSet`), combined into one variable.

A more general framing: **a variable whose levels are each defined by
filters**. Value recoding is the case where each level is a set of values
of one variable; regions, time windows or "high-mortality sites" fit the
same model.

**The old map's plot endpoints** (`standalone-map-*` apps, the
`Floating*Plugin`s in `data/plugin/standalonemap/`):

- They exist for three reasons:
  1. Megastudy zero-filling and weighting. Variables flagged
     `hasStudyDependentVocabulary` name a count variable in
     `variableSpecToImputeZeroesFor` (e.g. species → "unbiased specimen
     count"). The plugins weight by that count and fill in zero counts for
     values a study looked for but didn't find, using the per-study
     vocabulary from `getVocabByRootEntity`. The count variable is hidden
     everywhere on purpose. In R, veupathUtils `getDTWithImputedZeroes`
     finds the count through each variable's `weightingVariableSpec` (from
     `variableSpecToImputeZeroesFor`) and **does not read `imputeZero`**.
  2. Plot colours match the markers: they take the marker's `overlayConfig`
     (chosen values plus "All other values", or the marker's bins).
  3. `Collection*` variants for grouped variables.
- The `pass` plugins have neither the zero-filling nor the weighting. A
  `pass` barplot of species counts _Sample rows_, not mosquitoes. **Map plots
  must keep the weighted, zero-filled behaviour wherever a study declares
  it.** That isn't needed for the killer app.
- They are registered for VectorBase only, but that isn't enforced. The
  server never checks a plugin's projects, and the client filters apps by
  project only in the workspace's `ComputationRoute`. The new map already
  calls `standalone-map` marker endpoints on dataexplorer.
- Old map plots are visualisations under `standalone-map-*` computations
  (tagged with the marker type as `applicationContext`). The regular
  workspace, which uses `pass`, has no plugin to render them.

**Known back-end bug (reported to the team).** For **uploaded (VDI)
studies**, a Floating plugin whose output entity has study-dependent
vocabulary variables runs the app-db connection pool dry and returns 500.
The request holds about 4 connections for its data streams
(`AbstractPlugin.java:193`). Then, inside `writeResults`, it looks up each
variable's per-study vocabulary in a `parallelStream()`
(`AbstractPlugin.java:398`). Each lookup calls `StudyResolver.getStudyById`,
which isn't cached for user-submitted studies, so it needs another
connection. The 1 s wait to borrow one times out. Reproduced on QA with the
Maryland mosquito surveillance upload (`EDAUD_x888VQkZts0d1`,
`STUDY_32d63fbfa5`): a timeline of Collections returns 200, and a timeline
of Samples returns 500, with or without an overlay. Curated studies come
from the metadata cache and are unaffected.

**`imputeZero` is unrelated and can be ignored in phase 2.** It's a
different per-variable flag meaning "a missing value means zero" (e.g.
taxon abundance in microbiome data). Where it's used:

- plot.data (`class-plotdata.R`) replaces NA with 0 in any plotted column
  whose variable has it set;
- veupathUtils collections (e.g. abundance) replace NA with 0 when getting
  collection data;
- the microbiome and differential-expression compute plugins set it to
  `TRUE` themselves for count data;
- the `ContinuousNumericToOrdinal` derived variable treats a missing input
  as 0 if the input variable has it set.

It plays no part in megastudy zero-filling, so `imputeZero: false` on every
variable of the Maryland export is correct. For percent mortality it must
stay `false`: a missing assay is not 0 % mortality.

### Open questions for the next session

- **Regions → variable:** options 1–3 above; value recoding vs "levels
  defined by filters".
- **Overlap policy** (leaning towards forbidding), and how the UI prevents
  overlaps while drawing.
- **Several selections in the map:** naming, colours (shown on the markers,
  matching the plot), how many, how they relate to the single selection and
  "Filter to selection", and what happens to them on zoom or when filters
  change.
- **"Create variables" tab:** list/create/edit/delete; how derived variables
  appear in the variable pickers (merging their metadata into the study);
  editing or deleting a variable that plots use; sharing and copying
  analyses that reference user-owned derived variables.
- **Plots in the map:** where they live (Selection panel tab, a wider
  panel, a sheet), how many and how big; what they are filtered by
  (selection, else viewport, plus the time window) and how that is made
  obvious; which existing plots show (old `standalone-map-*` ones, `pass`
  ones from the workspace) and how they're labelled; which endpoint
  (Floating or `pass`) a plot uses for a given study; the "colour by the
  marker variable" option.
- **Derived variables as marker variables:** probably possible, since
  markers come from data plugins.
- **Subsetting on derived variables:** likely back-end work; in or out of
  scope?
- How this fits a more "dashboardy" map later (§2).

### Code to reuse

- `git show 562a5a1:packages/libs/eda/src/lib/map/analysis/hooks/standaloneVizPlugins.ts`
  and `.../MapVizManagement.tsx`. Visualisation container, StartPage and
  `FloatingLayout` are unchanged in core.
- `MapTypeMapLayerProps.selection` / `selectionFilterFuncs` are the
  integration points for selection- and viewport-filtered plots.
- `utils/geohashSelection.ts` (prefix-set operations) and
  `selection/filterToSelection.ts` (selection → filter).

## 9. Changes outside the map

- **Regular EDA workspace: no UX changes.** No code under
  `src/lib/workspace` or `src/lib/core` was modified. The map reuses
  `GeoCoordFilter`'s filter format and UI-state shape (§3).
- **Components library:** additive, opt-in props on `SemanticMarkers` and
  the markers, plus `LassoSelect` and `pointInPolygon` (§3). Behaviour for
  existing callers (e.g. `GeoCoordFilter`, `MapVisualization`) is unchanged.
- **Map event fix (`MapVEuMap`):** map events used react-leaflet v3's
  `useMapEvents`, which re-subscribes on every render. A programmatic move
  made from another effect in the same commit (eda's `MapFitBounds` for
  "zoom to marker") fires its `zoomend`/`moveend` synchronously in the
  unsubscribe/resubscribe gap whenever Leaflet doesn't animate it (zoom
  change > 4 levels, or a long pan). The bounds and zoom were never
  reported, so markers stayed at the old aggregation level and view, while
  the grid (which reads Leaflet directly) was correct. The handlers are
  now registered once and read the latest props from a ref. Reproduced
  with the real `MapVEuMap`/`SemanticMarkers` in headless Chromium: 15/30
  randomised zoom-to trials inconsistent before, 0/30 after.
- **Tile layer max zoom (`MapVEuMap`):** the map had no `maxZoom`, so
  Leaflet allowed the largest of its layers' limits: 18, from OSM's default.
  Street, Terrain and Satellite stop at 17. Beyond a layer's own limit
  Leaflet draws nothing for it and disables it in the layer selector, so at
  zoom 18 the always-present OSM layer underneath showed instead (e.g.
  Satellite "turned into" OSM). Every base layer now declares its
  `maxZoom`, and the map's maximum is the smallest of them
  (`MAX_ZOOM_FOR_ALL_BASE_LAYERS`, 17). Reproduced and verified in headless
  Chromium with the real `MapVEuMap` and stubbed tile servers.
- **No redundant OSM tiles (`MapVEuMap`):** an OSM `TileLayer` was
  rendered unconditionally underneath the layer selector's base layer:
  never seen, but downloaded for every view, doubling tile traffic. It is
  now rendered only when the selector is hidden (it's then the only
  layer). An unknown saved `baseLayer` now falls back to the first layer
  instead of leaving none checked. Measured in headless Chromium:
  Satellite went from 102 to 51 tile requests for the same views.
- **Geohash grid fix (`CustomGridLayer`):** the grid recomputed its lines
  only on `resize dragend zoomend`, so it went stale after programmatic
  pans. That includes the pan that keeps markers still when a panel opens:
  the grid then looked shifted left with the settings panel open and right
  with it closed. It now updates on `moveend` (covers drags, zooms and
  programmatic moves) and ignores out-of-date async results. This also
  fixes the grid after "Zoom to" without a zoom change. It is a bug fix
  for every user of the grid, including the regular EDA map visualisation
  and the lasso filter.

## 10. Known gaps / to verify against a live back end

- Record table header parsing assumes `headerFormat: 'standard'` returns
  entity ID column names and variable ids (as `SubsetDownloadModal` does).
- `updateConfiguration` validates plugin updates with
  `MarkerConfiguration.is`. An update that fails is ignored with a console
  error: check every marker menu control.
- With nothing selected and the records panel open, every pan re-requests
  per-entity counts for the viewport.
- The marker configuration menus were designed for a wider drawer. Check
  them in the 400px panel.
- No visual check has been done yet: VEuPathDB services and tile servers
  were unreachable from the development environment.
- Tests: `utils/*.test.ts`, `appState.test.ts`, `selection/*.test.ts`
  (eda) and `map/utils/pointInPolygon.test.ts` (components). The existing
  failures in components' `animation_functions` tests predate this work.
