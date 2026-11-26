# Derived variables: "Create variables" tab (design)

Status: the tab and filter-based groups are built (branches
`map-redesign-and-derived-vars` here and `filter-defined-groups` in
`service-eda`). Saving simple groupings as recoders (§4), agreed on
2026-11-24, is built too (recoders plan Tasks 1-6). Background on the back end is in
`map-redesign.md` §8.

## 1. Why

The killer app is insecticide resistance. Someone sees an east–west split
in percent mortality, divides the sites into "East" and "West", and
overlays that grouping on a time-series plot to see whether the split
holds over time. More generally, users want to make their own
categorical variables (regions, age bands, species groupings, time
windows, "sells banana loaf") and use them in plots.

This work is for the **regular EDA workspace first**. The UX there has to
be clean and self-explanatory, because nothing guides users into it. The
full-screen map comes later. It will reuse the same variables, storage
and plumbing, and add its own guided route in: draw a lasso, get prompted
to draw another, be told what the new variable can be used for.

## 2. Goals, non-goals, anti-goals

**Goals**

- A workspace tab, **Create variables**, between "Browse and Subset"
  and "Visualize", for listing, creating, editing, renaming and deleting
  grouping variables.
- A grouping variable is an ordered list of **groups**. Each group has a
  name and a set of filters, built with the same filter widgets as Browse
  and Subset, including the geo lasso filter. Value groupings ("these
  species"), numeric ranges ("age 0–5"), drawn regions and filters on
  other entities ("coffee shops whose menu has banana loaf") are all just
  filters.
- The variables appear in the variable pickers of Visualize's
  **standard visualisations** (the `pass` app: those not built on a
  computation). They work as an overlay or facet, and anywhere else a
  categorical variable is accepted.
- Variables **belong to one analysis**. Copying or sharing the analysis
  takes them along.
- Simple groupings cost the server no more than an ordinary variable
  (§4).

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
  drop the derived variables that the computation's config doesn't use.
- Other kinds of derived variable (formulas, unit conversion, reductions
  over child entities).
- The full-screen map (phase 2 of the map redesign).
- A personal library of variables shared across analyses.

**Anti-goals (a failure even if it technically works)**

- Users can't tell why a variable isn't in Browse and Subset, or think
  their subset changed the groups.
- Records silently land in an unexpected group because groups overlap.
- Editing a variable breaks or orphans plots that use it.
- Creating or editing a derived variable re-runs expensive computations
  (e.g. DESeq2).
- Users have to understand which back-end plugin their variable uses.

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
    Collections into…"). The entity is chosen first and is fixed once the
    variable is saved. The variable lives on it and can be used in plots
    of that entity or of any entity below it. Group filters may be on any
    entity, as in Browse and Subset.
  - **Groups**, in order (drag to reorder), each with a name, a summary
    of its filters, an edit button and a record count. **At most 7
    groups**, so that with "Everything else" every level gets one of the
    8 overlay colours. "Add group" is disabled at the limit, with a note
    saying why.
  - **Everything else**: a level for records in no group, including
    records with no value for the grouping's variable. It can be renamed
    or switched off. When off, those records have no value, and the
    plots' existing "include no data" option decides whether they show.
    Its default is in §3.2.
  - **Used by:** the plots that use the variable.
- **Editing a group's filters (✎)** opens the Browse and Subset layout
  (variable tree plus the same filter widgets, including the geo lasso),
  working on that group's filters instead of the analysis subset.
- **Groups may filter on different variables,** so group 1 can be a
  drawn region and group 2 a species. To make the common case quick,
  **"Add group" opens on the variable(s) the previous group used**, with
  nothing selected yet. The user can still switch to any other variable.
- **Earlier groups are shown while a later one is edited,** so overlaps
  can be avoided rather than only reported:
  - **Geo lasso:** earlier groups' geohash cells are drawn faintly in
    their group colours.
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
  goes to the first of them. Range ends are inclusive, as in Browse and
  Subset, so adjacent ranges 0–10 and 10–20 share 10, which goes to the
  first. The editor counts overlaps as you edit and shows a prominent
  warning naming the groups and the number of records. It strongly
  recommends fixing the filters before saving, but saving is not blocked.
- **"Everything else" default.** On, labelled "Other", except when every
  group is a set of values of one categorical variable and together they
  cover that variable's whole vocabulary (e.g. a Likert scale collapsed
  to Agree / Disagree). Then it is off, so the variable doesn't get an
  "Other" level that can never have records. The default follows the
  groups as they are edited until the user changes the switch; after
  that, the user's choice stands.
