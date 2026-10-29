# rnaseq-rc Wrangler Manifest Adoption Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace fixed-filename-stem discovery in the rnaseq-rc wrangler with manifest-driven discovery, so users' original count filenames survive into our system.

**Architecture:** `discover_counts_files()` is the only function whose logic changes, and its `list(mode, paths)` return contract stays identical — everything downstream is untouched. The stem lookup table becomes a role lookup table with the same keys. The bulk of the work is fixtures, not logic.

**Tech Stack:** R, testthat, Docker, the `study.wrangler` R package.

**Repo:** `vdi-plugin-wrangler`, branch **`rnaseq-rc`** (already on the remote — do **not** rename it; branch names are not type names).

**Source documents — read both before starting:**

- Contract: `web-monorepo/docs/superpowers/specs/2026-07-30-rnaseq-rc-upload-contract.md`
- Spec B: `web-monorepo/docs/superpowers/specs/2026-07-30-rnaseq-rc-wrangler-manifest-design.md`

## Global Constraints

- **Dataset type name is `rnaseqrc`**, no hyphen. Load-bearing: `bin/wrangle.R:63` interpolates it into `lib/R/wrangle-<name>.R`. The branch name, `doc/rnaseq-rc.md` and `tests/testthat/rnaseq-rc/` are **not** type names — leave them alone.
- **Manifest is `manifest.tsv`**: no header row; `role<TAB>filename`; parse on the **first** tab only, everything after it is the filename verbatim; LF endings; trailing newline; UTF-8; always present including the unstranded case; never lists itself.
- **Roles are exactly** `sense`, `antisense`, `unstranded`, `sample-info`. Either exactly `sense`+`antisense`, or exactly `unstranded`. Always `sample-info`.
- **`paths` keys stay** `sense` / `antisense` / `unstranded` / `sample_info` (note the underscore on the last — it is an R name, not a role token).
- **Accepted extensions:** `.txt`, `.tsv`, `.csv`, `.tab`, case-insensitive.
- **`sample-info` cap is 100,000 bytes**, measured `nchar(x, type = "bytes")`. The measure is correct and stays; only the user-facing wording changes from "characters" to "bytes".
- **Manifest faults are our bug, not the uploader's.** They report the internal error and point at the helpdesk. Content faults the user owns keep their instructive messages. See Spec B's _Error taxonomy_ section for the exact split.
- **A manifest is UTF-8, but the files it names may not be.** Do not assume the named files share the manifest's encoding.
- Run everything in Docker: `docker compose run --rm -w /opt/veupathdb <cmd>`. The image build is ~45 minutes — do not rebuild unless dependencies changed.

---

## File Structure

**Renamed:**

| From                        | To                         |
| --------------------------- | -------------------------- |
| `lib/R/wrangle-rnaseq-rc.R` | `lib/R/wrangle-rnaseqrc.R` |

**Modified:**

| Path                                       | Change                                                                                     |
| ------------------------------------------ | ------------------------------------------------------------------------------------------ |
| `lib/R/counts_files.R`                     | manifest discovery replaces stem matching; extension list gains `.tab`; size-error wording |
| `tests/testthat/test_counts_files.R`       | unit tests for the new discovery and its failure modes                                     |
| `tests/testthat/rnaseq-rc/*/`              | 29 fixtures gain `manifest.tsv`; count files renamed off the canonical stems               |
| `tests/testthat/rnaseq-rc/*/vdi-meta.json` | `"name": "rnaseq-rc"` → `"rnaseqrc"`                                                       |
| `doc/rnaseq-rc.md`                         | user-facing framing; bytes; `.tab`; units                                                  |

**Created:** new BAD fixtures for manifest failure modes (Task 4).

---

## Task 1: Rename the type to `rnaseqrc`

Independent of the manifest work and a prerequisite for any end-to-end test — VDI now sends `rnaseqrc`, so without this nothing runs at all.

**Files:**

