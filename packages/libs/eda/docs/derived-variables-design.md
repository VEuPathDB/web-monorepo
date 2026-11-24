# Derived variables: "Create variables" tab (design)

Status: design agreed on 2026-11-23, not yet planned or built. It follows
on from `map-redesign.md` §8, which has the background on the back end.

## 1. Why

The killer app is insecticide resistance. Someone sees an east–west split
in percent mortality, divides the sites into "East" and "West", and
overlays that grouping on a time-series plot to see whether the split
holds over time. More generally, users want to make their own
categorical variables (regions, age bands, species groupings, time
windows) and use them in plots.

The back end can already compute derived variables (`service-eda`
`merge/plugins/`), but nothing has ever used that code, and the front end
uses none of it.

This work is for the **regular EDA workspace first**. The UX there has to
be clean and self-explanatory, because nothing guides users into it. The
full-screen map comes later. It will reuse the same variables, storage
and plumbing, and add its own guided route in: draw a lasso, get prompted
to draw another, be told what the new variable can be used for.

Back-end work is kept small (§5.1): one new derived-variable plugin,
plus simplifications to the analysis descriptor's derived-variable
field, which nothing uses yet.

## 2. Goals, non-goals, anti-goals

**Goals**

- A new workspace tab, **Create variables**, between "Browse and Subset"
  and "Visualize", for listing, creating, editing, renaming and deleting
  grouping variables.
- A grouping variable is an ordered list of **groups**. Each group has a
  name and a set of filters, built with the same filter widgets as Browse
  and Subset, including the geo lasso filter. Value groupings ("these
  species"), numeric ranges ("age 0–5") and drawn regions are all just
  filters.
- The variables appear in the variable pickers of Visualize's
  **standard visualisations** (the `pass` app: those not built on a
  computation). They work as an overlay or facet, and anywhere else a
  categorical variable is accepted.
- Variables **belong to one analysis**. Copying or sharing the analysis
  takes them along.

**Non-goals (v1)**

- Subsetting on derived variables: they don't appear in Browse and
  Subset. The subsetting service can't compute them.
- Download: the Download tab uses the subsetting service. A later ticket
  can use the merge service's `/merging/query` (tabular, takes
  derived-variable specs inline) instead.
- Visualisations built on a computation (differential abundance or
  expression, beta diversity, correlation, etc.). Their data requests
  must carry exactly the derived variables of the computation's request
  (`AbstractPlugin.java:505–511`; the job id hashes the whole request,
  `JobIDs.kt:37–57`), so using a derived variable there would re-run the
  computation. This is solvable later: before hashing, `JobIDs.of` could
  drop the derived variables that the computation's config doesn't use
  (found by walking the config for `{ entityId, variableId }` references).
- Other kinds of derived variable (formulas, unit conversion, reductions
  over child entities).
- The full-screen map (phase 2 of the map redesign).
- A personal library of variables shared across analyses. "Copy from
  another analysis" may come later.

**Anti-goals (a failure even if it technically works)**

- Users can't tell why a variable isn't in Browse and Subset, or think
  their subset changed the groups.
- Records silently land in an unexpected group because groups overlap.
- Editing a variable breaks or orphans plots that use it.
- Creating or editing a derived variable re-runs expensive computations
  (e.g. DESeq2).

## 3. User-facing behaviour

### 3.1 The tab

```
Browse and Subset │ Create variables │ Visualize │ …
┌──────────────────────┬──────────────────────────────────────────────────┐
│ Your variables       │ Name  [Region (East/West)    ]   Group [Collections▾]│
│ ▸ Region (East/West) │                                                  │
│   Age band           │  1 ⠿ East   Location: lasso (3 shapes)  ✎   412   │
│                      │  2 ⠿ West   Location: lasso (2 shapes)  ✎   388   │
│ [+ New variable]     │    [+ Add group]                                 │
│                      │  ☑ Everything else  [Other      ]          97    │
│ Variables made here  │  ⚠ 12 Collections in West also match East;      │
│ can be used in       │    they count as East. Adjust filters before     │
│ Visualize, not for   │    saving.                                       │
│ subsetting.          │  Used by: Mortality over time                    │
│                      │                       [Cancel] [Save variable]   │
└──────────────────────┴──────────────────────────────────────────────────┘
```

