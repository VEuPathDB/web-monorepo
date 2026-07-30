# Spec B — rnaseq-rc Manifest Adoption (vdi-plugin-wrangler)

**Date:** 2026-07-30
**Repo:** `vdi-plugin-wrangler` (branch `rnaseq-rc`)
**Status:** Agreed and **unblocked** — the in-flight rnaseq-rc development landed on
2026-07-30. Anchors below re-verified against that state.

Replaces fixed-filename-stem discovery with manifest-driven discovery, so that
users' original count filenames survive into our system.

Prerequisite reading: [the upload contract](2026-07-30-rnaseq-rc-upload-contract.md).
Rules stated there are not repeated here.

Companion: [Spec A — web-monorepo](2026-07-30-rnaseq-rc-multipart-upload-design.md).

## State of the target repo

Work stays on branch **`rnaseq-rc`** — it is already on the remote, so do not
rename it despite the type name now being `rnaseqrc`. Branch names are not type
names.

The previously-blocking development has landed. Re-verified 2026-07-30:

| Anchor                                     | Then      | Now                 |
| ------------------------------------------ | --------- | ------------------- |
| `lib/R/counts_files.R` total               | 396 lines | **454**             |
| `.COUNTS_FILE_KEY_FOR_STEM`                | line 12   | line 12 (unchanged) |
| `SAMPLE_INFO_MAX_CHARS`                    | line 30   | line 30 (unchanged) |
| `discover_counts_files`                    | line 48   | line 48 (unchanged) |
| `data_file_pattern` regex                  | line 51   | line 51 (unchanged) |
| `nchar(..., type = "bytes")`               | line 126  | **line 135**        |
| `read_and_merge_counts`                    | line 392  | **line 404**        |
| Fixtures under `tests/testthat/rnaseq-rc/` | 24        | **29**              |

The discovery function's structure, validation blocks and `list(mode, paths)`
return contract are all unchanged, so this spec's design holds as written. The
growth is encoding work: five new fixtures (`25-iso8859-counts-OK`,
`26-windows1252-counts-OK`, `27-utf16-counts-OK`, `28-windows1252-sample-info-OK`,
`29-utf16-sample-info-OK`) and the transcoding that supports them.

**Those five matter to this spec.** A manifest is UTF-8 by contract, but it names
count files whose own contents may be Latin-1 or UTF-16 — and on a filesystem a
filename is bytes. Manifest parsing must not assume the _named_ files share the
manifest's encoding, and the filename comparison must work when a name contains
non-ASCII. Each of the five needs a manifest like every other fixture.

This spec and its plan live in `web-monorepo` for now. Move both into
`vdi-plugin-wrangler` when convenient — the repo is no longer busy.

Implementation plan:
[2026-07-30-rnaseq-rc-wrangler-manifest.md](../plans/2026-07-30-rnaseq-rc-wrangler-manifest.md)

### Two of the three deferral reasons are discharged; one is not

Planning was originally deferred for three reasons. Where they now stand:

1. **Line references would move** — discharged. Re-verified above; the anchors
   this spec depends on are stable, and the moved ones are recorded.
2. **Different language, harness and idiom** — discharged in practice. Every
   decision that matters is written down here, so a reader needs this document
   rather than the TypeScript history.
3. **Spec A's real `manifest.tsv` is the best fixture source** — **NOT
   discharged.** Spec A is implemented but its end-to-end upload has not been run
   yet, so no real manifest exists to copy. The plan's fixture task is therefore
   written against the contract, with an explicit instruction to replace the
   hand-written manifest with the real artifact as soon as Spec A's Task 6 Step 3
   produces one. Do not skip that swap: hand-written fixtures can encode the same
   misunderstanding on both sides and still pass.

**Verification is partly circular, so sequence it:** Spec A's Task 6 steps 1-4
and 6 validate the producer on its own, since they only inspect what VDI stored.
Step 5 — the import actually succeeding — is the joint gate and waits on this
spec. Archive-verify Spec A first, swap the real manifest into these fixtures,
then close Spec A's Step 5 last.

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
- In all 29 fixture `vdi-meta.json` files, `"name": "rnaseq-rc"` → `"rnaseqrc"`.

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

## Error taxonomy — decided

`stop_validation_error(user_msg =, technical_msg =)` assumes the user can act on
`user_msg`. For manifest faults that assumption breaks: **the UI generates the
manifest, so a bad manifest is our bug, not the uploader's.** Telling someone to
fix a file they never created would be actively misleading.

**Manifest-structure faults** — missing, malformed line, unknown role, duplicate
role, dangling reference, unreferenced extra — report the internal error plainly
and point at the helpdesk:

> There was a problem with the structure of your upload. If you uploaded through
> the website, please contact the helpdesk.

Full diagnostic detail goes in `technical_msg` as usual.

**Content faults the user genuinely owns** — empty `sample-info`, oversized
`sample-info`, malformed counts, mode violations — keep their current instructive
messages unchanged.

No further branching. The plugin cannot tell a form upload from a hand-crafted
API one, and deliberately does not try: a manifest arriving from the web client
should never be malformed, so this path is a bug report channel rather than a
user-guidance one. Not worth jumping through hoops for.

## Fixtures

29 directory-based cases under `tests/testthat/rnaseq-rc/`, each holding input
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

Keep the _Counts file layout_, _Sample IDs_ and _Suitability for differential
expression_ sections — none of them are affected.

**One addition to the `sample-info` content guidance:** ask for units. The upload
form's placeholder now prompts for them (`web-monorepo` commit `b59fcfc1`) —
"…what abbreviations mean, which samples are replicates, what units any values
are in, and what conditions or timepoints are represented" — and the doc should
say the same, so the two places a user might look agree. Units are rarely
recoverable from sample names alone, and the AI annotation step can only label
values it can interpret. Keep it to a clause in the existing list, not a new
section.

## Verification

`docker compose run --rm -w /opt/veupathdb bin/run_tests.R` (the build is ~45
minutes, so avoid a rebuild if the image is current). All 29 fixtures plus the
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
