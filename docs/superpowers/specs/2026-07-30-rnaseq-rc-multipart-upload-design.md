# Spec A — rnaseq-rc Multipart Upload (web-monorepo)

**Date:** 2026-07-30
**Repo:** `web-monorepo`
**Branch:** `rnaseq-form-align-to-plugin` (off `rnaseq-form`)
**Status:** Agreed, not yet implemented

Replaces the client-side zip archive for rnaseq-rc uploads with an array of
`dataFile` parts, and removes the prototype scaffolding around it.

Prerequisite reading: [the upload contract](2026-07-30-rnaseq-rc-upload-contract.md).
Rules stated there are not repeated here.

Companion: [Spec B — vdi-plugin-wrangler](2026-07-30-rnaseq-rc-wrangler-manifest-design.md).

## Goals

1. Stop building a zip in the browser; send the file set as separate parts.
2. Replace the type-sniffing conditionals with per-data-type configuration, so
   that adding a future multi-file type is a config change rather than another
   branch in the controller.
3. Remove the four prototype hacks.
4. Enforce the 100,000-byte `sample-info` limit in the form.

Non-goals: migrating `documentFiles` / `dataPropertiesFiles` off `FileList`
(deliberately deferred — see _Deferred_), and any change to the update/revision
form beyond what compiles.

## Architecture

Three concerns are currently tangled in `UploadFormController.submitAction` and
`RootDetailsSection`. They separate into:

| Concern                  | Today                                                  | After                         |
| ------------------------ | ------------------------------------------------------ | ----------------------------- |
| Transport                | one client-built zip                                   | N `dataFile` parts            |
| Which inputs render      | sniffed from `verbiage.formInputs?.samplesDescription` | `dataInputConfig.file.slots`  |
| What files get generated | hardcoded in the controller behind the sniff           | `formConfig.prepareDataFiles` |

The `user-datasets` library gains two generic extension points and keeps **no**
rnaseq-rc knowledge. All rnaseq-rc specifics live in `rnaseqRcFormConfigurator`
in `web-common`, alongside the rest of that type's configuration.

## Changes

### 1. Upload state: `FileList` → `readonly File[]`

`Service/Model/utility-types.ts`:

```ts
export interface DatasetUploads {
  readonly url?: string;
  readonly dataFiles?: readonly File[]; // was FileList
  readonly documentFiles?: FileList; // unchanged, see Deferred
  readonly dataPropertiesFiles?: FileList;
}
// antisenseDataFiles: deleted
```

`FileList` is a legacy interop type, not a safety feature: a pre-`Array` DOM
collection from the same era as `NodeList`. Newer file APIs abandoned it
(`showOpenFilePicker()` returns `FileSystemFileHandle[]`), and its immutability
protects no invariant here — the app replaces the whole list on every change, and
the real immutability that matters lives in `File` itself, a named blob
reference, which is unaffected. `readonly File[]` gives compile-time
immutability, which is stronger for a Redux store, and composes with
spread/map/filter.