- **Left:** the analysis's variables and a "New variable" button, plus a
  standing note on where the variables can be used.
- **Right:** the editor.
  - **Name**, and **what is being grouped**: the entity ("Group
    Collections into…"). The entity is chosen first. The variable lives
    on it and can be used in plots of that entity or of any entity below
    it. Group filters may be on any entity, as in Browse and Subset.
  - **Groups**, in order (drag to reorder), each with a name, a summary
    of its filters, an edit button and a record count.
  - **Everything else**: a level for records in no group. It's on by
    default and can be renamed or switched off. When off, those records
    have no value, and the plots' existing "include no data" option
    decides whether they show.
  - **Used by:** the plots that use the variable.
- **Editing a group's filters (✎)** opens the Browse and Subset layout
  (variable tree plus the same filter widgets, including the geo lasso),
  working on that group's filters instead of the analysis subset.
- **Groups may filter on different variables.** The plugin checks each
  group's filters on their own, so group 1 can be a drawn region and
  group 2 a species. To make the common case quick, **"Add group" opens
  on the variable(s) the previous group used**, with nothing selected
  yet. The user can still switch to any other variable.
- **Earlier groups are shown while a later one is edited,** so overlaps
  can be avoided rather than only reported:
  - **Geo lasso:** earlier groups' shapes (as drawn, or geohash-represented; builder's choice; probably the latter because selections can be rectangle and marker-based too)
    are drawn faintly in their group colours.
  - **Categorical values:** values used by an earlier group are marked
    (e.g. "in East"). They can still be picked, and the overlap warning
    then applies.
  - **Numeric and date ranges:** earlier groups' ranges are shaded on
    the histogram.

### 3.2 Rules

- **Groups don't depend on the subset.** The analysis subset (Browse and
  Subset filters) never redefines a group. It only changes which records
  are plotted. The editor's counts are for the whole dataset.
- **Overlaps: the first group wins.** A record that matches several groups
  goes to the first of them. The editor counts overlaps as you edit and
  shows a prominent warning naming the groups and the number of records.
  It strongly recommends fixing the filters before saving, but saving is
  not blocked.
- **Editing** a variable updates every plot that uses it.
- **Deleting** a variable that plots use asks for confirmation, naming
  those plots. If confirmed, those plots lose that variable and need a
  new one picked.
- **Renaming** a variable or a group changes the labels everywhere.

## 4. Approaches considered

### 4.1 Where definitions are kept

The server never looks a variable up by id. Plot requests carry the full
definitions inline, so the front-end plumbing (§5.3) is the same
whichever is chosen.

1. **Definitions in the analysis descriptor. (Chosen.)** The existing
   `descriptor.derivedVariables` field changes from a list of ids to a
   list of full definitions, each with a stable id created by the client.
   Edits happen in place, and copy, share and delete come for free,
   because they are copies or edits of the descriptor.
2. **The existing user-owned store as it is.** This was chosen first, to
   avoid back-end work, and dropped after review. It can't work without
   several back-end fixes:
   - An analysis's id list can only grow: saving merges the new list into
     the old one and loses its order (`UserService.java:298–334`).
   - Copying an analysis to another user gives each row a new id but
     leaves the configs, and the plots, pointing at the original owner's
     ids (`ImportAnalysisService.java:155–160`).
   - Definitions can't be edited, so every edit saves new rows, and unused
     rows pile up.
