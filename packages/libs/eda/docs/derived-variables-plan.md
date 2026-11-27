# Derived Variables ("Create variables") Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let users build grouping variables from filters in a new
"Create variables" workspace tab, and use them as overlays and facets in
standard visualisations.

**Architecture:** A new merge-service transform plugin
(`filterDefinedGroups`) computes one categorical variable from ordered,
filter-defined groups. The analysis descriptor stores the full plugin
specs in `derivedVariables`. In the web client, one provider wraps
visualisations of apps with no compute step. It adds the derived
variables to the study's variable tree and to each data request that
references them. Group filters are edited with the Browse and Subset
components, through an adapter `AnalysisState` whose filters are the
group's.

**Tech Stack:**

- Back end (`service-eda`): Java 21, RAML, JUnit 5.
- Front end (`web-monorepo`, `@veupathdb/eda`): React 17, TypeScript, io-ts, Jest and React Testing Library (via `veupathdb-react-scripts`).

**User Testing:**

- Applies to Claude-in-Chrome in Chromium too
- User has local webpack dev server running from web-monorepo's @veupathdb/clinepi-site - http://localhost:8080/a/app/
- This points at local port 8081 for the /eda proxy
- Built and served from `~/work/EDA/service-eda` and this:
  - `podman build --build-arg GITHUB_USERNAME=$GITHUB_USERNAME --build-arg GITHUB_TOKEN=$GITHUB_TOKEN -t localhost/veupathdb/service-eda:local-dev . && systemctl --user daemon-reload && systemctl --user restart eda-service@local.service`
  - local service is extremely slow due to transatlantic database proxy, use smaller datasets such as "Coffee Shops Geo-Edition": http://localhost:8080/a/app/workspace/analyses/EDAUD_Ah88IRopd809s/new

**Spec:** `packages/libs/eda/docs/derived-variables-design.md`. Section
numbers below (§) refer to it.

## Global Constraints