- **Editing** a variable updates every plot that uses it.
- **Deleting** a variable that plots use asks for confirmation, naming
  those plots. If confirmed, those plots lose that variable and need a
  new one picked.
- **Renaming** a variable or a group changes the labels everywhere.

## 4. How groups become one variable

When the variable is saved, the front end picks one of two server
plugins. Users never see which; the editor, labels, counts and plots are
the same either way.

- **Recoder form** (cheap: one value per row, no extra data streams).
  Used when all of these hold:

  - every group has exactly one filter;
  - all the filters are on the same variable;
  - that variable is on the grouped entity or one of its ancestors (a
    transform plugin can only read those);
  - the variable is not binary, not multi-valued and doesn't impute
    zero;
  - every filter is of one kind from this table, which fixes the plugin:

    | Filter kind                   | Plugin                    | Rule                                       |
    | ----------------------------- | ------------------------- | ------------------------------------------ |
    | `stringSet`                   | `categoricalRecoding`     | `inputValues` = the set                    |
    | `stringPrefixSet` (geo lasso) | `categoricalRecoding`     | `inputPrefixes` = the prefixes             |
    | `numberRange`                 | `continuousToOrdinal`     | `minInclusive`, `maxInclusive` = the range |
    | `dateRange`                   | `continuousDateToOrdinal` | `minInclusive`, `maxInclusive` = the range |

- **Filter-based form** (`filterDefinedGroups`) for everything else:
  several filters in a group, groups on different variables, filters on
  descendant entities, multi-filters, binary, multi-valued and
  zero-imputed variables, numeric and date value sets.

Each rule includes exactly the records its filter includes, so the two
forms give the same groups. The variable's id stays the same if an edit
switches it from one form to the other, so plots that use it are
unaffected.

Why two forms: a filter-based variable fetches one data stream per group,
plus one for the entity, and on the SQL path each stream holds a database
connection while the plot is computed. A 7-group variable needs 8
connections for one plot request. The recoder form adds none.

## 5. How it is built

### 5.1 Back end (`service-eda`)

**A. `filterDefinedGroups` transform (built).** Config:

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

- Creates one `subsetMembership` helper per group, on the variable's own
  entity, with id `<variableId>_group<n>` and the group's filters as its
  stream's filter override. The metadata endpoint returns only requested
  variables, so the helpers never reach the client.
- Value: the label of the first group whose membership is `1`, otherwise
  `unmappedValue`, or no value if that is absent or empty.
- Metadata: `STRING`, `CATEGORICAL`; vocabulary is the labels in order,
  plus `unmappedValue` if it isn't empty.
- Validation: at least one group; labels non-empty and unique; every
  group has at least one filter; `unmappedValue` differs from every
  label.
- In-process subsetting streams honour a stream's filter override
  (`EdaSubsettingClient.resolveFilters`, built). Without it every
  membership is `1`.

**B. The analysis descriptor holds definitions (built).**
`derivedVariables` is `DerivedVariableSpec[]`. The analysis PATCH stores
the list as sent (ids must be unique), and import copies it unchanged.

**C. Recoder fixes and additions (built).** No client uses these
plugins yet, so their behaviour can change. All of them:

- treat an absent or empty `unmappedValue` as "no value", and list the
  vocabulary as the distinct output values in rule order, plus
  `unmappedValue` only if it isn't empty and not already listed;
- give records with no input value the `unmappedValue`, like
  `filterDefinedGroups` does.

The server's `categoricalRecoding` accepts only categorical and binary
input variables, so a grouping of an ordinal variable is saved in the
filter-based form.

Per plugin:

- **`categoricalRecoding`.**
  - `CategoricalRecodingRule` gets `inputPrefixes?: string[]`, and
    `inputValues` becomes optional. A rule matches when the value is in
    `inputValues` or starts with one of `inputPrefixes`. Each rule needs
    at least one of the two, non-empty.
  - Rejects multi-valued input variables. (Their rows hold a JSON array
    string, which never matched any rule.)
  - Accepts the shape of geohash variables (to check, §7).
- **`continuousToOrdinal`.**
  - `ContinuousNumericRule.maxExclusive` is renamed `maxInclusive` and
    is inclusive.
  - A missing bound is open-ended in that direction. (A missing lower
    bound used to be `Double.MIN_VALUE`, the smallest positive number,
    so it missed 0 and negatives.)