- Rename: `lib/R/wrangle-rnaseq-rc.R` → `lib/R/wrangle-rnaseqrc.R`
- Modify: all 29 `tests/testthat/rnaseq-rc/*/vdi-meta.json`

**Interfaces:**

- Consumes: nothing.
- Produces: nothing later tasks import; but every later task's fixtures depend on `vdi-meta.json` naming the type `rnaseqrc`.

- [ ] **Step 1: Confirm the current state**

```bash
ls lib/R/wrangle-*.R
grep -l '"rnaseq-rc"' tests/testthat/rnaseq-rc/*/vdi-meta.json | wc -l
```

Expected: `wrangle-rnaseq-rc.R` present; 29 fixture metadata files matching.

- [ ] **Step 2: Rename the script**

```bash
git mv lib/R/wrangle-rnaseq-rc.R lib/R/wrangle-rnaseqrc.R
```

Nothing sources this file by name — `bin/wrangle.R:63` builds the path from the dataset type at runtime — so no import needs updating. Verify that claim:

```bash
grep -rn "wrangle-rnaseq-rc" --include="*.R" . | grep -v "^./tests/testthat/rnaseq-rc/"
```

Expected: no hits. If there are any, update them.

- [ ] **Step 3: Update the fixture metadata**

```bash
sed -i 's/"name": "rnaseq-rc"/"name": "rnaseqrc"/' tests/testthat/rnaseq-rc/*/vdi-meta.json
grep -h '"name"' tests/testthat/rnaseq-rc/*/vdi-meta.json | sort -u
```

Expected: only `"name": "rnaseqrc"` remains.

- [ ] **Step 4: Confirm nothing else refers to the type by the old name**

```bash
grep -rn "rnaseq-rc" --include="*.R" --include="*.json" . | grep -v "tests/testthat/rnaseq-rc/" | grep -v "^./doc/"
```

Expected: no hits, or only comments describing the feature. Directory paths under `tests/testthat/rnaseq-rc/` and `doc/rnaseq-rc.md` are **not** type names — leave them.

- [ ] **Step 5: Run the suite**

```bash
docker compose run --rm -w /opt/veupathdb bin/run_tests.R
```

Expected: all rnaseq-rc fixtures still pass. This task changes no logic, so a failure means the rename broke resolution — check `bin/wrangle.R:63` against the new filename.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Resolve the wrangler script from the type name VDI actually sends

VDI registers this type as rnaseqrc, without the hyphen, matching every
other registered type. bin/wrangle.R interpolates that name straight into
a script path, so the mismatch failed with 'data type not supported' -
a message pointing at the data type rather than the missing script."
```

---

## Task 2: Manifest-driven discovery

The only logic change. `discover_counts_files()` keeps its signature and return contract; only how it locates and classifies files changes.

**Files:**

- Modify: `lib/R/counts_files.R` — `.COUNTS_FILE_KEY_FOR_STEM` (line 12), `.COUNTS_FILE_ACCEPTED_NAMES_MSG` (line 32), `discover_counts_files` (line 48), extension regex (line 51), size-error wording (~line 135)

**Interfaces:**

- Consumes: nothing from Task 1.
- Produces: `discover_counts_files(input_dir)` returning `list(mode = "stranded"|"unstranded", paths = <named chr vector>)` with `paths` keyed `sense`/`antisense`/`unstranded`/`sample_info` — **identical to today**. `read_and_merge_counts()` and `wrangle-rnaseqrc.R` must need no change.

- [ ] **Step 1: Replace the stem table with a role table**

At line 12, `.COUNTS_FILE_KEY_FOR_STEM` becomes:

```r
# Manifest role tokens mapped to their canonical key in the `paths` result of
# `discover_counts_files()`. The keys are unchanged from the previous
# stem-based scheme, so everything downstream is unaffected.
.COUNTS_FILE_KEY_FOR_ROLE <- c(
  "sense"       = "sense",
  "antisense"   = "antisense",
  "unstranded"  = "unstranded",
  "sample-info" = "sample_info"
)