3. **Extend the store with edit and delete endpoints**, plus the fixes
   above. Ids stay stable, but it's the most back-end work. A same-user
   copy of an analysis shares rows with the original, so an edit in one
   would silently change the other, which goes against "belongs to one
   analysis".

Option 1 matches "belongs to one analysis", and nothing grows without
bound: the store is no longer written to.

### 4.2 How groups become one variable

1. **A new plugin, "groups defined by filters". (Chosen.)** One spec per
   variable, holding exactly what the editor shows. Internally it creates
   one `subsetMembership` per group (§5.1).
2. **Chain existing plugins.** One `subsetMembership` spec per group, a
   `concatenation` of them (`1,0,…`), and a `categoricalRecoding` listing
   every combination that maps to each group under first-group-wins
   (2^N − 1 strings). That's N + 2 specs per variable. The front end would
   have to hide the helpers and rebuild the editor from them. It also
   needs two back-end bug fixes (§6), and the "Everything else off" case
   adds a blank level to the recoding's vocabulary. Dropped in favour of
   option 1.

## 5. How it is built

### 5.1 Back-end changes (`service-eda`)

**A. New transform plugin `filterDefinedGroups`**
(`merge/plugins/transforms/`, registered in `merge/plugins/Transforms.java`).
The function name is my call.

Config (new RAML type in `schema/library.raml`, also listed in
`DerivedVariableDocumentationRequest`):

```yaml
FilterDefinedGroupsConfig:
  type: object
  properties:
    groups: FilterDefinedGroup[] # in priority order
    unmappedValue?: string # label for records in no group; absent or empty = no value
FilterDefinedGroup:
  type: object
  properties:
    label: string
    filters: API_Filter[]
```

Behaviour:

- **Helpers.** In `acceptConfig`, create one `subsetMembership` spec per
  group, on the variable's own entity, with id `<variableId>_group<i>`
  and the group's filters as `subsetFilters`. Return them from
  `getDependedDerivedVarSpecs()` and `getRequiredInputVars()`.
  `RelativeObservationCalculator.createAggregatorSpec` does the same
  thing. The factory already orders internally declared helpers, and
  the metadata endpoint returns only requested variables
  (`ServiceExternal.java:119–120`), so the helpers never reach the
  client.
- **Value.** The label of the first group whose membership column is
  `1`. Otherwise `unmappedValue`, or the empty value if that is absent
  or empty.
- **Metadata.** Type `STRING`, shape `CATEGORICAL`. The vocabulary is the
  labels in order, plus `unmappedValue` if it isn't empty, so there's no
  blank level.
- **Validation.**
  - At least one group.
  - Every group has a non-empty label and at least one filter, since an
    empty filter list would match every record.
  - Labels are unique, and `unmappedValue` differs from every label.
  - _My call on all of these._

**B. The analysis descriptor holds definitions**

- In `schema/library.raml` (`AnalysisDescriptor`) and
  `schema/url/user/user.raml`, change `derivedVariables: string[]` to
  `derivedVariables: DerivedVariableSpec[]`.
- In `UserService` (analysis PATCH, `:94–99`, `processPatchedDerivedVars`),
  store the list as given, with no lookup, ownership check or union.
- In `ImportAnalysisService` (`:96–102`), copy the list as it is, with no
  `copyDerivedVariables`.
- Before deploying, check that no saved analysis has a non-empty
  `derivedVariables`. The front end has never set it. Any that do would
  no longer decode and should be reset to `[]`.

The `/users/{user-id}/derived-variables` endpoints and table are left
alone and unused. They can be retired separately.

### 5.2 How a grouping variable is defined

One spec per variable, in `descriptor.derivedVariables`:

```json
{
  "entityId": "<the grouped entity>",
  "variableId": "<UUID created by the client, kept across edits>",
  "functionName": "filterDefinedGroups",
  "displayName": "Region (East/West)",
  "config": {
    "groups": [
      { "label": "East", "filters": [ … ] },
      { "label": "West", "filters": [ … ] }
    ],
    "unmappedValue": "Other"
  }
}
```

