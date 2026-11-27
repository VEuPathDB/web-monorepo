# Derived Variables: Recoder Form Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Save simple grouping variables as single-stream recoder
plugins instead of `filterDefinedGroups`, without users noticing, and
cap variables at 7 groups plus "Everything else".

**Architecture:** The back end fixes `categoricalRecoding` and
`continuousToOrdinal`, adds prefix rules and a date-range recoder, so
each recoder includes exactly the records the matching Browse and Subset
filter does. The editor keeps working on groups of filters. On save, and
for its live counts, a client function turns eligible groups into a
recoder spec; when a variable is opened, the reverse function turns a
recoder spec back into groups.

**Tech Stack:**

- Back end (`service-eda`): Java 21, RAML, JUnit 5.
- Front end (`web-monorepo`, `@veupathdb/eda`): React 17, TypeScript, io-ts, Jest and React Testing Library.

**User Testing:**

- Dev site: `http://localhost:8080/a/app/` (clinepi-site webpack dev server), with `/eda` proxied to the local service on `http://localhost:8081`.
- The user rebuilds and restarts the service. Ask them to; don't do it yourself.
- The local service is slow (transatlantic database). Use "Coffee Shops Geo-Edition" (`STUDY_88ceef6fd1`; analysis list at `http://localhost:8080/a/app/workspace/analyses/EDAUD_Ah88IRopd809s/new`).
- Auth for direct service requests: `curl -H @/tmp/claude-1000/-home-maccallr-work-EDA-web-monorepo/d37f30ff-ffd1-47fe-9e94-5d5f6ecd7459/scratchpad/auth-header.txt`. Never print, cat or copy that file. If it's gone, ask the user to recreate it.

**Spec:** `packages/libs/eda/docs/derived-variables-design.md`, mainly
§3.1–3.2 (group cap, "Everything else" default), §4 (when the recoder
form is used), §5.1 C–D and §5.2. Section numbers (§) refer to it.

**Builds on:** `packages/libs/eda/docs/derived-variables-plan.md`, whose
Tasks 1–10 are built. Its Task 11 checks are folded into Task 6 here.
Its deferred minor findings are listed under "Progress" in
`.superpowers/sdd/derived-variables-plan/progress.md`; the final
whole-branch review covers both plans and should read that list.

## Global Constraints

- **Repositories and branches:**
  - Back end: `/home/maccallr/work/EDA/service-eda`, branch `filter-defined-groups` (it is pushed). The worktree may be on the local-only `local/dv-with-leak-fix`; switch back first. Never push `local/dv-with-leak-fix`.
  - Front end: `/home/maccallr/work/EDA/web-monorepo`, branch `map-redesign-and-derived-vars`.
  - Push nothing without the user's approval.
- **Back-end builds and tests use the composite build:** `./gradlew --include-build ../lib-eda-subsetting …`. Never commit the local `build.gradle.kts` change. Stage explicit paths only.
- **RAML:** edit only files under `schema/url/`, run `merge-raml generate-jaxrs`, and commit the regenerated `schema/library.raml`. Never hand-edit `library.raml`.
- **TypeScript only:** new files are `.ts`/`.tsx`, no `any`, no `@ts-ignore`.
- **Front-end tests:** `yarn workspace @veupathdb/eda test --watchAll=false <pattern>`. Build check: `yarn workspace @veupathdb/eda build-npm-modules`.
- **Plugin function names:** `categoricalRecoding`, `continuousToOrdinal`, `continuousDateToOrdinal`, `filterDefinedGroups`.
- **Rule fields:** `inputValues?`, `inputPrefixes?`, `outputValue` (categorical); `minInclusive?`, `maxInclusive?`, `outputValue` (ranges; numbers for `continuousToOrdinal`, strings for `continuousDateToOrdinal`).
- **Vocabulary of every recoder:** the distinct output values in rule order, then `unmappedValue` only if it is non-empty and not already listed.
- **Unmapped and missing input:** records matching no rule, including records with no input value, get `unmappedValue`; absent or empty means no value.
- **Range ends are inclusive at both ends;** the first matching rule or group wins.
- **Groups:** at most 7 per variable (`MAX_GROUPS = 7`). Default "Everything else" label `Other`.
- **Temporary commit message:** `TEMP: squash of fix-floating-plugin-connection-leaks — drop when that branch lands`.
- **Commits** end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Reopening a variable saved as a recoder gives back exactly the groups that were saved:** labels, order, each filter, and "Everything else" on or off. (Task 4)
2. **The two forms give the same counts for the same groups,** including a value exactly on a range's upper end and records with no value. (Tasks 1, 2, 3)
3. **Groups the recoder form can't represent fall back to `filterDefinedGroups`** and never produce a spec the server rejects: a filter on a descendant entity, binary, multi-valued or zero-imputed variables, an empty value set, `numberSet`. (Task 4)
4. **An edit that switches a saved variable between forms keeps its `variableId`,** so plots that use it keep working. (Tasks 5, 6)
5. **A recoder spec the client can't turn back into groups is shown read-only as "unsupported",** never crashing or being rewritten. (Task 4)