MANIFEST_FILENAME <- "manifest.tsv"
```

- [ ] **Step 2: Replace the user-facing "name your files" message**

`.COUNTS_FILE_ACCEPTED_NAMES_MSG` (line 32) instructs users to name files, which is no longer how this works. Replace it with the manifest-fault message from the contract's error taxonomy:

```r
# Manifest problems are our bug, not the uploader's: the upload form generates
# the manifest, so a user who went through the website did nothing wrong. Full
# diagnostic detail belongs in technical_msg.
.MANIFEST_FAULT_USER_MSG <- paste(
  "There was a problem with the structure of your upload.",
  "If you uploaded through the website, please contact the helpdesk."
)
```

- [ ] **Step 3: Write the manifest parser**

Add above `discover_counts_files`:

```r
#' Parse `manifest.tsv` into a named character vector of role -> filename
#'
#' Splits each non-empty line on the FIRST tab only; everything after it is
#' the filename verbatim, since filenames are user-controlled and may contain
#' almost anything except a tab.
#'
#' @param path Path to the manifest file
#' @return named character vector, names are role tokens, values are filenames
.parse_manifest <- function(path) {
  lines <- readr::read_lines(path)
  lines <- lines[trimws(lines) != ""]

  if (length(lines) == 0) {
    stop_validation_error(
      user_msg = .MANIFEST_FAULT_USER_MSG,
      technical_msg = paste("Manifest is empty:", path),
      file = path
    )
  }

  tab_at <- regexpr("\t", lines, fixed = TRUE)

  if (any(tab_at < 0)) {
    bad <- lines[tab_at < 0][1]
    stop_validation_error(
      user_msg = .MANIFEST_FAULT_USER_MSG,
      technical_msg = paste0("Manifest line has no tab separator: '", bad, "'"),
      file = path
    )
  }

  roles <- substr(lines, 1, tab_at - 1)
  files <- substr(lines, tab_at + 1, nchar(lines))

  unknown <- roles[!roles %in% names(.COUNTS_FILE_KEY_FOR_ROLE)]
  if (length(unknown) > 0) {
    stop_validation_error(
      user_msg = .MANIFEST_FAULT_USER_MSG,
      technical_msg = paste(
        "Manifest contains unknown role(s):", paste(unknown, collapse = ", ")
      ),
      file = path
    )
  }

  dup <- unique(roles[duplicated(roles)])
  if (length(dup) > 0) {
    stop_validation_error(
      user_msg = .MANIFEST_FAULT_USER_MSG,
      technical_msg = paste(
        "Manifest contains duplicate role(s):", paste(dup, collapse = ", ")
      ),
      file = path
    )
  }

  setNames(files, roles)
}
```

`readr::read_lines` rather than base `readLines` for consistency with `read_sample_info_text()` elsewhere in this file, and because it handles a missing trailing newline without warning.

**Do not add encoding detection to the manifest read.** The manifest is UTF-8 by contract — we generate it — so the default locale is correct. The files it _names_ may well be Latin-1 or UTF-16 (fixtures `25`-`29` cover exactly that), but those are read by existing code that already calls `study.wrangler::detect_file_encoding()`. Adding `detect_file_encoding()` here would be sniffing a file whose encoding is already known, and on a short ASCII manifest the sniff can guess wrong.

- [ ] **Step 4: Rewrite the discovery body**

Replace lines 49-72 (from `all_files <- list.files(...)` through the `recognised_keys` assignment) with:

```r
  all_files <- list.files(input_dir, full.names = FALSE)

  if (!MANIFEST_FILENAME %in% all_files) {
    stop_validation_error(
      user_msg = .MANIFEST_FAULT_USER_MSG,
      technical_msg = paste0(
        "No ", MANIFEST_FILENAME, " found in: ", input_dir,
        ". Files present: ", paste(all_files, collapse = ", ")
      ),
      file = input_dir
    )
  }

  manifest <- .parse_manifest(file.path(input_dir, MANIFEST_FILENAME))

  # Every listed file must exist.
  missing <- manifest[!manifest %in% all_files]
  if (length(missing) > 0) {
    stop_validation_error(
      user_msg = .MANIFEST_FAULT_USER_MSG,
      technical_msg = paste(
        "Manifest references file(s) not present in the upload:",
        paste(missing, collapse = ", ")
      ),
      file = input_dir
    )
  }

  # Every file must be listed. An unexpected extra is more likely a mistake
  # than a deliberate addition, so reject rather than silently ignore.
  data_file_pattern <- "\\.(txt|tsv|csv|tab)$"
  data_files <- all_files[grepl(data_file_pattern, all_files, ignore.case = TRUE)]
  unreferenced <- setdiff(setdiff(data_files, manifest), MANIFEST_FILENAME)
  if (length(unreferenced) > 0) {
    stop_validation_error(
      user_msg = .MANIFEST_FAULT_USER_MSG,
      technical_msg = paste(
        "Upload contains file(s) not listed in the manifest:",
        paste(unreferenced, collapse = ", ")
      ),
      file = input_dir
    )
  }

  # Extensions are checked on the real filenames, which the manifest preserves.
  bad_ext <- manifest[!grepl(data_file_pattern, manifest, ignore.case = TRUE)]
  if (length(bad_ext) > 0) {
    stop_validation_error(
      user_msg = paste0(
        "File '", bad_ext[1], "' does not have an accepted extension. ",
        "Count and sample metadata files must be .txt, .tsv, .csv or .tab."
      ),
      technical_msg = paste(
        "Manifest lists file(s) with disallowed extensions:",
        paste(bad_ext, collapse = ", ")
      ),
      file = input_dir
    )
  }

  paths <- setNames(
    file.path(input_dir, unname(manifest)),
    unname(.COUNTS_FILE_KEY_FOR_ROLE[names(manifest)])
  )