Convert at the input boundary with `Array.from(e.target.files ?? [])`, applying
`sanitizeFileName` there (see the contract's _sanitization ordering_).

This deletes both `new DataTransfer()` hacks — the synthetic `FileList` in
`UploadFormController.tsx:121-126` and whatever a two-slot editor over an
immutable `FileList` would have needed.

Touch points, all of them: `RootDataInput.tsx`, `DataFileInput.tsx`,
`DualFileInput.tsx`, `RootDetailsSection.tsx` (lines 165-175 and 233-237),
`hasUploads` in `utility-types.ts`, `UpdateForm.tsx`, and `create-dataset.ts`
— whose `appendFiles` already does `for (const file of fileList)` and so needs
only a widened parameter type (`Iterable<File>`).

### 2. `dataInputConfig.file.slots` — declares which inputs render

`Common/Configuration/UploadFormConfig.ts`:

```ts
export interface DataFileSlot {
  readonly label: string;
  readonly buttonText: string;
  readonly required: boolean;
}

export interface FileUploadConfig extends UploadConfig {
  readonly slots?: readonly DataFileSlot[];
  readonly accept?: string;
}
```

Positional: `slots[i]` describes `dataFiles[i]`, so form state stays a plain
array. When two or more slots are declared, the form renders one input per slot;
otherwise it renders the existing single `RootDataInput`.

This is deliberately the light version of a named-slots model — no state
restructuring, but a third file later is config-only. Something has to drive the
`DualFileInput` vs `RootDataInput` choice at `RootDetailsSection.tsx:161/187`,
and a bare boolean would not be the "expandable" this refactor is for.

`DualFileInput` becomes slot-driven and loses its hardcoded labels
("Data file 1", "Choose sense or unstranded file"), which move into the rnaseq-rc
config. Its `senseFile`/`antisenseFile`/`setSenseFile`/`setAntisenseFile` props
collapse to an indexed read/write over `dataFiles`.

### 3. `formConfig.prepareDataFiles` — declares what gets generated

`Common/Configuration/DatasetFormConfig.ts`:

```ts
/**
 * Optional hook assembling the final set of files sent to VDI as `dataFile`
 * parts. Return value replaces `uploads.dataFiles`. Receives filenames already
 * sanitized.
 *
 * May throw, but only as a defensive backstop: everything it could reject is
 * already caught by `validateFormState` (see below), which is the user-facing
 * gate and reports errors inline against the offending field. A throw here
 * means a form-validation gap, and surfaces as a generic submit error.
 */
readonly prepareDataFiles?: (
  dataFiles: readonly File[],
  details: PartialDatasetDetails
) => readonly File[];
```

Synchronous — with JSZip gone there is nothing to await.

### 4. The rnaseq-rc file builder

`Service/utils/rnaseq-rc-file-transformer.ts` is rewritten as a pure function and
renamed to reflect that it no longer transforms into an archive:

```ts
export function buildRnaSeqRcDataFiles(
  dataFiles: readonly File[], // [unstranded] or [sense, antisense]
  samplesDescription?: string
): readonly File[];
```

Behaviour:

1. Validate each input file's extension against the contract's four.
2. Build `sample-info.txt` from `samplesDescription` —
   `new File([text], name, { type: 'text/plain' })`. A `File` is a named `Blob`
   and its constructor takes `BlobPart[]`; a string is a valid `BlobPart`, so
   textarea-sourced content needs no file input. This is the technique the
   current code already uses at line 86.
3. Build `manifest.tsv` per the contract — always, both modes.
4. De-collide generated filenames against user filenames (contract:
   _generated files yield_), writing the final names into the manifest.
5. Return `[...dataFiles, sampleInfo, manifest]`.

Drops the debug `console.log` calls at lines 79-84.

Registered in `rnaseqRcFormConfigurator` (`web-common/src/user-dataset-upload-config.tsx`),
which adapts the hook's generic signature to this builder's:

```ts
prepareDataFiles: (files, details) =>
  buildRnaSeqRcDataFiles(files, details.samplesDescription),
```

The configurator also declares the two slots and their labels, and its help text
needs rewriting — it currently promises "a .zip archive" and a manifest only "if you
provide both Data file 1 and Data file 2".

### 5. Controller simplification

`UploadFormController.submitAction` loses the sniff, the `DataTransfer` hack, the
async try/catch, and the type rewrite:

```ts
const dataFiles = formConfig.prepareDataFiles
  ? formConfig.prepareDataFiles(
      fileUploads.dataFiles ?? [],
      formState.datasetDetails
    )
  : fileUploads.dataFiles;
```

and submits `type: formConfig.dataType` directly.

### 6. Prototype hacks removed

| Site                               | Hack                                                      |
| ---------------------------------- | --------------------------------------------------------- |
| `UploadFormController.tsx:109`     | `samplesDescription`-presence used as "is this rnaseq-rc" |
| `UploadFormController.tsx:121-128` | `new DataTransfer()` to synthesise a `FileList`           |
| `UploadFormController.tsx:143-147` | `rnaseq-rc` → `rnaseq` type rewrite on submit             |
| `DatasetTypeConfig.ts:86-92`       | the same alias in `filterAvailableDataTypes`              |
| `RootDetailsSection.tsx:99`        | `isRnaSeqRc` derived from verbiage config                 |

Removing the last two is gated on the contract's **deployment prerequisite**.

### 7. Validation

Added to the existing `validateFormState` path, which already renders keyed
errors:

- `samplesDescription` over 100,000 UTF-8 bytes (`TextEncoder`, per contract)
- duplicate basenames among user files
- tabs in filenames
- required slots unfilled

The size limit is enforced **softly** — a live byte counter plus a
submit-blocking error — rather than via the `maxLength` attribute `TextAreaInput`
already supports. `maxLength` silently truncates a paste, and someone pasting a
Methods section would lose the tail with no indication. A counter also gives
useful feedback well before the limit.

## Testing

`buildRnaSeqRcDataFiles` is the natural unit-test target: file set in, file set
out, no DOM, no network. Cases — unstranded, stranded pair, manifest content and
ordering, generated-name de-collision, rejected extensions, duplicate basenames,
tabs, the 100,000-byte boundary in both ASCII and multi-byte text.

**Caveat:** `packages/libs/user-datasets` has a `test` script
(`veupathdb-react-scripts test`) but **zero existing test files**. This
establishes the harness in that package and may need config work; budget for
that. If it proves obstructive, the fallback is to co-locate these tests in a
package that already has a working runner rather than to skip them.

Then `yarn nx compile:check` for the `File[]` migration, and a real upload
against a dev VDI — including the deliberate collision cases, to confirm the
`FileAlreadyExistsException` reading in the contract.

## Deferred

`documentFiles` and `dataPropertiesFiles` stay `FileList`, leaving two
conventions side by side. Migrating them was considered and rejected for this
pass: they are untouched by rnaseq-rc, and widening the diff makes the
`compile:check` sweep harder to review. Worth a follow-up so the interface ends
up consistent.

## Risks

| Risk                                                        | Mitigation                                                                      |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `rnaseq-rc:1.0` not registered in VDI stack config at merge | Confirm before merging; the form vanishes and `PluginRegistry.require()` throws |
| Spec B not yet landed — plugin still expects fixed stems    | Ship in step; the archive is structurally identical, only naming differs        |
| `File[]` migration breaks the update/revision form          | `compile:check`, and exercise the update form manually                          |
| No test harness in `user-datasets`                          | Time-boxed; documented fallback above                                           |