---

## Part A — Back end (`service-eda`)

### Task 1: Temporary leak fix, `concatenation` shape, and `categoricalRecoding`

**Files:**

- Modify: `schema/url/merge/derived-variables.raml` (`CategoricalRecodingRule`)
- Regenerate: `schema/library.raml`
- Create: `src/main/java/org/veupathdb/service/eda/merge/plugins/transforms/RecodingVocabulary.java`
- Modify: `src/main/java/org/veupathdb/service/eda/merge/plugins/transforms/CategoricalRecoding.java`
- Modify: `src/main/java/org/veupathdb/service/eda/merge/plugins/transforms/Concatenation.java:56`
- Test: `src/test/java/eda/CategoricalRecodingTest.java`, `src/test/java/eda/DerivedVarConfigTest.java`

**Interfaces:**

- Produces: `final class RecodingVocabulary { static List<String> of(List<String> outputValues, String unmappedValueOrNull) }`, which implements the Global Constraints vocabulary rule. Task 2 uses it.
- Produces (RAML): `CategoricalRecodingRule { inputValues?: string[], inputPrefixes?: string[], outputValue: string }`.

- [ ] **Step 1: Switch branch and make the temporary commit**

```bash
cd /home/maccallr/work/EDA/service-eda
git switch filter-defined-groups
git merge --squash origin/fix-floating-plugin-connection-leaks
```

Check `git status` shows only the leak fix's files, plus the unstaged `build.gradle.kts`. Commit with the exact TEMP message from Global Constraints.

- [ ] **Step 2: Check the data shape of geohash variables.** Fetch Coffee Shops' study metadata from the local service (`GET http://localhost:8081/studies/STUDY_88ceef6fd1`, with the auth header) and find its geohash variables (`displayType` "geohash", or ids/names containing "geohash"). Record their `type` and `dataShape` in the report. If the service is down, ask the user. If the shape is not `categorical`, add it to the shapes `categoricalRecoding` accepts in Step 5 and say so in the report.

- [ ] **Step 3: Write the failing tests.** Build plugins as `FilterDefinedGroupsTest` does: round-trip a `DerivedVariableSpecImpl` through `JsonUtil.Jackson`, build a `DerivedVariableFactory(null, specs)`, then find the instance. Input column `e.v`.

```java
@Test void matchesValuesAndPrefixesFirstRuleWins()
  // rules: East {inputValues ["x"], inputPrefixes ["dqc"]}, West {inputPrefixes ["dq"]}; unmapped "Other"
  // "x" -> East; "dqcr1" -> East; "dqb" -> West; "zz" -> Other
@Test void missingInputGetsUnmappedValue()
  // "" -> "Other"; with unmappedValue absent: "" -> ""
@Test void vocabularyIsDistinctOutputsThenNonEmptyUnmapped()
  // rules A,B,A outputs; unmapped "Other" -> ["A","B","Other"]
  // unmapped "" or absent -> ["A","B"]; unmapped "A" -> ["A","B"]
@Test void rejectsRuleWithNeitherValuesNorPrefixes()
  // rule with both absent, and rule with both empty -> ValidationException
  // message "Each rule needs inputValues or inputPrefixes"
@Test void rejectsMultiValuedInput()
  // CategoricalRecoding.checkNotMultiValued(<VariableDef with isMultiValue true>) throws ValidationException
  // message "Input variable must not be multi-valued"; with false, no throw
```

In `DerivedVarConfigTest` add: `concatenation`'s `getDataShape()` is `CATEGORICAL`.