```

Everything from the `sample_info` presence check onward stays exactly as it is — the mode and pairing rules, the empty check, and the size check all read from `paths` and need no change.

- [ ] **Step 5: Fix the size-error wording**

At the size check (~line 135), the message says "characters" while `nchar(..., type = "bytes")` measures bytes. Change both occurrences in `user_msg` and `technical_msg` from "characters" to "bytes". **Do not change the measure** — the byte count is deliberate and its rationale is documented in the comment above `SAMPLE_INFO_MAX_CHARS`.

Consider renaming the constant `SAMPLE_INFO_MAX_CHARS` → `SAMPLE_INFO_MAX_BYTES` for the same reason. If you do, update every reference (`grep -rn SAMPLE_INFO_MAX_CHARS`).

- [ ] **Step 6: Confirm the return contract is unchanged**

```bash
grep -n "list(mode = mode, paths = paths)" lib/R/counts_files.R
grep -rn "discover_counts_files" lib/R/ bin/
```

Expected: the return statement is untouched, and the only caller is `lib/R/wrangle-rnaseqrc.R`. If `read_and_merge_counts` or the wrangle script needed editing, the contract was broken — stop and reconsider.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "Locate count files by manifest rather than by filename stem

Stem matching forced users to rename their files, so HTSeq_output_run3.tsv
became unstranded-counts.tsv and the original name - and its traceability -
was lost. The upload form now generates a manifest naming each file's role,
which lets us keep what the user actually called it.

The manifest is generated by the UI, never hand-written; requiring users to
author one would have been strictly worse than fixed names.

Manifest structure faults report an internal error and point at the
helpdesk, because a manifest arriving from the web client should never be
malformed - that path is a bug report channel, not user guidance."
```

---

## Task 3: Update the unit tests

**Files:**

- Modify: `tests/testthat/test_counts_files.R`

**Interfaces:**

- Consumes: `discover_counts_files` and `.parse_manifest` from Task 2.
- Produces: nothing.

- [ ] **Step 1: Read the existing tests**