- The editor's state and the stored spec are the same thing. There's
  nothing to hide or rebuild.
- Groups are **capped at 10** in the UI. _My call: overlay colours get
  hard to tell apart beyond that._
- The front-end codec for the field (`core/types/analysis.ts:40`,
  currently `t.unknown`) becomes a real `DerivedVariableSpec` codec, with
  a typed config for `filterDefinedGroups`. A spec with any other
  function name is shown read-only as "unsupported" rather than dropped.

### 5.3 Front-end plumbing

- **Metadata:** call `POST /merging/derived-variables/metadata/variables`
  (study id plus the specs) for each variable's type, shape and
  vocabulary. Merge the results into the variable tree **for the pickers
  of standard visualisations only**. Browse and Subset, Download and
  visualisations built on a computation must not see them. _My call on
  placement: a "Created in this analysis" folder under their entity._
- **Data requests:** every data-plugin request of a standard
  visualisation (`DataPluginRequestBase.derivedVariables`; today
  `DataClient/types.ts` has `// TO DO` and Scatterplot sends `[]`)
  carries **only the specs it references**, so unrelated edits don't
  change requests or caches.
- **Compute requests:** `ComputeJobStatusHook.ts:49` sends the whole of
  `descriptor.derivedVariables` today. Change it to send what the
  computation's configuration references, which in v1 is always nothing,
  so `[]`. Otherwise every edit would re-run every compute job (an
  anti-goal), and the data requests of visualisations built on a
  computation would stop matching their computation.
- **Save, edit, rename, delete:** replace the spec in
  `descriptor.derivedVariables` (`setDerivedVariables` in
  `hooks/analysis.ts` already exists, unused). The id doesn't change, so
  plots that reference the variable need no rewriting. An unsaved new
  analysis is saved first, as with other edits.
- **Deleting:** plots that referenced the variable are left to their
  existing handling of a variable that no longer exists (to verify, §7).
- **Counts and overlaps in the editor (whole dataset, no subset filters):**
  - **Raw count of each group:** the subsetting service's count for that
    group's filters on the grouped entity. This is the same request
    Browse and Subset makes.
  - **Final counts under first-group-wins,** including "Everything
    else": a data-plugin request with the unsaved spec inline, counting
    each level. The builder chooses which plugin (e.g. a `pass` barplot).
  - **Overlap** for group _i_: raw count − final count. That's the
    number of its records that an earlier group claims. With one earlier
    group the warning names it; with several it says "an earlier group",
    unless the builder adds per-pair counts.

### 5.4 Group filter editing

The Browse and Subset components (`Subsetting`, filter containers) read
and write `analysisState.descriptor.subset`. Group editing needs them to
work on a group's own filter list instead, with counts for the whole
dataset. How to adapt them (an adapter analysis state, or lifting a
filters/setFilters pair out) is left to the builder.

The geo lasso filter (`GeoCoordFilter`) keeps its UI state per variable
in `subset.uiSettings`. Group edits need their own UI state. It can't go
in the spec's config, which the server parses as
`FilterDefinedGroupsConfig`, so keep it in `subset.uiSettings` under a
key made from the derived variable's id and the group's position.

## 6. Constraints and facts the design relies on

- `SubsetMembership` is a reduction whose required input is the entity's
  own ID column, with the group's filters as a filter override, so its
  input stream is on the same entity. `Reduction.validateDependedVariableLocations`
  allows that. **It has not been tried against a live service.**