- [ ] **Step 4: Run them to verify they fail**

Run: `./gradlew --include-build ../lib-eda-subsetting test --tests eda.CategoricalRecodingTest --tests eda.DerivedVarConfigTest`
Expected: compilation failure (`RecodingVocabulary`, `checkNotMultiValued` and `getInputPrefixes` don't exist).

- [ ] **Step 5: Implement**

- RAML: make `inputValues` optional and add `inputPrefixes?: string[]`, then run `merge-raml generate-jaxrs`.
- `CategoricalRecoding`:
  - `acceptConfig` throws the "Each rule needs…" `ValidationException` (null lists count as empty).
  - `performSupplementalDependedVariableValidation` keeps the shape check and calls `static void checkNotMultiValued(VariableDef var) throws ValidationException`.
  - `getValue` matches `inputValues.contains(v) || inputPrefixes.stream().anyMatch(v::startsWith)`, skipping null lists; an empty `v` matches nothing.
  - `getVocabulary` returns `RecodingVocabulary.of(...)`.
- `Concatenation.getDataShape()` returns `CATEGORICAL`.

- [ ] **Step 6: Run the full suite**

Run: `./gradlew --include-build ../lib-eda-subsetting test`
Expected: BUILD SUCCESSFUL.

- [ ] **Step 7: Commit** (after the TEMP commit): `git add` the RAML files, `library.raml`, the three Java files and two tests; message "Add prefix rules to categoricalRecoding and fix its vocabulary".

### Task 2: Range recoders include both ends; new `continuousDateToOrdinal`

**Files:**

- Modify: `schema/url/merge/derived-variables.raml` (`ContinuousNumericRule`; add `ContinuousDateRule`, `ContinuousDateRecodingConfig` as in spec §5.1 C)
- Modify: `schema/url/merge/derived-variable-metadata.raml` (add `continuousDateToOrdinal: ContinuousDateRecodingConfig` to `DerivedVariableDocumentationRequest`)
- Regenerate: `schema/library.raml`
- Modify: `src/main/java/org/veupathdb/service/eda/merge/plugins/transforms/ContinuousNumericToOrdinal.java`
- Create: `src/main/java/org/veupathdb/service/eda/merge/plugins/transforms/ContinuousDateToOrdinal.java`
- Modify: `src/main/java/org/veupathdb/service/eda/merge/plugins/Transforms.java` (register it)
- Test: `src/test/java/eda/RangeRecodingTest.java`

**Interfaces:**

- Consumes: `RecodingVocabulary.of` (Task 1).
- Produces (RAML): `ContinuousNumericRule { minInclusive?: number, maxInclusive?: number, outputValue }` (`maxExclusive` removed); `ContinuousDateRule { minInclusive?: string, maxInclusive?: string, outputValue }`; `ContinuousDateRecodingConfig { inputVariable, rules, unmappedValue? }`.
- Produces: `ContinuousDateToOrdinal extends Transform<ContinuousDateRecodingConfig>`, function name `continuousDateToOrdinal`, input type `DATE` and shape `CONTINUOUS`, output `STRING` / `ORDINAL`.

- [ ] **Step 1: Write the failing tests** (same construction as Task 1)

```java
@Test void numericEndsAreInclusiveFirstRuleWins()
  // rules A [0,10], B [10,20]; "10" -> A; "20" -> B; "20.5" -> unmapped
@Test void numericMissingBoundsAreOpen()
  // rule Low {max 0}: "-5" -> Low, "0" -> Low; rule High {min 100}: "1e9" -> High
@Test void numericMissingInputGetsUnmappedValue()
  // "" -> "Other" (variable not imputeZero; _imputeZero defaults false when metadata is null)
@Test void numericVocabularyIncludesUnmapped()
  // ["A","B","Other"]; unmapped absent -> ["A","B"]
@Test void dateRulesUseFilterParsingInclusive()
  // rule Jan {min "2020-01-01T00:00:00Z", max "2020-01-31T00:00:00Z"}
  // "2020-01-01" -> Jan; "2020-01-31" -> Jan; "2020-01-31T12:00:00" -> unmapped; "2019-12-31T23:59:59" -> unmapped
@Test void dateMissingInputAndVocabulary()
  // "" -> "Other"; vocabulary ["Jan","Other"]
```

- [ ] **Step 2: Run them to verify they fail**

Run: `./gradlew --include-build ../lib-eda-subsetting test --tests eda.RangeRecodingTest`
Expected: compilation failure.

- [ ] **Step 3: Implement**

- RAML changes as listed, then `merge-raml generate-jaxrs`.
- `ContinuousNumericToOrdinal`:
  - missing bounds become `Double.NEGATIVE_INFINITY` / `POSITIVE_INFINITY`;
  - `matches` is `d >= min && d <= max`;
  - empty input with `!_imputeZero` returns `_unmappedValue`;
  - `getVocabulary` uses `RecodingVocabulary.of`.
- `ContinuousDateToOrdinal`:

  - Parse rule bounds with the same calls as `ApiConversionUtil.unpackDateRangeFilter` (`FormatUtil.parseDateTime(Utils.standardizeLocalDateTime(s))`).
  - Parse row values that are ISO local dates (`LocalDate.parse(v).atStartOfDay()`) or ISO local date-times (`LocalDateTime.parse(v)`).
  - Compare as `LocalDateTime`, inclusive.
  - Missing input gets `_unmappedValue`.

- [ ] **Step 4: Run the full suite**

Run: `./gradlew --include-build ../lib-eda-subsetting test`
Expected: BUILD SUCCESSFUL.

- [ ] **Step 5: Commit**: "Make range recoders inclusive and add continuousDateToOrdinal".

### Task 3: Check that both forms agree on the local stack (stop and ask the user)

**Files:** none (results go in the task report).

**Interfaces:**

- Consumes: Tasks 1–2 deployed to the user's local stack.

- [ ] **Step 1: Ask the user to rebuild and restart the service** from `filter-defined-groups` (it now carries the TEMP leak fix), and wait for their go-ahead.
- [ ] **Step 2: For each filter kind, compare the two forms on Coffee Shops.** Kinds: `stringSet` (a categorical string variable), `stringPrefixSet` (a geohash variable, 2 groups of 1–2 prefixes), `numberRange` (two adjacent ranges whose shared end is a value that occurs in the data), `dateRange` (likewise).
  - POST the same groups once as a `filterDefinedGroups` spec and once as the recoder spec, with `unmappedValue` "Other". Send them as a `pass` barplot of counts on the variable's entity: `/apps/pass/visualizations/barplot`, `filters: []`, `xAxisVariable` = the derived variable.
  - Expected: 200 for both, and identical counts per level.
- [ ] **Step 3: POST each recoder spec to `/merging/derived-variables/metadata/variables`.** Expected: one entry each; `string`; `categorical` or `ordinal`; vocabulary = the group labels then "Other". Repeat one spec without `unmappedValue`: the vocabulary has no "Other" and no `""`.
- [ ] **Step 4: Report.** Put the requests (no auth header) and the counts in the task report. If any kind disagrees, stop and report to the user before Part B.

---

## Part B — Front end (`web-monorepo`, `packages/libs/eda`)

### Task 4: Recoder codecs and conversion both ways

**Files:**

- Create: `src/lib/core/derivedVariables/recoding.ts`
- Modify: `src/lib/core/derivedVariables/types.ts` (move `decodeDerivedVariables` out)
- Modify: `src/lib/core/types/study.ts` (add `imputeZero?: boolean` to the number and integer variable codecs' `t.partial`)
- Test: `src/lib/core/derivedVariables/recoding.test.ts`; move the `decodeDerivedVariables` cases from `types.test.ts` into it.

**Interfaces:**

- Produces (`recoding.ts`):
  - `CATEGORICAL_RECODING`, `CONTINUOUS_TO_ORDINAL`, `CONTINUOUS_DATE_TO_ORDINAL` string constants, and io-ts codecs `CategoricalRecodingConfig`, `ContinuousNumericRecodingConfig`, `ContinuousDateRecodingConfig` matching Tasks 1–2's RAML (`inputVariable` is a `VariableDescriptor`).
  - `toRecoderSpec(spec: FilterDefinedGroupsSpec, entities: StudyEntity[]): DerivedVariableSpec | undefined`
  - `toStoredSpec(spec: FilterDefinedGroupsSpec, entities: StudyEntity[]): DerivedVariableSpec`, which returns `toRecoderSpec(...) ?? spec`.
  - `fromRecoderSpec(spec: DerivedVariableSpec): FilterDefinedGroupsSpec | undefined`
  - `interface DecodedDerivedVariable { stored: DerivedVariableSpec; editable: FilterDefinedGroupsSpec }`
  - `decodeDerivedVariables(entries: DerivedVariableSpec[]): { supported: DecodedDerivedVariable[]; unsupported: DerivedVariableSpec[] }`. `filterDefinedGroups` specs decode to `{ stored: spec, editable: spec }`; recoder specs use `fromRecoderSpec`; anything else is unsupported.
- `entities` is the array from `useStudyEntities()` (tree order, as `ancestorEntitiesForEntityId` expects).

- [ ] **Step 1: Write the failing tests.** Use a small fixture tree: Shop → Menu → Item, with variables:
  - on Shop: `region` (string, categorical), `geohash` (string, categorical), `size` (number, continuous), `opened` (date, continuous), `chain` (binary), `tags` (multi-valued string), `staff` (number, `imputeZero: true`);
  - on Item: `cake` (string, categorical).

```ts
describe('toRecoderSpec', () => {
  it('stringSet groups -> categoricalRecoding with inputValues');
  it('stringPrefixSet groups -> categoricalRecoding with inputPrefixes');
  it(
    'numberRange groups -> continuousToOrdinal with minInclusive/maxInclusive'
  );
  it(
    'dateRange groups -> continuousDateToOrdinal with the filter strings verbatim'
  );
  it(
    'keeps entityId, variableId, displayName and unmappedValue (omitted when empty)'
  );
  it('uses an ancestor variable when grouping a descendant entity'); // spec on Menu, filters on Shop.region
  it.each([
    'a group with two filters',
    'groups on different variables',
    'filters of different kinds',
    'a variable on a descendant entity (Item.cake for Shop)',
    'a binary variable',
    'a multi-valued variable',
    'an imputeZero variable',
    'an empty stringSet',
    'a numberSet filter',
    'no groups',
  ])('returns undefined for %s');
});
describe('fromRecoderSpec', () => {
  it('round-trips every kind: fromRecoderSpec(toRecoderSpec(s)) deep-equals s');
  it.each([
    'a rule with both inputValues and inputPrefixes',
    'an open-ended range',
    'two rules with the same outputValue',
    'a config that fails to decode',
  ])('returns undefined for %s');
});
describe('decodeDerivedVariables', () => {
  it('filterDefinedGroups -> stored and editable are the same spec');
  it('recoder -> stored is the recoder spec, editable its groups');
  it(
    'unknown function or non-round-trippable recoder -> unsupported, untouched'
  );
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `yarn workspace @veupathdb/eda test --watchAll=false derivedVariables/recoding`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `recoding.ts`.**

  - Eligibility is exactly spec §4's list. Find the variable with `findEntityAndVariable`, and check its entity is in `ancestorEntitiesForEntityId(spec.entityId, entities)`.
  - `fromRecoderSpec` builds one filter per rule on `inputVariable`:
    - `stringSet` from `inputValues`;
    - `stringPrefixSet` from `inputPrefixes` (the field is `prefixSet`);
    - `numberRange` / `dateRange` from both bounds.
  - Update the callers of the moved `decodeDerivedVariables` only enough to compile: use `.editable` in `CreateVariables/index.tsx` and `.stored` in `DerivedVariablesProvider.tsx`. Task 5 does the rest.

- [ ] **Step 4: Run tests and the type check**

Run: `yarn workspace @veupathdb/eda test --watchAll=false derivedVariables CreateVariables` then `yarn workspace @veupathdb/eda build-npm-modules`
Expected: PASS; build succeeds.

- [ ] **Step 5: Commit**: "Convert simple groupings to recoder specs and back".

### Task 5: Save recoders, 7-group cap, "Everything else" default

**Files:**

- Modify: `src/lib/workspace/CreateVariables/VariableEditor.tsx` (`upsertSpec` stores `toStoredSpec(draft, entities)`; cap note; default switch)
- Modify: `src/lib/core/derivedVariables/useGroupCounts.ts` (the barplot sends `toStoredSpec(debouncedSpec, entities)`)
- Modify: `src/lib/core/derivedVariables/groups.ts` (`MAX_GROUPS = 7`; add `coversVocabulary`)
- Test: `src/lib/core/derivedVariables/groups.test.ts`, `src/lib/workspace/CreateVariables/VariableEditor.test.tsx`, `src/lib/core/derivedVariables/useGroupCounts.test.tsx`

**Interfaces:**

- Consumes: `toStoredSpec`, `decodeDerivedVariables` (Task 4).
- Produces: `coversVocabulary(groups: FilterDefinedGroup[], entities: StudyEntity[]): boolean`. It is true when every group is one `stringSet` filter on the same variable, and the union of their values contains every value of that variable's `vocabulary`.

- [ ] **Step 1: Write the failing tests**

```ts
// groups.test.ts
it(
  'coversVocabulary: true when stringSet groups on one variable cover its vocabulary'
);
it(
  'coversVocabulary: false when a value is missing, filters differ in variable, or a group is not stringSet'
);
// VariableEditor.test.tsx
it('saves eligible groups as a recoder spec with the same variableId');
it('saves ineligible groups as filterDefinedGroups');
it('re-saving after an edit that changes form keeps the variableId');
it(
  'disables Add group at 7 groups with the note "At most 7 groups, so each group and Everything else gets its own colour"'
);
it(
  'new variable: Everything else turns off when groups cover the vocabulary, back on when they stop'
);
it('once the user toggles Everything else, coverage changes no longer move it');
it('opening a saved variable keeps its stored Everything else setting');
// useGroupCounts.test.tsx
it('sends the recoder form in the barplot request when eligible');
```

- [ ] **Step 2: Run them to verify they fail**

Run: `yarn workspace @veupathdb/eda test --watchAll=false CreateVariables derivedVariables`
Expected: the new tests FAIL.

- [ ] **Step 3: Implement.**

  - Add an `everythingElseTouched` state:
    - it starts true for a saved variable and false for a new one;
    - toggling the switch sets it;
    - while it is false, the switch is `!coversVocabulary(groups, entities)`.
  - Validation and raw counts keep using the editable groups.
  - Replace the existing cap message with the note above.

- [ ] **Step 4: Run tests and the build**

Run: `yarn workspace @veupathdb/eda test --watchAll=false CreateVariables derivedVariables` then `yarn workspace @veupathdb/eda build-npm-modules`
Expected: PASS; build succeeds.

- [ ] **Step 5: Commit**: "Save simple groupings as recoders; cap groups at 7".

### Task 6: End-to-end checks on the local stack (stop and ask the user)

**Files:** none; results go in the task report, and the design doc's Status line is updated.

**Interfaces:**

- Consumes: everything above, with the service from Task 3 running and the eda library rebuilt (`yarn workspace @veupathdb/eda build-npm-modules`; the dev site serves the compiled library).

- [ ] **Step 1: Ask the user** to confirm the service and dev site are up. Use Coffee Shops.
- [ ] **Step 2: One variable of each kind.** Create a region (lasso), a category grouping, a numeric-range and a date-range variable. In the network panel, confirm each is saved with the expected recoder `functionName`, and that its counts match Browse and Subset for each group's filter.
- [ ] **Step 3: Filter-based fallback.** Create "Sells banana loaf" on Coffee_shop from a Menu_item filter. Confirm it is saved as `filterDefinedGroups`.
- [ ] **Step 4: Switching form.** Use a recoder variable as a plot's overlay. Edit it so it becomes filter-based (add a second filter to a group), then back. Expected: same `variableId` each time, and the plot keeps working.
- [ ] **Step 5: Defaults and cap.** Collapse a categorical variable into groups covering its whole vocabulary. Expected: "Everything else" switches off, and no "Other" level in plots. Expected: "Add group" is disabled at 7, with the note.
- [ ] **Step 6: Old Task 11 checks.**
  - Use a variable as overlay and as facet in histogram, barplot, boxplot, scatterplot, lineplot, mosaic and map. For each break, note whether `main` has it too.
  - Delete a variable a plot uses. Expected: the confirmation lists the plot, and Visualize renders without crashing.
  - Open a computation-backed visualisation. Expected: no derived variables in its pickers, and no job re-run.
- [ ] **Step 7: Record and commit.** Write the results in the task report. Update the design doc's Status line to say the recoder form is built.

```bash
git add packages/libs/eda/docs/derived-variables-design.md
git commit -m "Record recoder form end-to-end results"
```