```bash
grep -n "discover_counts_files\|test_that" tests/testthat/test_counts_files.R
```

They build temp directories and call `discover_counts_files()` directly. Every one that creates count files by canonical stem now needs a `manifest.tsv` alongside.

- [ ] **Step 2: Add a fixture helper**

Add near the top of the file:

```r
# Writes a manifest for the given role -> filename pairs, matching the
# contract: no header, role<TAB>filename, LF, trailing newline.
write_manifest <- function(dir, ...) {
  entries <- c(...)
  writeLines(
    paste(names(entries), unname(entries), sep = "\t"),
    file.path(dir, "manifest.tsv")
  )
}
```

`writeLines` emits a trailing newline and LF endings by default, which is what the contract requires.

- [ ] **Step 3: Update the existing tests**

For each test that writes count files, add a `write_manifest()` call. **Deliberately give the count files non-canonical names** — `my_counts.tsv`, `HTSeq_run3.txt` — so a leftover stem-matching path cannot keep the suite green:

```r
test_that("discovers an unstranded upload", {
  d <- withr::local_tempdir()
  writeLines("gene\tS1\nA\t1", file.path(d, "HTSeq_run3.tsv"))
  writeLines("S1 is a control", file.path(d, "sample-info.txt"))
  write_manifest(d, "unstranded" = "HTSeq_run3.tsv", "sample-info" = "sample-info.txt")

  got <- discover_counts_files(d)

  expect_equal(got$mode, "unstranded")
  expect_equal(basename(got$paths[["unstranded"]]), "HTSeq_run3.tsv")
  expect_equal(basename(got$paths[["sample_info"]]), "sample-info.txt")
})
```

The test at line ~100 asserting `expect_error(discover_counts_files(d), "counts.tsv")` tested the removed unrecognised-filename behaviour. Under the manifest scheme `counts.tsv` listed as `unstranded` is **valid**, so rewrite it to assert the unreferenced-extra rejection instead.

- [ ] **Step 4: Add tests for the new failure modes**

One per manifest fault. Each asserts on `technical_msg` content, since all manifest faults share the same `user_msg`:

```r
test_that("rejects a missing manifest", {
  d <- withr::local_tempdir()
  writeLines("gene\tS1\nA\t1", file.path(d, "counts.tsv"))
  expect_error(discover_counts_files(d), "No manifest.tsv")
})

test_that("rejects a manifest line with no tab", {
  d <- withr::local_tempdir()
  writeLines("gene\tS1\nA\t1", file.path(d, "counts.tsv"))
  writeLines("unstranded counts.tsv", file.path(d, "manifest.tsv"))
  expect_error(discover_counts_files(d), "no tab separator")
})

test_that("rejects an unknown role", {
  d <- withr::local_tempdir()
  writeLines("gene\tS1\nA\t1", file.path(d, "counts.tsv"))
  write_manifest(d, "spliced" = "counts.tsv", "sample-info" = "si.txt")
  expect_error(discover_counts_files(d), "unknown role")
})

test_that("rejects a duplicate role", {
  d <- withr::local_tempdir()
  writeLines("gene\tS1\nA\t1", file.path(d, "a.tsv"))
  writeLines("gene\tS1\nA\t1", file.path(d, "b.tsv"))
  write_manifest(d, "sense" = "a.tsv", "sense" = "b.tsv")
  expect_error(discover_counts_files(d), "duplicate role")
})

test_that("rejects a dangling manifest reference", {
  d <- withr::local_tempdir()
  writeLines("S1 is a control", file.path(d, "sample-info.txt"))
  write_manifest(d, "unstranded" = "absent.tsv", "sample-info" = "sample-info.txt")
  expect_error(discover_counts_files(d), "not present")
})

test_that("rejects a file the manifest does not list", {
  d <- withr::local_tempdir()
  writeLines("gene\tS1\nA\t1", file.path(d, "counts.tsv"))
  writeLines("stray", file.path(d, "extra.tsv"))
  writeLines("S1 is a control", file.path(d, "sample-info.txt"))
  write_manifest(d, "unstranded" = "counts.tsv", "sample-info" = "sample-info.txt")
  expect_error(discover_counts_files(d), "not listed in the manifest")
})

test_that("accepts a filename containing spaces", {
  d <- withr::local_tempdir()
  writeLines("gene\tS1\nA\t1", file.path(d, "my counts.tsv"))
  writeLines("S1 is a control", file.path(d, "sample-info.txt"))
  write_manifest(d, "unstranded" = "my counts.tsv", "sample-info" = "sample-info.txt")

  got <- discover_counts_files(d)

  expect_equal(basename(got$paths[["unstranded"]]), "my counts.tsv")
})
```