- **`continuousDateToOrdinal` (new).** Like `continuousToOrdinal`, for
  `DATE` variables:

  ```yaml
  ContinuousDateRule:
    type: object
    properties:
      minInclusive?: string
      maxInclusive?: string
      outputValue: string
  ContinuousDateRecodingConfig:
    type: object
    properties:
      inputVariable: VariableSpec
      rules: ContinuousDateRule[]
      unmappedValue?: string
  ```

  Bounds are parsed exactly as the subsetting service parses a
  `dateRange` filter's `min` and `max`
  (`FormatUtil.parseDateTime(Utils.standardizeLocalDateTime(…))`,
  `ApiConversionUtil.java:395`). Row values arrive as ISO local dates or
  date-times (`DateVariable.java:88–90`).

- **`concatenation`:** reports `CATEGORICAL`, not `CONTINUOUS`.

New config types are listed in `DerivedVariableDocumentationRequest`
alongside the existing ones.

**D. Database connection leak fix (temporary).** The branch
`fix-floating-plugin-connection-leaks` is squash-merged into
`filter-defined-groups` as one commit marked `TEMP:`, so testing isn't
disrupted by leaked connections. It is dropped once that branch reaches
`master`.

### 5.2 How a variable is stored

One spec per variable in `descriptor.derivedVariables`. The
`variableId` is a UUID created by the client and kept across edits.

Filter-based form:

```json
{
  "entityId": "<the grouped entity>",
  "variableId": "<uuid>",
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

Recoder form, for the same groups drawn with the lasso:

```json
{
  "entityId": "<the grouped entity>",
  "variableId": "<uuid>",
  "functionName": "categoricalRecoding",
  "displayName": "Region (East/West)",
  "config": {
    "inputVariable": { "entityId": "…", "variableId": "<geohash variable>" },
    "rules": [
      { "inputPrefixes": ["dqcq", "dqcr"], "outputValue": "East" },
      { "inputPrefixes": ["dqch", "dqck"], "outputValue": "West" }
    ],
    "unmappedValue": "Other"
  }
}
```

- The editor works on groups of filters. A recoder spec is turned back
  into groups when it is opened: each rule becomes one filter of the
  matching kind on `inputVariable`. A recoder spec that can't be turned
  back (a rule with both values and prefixes, an open-ended range,
  several rules with the same output) is shown read-only as
  "unsupported", like a spec with an unknown function name. The client
  never writes such specs.
- Per-group filter widget state is kept outside the spec (§5.4), so it
  is the same for both forms.

### 5.3 Front-end plumbing (built, unchanged by §4)

- **Metadata:** `POST /merging/derived-variables/metadata/variables`
  (study id plus the specs) gives each variable's type, shape and
  vocabulary. They are added to the variable tree **for the pickers of
  standard visualisations only**, in a "Created in this analysis"
  folder under their entity. Browse and Subset, Download and
  visualisations built on a computation don't see them.
- **Data requests:** every data-plugin request of a standard
  visualisation carries **only the specs it references**, and cached
  requests are keyed on those specs, so unrelated edits don't change
  requests or caches.
- **Compute requests** send no derived variables (`[]`), so edits never
  re-run compute jobs.
- **Save, edit, rename, delete** replace the spec in
  `descriptor.derivedVariables`. The id doesn't change, so plots that
  reference the variable need no rewriting.
- **Counts in the editor (whole dataset, no subset filters):**
  - **Raw count of each group:** the subsetting service's count for that
    group's filters on the grouped entity.
  - **Final counts under first-group-wins,** including "Everything
    else": a `pass` barplot with the unsaved spec inline, counting each
    level. This works for both forms.
  - **Overlap** for group _i_: raw count − final count.

### 5.4 Group filter editing (built)

The Browse and Subset components work on a group's filters through an
adapter analysis state. Per-group widget state (e.g. the geo lasso's) is
kept in `subset.uiSettings` under `derivedVariable/<variableId>/group<n>`.

## 6. Facts the design relies on

- Transform plugins may read variables on their own entity or an
  ancestor only (`Transform.validateDependedVariableLocations`).
- Multi-valued variables arrive in rows as a JSON array string
  (`TallRowConversionUtils.java:178`).
- Browse and Subset range filters include both ends
  (`NumberRangeFilter.java:32`, `DateRangeFilter.java:33`).
- Plots draw every vocabulary value, in order, and leave out values not
  in the vocabulary (e.g. barplot `reorderData`). A vocabulary value with
  no records shows as an empty slot or a greyed legend entry.
- `DerivedVariableFactory` orders derived variables only by helpers
  declared internally, not by one requested variable using another as
  input. Nothing here chains requested variables, so this doesn't matter
  yet.

## 7. To check while building

1. The data shape of geohash variables, and that `categoricalRecoding`
   accepts them.
2. For one set of groups of each filter kind, the recoder form and the
   filter-based form give the same counts per level.

## 8. Left to the builder

- Component structure, file layout, state management and tests.
- Exact wording of the notes and warnings, within §3.
