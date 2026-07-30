# Spec B — rnaseq-rc Manifest Adoption (vdi-plugin-wrangler)

**Date:** 2026-07-30
**Repo:** `vdi-plugin-wrangler` (branch `rnaseq-rc`)
**Status:** Agreed, **blocked** — do not execute yet

Replaces fixed-filename-stem discovery with manifest-driven discovery, so that
users' original count filenames survive into our system.

Prerequisite reading: [the upload contract](2026-07-30-rnaseq-rc-upload-contract.md).
Rules stated there are not repeated here.

Companion: [Spec A — web-monorepo](2026-07-30-rnaseq-rc-multipart-upload-design.md).

## Blocked on

Development of the rnaseq-rc datatype is being finished in a **separate Claude
Code session** on branch `rnaseq-rc`, which had an uncommitted `Dockerfile`
change at the time of writing. Do not start this spec until that work has landed,
and re-verify the line references below against the merged state — they will have
moved.

This spec lives in `web-monorepo` only because of that. Move it into
`vdi-plugin-wrangler` when the repo is free.

## Why change a working design

The plugin's stem-based discovery is sound and well-tested. It is being changed
for one reason: **it forces users to rename their files.** A user's
`HTSeq_output_run3.tsv` becomes `unstranded-counts.tsv` and the original name is
gone from our system, taking its traceability with it.

The manifest was the frontend designer's approach; fixed stems were this repo's.
The manifest wins **only because the UI generates it** — requiring a
hand-written manifest would be strictly worse than fixed names. That condition is
load-bearing and is honoured in Spec A.

## The seam is clean

`discover_counts_files()` (`lib/R/counts_files.R:48`) is the only function that
needs to change, and **its return contract does not change at all**:

```r
list(mode = "stranded"|"unstranded", paths = <named chr vector>)
```

`paths` stays keyed `sense` / `antisense` / `unstranded` / `sample_info`.
Everything downstream — `read_and_merge_counts()`, and the single call site at
`lib/R/wrangle-rnaseq-rc.R:69` — is untouched. `.COUNTS_FILE_KEY_FOR_STEM`
(line 12) becomes `.COUNTS_FILE_KEY_FOR_ROLE` with identical values, mapping the
contract's role tokens rather than filename stems.

The bulk of the work is fixtures, not logic.

## Rename the type to `rnaseqrc`

Independent of the manifest work, and do it **first** — it is a prerequisite for
any end-to-end test, since VDI will send `rnaseqrc` and nothing will run
otherwise.

The registered VDI type name has no hyphen (see the contract's _type name_
section), and `bin/wrangle.R:63` interpolates it straight into a script path:

```r
script_path <- file.path("lib/R", paste0("wrangle-", datatype, ".R"))
```

So:

- `git mv lib/R/wrangle-rnaseq-rc.R lib/R/wrangle-rnaseqrc.R`
- In all 24 fixture `vdi-meta.json` files, `"name": "rnaseq-rc"` → `"rnaseqrc"`.

Leave everything else spelled `rnaseq-rc`: the branch, `doc/rnaseq-rc.md`, and the
`tests/testthat/rnaseq-rc/` fixture directory are not type names and nothing
resolves them from one. Only the two items above are load-bearing.

Without this, imports fail with _"The data type 'rnaseqrc' is not supported by
this plugin"_ — a message that points at the data type rather than at the missing
script, so it is worth fixing before it wastes anyone's afternoon.

## Changes to `lib/R/counts_files.R`

### Removed

- Stem matching: `stems <- tolower(sub(...))` and the `known_stems` membership
  tests (lines 54-72).
- `.COUNTS_FILE_ACCEPTED_NAMES_MSG` (line 32) in its current form — it instructs
  users to name files, which is no longer how this works.

### Added — manifest parsing

Read `manifest.tsv`, split each non-empty line on the **first** tab, per the
contract. Validate:

| Check                                                    | Failure            |
| -------------------------------------------------------- | ------------------ |
| `manifest.tsv` present                                   | no manifest        |
| every line has a tab                                     | malformed line     |
| every role in the known vocabulary                       | unknown role       |
| no duplicate roles                                       | duplicate role     |
| every listed filename exists in the input dir            | dangling reference |
| every data file in the dir is listed (manifest excepted) | unreferenced extra |

The last one preserves the existing design principle — an unexpected extra file
is rejected rather than silently ignored, because it is more likely a mistake
than a deliberate extra. It now reduces to _every file but the manifest must be
listed_.

### Retained unchanged