That last one matters: splitting on the first tab rather than on whitespace is exactly what makes spaces in filenames safe, and it is the case a naive `strsplit(line, "\\s+")` would break.

- [ ] **Step 5: Run and commit**

```bash
docker compose run --rm -w /opt/veupathdb bin/run_tests.R
git add -A
git commit -m "Test manifest-driven discovery and its failure modes

Count files in these tests are deliberately named off the old canonical
stems, so a leftover stem-matching path cannot keep the suite green."
```

---

## Task 4: Fixtures

29 directory-based cases, each holding input files plus `vdi-meta.json`.

**Files:**

- Modify: all 29 `tests/testthat/rnaseq-rc/*/`
- Create: new BAD fixtures for manifest faults

- [ ] **Step 1: Survey what each fixture contains**

```bash
for d in tests/testthat/rnaseq-rc/*/; do echo "== $d"; ls "$d"; done
```

- [ ] **Step 2: Add a manifest to every fixture, renaming count files off the canonical stems**

For each fixture: rename `sense-counts.*` → something arbitrary (`my_sense.tsv`), `antisense-counts.*` → (`my_anti.tsv`), `unstranded-counts.*` → (`HTSeq_run3.tsv`), keep `sample-info.*` as is, then write a `manifest.tsv` naming them.

Do this **for every fixture, not a sample.** Leaving canonical names anywhere means a regression to stem matching could pass unnoticed.

Preserve each fixture's existing extension — the encoding fixtures (`25`-`29`) depend on their specific files, and `03`/`05` are `.csv` deliberately.

- [ ] **Step 3: Repurpose `13-bad-count-filename-BAD`**

Its premise — `counts.tsv` rejected as unrecognised — is now **valid** behaviour when the manifest lists it. Retarget it at an unreferenced extra file, and update its `vdi-meta.json` `expected_technical_error_regex` / `expected_user_error_regex` accordingly. Consider renaming the directory to `13-unreferenced-extra-file-BAD` for accuracy.

- [ ] **Step 4: Add BAD fixtures for manifest faults**

One directory each, following the existing naming convention (`30-…-BAD` onward): missing manifest; malformed line; unknown role; duplicate role; dangling reference; both stranded and unstranded roles present.

Each needs a `vdi-meta.json` with `"type": {"name": "rnaseqrc", "version": "1.0"}`, `"test_expectation": "fail"`, and the expected error regexes. Copy the shape from an existing BAD fixture.

Remember all manifest faults share one `user_msg`, so `expected_user_error_regex` will be the same helpdesk text for all six — the discriminating assertion is `expected_technical_error_regex`.

- [ ] **Step 5: Run the full suite**

```bash
docker compose run --rm -w /opt/veupathdb bin/run_tests.R
```

Expected: all 29 existing fixtures plus the new BAD cases green.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Drive every rnaseq-rc fixture through the manifest

Count files are deliberately renamed off the canonical stems in all
fixtures, so the indirection is load-bearing in every test rather than
in a sample of them.