- **Repositories and branches:**
  - Back end: `/home/maccallr/work/EDA/service-eda`, a new branch `filter-defined-groups` off `master`.
  - Front end: `/home/maccallr/work/EDA/web-monorepo`, branch `map-redesign-and-derived-vars` (it already contains PR #1775).
- **Back-end builds and tests always use the composite build:**
  `./gradlew --include-build ../lib-eda-subsetting …`.
  - `master` does not compile against the published `eda-subsetting` jar.
  - Never commit the local `build.gradle.kts` change.
- **RAML:** edit only files under `schema/url/`, then run `merge-raml` and commit the regenerated `schema/library.raml`. Never hand-edit `library.raml`.
- **TypeScript only:** new files are `.ts`/`.tsx`, with no `any` and no `@ts-ignore`.
- **Front-end tests:** `yarn workspace @veupathdb/eda test --watchAll=false <pattern>`.
- **Front-end build check:** `yarn workspace @veupathdb/eda build-npm-modules`.
- **Plugin function name:** `filterDefinedGroups`. Helper ids are `<variableId>_group<n>`, with `n` counting from 1.
- **Groups:** at most 10 per variable in the UI (`MAX_GROUPS = 10`).
- **Text and labels:**
  - Tab label: "Create variables". Route: `${routeBase}/create-variables`.
  - Picker folder: "Created in this analysis".
  - Standing note in the tab: "Variables made here can be used in Visualize, not for subsetting."
  - Default "Everything else" label: `Other`. It is on by default (§3.1).
- **Which visualisations get derived variables:** only those whose app has no `computeName` (§2). Compute requests always send `derivedVariables: []`.
- **Groups don't depend on the subset:** editor counts use no subset filters (§3.2).

## Review Focus

1. **A derived variable this client can't decode must not stop an analysis loading.** That covers a spec from a plugin it doesn't know, and a config it can't decode (e.g. a filter type added later). The entry is shown as "unsupported". (Task 4)
2. **Creating a variable in an unsaved analysis must save the analysis first,** as other first edits do. Otherwise the variable is lost. (Task 9)
3. **Visualisations built on a computation never send derived variables,** even when the analysis has some. Their results lookup must keep matching their computation. (Task 5)
4. **Group labels that are empty or duplicated, or equal to the "Everything else" label, block saving in the UI,** with the same rules as the server's validation. A server 400 is too late. (Tasks 1 and 8)
5. **Deleting a variable a plot uses** lists that plot before deleting. Afterwards Visualize must still render, showing the plot's normal "variable missing" state, not crash. (Tasks 9 and 12)

---

## Part A — Back end (`service-eda`)

### Task 1: `filterDefinedGroups` transform plugin

**Files:**

- Modify: `schema/url/merge/derived-variables.raml` (add the types below)
- Modify: `schema/url/merge/derived-variable-metadata.raml` (add `filterDefinedGroups: FilterDefinedGroupsConfig` to `DerivedVariableDocumentationRequest`)
- Regenerate: `schema/library.raml`
- Create: `src/main/java/org/veupathdb/service/eda/merge/plugins/transforms/FilterDefinedGroups.java`
- Modify: `src/main/java/org/veupathdb/service/eda/merge/plugins/Transforms.java` (register it)
- Test: `src/test/java/eda/FilterDefinedGroupsTest.java`

**Interfaces:**

- Produces (RAML, so generated as `FilterDefinedGroupsConfig` and `FilterDefinedGroup`, plus their `…Impl` classes):
  ```yaml
  FilterDefinedGroup:
    properties:
      label: string
      filters: API_Filter[]
  FilterDefinedGroupsConfig:
    properties:
      groups: FilterDefinedGroup[]
      unmappedValue?: string
  ```
- Produces: `public class FilterDefinedGroups extends Transform<FilterDefinedGroupsConfig>`, with `FUNCTION_NAME = "filterDefinedGroups"`.

- [ ] **Step 1: Create the branch and add the RAML types**

```bash
cd /home/maccallr/work/EDA/service-eda
git switch master && git switch -c filter-defined-groups
```

Add the two types under `types:` in `schema/url/merge/derived-variables.raml`, and the documentation property. Then:

Run: `./gradlew --include-build ../lib-eda-subsetting merge-raml generate-jaxrs`
Expected: BUILD SUCCESSFUL. `git diff schema/library.raml` shows both new types, and `FilterDefinedGroupsConfigImpl` exists under `src/main/java/.../generated/model/`.

- [ ] **Step 2: Write the failing tests**

Build specs the way `DerivedVarConfigTest` does: set the config, then round-trip the spec through `JsonUtil.Jackson` so the config is a `Map`. `convertConfig` accepts only a `Map`. Build a `DerivedVariableFactory(null, specs)`; metadata isn't needed for any of these. Use entity `"e"`, variable `"v"`, and groups `East` and `West`, each with one `stringSet` filter.

```java
@Test void declaresOneMembershipHelperPerGroupBeforeItself()
  // getAllDerivedVars(): size 3; the last is the FilterDefinedGroups instance;
  // the first two have functionName "subsetMembership" and variableIds "v_group1", "v_group2"

@Test void valueIsFirstMatchingGroup()
  // row {"e.v_group1":"1","e.v_group2":"1"} -> "East"
  // row {"e.v_group1":"0","e.v_group2":"1"} -> "West"

@Test void unmatchedRowGetsUnmappedValueOrEmpty()
  // unmappedValue "Other": row of "0","0" -> "Other"
  // unmappedValue absent: -> ""

@Test void vocabularyIsLabelsThenNonEmptyUnmappedValue()
  // with "Other": ["East","West","Other"]; with unmappedValue "" or absent: ["East","West"]

@Test void rejectsInvalidConfigs()
  // assertThrows(ValidationException.class, …) for each of:
  // no groups; empty label; duplicate labels; a group with empty filters;
  // unmappedValue equal to a label
```

Find the instance with
`factory.getAllDerivedVars().stream().filter(FilterDefinedGroups.class::isInstance)`.
Build row keys with `VariableDef.toDotNotation` on the helper specs; don't hard-code them.

- [ ] **Step 3: Run the tests to verify they fail**

Run: `./gradlew --include-build ../lib-eda-subsetting test --tests eda.FilterDefinedGroupsTest`
Expected: compilation failure (`FilterDefinedGroups` not found).

- [ ] **Step 4: Implement `FilterDefinedGroups`**

Model it on `RelativeObservationCalculator.createAggregatorSpec`.

- **`acceptConfig`:**
  - Validate the config. Use these messages: "At least one group is required", "Group labels must be non-empty", "Group labels must be unique", "Group '<label>' has no filters", "unmappedValue must differ from every group label".
  - Then build one `DerivedVariableSpecImpl` per group: entity `getEntityId()`, id `getVariableId() + "_group" + n`, function name `subsetMembership`, display name = the label.
  - **The helper's config must be a `Map`:** `Map.of("subsetFilters", group.getFilters())`.
- **`getDependedDerivedVarSpecs()` and `getRequiredInputVars()`:** both return the helper specs.
- **`getValue`:** return the label of the first group whose helper column is `"1"`. Otherwise `unmappedValue`, or `EMPTY_VALUE` when that's null or empty.
- **Metadata:** `getVariableType()` = `STRING`, `getDataShape()` = `CATEGORICAL`, and `getVocabulary()` as in the test.
- **`performSupplementalDependedVariableValidation`:** nothing to check.

Register it in `Transforms.getPlugins()`.

- [ ] **Step 5: Run the tests to verify they pass**

Run: `./gradlew --include-build ../lib-eda-subsetting test --tests eda.FilterDefinedGroupsTest --tests eda.DerivedVarConfigTest`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add schema/url/merge schema/library.raml src/main/java/org/veupathdb/service/eda/merge/plugins src/test/java/eda/FilterDefinedGroupsTest.java
git commit -m "Add filterDefinedGroups derived variable plugin"
```

### Task 2: The analysis descriptor stores derived-variable specs

**Files:**

- Modify: `schema/url/user/user.raml` (`AnalysisDescriptor.derivedVariables: DerivedVariableSpec[]`)
- Regenerate: `schema/library.raml`
- Modify: `src/main/java/org/veupathdb/service/eda/user/service/UserService.java` (`:86–103`, `:245–250`, `:260–335`)
- Modify: `src/main/java/org/veupathdb/service/eda/user/service/ImportAnalysisService.java` (`:93–102`, `:108–end of copyDerivedVariables`)
- Test: `src/test/java/eda/AnalysisDescriptorDerivedVariablesTest.java`

**Interfaces:**

- Produces: `AnalysisDescriptor.getDerivedVariables()` returns `List<DerivedVariableSpec>`.
- Produces: the analysis PATCH stores the list as sent. It returns 400 "Derived variable ids must be unique within an analysis" if two specs share a `variableId`. Import copies the list unchanged.

- [ ] **Step 1: Write the failing test**

```java
@Test void descriptorRoundTripsDerivedVariableSpecs()
  // JSON descriptor with derivedVariables: [{entityId:"e", variableId:"v",
  //   functionName:"filterDefinedGroups", displayName:"Region", config:{groups:[]}}]
  // -> JsonUtil.Jackson.readValue(json, AnalysisDescriptorImpl.class)
  // -> getDerivedVariables().get(0).getFunctionName() == "filterDefinedGroups"
```

- [ ] **Step 2: Run it to verify it fails**

Run: `./gradlew --include-build ../lib-eda-subsetting test --tests eda.AnalysisDescriptorDerivedVariablesTest`
Expected: FAIL. Deserialization errors, because the field is `List<String>`.

- [ ] **Step 3: Change the schema and simplify the user service**

Change `derivedVariables` in `user.raml`'s `AnalysisDescriptor`. Then run `./gradlew --include-build ../lib-eda-subsetting merge-raml generate-jaxrs`.

In `UserService`:

- delete `processPatchedDerivedVars` and the derived-variable handling around it in the analysis PATCH;
- replace the UUID loop in `editAnalysis` with the uniqueness check above;
- simplify `getDerivedVariables` to return `List<DerivedVariableSpec>`, or remove it if nothing uses it.

In `ImportAnalysisService`, delete the copy block and `copyDerivedVariables`.

Leave `UserDataFactory` and the `/derived-variables` store endpoints alone.

- [ ] **Step 4: Run the full test suite and compile**

Run: `./gradlew --include-build ../lib-eda-subsetting test`
Expected: BUILD SUCCESSFUL. All tests pass.

- [ ] **Step 5: Commit**

```bash
git add schema src/main/java/org/veupathdb/service/eda/user src/test/java/eda/AnalysisDescriptorDerivedVariablesTest.java
git commit -m "Store full derived variable specs in the analysis descriptor"
```

- [ ] **Step 6: Hand the pre-deploy check to the user (not run by the implementer)**

Report this query for each project's user schema. It must return 0 before deploying (§5.1 B):

```sql
select count(*) from <schema>.analysis
where analysis_descriptor like '%"derivedVariables":[%'
  and analysis_descriptor not like '%"derivedVariables":[]%';
```

### Task 3: Spike on a local stack (spec §7, items 1–3)

**Files:**

- Modify: `packages/libs/eda/docs/derived-variables-design.md` §7 (record the results, in `web-monorepo`)

**Interfaces:**

- Consumes: Tasks 1 and 2 deployed to the user's local service stack.

- [ ] **Step 1: Ask the user for the local stack's base URL and auth header.** Use the Maryland upload (`STUDY_32d63fbfa5`).
- [ ] **Step 2: POST a `pass` line plot with an inline two-group variable as the overlay** (`/apps/pass/visualizations/lineplot`):

  - one `filterDefinedGroups` spec in `derivedVariables`;
  - groups defined by `stringPrefixSet` geohash filters that overlap a little;
  - `unmappedValue` `"Other"`.

  Expected: 200. The series are East, West and Other, and records in the overlap count only under East.

- [ ] **Step 3: Repeat with membership filters on another entity:** an ancestor of the grouped entity, then a descendant. Expected: 200, with plausible counts.
- [ ] **Step 4: POST the spec to `/merging/derived-variables/metadata/variables`.** Expected: exactly one entry, with `variableType: "string"`, `dataShape: "categorical"` and vocabulary `["East","West","Other"]`. No `_group` helpers.
- [ ] **Step 5: Repeat Step 2 with no `unmappedValue`** and `showMissingness: "TRUE"`. Record whether unmatched records show as "no data".
- [ ] **Step 6: Record the results in §7 and commit**

```bash
git add packages/libs/eda/docs/derived-variables-design.md
git commit -m "Record derived variable spike results"
```

If any step fails, stop and report to the user before Part B.

---

## Part B — Front end (`web-monorepo`, `packages/libs/eda`)

All paths below are under `packages/libs/eda/src/lib/`.

### Task 4: Types and reference helpers

**Files:**

- Create: `core/derivedVariables/types.ts`
- Create: `core/derivedVariables/references.ts`
- Modify: `core/types/analysis.ts:39–40` and `:108` (replace `DerivedVariable` with `DerivedVariableSpec`)
- Test: `core/derivedVariables/types.test.ts`, `core/derivedVariables/references.test.ts`

**Interfaces:**

- Produces (`core/types/analysis.ts`):
  - `DerivedVariableSpec`: an io-ts codec `t.type({ entityId: t.string, variableId: t.string, functionName: t.string, displayName: t.string, config: t.unknown })`. It replaces `DerivedVariable`.
  - `AnalysisDescriptor.derivedVariables: t.array(DerivedVariableSpec)`.
  - It lives here rather than in `core/derivedVariables/`, so `analysis.ts` imports nothing from the new folder.
- Produces (`types.ts`):
  - It re-exports `DerivedVariableSpec`.
  - `FILTER_DEFINED_GROUPS = 'filterDefinedGroups'`.
  - `FilterDefinedGroup`: `{ label: string; filters: Filter[] }`.
  - `FilterDefinedGroupsConfig`: `{ groups: FilterDefinedGroup[]; unmappedValue?: string }`. Both are io-ts codecs.
  - `FilterDefinedGroupsSpec = DerivedVariableSpec & { functionName: 'filterDefinedGroups'; config: FilterDefinedGroupsConfig }`.
  - `isFilterDefinedGroupsSpec(x: unknown): x is FilterDefinedGroupsSpec`.
  - `decodeDerivedVariables(entries: DerivedVariableSpec[]): { supported: FilterDefinedGroupsSpec[]; unsupported: DerivedVariableSpec[] }`. Specs with another `functionName`, or whose `config` fails `FilterDefinedGroupsConfig`, are unsupported.
- Produces (`references.ts`):
  - `findReferencedSpecs<S extends DerivedVariableSpec>(value: unknown, specs: S[]): S[]`. It walks `value` deeply and returns the specs whose `{ entityId, variableId }` appears as an object's own `entityId` and `variableId` properties.
  - `findVisualizationsUsing(computations: Computation[], spec: DerivedVariableSpec): Visualization[]`.
- **The outer spec shape is strict, but `config` is decoded only in `core/derivedVariables/`.** An unknown plugin, or a config this client can't decode, therefore can't stop an analysis loading (Review Focus 1).

- [ ] **Step 1: Write the failing tests**

```ts
test('decodeDerivedVariables splits supported and unsupported specs', ...)
  // [validSpec, {...validSpec, functionName: 'concatenation'},
  //  {...validSpec, config: { groups: [{ label: 'A', filters: [{ type: 'notAFilterType' }] }] }}]
  // -> supported: [validSpec]; unsupported: the other two

test('an analysis whose descriptor has an unsupported spec still decodes', ...)
  // AnalysisDescriptor.decode(descriptorWith([{...validSpec, functionName: 'somethingNew'}])) is Right

test('findReferencedSpecs finds specs nested anywhere in a config', ...)
  // value: { config: { overlayVariable: { entityId: 'e', variableId: 'v' } } }
  // specs: [spec v, spec w] -> [spec v]

test('findReferencedSpecs ignores a matching variableId on another entity', ...)

test('findVisualizationsUsing lists visualisations whose descriptor references the spec', ...)
  // two computations; one viz with overlayVariable = spec -> [that viz]
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `yarn workspace @veupathdb/eda test --watchAll=false derivedVariables`
Expected: FAIL (modules not found).

- [ ] **Step 3: Implement `types.ts` and `references.ts`.** Reuse the existing `Filter` codec from `core/types/filter`.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `yarn workspace @veupathdb/eda test --watchAll=false derivedVariables`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/libs/eda/src/lib/core/derivedVariables packages/libs/eda/src/lib/core/types/analysis.ts
git commit -m "Add derived variable spec types and reference helpers"
```

### Task 5: Metadata, request injection and the Visualize provider

**Files:**

- Modify: `core/api/DataClient/types.ts` (the `DerivedVariableMetadata` codec)
- Modify: `core/api/DataClient/index.ts` (the `getDerivedVariableMetadata` method)
- Create: `core/derivedVariables/metadata.ts`
- Create: `core/derivedVariables/dataClient.ts`
- Create: `core/derivedVariables/DerivedVariablesProvider.tsx`
- Modify: `core/components/computations/ComputationInstance.tsx:92–109` (the wrapper)
- Modify: `core/components/computations/ComputeJobStatusHook.ts:49` (`derivedVariables: []`)
- Test: `core/derivedVariables/metadata.test.ts`, `core/derivedVariables/dataClient.test.ts`, `core/derivedVariables/DerivedVariablesProvider.test.tsx`

**Interfaces:**

- Consumes: Task 4's `DerivedVariableSpec`, `findReferencedSpecs` and `decodeDerivedVariables`.
- Produces:
  - **`DerivedVariableMetadata`** (io-ts): `{ entityId, variableId, derivationType: 'transform'|'reduction', variableType: 'string'|'number'|'integer'|'date'|'longitude', dataShape: 'categorical'|'ordinal'|'binary'|'continuous' }`, plus optional `vocabulary: string[]` and `units: string`. The API's enum values are lower-case.
  - **`DataClient.getDerivedVariableMetadata(studyId: string, derivedVariables: DerivedVariableSpec[]): Promise<DerivedVariableMetadata[]>`**: POST `/merging/derived-variables/metadata/variables`.
  - **`toVariableTreeNode(meta: DerivedVariableMetadata, spec: DerivedVariableSpec): StringVariable`**:
    - `type: 'string'`, `dataShape` and `vocabulary` from the metadata, `distinctValuesCount` = vocabulary length;
    - `isTemporal`, `isFeatured`, `isMergeKey` and `isMultiValued` all `false`;
    - `providerLabel: ''`, `hideFrom: ['download']`, `parentId: DERIVED_VARIABLES_CATEGORY_ID`.
  - **`DERIVED_VARIABLES_CATEGORY_ID = 'derived_variables_category'`**.
  - **`addDerivedVariablesToEntity(root: StudyEntity, nodes: Array<{ entityId: string; node: StringVariable }>): StudyEntity`**: returns a new tree. Each entity that gets nodes also gets a `VariableCategory` named "Created in this analysis", with `hideFrom: []`.
  - **`withDerivedVariableSpecs(client: DataClient, specs: DerivedVariableSpec[]): DataClient`**: returns `Object.create(client)` with `getVisualizationData` overridden to add `derivedVariables: findReferencedSpecs(params, specs)` to `params`. Every typed method calls `this.getVisualizationData`, so all of them are covered.
  - **`<DerivedVariablesProvider analysis={…}>{children}</DerivedVariablesProvider>`**:
    - decodes `analysis.descriptor.derivedVariables` and fetches the metadata, again whenever the specs change, so renames and edits show up;
    - re-provides `WorkspaceContext` with `studyMetadata.rootEntity` augmented and `dataClient` wrapped;
    - while the metadata is loading, renders children with the unaugmented context.
- `ComputationInstance` wraps `VisualizationsContainer` in the provider only when `computationAppOverview.computeName == null` (Review Focus 3).

- [ ] **Step 1: Write the failing tests**

```ts
test('toVariableTreeNode makes a categorical string variable in the derived folder', ...)
test('addDerivedVariablesToEntity adds the folder and variable to the right nested entity only', ...)
test('withDerivedVariableSpecs adds only referenced specs to visualization requests', ...)
  // fake client whose getVisualizationData records params; call getLineplot via the wrapper
  // with overlayVariable = spec A; specs [A, B] -> recorded params.derivedVariables == [A]
test('withDerivedVariableSpecs sends [] when nothing is referenced', ...)
test('DerivedVariablesProvider exposes derived variables through useStudyEntities', ...)
  // render with a WorkspaceContext whose dataClient.getDerivedVariableMetadata resolves;
  // a child calling useStudyEntities() finds a variable with the spec's variableId
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `yarn workspace @veupathdb/eda test --watchAll=false derivedVariables`
Expected: the new tests FAIL.

- [ ] **Step 3: Implement the codec, the client method, `metadata.ts`, `dataClient.ts` and the provider. Then wire `ComputationInstance` and change `ComputeJobStatusHook`.**

- [ ] **Step 4: Run the tests and the build**

Run: `yarn workspace @veupathdb/eda test --watchAll=false derivedVariables && yarn workspace @veupathdb/eda build-npm-modules`
Expected: PASS, and the build completes.

- [ ] **Step 5: Commit**

```bash
git add packages/libs/eda/src/lib/core
git commit -m "Offer derived variables in standard visualisations"
```

### Task 6: Group-editing model

**Files:**

- Create: `core/derivedVariables/groups.ts`
- Test: `core/derivedVariables/groups.test.ts`

**Interfaces:**

- Produces:

  - `MAX_GROUPS = 10` and `DEFAULT_UNMAPPED_VALUE = 'Other'`.
  - `validateFilterDefinedGroups(config: FilterDefinedGroupsConfig): string[]`. It returns user-facing messages, empty when the config is valid. The rules are the server's (Task 1) plus "At most 10 groups".
  - `overlapForGroup(index: number, rawCounts: number[], finalCounts: number[]): number`. It returns `rawCounts[index] - finalCounts[index]`.
  - `newFilterDefinedGroupsSpec(entityId: string, displayName: string): FilterDefinedGroupsSpec`. It creates a uuid id, no groups and `unmappedValue: 'Other'`.
  - `nextGroupStartVariable(groups: FilterDefinedGroup[]): VariableDescriptor | undefined`. It returns the variable of the last group's last filter (§3.1, "Add group").

- [ ] **Step 1: Write the failing tests**

```ts
test('valid config has no messages', ...)
test.each([...])('rejects %s', ...)
  // no groups; empty label; duplicate labels; group with no filters;
  // unmappedValue equal to a label; 11 groups
test('overlapForGroup is raw minus final', ...)            // ([10, 8], [10, 5]) at index 1 -> 3
test('nextGroupStartVariable uses the previous group's variable', ...)
test('nextGroupStartVariable is undefined with no groups', ...)
```

- [ ] **Step 2: Run to verify failure.** Run: `yarn workspace @veupathdb/eda test --watchAll=false groups.test`. Expected: FAIL.
- [ ] **Step 3: Implement `groups.ts`.**
- [ ] **Step 4: Run to verify pass.** Same command. Expected: PASS.
- [ ] **Step 5: Commit**

```bash
git add packages/libs/eda/src/lib/core/derivedVariables/groups.ts packages/libs/eda/src/lib/core/derivedVariables/groups.test.ts
git commit -m "Add the filter-defined groups editing model"
```

### Task 7: Group filter adapter and editor counts

**Files:**

- Create: `core/derivedVariables/useGroupFilterAnalysisState.ts`
- Create: `core/derivedVariables/useGroupCounts.ts`
- Test: `core/derivedVariables/useGroupFilterAnalysisState.test.ts`, `core/derivedVariables/useGroupCounts.test.tsx`

**Interfaces:**

- Consumes: `AnalysisState` (`core/hooks/analysis.ts:47`), `SubsettingClient.getEntityCount(studyId, entityId, filters)`, `DataClient.getBarplot`, and Task 6's model.
- Produces:
  - **`useGroupFilterAnalysisState(base: AnalysisState, group: { filters: Filter[]; uiSettings: Record<string, unknown> }, onChange: (next: { filters: Filter[]; uiSettings: Record<string, unknown> }) => void): AnalysisState`**:
    - returns `base` with `analysis.descriptor.subset` replaced by the group's filters and UI settings;
    - `setFilters` and `setVariableUISettings` call `onChange`, accepting either a value or an updater function;
    - every other member is passed through.
  - **`useGroupCounts(spec: FilterDefinedGroupsSpec): { pending: boolean; raw?: number[]; final?: Record<string, number> }`**:
    - `raw[i]` is `getEntityCount(studyId, spec.entityId, groups[i].filters)`;
    - `final` comes from one `pass` barplot request: x axis = the spec's variable, `valueSpec: 'count'`, `filters: []`, `showMissingness: 'TRUE'`, and `derivedVariables: [spec]`;
    - keys are the labels, plus `''` for no value;
    - requests are debounced by 500 ms after the last spec change.
- **Group UI settings** live in the analysis's `subset.uiSettings`, under the key `derivedVariable/<variableId>/group<n>` (§5.4).

- [ ] **Step 1: Write the failing tests**

```ts
test('adapter exposes the group filters as the subset', ...)
test('adapter setFilters with an updater function calls onChange with the result', ...)
test('adapter passes other members through unchanged', ...)            // setStarredVariables === base's
test('useGroupCounts requests a raw count per group and one final barplot with filters []', ...)
  // mocked clients via WorkspaceContext; assert call args and the returned shape
```

- [ ] **Step 2: Run to verify failure.** Run: `yarn workspace @veupathdb/eda test --watchAll=false "useGroup"`. Expected: FAIL.
- [ ] **Step 3: Implement both hooks.** Use the existing `usePromise` and `useDebounce` hooks.
- [ ] **Step 4: Run to verify pass.** Same command. Expected: PASS.
- [ ] **Step 5: Commit**

```bash
git add packages/libs/eda/src/lib/core/derivedVariables
git commit -m "Add the group filter adapter and editor counts"
```

### Task 8: "Create variables" tab — the list and the editor

**Files:**

- Create: `workspace/CreateVariables/index.tsx` (the tab: list and editor host)
- Create: `workspace/CreateVariables/VariableEditor.tsx`
- Create: `workspace/CreateVariables/GroupRow.tsx`
- Create: `workspace/CreateVariables/CreateVariables.scss`
- Modify: `workspace/AnalysisPanel.tsx:352–388` (the nav item after "Browse and Subset") and the routes near `:458` (`${routeBase}/create-variables`)
- Test: `workspace/CreateVariables/VariableEditor.test.tsx`

**Interfaces:**

- Consumes: Tasks 4, 6 and 7. `analysisState.setDerivedVariables(value, createIfUnsaved)`.
- Produces: `<CreateVariables analysisState={…} />` and `<VariableEditor spec={…} analysisState={…} onSave={(spec) => void} onCancel={() => void} onDelete={() => void} />`.
- **Behaviour (§3.1, §3.2):**
  - **Name and entity:** the editor has a name field and an entity picker. The entity is chosen first and can't change once the variable has groups.
  - **Groups:** listed in order with up/down reorder buttons, each with its label, a filter summary from the existing filter chip text, an edit button, and its final count. Build `finalCounts = groups.map(g => final[g.label] ?? 0)` and pass it, with `raw`, to `overlapForGroup`.
  - **Adding groups:** "Add group" is disabled at 10.
  - **"Everything else":** a checkbox and label (`Other`); unchecked sets `unmappedValue: ''`.
  - **Overlap warning:** shown for any group with `overlapForGroup > 0`: "`<n>` `<entity plural>` in `<label>` also match an earlier group; they count as that group. Adjust filters before saving." When exactly one earlier group overlaps, name it.
  - **Used by:** lists `findVisualizationsUsing(...)` by display name.
  - **Save:** disabled while `validateFilterDefinedGroups` returns messages, which are shown above the button. Saving calls `setDerivedVariables(next, true)` (Review Focus 2). It replaces the spec with the same `variableId`, or appends a new one.
  - **Delete:** confirms in a coreui modal that lists "Used by" plots (Review Focus 5), then removes the spec.
- **The list** shows supported specs by display name and unsupported entries as read-only "Unsupported variable". Below it is the standing note: "Variables made here can be used in Visualize, not for subsetting."

- [ ] **Step 1: Write the failing tests**

```ts
test('save is disabled and messages shown for a duplicate group label', ...)
test('saving a new variable calls setDerivedVariables with createIfUnsaved true', ...)
test('overlap warning names the single earlier group', ...)      // mock useGroupCounts
test('delete confirmation lists the plots that use the variable', ...)
test('Add group is disabled at 10 groups', ...)
```

- [ ] **Step 2: Run to verify failure.** Run: `yarn workspace @veupathdb/eda test --watchAll=false VariableEditor`. Expected: FAIL.
- [ ] **Step 3: Implement the tab, editor and row, and add the nav item and route.** Group editing (✎) is a placeholder button here; Task 9 wires it up.
- [ ] **Step 4: Run tests and build.** Run: `yarn workspace @veupathdb/eda test --watchAll=false VariableEditor && yarn workspace @veupathdb/eda build-npm-modules`. Expected: PASS, and the build completes.
- [ ] **Step 5: Commit**

```bash
git add packages/libs/eda/src/lib/workspace
git commit -m "Add the Create variables tab"
```

### Task 9: Editing a group's filters

**Files:**

- Create: `workspace/CreateVariables/GroupFilterEditor.tsx`
- Modify: `workspace/CreateVariables/VariableEditor.tsx` (✎ opens it)
- Test: `workspace/CreateVariables/GroupFilterEditor.test.tsx`

**Interfaces:**

- Consumes: `Subsetting` (`workspace/Subsetting/index.tsx`) with a button-type `VariableLinkConfig`, as `notebook/cells/SubsettingNotebookCell.tsx` uses it; `FilterChipList`; `useGroupFilterAnalysisState`; `nextGroupStartVariable`; and `useEntityCounts()` with no filters, for whole-dataset counts.
- Produces: `<GroupFilterEditor analysisState group groupIndex variableId onChange onClose />`.
- **Behaviour:**

  - It renders the group's filter chips and the Browse and Subset layout, working on the group's filters.
  - A new group opens on `nextGroupStartVariable(previous groups)`; otherwise on the study's default variable.

- [ ] **Step 1: Write the failing tests**

```ts
test('applying a filter in the editor updates only the group, not the analysis subset', ...)
test('a new group opens on the previous group's variable', ...)
```

- [ ] **Step 2: Run to verify failure.** Run: `yarn workspace @veupathdb/eda test --watchAll=false GroupFilterEditor`. Expected: FAIL.
- [ ] **Step 3: Implement it and wire up ✎ and "Add group".**
- [ ] **Step 4: Run tests and build.** Same test command, plus `build-npm-modules`. Expected: PASS, and the build completes.
- [ ] **Step 5: Commit**

```bash
git add packages/libs/eda/src/lib/workspace/CreateVariables
git commit -m "Edit a group's filters with the Browse and Subset widgets"
```

### Task 10: Show earlier groups while editing (§3.1; can be cut back)

**Files:**

- Create: `core/derivedVariables/GroupEditingContext.ts`
- Modify: `workspace/CreateVariables/GroupFilterEditor.tsx` (provide the context)
- Modify: `core/components/filter/GeoCoordFilter.tsx` (draw earlier shapes)
- Modify: `core/components/filter/TableFilter.tsx` and `core/components/filter/MultiFilter.tsx` (mark used values)
- Modify: `core/components/filter/HistogramFilter.tsx` (shade earlier ranges)
- Test: `core/derivedVariables/GroupEditingContext.test.ts`

**Interfaces:**

- Produces:
  - `GroupEditingContext`: a React context of `{ earlierGroups: Array<{ label: string; color: string; filters: Filter[] }> } | undefined`.
  - `earlierFiltersFor(ctx, entityId: string, variableId: string): Array<{ label: string; color: string; filter: Filter }>`.
- **Behaviour:**
  - Outside a group editor the context is `undefined`, and the widgets behave exactly as before.
  - Colours come from the overlay palette in group order. Reuse the palette the visualisations use for categorical overlays.
- **Mapping each filter type to its widget's display:**

  - **Geo (`stringPrefixSet`):** the rectangles from the filter's UI settings, drawn faintly.
  - **`stringSet` and the other set filters:** a "in `<label>`" mark beside each value.
  - **`numberRange` and `dateRange`:** shaded bands on the histogram.

- [ ] **Step 1: Write the failing test**

```ts
test('earlierFiltersFor returns only earlier groups' filters on that variable, with colours', ...)
```

- [ ] **Step 2: Run to verify failure.** Run: `yarn workspace @veupathdb/eda test --watchAll=false GroupEditingContext`. Expected: FAIL.
- [ ] **Step 3: Implement the context and helper. Then the widgets, one at a time, building after each.**
- [ ] **Step 4: Run tests and build.** Expected: PASS, and the build completes. Then check by hand in the dev site that Browse and Subset looks unchanged.
- [ ] **Step 5: Commit**

```bash
git add packages/libs/eda/src/lib/core
git commit -m "Show earlier groups while editing a group's filters"
```

### Task 11: End-to-end check, and test the refactored visualisations

**Files:**

- Modify: `packages/libs/eda/docs/derived-variables-design.md` §7 (record the results)

**Interfaces:**

- Consumes: everything above, on the user's local stack (Task 3's base URL).