- **Back-end bugs found along the way.** This design no longer needs any
  of these fixed:
  - `Concatenation` reports its output as `CONTINUOUS` though it is
    joined text (`Concatenation.java:56`). The fix to `CATEGORICAL` is
    being merged anyway.
  - `DerivedVariableFactory` orders derived variables only by helpers
    declared internally, not by one variable in a request using another
    as input (`:176–203`). The order is effectively random, so chains of
    transforms can run in the wrong order. Worth fixing for anyone who
    chains plugins.
  - `CategoricalRecoding` lists an empty `unmappedValue` in its vocabulary
    (`:59–63`).
  - `ContinuousNumericToOrdinal` treats a missing lower bound as
    `Double.MIN_VALUE`, the smallest positive number, so open-ended
    "under N" ranges miss 0 and negative values (`:21`).
- `EcmaScriptExpressionEval` is not used: it declares no vocabulary, so
  plots couldn't order or colour its levels.

## 7. To verify early (spike before building)

1. With the plugin deployed to QA, send a `pass` line plot request of
   percent mortality over time for the Maryland upload, with a two-group
   variable inline as the overlay. Check:
   - the values;
   - first-group-wins on an overlap;
   - "Everything else", and how plots show records with no value when
     it's off.
2. Membership with a geo (`stringPrefixSet`) filter on the same entity,
   and with filters on another entity (ancestor and descendant).
3. The metadata endpoint for the same spec: type, shape and vocabulary
   order, and that the helpers aren't returned.
4. How each standard visualisation behaves when a variable in its
   configuration disappears from the metadata (delete).
5. That no saved analysis has a non-empty `derivedVariables` (§5.1 B).

### Spike results (2026-11-24, local stack)

Run against the Maryland upload (`STUDY_2d1a36a0e2`, "Maryland mossies"; the
id first given, `STUDY_32d63fbfa5`, returns 403 and isn't in the study
list). It has no percent-mortality variable, so the plot used mean
`unbiased specimen count` (Sample) by year of collection date (Collection),
overlay on the Collection site entity (2980 sites, 9602 collections, 66082
samples). Groups: East = GEOHASH 4 prefixes `dqcq dqcr dqct dqcu dqcw dqcx
dr0b`; West = `dqch dqck dqcj dqcn dqcq`; overlap = `dqcq`; `unmappedValue`
"Other".

The first run found that `filtersOverride` was ignored when fetching
tabular streams, so every `subsetMembership` returned 1; fixed in
service-eda `ff333cfd`. Results below are after the fix.

- **Metadata (item 3): pass.** One entry: `string`, `categorical`,
  `derivationType: transform`, vocabulary `["East","West","Other"]`
  (`["East","West"]` with no `unmappedValue`). No `_group` helpers.
- **Line plot, geohash groups (item 1): pass.** Series East, Other, West
  with N = 20949 / 37449 / 7684 samples, each with 22 yearly bins. East
  equals the subsetting count for East's filters; West is 28440 minus the
  20756 overlap records, so overlap records count only under East
  (first group wins). Bar plot on the site entity: East 433, West 452,
  Other 2095 (sums to 2980).
- **Other-entity filters (item 2): pass.**
  - Ancestor filters (geohash filters, variable on Collection): East
    2502, West 1215, Other 5885 (West count 3688 minus 2473 overlap).
  - Descendant filters (Collection `device`, variable on the site
    entity; East = BG-Sentinel, West = BG-Sentinel or gravid): East 452,
    West 10, Other 2518. Matches the subsetting counts (452, 462).
- **No `unmappedValue`, `showMissingness: "TRUE"` (step 5):** unmatched
  records show as a series named "No data" (N = 37449, the same records
  that are "Other" above), plotted alongside East and West. With it
  `FALSE` they would be dropped, as for any variable with no value.
- Timing: the 66082-sample line plot took about 3 minutes; the 2980-site
  bar plots 40 s.

## 8. Left to the builder

- Component structure, file layout, state management, tests (including
  `DerivedVarConfigTest`-style tests for the new plugin).
- How Browse and Subset's filter UI is reused for group editing (§5.4).
- Which data plugin supplies the editor's final counts (§5.3).
- Loading and error states, and how an invalid spec is shown.
- Exact wording of the notes and warnings, within §3.