- Mode and pairing rules (lines 146-197): exactly a `sense`+`antisense` pair or
  exactly `unstranded`; never both, never a lone one, never neither. The checks
  now read roles from the manifest rather than inferring them from filenames, but
  the logic and the user-facing messages are unaffected in substance.
- `sample-info` present, non-empty, and within `SAMPLE_INFO_MAX_CHARS`.
- Duplicate-key rejection (now duplicate _role_ rather than duplicate stem).

### Amended

- **Extensions** (line 51): `"\\.(txt|tsv|csv)$"` → add `tab`, per the contract.
  Applied to the actual filenames in the manifest.
- **Size error wording** (lines 129-141): the message says "characters" while
  `nchar(..., type = "bytes")` at line 126 measures bytes. The measure is right
  and stays; the wording should say bytes. `doc/rnaseq-rc.md` needs the same fix.

## Error taxonomy — a genuine question

`stop_validation_error(user_msg =, technical_msg =)` assumes the user can act on
`user_msg`. For manifest faults that assumption breaks: **the UI generates the
manifest, so a bad manifest is our bug, not the uploader's.** Telling someone to
fix a file they never created is actively misleading.

But the plugin cannot tell how an upload arrived. Besides the form there is
VDI's proxy POST route and direct API access, where a hand-crafted manifest is
possible and a user-actionable message _would_ be right.

**Recommendation:** manifest-structure faults (missing, malformed, unknown role,
duplicate role, dangling reference) get a `user_msg` that is honest rather than
instructive — along the lines of _"There was a problem with the structure of your
upload. If you uploaded through the website, please report this."_ — with full
detail in `technical_msg`. Content faults the user genuinely owns (empty
`sample-info`, oversized `sample-info`, bad counts, mode violations) keep their
current instructive messages.

Confirm this before implementing; it shapes every new error string.

## Fixtures

24 directory-based cases under `tests/testthat/rnaseq-rc/`, each holding input
files plus `vdi-meta.json`.

**Every fixture needs a `manifest.tsv`.**

**Rename count files to non-canonical names in all fixtures** —
`my_counts.tsv`, `HTSeq_run3.txt`, and so on. This is deliberate: if canonical
names are left in place, a leftover stem-matching path could keep the suite green
after the logic was supposed to be deleted. Non-canonical names make the
indirection load-bearing in every test. Mechanical, but do it everywhere.

**`13-bad-count-filename-BAD` must be repurposed.** Its entire premise is that
`counts.tsv` is rejected as unrecognised — which under the manifest scheme is
_valid_ when listed as `unstranded`. Retarget it at an unreferenced extra file.

**New BAD fixtures:** manifest missing; malformed line (no tab); unknown role;
duplicate role; dangling reference; file present but unlisted; both stranded and
unstranded roles present.

**Unit tests** in `tests/testthat/test_counts_files.R` also change — it calls
`discover_counts_files()` directly at lines 32-106. Line 100's
`expect_error(discover_counts_files(d), "counts.tsv")` tests the removed
unrecognised-filename behaviour and needs rewriting.

## Documentation

`doc/rnaseq-rc.md` needs its _Input directory requirements_ section rewritten.
It currently documents fixed stems as a user-facing requirement across four
bullets, plus a stem-matching rule. Under the manifest scheme users choose files
in a form and name nothing — the whole framing changes from "name your files
correctly" to "select your files". Also fix "100,000 characters" → bytes, and add
`.tab` to the accepted extensions.

Keep the _Counts file layout_, _sample-info_ content guidance, _Sample IDs_ and
_Suitability for differential expression_ sections — none of them are affected.

## Verification

`docker compose run --rm -w /opt/veupathdb bin/run_tests.R` (the build is ~45
minutes, so avoid a rebuild if the image is current). All 24 fixtures plus the
new BAD cases green, and `test_counts_files.R` updated rather than skipped.

Then an end-to-end upload from the Spec A form against a dev VDI, with count
files whose names are nothing like the old stems — that is the actual acceptance
criterion for both specs, and neither proves it alone.

## Risks

| Risk                                                  | Mitigation                                                                               |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Merge conflict with the in-flight session             | Wait for it to land; re-verify all line references                                       |
| Ships before Spec A, so real uploads have no manifest | Coordinate; the plugin has no fallback by design                                         |
| Fixture renaming churn obscures the logic diff        | Separate commits: type rename, then logic, then fixtures                                 |
| Error-taxonomy decision unmade                        | Settle before writing error strings                                                      |
| Type rename missed, so nothing runs end to end        | Do it first; the error message misleadingly blames the data type, not the missing script |