13-bad-count-filename-BAD is repurposed: its premise, that counts.tsv is
rejected as unrecognised, is valid behaviour now that a manifest can name
it. It targets an unreferenced extra file instead."
```

- [ ] **Step 7: Swap in the real manifest — do not skip**

Once Spec A's end-to-end upload has run (its Task 6 Step 3 dumps a real `manifest.tsv` via `unzip -p upload.zip manifest.tsv | cat -A`), compare it byte-for-byte against the fixtures written here:

```bash
cat -A tests/testthat/rnaseq-rc/01-unstranded-horizontal-tsv-OK/manifest.tsv
```

Expected: `^I` between role and filename, `$` at each line end, trailing newline present. If the real artifact differs in **any** respect, the real one is correct — it is what the plugin will actually receive. Update the fixtures and, if the difference is structural, the contract too.

Hand-written fixtures can encode the same misunderstanding on both sides of an interface and still pass. This step is what stops that.

---

## Task 5: Documentation

**Files:**

- Modify: `doc/rnaseq-rc.md`

- [ ] **Step 1: Rewrite _Input directory requirements_**

It currently documents fixed stems as a user-facing requirement across four bullets plus a stem-matching rule. Under the manifest scheme users select files in a form and name nothing, so the framing changes from "name your files correctly" to "select your files". State that original filenames are preserved.

- [ ] **Step 2: Correct the size limit units**

"Size limit: 100,000 characters" → bytes, matching the code and the corrected error message.

- [ ] **Step 3: Add `.tab` to the accepted extensions**

The doc lists `.txt`, `.tsv`, `.csv`. Add `.tab`, matching Task 2's regex and the contract.

- [ ] **Step 4: Ask for units in the sample-info guidance**

The upload form's placeholder now prompts for units (`web-monorepo` commit `b59fcfc1`). Mirror it here so the two places a user might look agree — a clause in the existing list, not a new section. Units are rarely recoverable from sample names alone, and the AI annotation step can only label values it can interpret.

- [ ] **Step 5: Leave the rest alone**

_Counts file layout_, _Sample IDs that must appear in `sample-info`_, and _Suitability for differential expression_ are unaffected by this change.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Document manifest-based upload, byte limit, .tab and units

Users no longer name files - they select them in a form and their original
names are preserved - so the whole framing changes from 'name your files
correctly' to 'select your files'.

The size limit was documented in characters but has always been measured
in bytes. Adds a prompt for units, matching the upload form's placeholder."
```

---

## Task 6: Joint end-to-end verification

The real acceptance gate, and the one neither spec can pass alone.

- [ ] **Step 1: Confirm both sides are deployed**

Spec A merged and deployed; this branch built into the wrangler image.

- [ ] **Step 2: Upload an unstranded dataset through the form**

Count file named nothing like the old stems. Expect the import to **succeed** — this is the step that was failing before this spec landed.

- [ ] **Step 3: Upload a stranded pair**

Expect success, and confirm sense and antisense are assigned per the manifest rather than by filename.

- [ ] **Step 4: Confirm the sense/antisense assignment is actually correct**

Do not settle for "the import succeeded". Use count files whose values make the strands distinguishable (e.g. deliberately different totals), then check the resulting study's `HTSeq counts` entity assigns `Sense.Count` and `Antisense.Count` the right way round.

A swapped pair imports perfectly happily and is wrong in a way no error surfaces — it is the exact failure this whole design guards against, so prove it rather than assuming it.

- [ ] **Step 5: Upload a count file named `sample-info.txt`**

Spec A renames its own generated file on collision (`sample-info-1.txt`) and records that in the manifest. Confirm the plugin follows the manifest and reads the right file as sample metadata.

---

## Notes for the implementer

- **Task 1 first, always.** Without it nothing runs and every failure is masked by "data type not supported".
- The Docker image build is ~45 minutes. Only rebuild if dependencies changed; otherwise `docker compose run` against the current image.
- If `read_and_merge_counts()` or `wrangle-rnaseqrc.R` need editing, stop — the `list(mode, paths)` contract was supposed to be preserved, and breaking it means Task 2 went wrong.
- Manifest faults share one user-facing message by design. When writing tests, assert on `technical_msg`.