- [ ] **Step 1: Rebuild both libraries and run the dev site against the local stack**

```bash
yarn workspace @veupathdb/components build-npm-modules
yarn workspace @veupathdb/eda build-npm-modules
```

Use the dev site setup in memory note `project_dev_site_compiled_lib`.

- [ ] **Step 2: Run the killer app on the Maryland upload.**

  - Create "Region (East/West)" from two lasso groups.
  - Make a percent-mortality line plot over time, with Region as the overlay.

  Expected: the East and West lines, plus "Other". After the analysis is reloaded, everything is still there.

- [ ] **Step 3: Use the variable as overlay and as facet in every standard visualisation:** histogram, barplot, boxplot, scatterplot, lineplot, mosaic and map. Record anything broken. For each break, check `main` (no PR #1775) and note whether `main` has it too.
- [ ] **Step 4: Delete the variable while the line plot uses it.** Expected: the confirmation lists the plot. Visualize then renders, and the plot shows a missing variable without crashing (Review Focus 5).
- [ ] **Step 5: Check visualisations built on a computation.** With a derived variable in the analysis, open a computation-backed visualisation (e.g. alpha diversity, if the study allows one). Expected: no derived variables in its pickers, and no re-run of the job.
- [ ] **Step 6: Record the results in §7 and commit**

```bash
git add packages/libs/eda/docs/derived-variables-design.md
git commit -m "Record derived variables end-to-end results"
```
