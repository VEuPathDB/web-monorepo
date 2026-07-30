# rnaseq-rc Multipart Upload Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the browser-built zip archive for rnaseq-rc dataset uploads with an array of `dataFile` multipart parts, and remove the prototype scaffolding that surrounded it.

**Architecture:** VDI already packs multiple `dataFile` parts into a flat archive server-side, structurally identical to what the browser currently builds with JSZip — so the change is mostly deletion. Three tangled concerns get separated: transport (parts, not a zip), which inputs render (declared via `dataInputConfig.file.slots`), and what files get generated (a `prepareDataFiles` hook on the form config). The `user-datasets` library keeps no rnaseq-rc knowledge; all specifics live in `rnaseqRcFormConfigurator` in `web-common`.

**Tech Stack:** TypeScript, React 18, Redux, Yarn 4 workspaces, Nx 16, jest via `veupathdb-react-scripts test`.

**Source documents — read both before starting:**

- Contract: `docs/superpowers/specs/2026-07-30-rnaseq-rc-upload-contract.md`
- Spec A: `docs/superpowers/specs/2026-07-30-rnaseq-rc-multipart-upload-design.md`

## Global Constraints

- **Type name is `rnaseqrc`**, no hyphen. Load-bearing: the wrangler plugin interpolates it into a script path. Filenames like `rnaseq-rc-*.ts` and this plan's own title are not type names and keep their spelling.
- **Roles in `manifest.tsv`:** exactly `sense`, `antisense`, `unstranded`, `sample-info`.
- **Manifest format:** no header row, `role<TAB>filename`, LF endings, trailing newline, UTF-8. Manifest never lists itself.
- **Manifest is always generated**, including the single-file unstranded case.
- **`sample-info` cap: 100,000 UTF-8 bytes.** Measure with `new Blob([text]).size`. **Never** `String.prototype.length` (UTF-16 code units) and **never** `TextEncoder` (absent in jsdom, so it passes in-browser and throws in jest).
- **Reading file content in tests:** `await new Response(file).text()`. `File.prototype.text()` does not exist in this jsdom.
- **Accepted extensions** come from `dataType.vdiConfig.allowedFileExtensions` — do not hardcode a second list. VDI config currently has `.txt .tsv .csv .tab`; a dev site on `main` quadlets config will lack `.tab` until that branch deploys.
- **Never use `new DataTransfer()`.** Removing it is a goal of this work.
- **Import style:** regular imports, not `import type`.
- **Dependencies:** if you ever need to add one, use `yarn add`; never hand-edit `package.json`. (Removal in Task 4 uses `yarn remove`.)
- Run all commands from the repo root unless stated. Use `~/.volta/bin/yarn` if `yarn --version` reports 1.x.

---

## File Structure

**Created:**

| Path                                                                             | Responsibility                                                                                                                                                   |
| -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/libs/user-datasets/src/lib/Service/utils/rnaseq-rc-data-files.ts`      | Pure builder: user files + description → the full `File[]` set including `sample-info.txt` and `manifest.tsv`. Owns the byte-length helper and the cap constant. |
| `packages/libs/user-datasets/src/lib/Service/utils/rnaseq-rc-data-files.test.ts` | Unit tests for the above.                                                                                                                                        |

**Deleted:**

| Path                                                                              | Why                                                     |
| --------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `packages/libs/user-datasets/src/lib/Service/utils/rnaseq-rc-file-transformer.ts` | Superseded by the builder; was the only JSZip consumer. |

**Modified:**

| Path                                                                     | Change                                                             |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| `.../Service/Model/utility-types.ts`                                     | `dataFiles` → `readonly File[]`; delete `antisenseDataFiles`       |
| `.../Service/Datasets/create-dataset.ts`                                 | widen `appendFiles` param to `Iterable<File>`                      |
| `.../Common/Configuration/UploadFormConfig.ts`                           | add `DataFileSlot` and `slots`                                     |
| `.../Common/Configuration/DatasetFormConfig.ts`                          | add `prepareDataFiles`                                             |
| `.../Common/Configuration/DatasetTypeConfig.ts`                          | remove the `rnaseq-rc`→`rnaseq` alias                              |
| `.../Common/Forms/Components/Sections/Definition/DataFileInput.tsx`      | emit `readonly File[]`, sanitize at boundary                       |
| `.../Common/Forms/Components/Sections/Definition/DualFileInput.tsx`      | slot-driven, indexed over `dataFiles`                              |
| `.../Common/Forms/Components/Sections/Definition/RootDataInput.tsx`      | `FileList` → `readonly File[]`                                     |
| `.../Common/Forms/Components/Sections/Definition/RootDetailsSection.tsx` | pick input by config; byte counter                                 |
| `.../Components/Upload/UploadFormController.tsx`                         | use the hook; drop sniff, `DataTransfer`, type rewrite; validation |
| `packages/libs/web-common/src/user-dataset-upload-config.tsx`            | `rnaseqrc` name, slots, `prepareDataFiles`, help text              |
| `packages/libs/user-datasets/package.json`                               | remove `jszip`, `@types/jszip`                                     |

`Components/Update/UpdateForm.tsx` needs **no** change — it references only
`dataPropertiesFiles` and `hasUploads`, never `dataFiles`.

---

## Task 1: The pure file builder

Builds the complete upload file set. Pure, synchronous, no DOM, no network — the one genuinely unit-testable piece, so it goes first and gets real TDD.

**Files:**

- Create: `packages/libs/user-datasets/src/lib/Service/utils/rnaseq-rc-data-files.ts`
- Test: `packages/libs/user-datasets/src/lib/Service/utils/rnaseq-rc-data-files.test.ts`

**Interfaces:**

- Consumes: nothing from other tasks.
- Produces, all imported by later tasks:

  - `buildRnaSeqRcDataFiles(dataFiles: readonly File[], samplesDescription: string | undefined, allowedExtensions: readonly string[]): readonly File[]`
  - `utf8ByteLength(text: string): number`
  - `SAMPLE_INFO_MAX_BYTES: 100000`
  - `findDuplicateFileName(files: readonly File[]): string | undefined`
  - `hasTabInName(files: readonly File[]): string | undefined`

- [ ] **Step 1: Write the failing tests**

Create `packages/libs/user-datasets/src/lib/Service/utils/rnaseq-rc-data-files.test.ts`:

```ts
import {
  buildRnaSeqRcDataFiles,
  findDuplicateFileName,
  hasTabInName,
  SAMPLE_INFO_MAX_BYTES,
  utf8ByteLength,
} from './rnaseq-rc-data-files';

const EXTS = ['.txt', '.tsv', '.csv', '.tab'];

const file = (name: string, content = 'gene\tS1\nA\t1\n') =>
  new File([content], name, { type: 'text/plain' });

const read = (f: File) => new Response(f).text();

const byName = (files: readonly File[], name: string) => {
  const hit = files.find((f) => f.name === name);
  if (hit == null)
    throw new Error(`no file named ${name} in [${files.map((f) => f.name)}]`);
  return hit;
};

describe('utf8ByteLength', () => {
  it('counts UTF-8 bytes, not UTF-16 code units', () => {
    expect(utf8ByteLength('hello')).toBe(5);
    expect(utf8ByteLength('é')).toBe(2);
    expect(utf8ByteLength('日本語')).toBe(9);
  });
});

describe('buildRnaSeqRcDataFiles — unstranded', () => {
  it('returns the count file plus sample-info and manifest', () => {
    const result = buildRnaSeqRcDataFiles(
      [file('HTSeq_run3.txt')],
      'notes',
      EXTS
    );

    expect(result.map((f) => f.name).sort()).toEqual([
      'HTSeq_run3.txt',
      'manifest.tsv',
      'sample-info.txt',
    ]);
  });

  it('writes an unstranded manifest with a trailing newline', async () => {
    const result = buildRnaSeqRcDataFiles(
      [file('HTSeq_run3.txt')],
      'notes',
      EXTS
    );

    expect(await read(byName(result, 'manifest.tsv'))).toBe(
      'unstranded\tHTSeq_run3.txt\nsample-info\tsample-info.txt\n'
    );
  });

  it('puts the description verbatim into sample-info.txt', async () => {
    const result = buildRnaSeqRcDataFiles(
      [file('c.tsv')],
      'S1 infected\nS2 control',
      EXTS
    );

    expect(await read(byName(result, 'sample-info.txt'))).toBe(
      'S1 infected\nS2 control'
    );
  });

  it('generates an empty sample-info.txt when no description is given', async () => {
    const result = buildRnaSeqRcDataFiles([file('c.tsv')], undefined, EXTS);

    expect(await read(byName(result, 'sample-info.txt'))).toBe('');
  });
});

describe('buildRnaSeqRcDataFiles — stranded', () => {
  it('writes a sense/antisense manifest in slot order', async () => {
    const result = buildRnaSeqRcDataFiles(
      [file('my_sense.tsv'), file('my_anti.tsv')],
      'notes',
      EXTS
    );

    expect(await read(byName(result, 'manifest.tsv'))).toBe(
      'sense\tmy_sense.tsv\nantisense\tmy_anti.tsv\nsample-info\tsample-info.txt\n'
    );
  });
});

describe('buildRnaSeqRcDataFiles — generated names yield on collision', () => {
  it('renames its own sample-info when the user file claims that name', async () => {
    const result = buildRnaSeqRcDataFiles(
      [file('sample-info.txt')],
      'notes',
      EXTS
    );

    expect(result.map((f) => f.name).sort()).toEqual([
      'manifest.tsv',
      'sample-info-1.txt',
      'sample-info.txt',
    ]);
    expect(await read(byName(result, 'manifest.tsv'))).toBe(
      'unstranded\tsample-info.txt\nsample-info\tsample-info-1.txt\n'
    );
  });

  it('renames its own manifest when the user file claims that name', () => {
    const result = buildRnaSeqRcDataFiles(
      [file('manifest.tsv')],
      'notes',
      EXTS
    );

    expect(result.map((f) => f.name)).toContain('manifest-1.tsv');
    expect(result.map((f) => f.name)).toContain('manifest.tsv');
  });

  it('keeps counting up when the first fallback is also taken', () => {
    const result = buildRnaSeqRcDataFiles(
      [file('sample-info.txt'), file('sample-info-1.txt')],
      'notes',
      EXTS
    );

    expect(result.map((f) => f.name)).toContain('sample-info-2.txt');
  });
});

describe('buildRnaSeqRcDataFiles — rejections', () => {
  it('rejects a disallowed extension', () => {
    expect(() =>
      buildRnaSeqRcDataFiles([file('counts.xlsx')], 'n', EXTS)
    ).toThrow(/counts\.xlsx/);
  });

  it('accepts extensions case-insensitively', () => {
    expect(() =>
      buildRnaSeqRcDataFiles([file('Counts.CSV')], 'n', EXTS)
    ).not.toThrow();
  });

  it('rejects an empty file list', () => {
    expect(() => buildRnaSeqRcDataFiles([], 'n', EXTS)).toThrow(
      /at least one/i
    );
  });

  it('rejects more files than there are roles', () => {
    expect(() =>
      buildRnaSeqRcDataFiles(
        [file('a.tsv'), file('b.tsv'), file('c.tsv')],
        'n',
        EXTS
      )
    ).toThrow(/at most two/i);
  });
});

describe('findDuplicateFileName', () => {
  it('finds a repeated basename', () => {
    expect(
      findDuplicateFileName([file('counts.tsv'), file('counts.tsv')])
    ).toBe('counts.tsv');
  });

  it('returns undefined when all names differ', () => {
    expect(
      findDuplicateFileName([file('a.tsv'), file('b.tsv')])
    ).toBeUndefined();
  });
});

describe('hasTabInName', () => {
  it('finds a tab in a filename', () => {
    expect(hasTabInName([file('od\td.tsv')])).toBe('od\td.tsv');
  });

  it('returns undefined for clean names', () => {
    expect(hasTabInName([file('fine.tsv')])).toBeUndefined();
  });
});

describe('SAMPLE_INFO_MAX_BYTES', () => {
  it('matches the plugin cap', () => {
    expect(SAMPLE_INFO_MAX_BYTES).toBe(100000);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
cd packages/libs/user-datasets && CI=true ~/.volta/bin/yarn test --testPathPattern="rnaseq-rc-data-files"
```

Expected: FAIL — `Cannot find module './rnaseq-rc-data-files'`.

- [ ] **Step 3: Write the implementation**

Create `packages/libs/user-datasets/src/lib/Service/utils/rnaseq-rc-data-files.ts`:

```ts
/**
 * Builds the file set for an rnaseq-rc upload.
 *
 * Files are sent to VDI as separate `dataFile` multipart parts; VDI packs them
 * into a flat archive server-side. See
 * docs/superpowers/specs/2026-07-30-rnaseq-rc-upload-contract.md.
 */

/** Cap on sample-info size, mirroring the wrangler plugin's own check. */
export const SAMPLE_INFO_MAX_BYTES = 100000;

const SAMPLE_INFO_NAME = 'sample-info.txt';
const MANIFEST_NAME = 'manifest.tsv';

/**
 * UTF-8 byte length of `text`.
 *
 * `Blob` rather than `TextEncoder` because jsdom does not provide the latter,
 * so a `TextEncoder` implementation would pass in a browser and throw in jest.
 * `Blob` is also the primitive `File` is built on, so this cannot disagree with
 * the bytes actually uploaded.
 */
export function utf8ByteLength(text: string): number {
  return new Blob([text]).size;
}

/** First basename appearing more than once, or undefined. */
export function findDuplicateFileName(
  files: readonly File[]
): string | undefined {
  const seen = new Set<string>();

  for (const file of files) {
    if (seen.has(file.name)) return file.name;
    seen.add(file.name);
  }

  return undefined;
}

/**
 * First filename containing a tab, or undefined.
 *
 * Tabs are legal in POSIX filenames but would break the manifest's
 * tab-separated parse.
 */
export function hasTabInName(files: readonly File[]): string | undefined {
  return files.find((f) => f.name.includes('\t'))?.name;
}

export function buildRnaSeqRcDataFiles(
  dataFiles: readonly File[],
  samplesDescription: string | undefined,
  allowedExtensions: readonly string[]
): readonly File[] {
  if (dataFiles.length === 0)
    throw new Error('Please provide at least one count file.');

  if (dataFiles.length > 2)
    throw new Error(
      'Please provide at most two count files: a sense/antisense pair, or a single unstranded file.'
    );

  for (const file of dataFiles) {
    if (!hasAllowedExtension(file.name, allowedExtensions))
      throw new Error(
        `Unsupported file type: ${file.name}. Permitted types are ` +
          `${allowedExtensions.join(', ')}.`
      );
  }

  // Generated names yield to the user's, since the manifest carries the
  // name-to-role mapping and nothing requires a generated file to keep its
  // preferred name. Reserve both before writing the manifest so its contents
  // and the archive agree.
  const taken = new Set(dataFiles.map((f) => f.name));

  const sampleInfoName = deCollide(SAMPLE_INFO_NAME, taken);
  taken.add(sampleInfoName);

  const manifestName = deCollide(MANIFEST_NAME, taken);

  const roles =
    dataFiles.length === 2 ? ['sense', 'antisense'] : ['unstranded'];

  const manifestLines = [
    ...dataFiles.map((file, i) => `${roles[i]}\t${file.name}`),
    `sample-info\t${sampleInfoName}`,
  ];

  return [
    ...dataFiles,
    textFile(sampleInfoName, samplesDescription ?? ''),
    // Trailing newline: the manifest is a line-oriented file and R's readLines
    // warns on an unterminated final line.
    textFile(manifestName, manifestLines.join('\n') + '\n'),
  ];
}

function textFile(name: string, content: string): File {
  return new File([content], name, { type: 'text/plain' });
}

function hasAllowedExtension(
  name: string,
  allowedExtensions: readonly string[]
): boolean {
  const lower = name.toLowerCase();
  return allowedExtensions.some((ext) => lower.endsWith(ext.toLowerCase()));
}

/**
 * Returns `desired`, or `<stem>-<n><ext>` for the lowest n making it unused.
 */
function deCollide(desired: string, taken: ReadonlySet<string>): string {
  if (!taken.has(desired)) return desired;

  const dot = desired.lastIndexOf('.');
  const stem = dot < 0 ? desired : desired.slice(0, dot);
  const ext = dot < 0 ? '' : desired.slice(dot);

  for (let i = 1; ; i++) {
    const candidate = `${stem}-${i}${ext}`;
    if (!taken.has(candidate)) return candidate;
  }
}
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
cd packages/libs/user-datasets && CI=true ~/.volta/bin/yarn test --testPathPattern="rnaseq-rc-data-files"
```

Expected: PASS, all tests. If the collision tests fail on ordering, note that `buildRnaSeqRcDataFiles` returns user files first, then sample-info, then manifest — the tests that assert exact order rely on that.

- [ ] **Step 5: Commit**

```bash
git add packages/libs/user-datasets/src/lib/Service/utils/rnaseq-rc-data-files.ts \
        packages/libs/user-datasets/src/lib/Service/utils/rnaseq-rc-data-files.test.ts
git commit -m "Add pure builder for the rnaseq-rc upload file set

Assembles the count files plus a generated sample-info.txt and
manifest.tsv, with generated names yielding to user filenames on
collision so the manifest and the archive always agree.

Establishes the first tests in this package."
```

---

## Task 2: Migrate upload state to `readonly File[]`

Mechanical type migration. Deletes `antisenseDataFiles`, folding the second count file into `dataFiles[1]`. No behaviour change intended — the form should look and work identically afterwards.

**Files:**

- Modify: `packages/libs/user-datasets/src/lib/Service/Model/utility-types.ts:1-24`
- Modify: `packages/libs/user-datasets/src/lib/Service/Datasets/create-dataset.ts:56-68`
- Modify: `.../Common/Forms/Components/Sections/Definition/DataFileInput.tsx:11,27-30,78`
- Modify: `.../Common/Forms/Components/Sections/Definition/DualFileInput.tsx` (whole file)
- Modify: `.../Common/Forms/Components/Sections/Definition/RootDataInput.tsx:136-137`
- Modify: `.../Common/Forms/Components/Sections/Definition/RootDetailsSection.tsx:161-186,233-237`
- Modify: `packages/libs/user-datasets/src/lib/Components/Upload/UploadFormController.tsx:106-128`

**Interfaces:**

- Consumes: nothing.
- Produces: `DatasetUploads.dataFiles?: readonly File[]`, and `antisenseDataFiles` no longer exists. Task 3 relies on `dataFiles` being index-addressable.

- [ ] **Step 1: Change the upload state type**

In `utility-types.ts`, replace the interface:

```ts
export interface DatasetUploads {
  readonly url?: string;
  readonly dataFiles?: readonly File[];
  readonly documentFiles?: FileList;
  readonly dataPropertiesFiles?: FileList;
}
```

`antisenseDataFiles` is deleted. Leave `documentFiles` and `dataPropertiesFiles` as `FileList` — migrating them is explicitly out of scope.

- [ ] **Step 2: Widen `appendFiles` so it accepts either**

In `create-dataset.ts`, change the `fileList` parameter type only:

```ts
function appendFiles(
  fileList: Iterable<File> | undefined,
  converter: Function<File, DatasetUpload>,
  combinedUploads: DatasetUpload[]
) {
```

The body already does `for (const file of fileList)`, so nothing else changes. **Leave the `sanitizeFileName(file)` call in place** — Step 3 also sanitizes at the input boundary, and `name.replace(/\s+/g, '_')` is idempotent, so applying it twice is harmless and the doc/props paths still need it here.

- [ ] **Step 3: Make `DataFileInput` emit an array and sanitize at the boundary**

In `DataFileInput.tsx`, add the import:

```ts
import { sanitizeFileName } from '../../../../../Service/utils/sanitization';
```

Change the prop type:

```ts
readonly setFile: Consumer<Nullable<readonly File[]>>;
```

Replace `handleChange` and the plain-input `onChange` so both go through one path:

```ts
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(e.target.files ?? []).map(sanitizeFileName);
  props.setFile(files.length === 0 ? null : files);
  setFileName(files[0]?.name ?? '');
};
```

Then change the default input at line 78 from its inline arrow to `onChange={handleChange}`.

Sanitizing here rather than at submit time is what keeps `manifest.tsv` in step with the archive — see the contract's _sanitization ordering_.

- [ ] **Step 4: Rewrite `DualFileInput` to index into `dataFiles`**

Replace the whole of `DualFileInput.tsx`:

```tsx
import React, { ReactElement } from 'react';
import { DataFileInput } from './DataFileInput';
import { Consumer, JsonPathBuilder } from '../../../../../Utils';
import { DatasetTypeConfig } from '../../../../Configuration';
import { VdiServiceFeatures } from '../../../../../Service';

export interface DualFileInputProps {
  readonly pathBuilder: JsonPathBuilder;
  readonly dataType: DatasetTypeConfig;
  readonly vdiFeatures: VdiServiceFeatures;
  readonly files: readonly File[];
  readonly setFiles: Consumer<readonly File[]>;
  readonly accept?: string;
}

/**
 * Two data file inputs writing into positions 0 and 1 of `files`.
 *
 * The second input stays disabled until the first is filled. That gating is
 * load-bearing, not cosmetic: it guarantees the array is dense, so position
 * keeps meaning role (0 = sense/unstranded, 1 = antisense) for the manifest.
 */
export function DualFileInput(props: DualFileInputProps): ReactElement {
  const senseFieldName = props.pathBuilder.appendToString('dataFile');
  const antisenseFieldName =
    props.pathBuilder.appendToString('antisenseDataFile');

  const setAt = (index: number, files: readonly File[] | null) => {
    const next = [...props.files];

    if (files == null || files.length === 0) next.splice(index);
    else next[index] = files[0];

    props.setFiles(next);
  };

  const hasSense = props.files.length > 0;

  return (
    <>
      <label
        htmlFor={senseFieldName}
        style={{ fontWeight: 'normal', color: 'red' }}
      >
        Data file 1 <span>*</span>
      </label>
      <DataFileInput
        fieldName={senseFieldName}
        dataType={props.dataType}
        required={true}
        setFile={(files) => setAt(0, files)}
        vdiFeatures={props.vdiFeatures}
        accept={props.accept}
        buttonText="Choose sense or unstranded file"
      />
      <div className="column-2"></div>

      <label
        htmlFor={antisenseFieldName}
        style={{
          fontWeight: 'normal',
          color: hasSense ? 'inherit' : '#666',
          opacity: hasSense ? 1 : 0.85,
        }}
      >
        Data file 2
      </label>
      <DataFileInput
        fieldName={antisenseFieldName}
        dataType={props.dataType}
        required={false}
        setFile={(files) => setAt(1, files)}
        vdiFeatures={props.vdiFeatures}
        disabled={!hasSense}
        accept={props.accept}
        buttonText="Choose anti-sense file (optional)"
      />
      <div className="column-2"></div>
    </>
  );
}
```

`splice(index)` truncates from that position, so clearing slot 0 clears slot 1 too — correct, since an antisense file alone is meaningless.

- [ ] **Step 5: Update the remaining `FileList` references**

In `RootDataInput.tsx`, change `FileUploadState`:

```ts
interface FileUploadState {
  readonly files: Nullable<readonly File[]>;
  readonly setFiles: Consumer<Nullable<readonly File[]>>;
  readonly vdiConfig: VdiServiceMetadata;
}
```

In `RootDetailsSection.tsx`, replace the `DualFileInput` call site (currently lines 161-186) with:

```tsx
<DualFileInput
  pathBuilder={props.contentJsonPath}
  dataType={formConfig.dataType}
  vdiFeatures={formProps.vdiConfig.features}
  files={fileUploads.dataFiles ?? []}
  setFiles={(files) => setUploads({ ...fileUploads, dataFiles: files })}
  accept=".tsv,.tab,.txt"
/>
```

Leave the `isRnaSeqRc` condition alone for now — Task 3 removes it. The `buildFileProps` block at lines 233-237 needs no edit; `lodash.isEmpty` handles arrays.

In `UploadFormController.tsx`, the old transform block at lines 106-141 still references `antisenseDataFiles` and won't compile. Replace that whole block with a temporary passthrough — Task 4 replaces it properly:

```ts
const finalFileUploads = fileUploads;
```

Delete the now-unused `transformRnaSeqRcUpload` import.

- [ ] **Step 6: Type-check**

```bash
~/.volta/bin/yarn nx compile:check @veupathdb/genomics-site
```

Expected: no errors. `DatasetUploads` is part of the library's public API, so if a site package fails, fix it there too rather than widening the type back.

- [ ] **Step 7: Confirm the unit tests still pass**

```bash
cd packages/libs/user-datasets && CI=true ~/.volta/bin/yarn test
```

Expected: PASS. Task 1's tests are independent of this change, so a failure here means something was over-edited.

- [ ] **Step 8: Commit**

```bash
git add -A packages/libs
git commit -m "Hold uploaded data files as readonly File[]

FileList is a legacy interop type whose immutability protects no
invariant here - the list is replaced wholesale on every change, and the
immutability that matters lives in File itself. An array gives
compile-time immutability and composes, removing the need to synthesise
FileLists via DataTransfer.

Folds the antisense file into dataFiles[1], so a second count file is no
longer a special-cased upload field. The second input stays gated on the
first being filled, which now also guarantees position keeps meaning
role."
```

---

## Task 3: Declare inputs via `slots` instead of sniffing verbiage

Removes the `isRnaSeqRc` heuristic. Which inputs render becomes a property of the form config, so a future multi-file type needs no controller change.

**Files:**

- Modify: `packages/libs/user-datasets/src/lib/Common/Configuration/UploadFormConfig.ts:17`
- Modify: `.../Common/Forms/Components/Sections/Definition/DualFileInput.tsx` (labels from props)
- Modify: `.../Common/Forms/Components/Sections/Definition/RootDetailsSection.tsx:98-99,161-186`
- Modify: `packages/libs/web-common/src/user-dataset-upload-config.tsx:508-535`

**Interfaces:**

- Consumes: `DualFileInputProps` from Task 2.
- Produces: `DataFileSlot { label: string; buttonText: string; required: boolean }` and `FileUploadConfig.slots?: readonly DataFileSlot[]`, both exported from `Common/Configuration`.

- [ ] **Step 1: Add the slot type to the config**

In `UploadFormConfig.ts`, replace the empty `FileUploadConfig`:

```ts
/** One data file input. Position in `slots` maps to position in `dataFiles`. */
export interface DataFileSlot {
  readonly label: string;
  readonly buttonText: string;
  readonly required: boolean;
}

export interface FileUploadConfig extends UploadConfig {
  /**
   * Labelled data file inputs. When two or more are declared the form renders
   * one input per slot; otherwise it renders the single default input.
   */
  readonly slots?: readonly DataFileSlot[];

  /** `accept` attribute override. Defaults to the data type's extensions. */
  readonly accept?: string;
}
```

- [ ] **Step 2: Drive `DualFileInput` labels from slots**

In `DualFileInput.tsx`, import the type directly from the config module — the
sibling `RootDataInput.tsx` already imports from that path rather than the
barrel, so no `Configuration/index.ts` change is needed:

```ts
import { DataFileSlot } from '../../../../Configuration/UploadFormConfig';
```

Add to `DualFileInputProps`:

```ts
  readonly slots: readonly DataFileSlot[];
```

Then replace the returned JSX so every label and button string comes from a
slot:

```tsx
return (
  <>
    <label
      htmlFor={senseFieldName}
      style={{ fontWeight: 'normal', color: 'red' }}
    >
      {props.slots[0].label} {props.slots[0].required && <span>*</span>}
    </label>
    <DataFileInput
      fieldName={senseFieldName}
      dataType={props.dataType}
      required={props.slots[0].required}
      setFile={(files) => setAt(0, files)}
      vdiFeatures={props.vdiFeatures}
      accept={props.accept}
      buttonText={props.slots[0].buttonText}
    />
    <div className="column-2"></div>

    <label
      htmlFor={antisenseFieldName}
      style={{
        fontWeight: 'normal',
        color: hasSense ? 'inherit' : '#666',
        opacity: hasSense ? 1 : 0.85,
      }}
    >
      {props.slots[1].label} {props.slots[1].required && <span>*</span>}
    </label>
    <DataFileInput
      fieldName={antisenseFieldName}
      dataType={props.dataType}
      required={props.slots[1].required}
      setFile={(files) => setAt(1, files)}
      vdiFeatures={props.vdiFeatures}
      disabled={!hasSense}
      accept={props.accept}
      buttonText={props.slots[1].buttonText}
    />
    <div className="column-2"></div>
  </>
);
```

Keep `setAt` and `hasSense` from Task 2 exactly as they are.

- [ ] **Step 3: Select the input by config, not by verbiage**

In `RootDetailsSection.tsx`, delete lines 98-99:

```ts
// Check if this is rnaseq-rc type (has samplesDescription field)
const isRnaSeqRc = !!formConfig.verbiage.formInputs?.samplesDescription;
```

Replace with:

```ts
const slots = formConfig.dataInputConfig.file?.enabled
  ? formConfig.dataInputConfig.file.slots
  : undefined;
const useSlottedInputs = (slots?.length ?? 0) > 1;
```

Change the two conditions from `isRnaSeqRc` / `!isRnaSeqRc` to `useSlottedInputs` / `!useSlottedInputs`, and pass the slots plus the configured accept through:

```tsx
{
  props.showDataInputs && useSlottedInputs && (
    <DualFileInput
      pathBuilder={props.contentJsonPath}
      dataType={formConfig.dataType}
      vdiFeatures={formProps.vdiConfig.features}
      slots={slots!}
      files={fileUploads.dataFiles ?? []}
      setFiles={(files) => setUploads({ ...fileUploads, dataFiles: files })}
      accept={
        formConfig.dataInputConfig.file?.enabled
          ? formConfig.dataInputConfig.file.accept
          : undefined
      }
    />
  );
}
```

- [ ] **Step 4: Declare the slots for rnaseq-rc**

In `user-dataset-upload-config.tsx`, in `rnaseqRcFormConfigurator`, replace the `dataInputConfig.file` block:

```ts
    dataInputConfig: {
      file: {
        enabled: true,
        slots: [
          {
            label: 'Data file 1',
            buttonText: 'Choose sense or unstranded file',
            required: true,
          },
          {
            label: 'Data file 2',
            buttonText: 'Choose anti-sense file (optional)',
            required: false,
          },
        ],
      },
```

Do **not** set `accept` — omitting it makes `DataFileInput` derive the list from `dataType.vdiConfig.allowedFileExtensions`, so VDI config stays the single source of truth for extensions. On a dev site running `main` quadlets config, `.tab` will be absent from the picker until that branch deploys; that is expected.

- [ ] **Step 5: Type-check**

```bash
~/.volta/bin/yarn nx compile:check @veupathdb/genomics-site
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add -A packages/libs
git commit -m "Declare data file inputs via config slots

Replaces the isRnaSeqRc heuristic - which inferred a whole input layout
from the presence of an unrelated verbiage field - with slots declared on
the form config. Adding a third data file, or a second multi-file type,
is now configuration rather than another branch in the section component.

Drops the hardcoded accept list so the data type's own
allowedFileExtensions from VDI is the single source of truth."
```

---

## Task 4: Wire the builder in via `prepareDataFiles`, and delete JSZip

**Files:**

- Modify: `packages/libs/user-datasets/src/lib/Common/Configuration/DatasetFormConfig.ts:29`
- Modify: `packages/libs/user-datasets/src/lib/Components/Upload/UploadFormController.tsx`
- Modify: `packages/libs/web-common/src/user-dataset-upload-config.tsx`
- Delete: `packages/libs/user-datasets/src/lib/Service/utils/rnaseq-rc-file-transformer.ts`
- Modify: `packages/libs/user-datasets/package.json` (via `yarn remove`)

**Interfaces:**

- Consumes: `buildRnaSeqRcDataFiles` from Task 1.
- Produces: `DatasetFormConfig.prepareDataFiles?: (dataFiles: readonly File[], details: PartialDatasetDetails) => readonly File[]`.

- [ ] **Step 1: Add the hook to the form config**

In `DatasetFormConfig.ts`, add to the interface and import `PartialDatasetDetails` from `'../../Service'`:

```ts
  /**
   * Optional hook assembling the final set of files sent to VDI as `dataFile`
   * parts. Return value replaces `uploads.dataFiles`. Filenames arrive already
   * sanitized.
   *
   * May throw, but only as a backstop: everything it rejects is already caught
   * by the form's own validation, which reports inline against the offending
   * field. A throw here means a validation gap and surfaces as a generic
   * submit error.
   */
  readonly prepareDataFiles?: (
    dataFiles: readonly File[],
    details: PartialDatasetDetails
  ) => readonly File[];
```

- [ ] **Step 2: Use the hook in the controller**

In `UploadFormController.tsx`, replace the temporary `const finalFileUploads = fileUploads;` from Task 2 with:

```ts
let finalFileUploads = fileUploads;

if (formConfig.prepareDataFiles != null) {
  try {
    finalFileUploads = {
      ...fileUploads,
      dataFiles: formConfig.prepareDataFiles(
        fileUploads.dataFiles ?? [],
        formState.datasetDetails
      ),
    };
  } catch (e) {
    setSubmitting(false);
    return receiveBadUpload([
      {
        type: 400,
        message:
          e instanceof Error ? e.message : 'Failed to prepare upload files',
      },
    ]);
  }
}
```

Then replace the submit call's type with the unmodified config value — delete the `backendTypeName` variable and its comment entirely:

```ts
        details: {
          type: {
            name: formConfig.dataType.name,
            version: formConfig.dataType.version,
          },
          ...filterDetails(formState),
        },
```

- [ ] **Step 3: Register the builder**

In `user-dataset-upload-config.tsx`, import the builder:

```ts
import { buildRnaSeqRcDataFiles } from '@veupathdb/user-datasets/lib/Service/utils/rnaseq-rc-data-files';
```

Match the import style already used in that file for other `@veupathdb/user-datasets` imports — if it imports from the package root, export `buildRnaSeqRcDataFiles` from `packages/libs/user-datasets/src/lib/Service/utils/index.ts` (or the nearest barrel) and import it from there instead.

Add to `rnaseqRcFormConfigurator`'s returned object:

```ts
    prepareDataFiles: (files, details) =>
      buildRnaSeqRcDataFiles(
        files,
        details.samplesDescription,
        dataType.vdiConfig.allowedFileExtensions
      ),
```

- [ ] **Step 4: Rewrite the help text**

Still in `rnaseqRcFormConfigurator`, replace the `helpText` body. The current text promises a `.zip` archive and a manifest only when two files are given — both now wrong:

```tsx
      helpText: () => (
        <details>
          <summary>
            Instructions to upload your {dataType.vdiConfig.category} dataset
          </summary>
          <div className="formInfo">
            <p>
              Upload your RNA-Seq count data as tab- or comma-delimited files.
              Your original file names are preserved.
            </p>
            <p>
              Provide either a single unstranded count file as Data file 1, or a
              stranded pair: sense as Data file 1 and anti-sense as Data file 2.
            </p>
            <p>
              The Sample Details you enter below are submitted alongside your
              count files for AI annotation. You do not need to prepare any
              additional files.
            </p>
            {textFilesHelp}
          </div>
        </details>
      ),
```

- [ ] **Step 5: Delete the old transformer and its dependency**

```bash
git rm packages/libs/user-datasets/src/lib/Service/utils/rnaseq-rc-file-transformer.ts
cd packages/libs/user-datasets && ~/.volta/bin/yarn remove jszip @types/jszip
```

Then confirm nothing else referenced it:

```bash
cd /home/maccallr/Desktop/EDA/web-monorepo
grep -rn "jszip\|JSZip\|rnaseq-rc-file-transformer" packages/libs packages/sites --include="*.ts" --include="*.tsx" --include="*.json" | grep -v node_modules
```

Expected: no hits outside `yarn.lock`.

- [ ] **Step 6: Type-check and test**

```bash
~/.volta/bin/yarn nx compile:check @veupathdb/genomics-site
cd packages/libs/user-datasets && CI=true ~/.volta/bin/yarn test
```

Expected: both clean.

- [ ] **Step 7: Commit**

```bash
cd /home/maccallr/Desktop/EDA/web-monorepo
git add -A packages/libs yarn.lock
git commit -m "Send rnaseq-rc uploads as separate dataFile parts

VDI already packs multiple dataFile parts into a flat archive
server-side, structurally identical to what JSZip was building in the
browser - so the client-side archive was redundant work that also forced
the upload to be async and put file assembly behind a type sniff in the
controller.

File assembly moves to a prepareDataFiles hook on the form config,
keeping the user-datasets library free of rnaseq-rc knowledge. Drops the
jszip dependency and the rnaseq-rc-to-rnaseq type rewrite on submit."
```

---

## Task 5: Rename the type to `rnaseqrc` and drop the alias

Do this **after** the quadlets branch registering `rnaseqrc:1.0` is merged and deployed to the target dev site. Until then the upload type will not appear in the menu.

**Files:**

- Modify: `packages/libs/web-common/src/user-dataset-upload-config.tsx:34`
- Modify: `packages/libs/user-datasets/src/lib/Common/Configuration/DatasetTypeConfig.ts:86-92`

**Interfaces:**

- Consumes: nothing.
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Confirm the backend actually reports the type**

```bash
curl -s "$VDI_BASE_URL/plugins" | jq -r '.[].dataTypes[] | "\(.name):\(.version)"'
```

Expected: `rnaseqrc:1.0` present. If it is absent, **stop** — completing this task will remove the type from the upload menu. `$VDI_BASE_URL` is the VDI service URL from the target site's `.env`.

- [ ] **Step 2: Rename the frontend type constant**

In `user-dataset-upload-config.tsx` line 34:

```ts
  rnaseqrc: { name: 'rnaseqrc', version: '1.0' },
```

Only the `name` value changes; the object key was already `rnaseqrc`.

- [ ] **Step 3: Remove the alias from type filtering**

In `DatasetTypeConfig.ts`, replace the body of the `filter` callback so it no longer special-cases anything:

```ts
return clientTypes.filter((cdt) => serviceTypes.has(stringifyDataType(cdt)));
```

- [ ] **Step 4: Type-check**

```bash
~/.volta/bin/yarn nx compile:check @veupathdb/genomics-site
```

Expected: no errors.

- [ ] **Step 5: Verify the type still appears in the menu**

Start the dev server and load the user datasets upload page:

```bash
~/.volta/bin/yarn nx start @veupathdb/genomics-site
```

Expected: "RNA-Seq raw counts" is listed as an upload type. Its absence means Step 1's check was wrong or the site is pointed at a backend without the config.

- [ ] **Step 6: Commit**

```bash
git add -A packages/libs
git commit -m "Ask VDI for rnaseqrc, the name it actually registers

The type was built as rnaseq-rc on both the frontend and the wrangler
plugin, but every other registered VDI data type is a single unseparated
lowercase word, so VDI config normalised it. Aligning here lets the
prototype aliasing go: filterAvailableDataTypes can match the service's
reported types directly.

Requires the quadlets config registering rnaseqrc:1.0 to be deployed."
```

---

## Task 6: Form validation

Catches the failures the builder would otherwise throw on, reporting them inline against the right field instead of as a generic submit error.

**Files:**

- Modify: `packages/libs/user-datasets/src/lib/Components/Upload/UploadFormController.tsx:186-212`
- Modify: `.../Common/Forms/Components/Sections/Definition/RootDetailsSection.tsx` (byte counter)

**Interfaces:**

- Consumes: `utf8ByteLength`, `SAMPLE_INFO_MAX_BYTES`, `findDuplicateFileName`, `hasTabInName` from Task 1.
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Extend `validateFormState`**

In `UploadFormController.tsx`, import the helpers from Task 1, then add to `validateFormState` before its `return keyedErrors`. Note the existing key convention — JSON paths like `'$.details.dependencies'`:

```ts
const { samplesDescription } = datasetDetails;

if (
  samplesDescription != null &&
  utf8ByteLength(samplesDescription) > SAMPLE_INFO_MAX_BYTES
) {
  keyedErrors['$.details.samplesDescription'] = [
    `too long: ${utf8ByteLength(
      samplesDescription
    ).toLocaleString()} bytes, maximum ${SAMPLE_INFO_MAX_BYTES.toLocaleString()}`,
  ];
}

const dataFiles = fileUploads.dataFiles ?? [];

const duplicate = findDuplicateFileName(dataFiles);
if (duplicate != null) {
  keyedErrors['$.dataFiles'] = [
    `two data files are both named "${duplicate}" - please rename one`,
  ];
}

const tabbed = hasTabInName(dataFiles);
if (tabbed != null) {
  keyedErrors['$.dataFiles'] = [
    `the file name "${tabbed}" contains a tab character - please rename it`,
  ];
}

// The `accept` attribute is advisory - some file pickers let users override
// it - so re-check here rather than relying on the builder's throw, which
// surfaces as a generic submit error rather than against the field.
const allowed = formConfig.dataType.vdiConfig.allowedFileExtensions;
const badExtension = dataFiles.find(
  (f) =>
    !allowed.some((ext) => f.name.toLowerCase().endsWith(ext.toLowerCase()))
);
if (badExtension != null) {
  keyedErrors['$.dataFiles'] = [
    `"${
      badExtension.name
    }" is not an accepted file type - permitted types are ${allowed.join(
      ', '
    )}`,
  ];
}
```

`validateFormState` currently destructures only `{ datasetDetails }` from its `DatasetFormState` argument — add `fileUploads` to that destructuring. It already receives `formConfig` as its second parameter.

Note these all write to the same `'$.dataFiles'` key, so only the last matching problem shows. That is acceptable for mutually-rare input mistakes; if it proves confusing, accumulate into an array instead.

- [ ] **Step 2: Show a live byte counter**

In `RootDetailsSection.tsx`, import `utf8ByteLength` and `SAMPLE_INFO_MAX_BYTES`, then add directly below the `TextAreaInput` for `samplesDescription`, inside the same conditional block:

```tsx
<div className="column-2" style={{ textAlign: 'right' }}>
  <span
    style={{
      fontSize: '0.9em',
      color:
        utf8ByteLength(datasetDetails.samplesDescription ?? '') >
        SAMPLE_INFO_MAX_BYTES
          ? 'red'
          : '#666',
    }}
  >
    {utf8ByteLength(datasetDetails.samplesDescription ?? '').toLocaleString()} /{' '}
    {SAMPLE_INFO_MAX_BYTES.toLocaleString()} bytes
  </span>
</div>
```

Do **not** add a `maxLength` prop — it truncates a paste silently, which is the failure mode this replaces.

- [ ] **Step 3: Type-check**

```bash
~/.volta/bin/yarn nx compile:check @veupathdb/genomics-site
```

Expected: no errors.

- [ ] **Step 4: Verify by hand in the dev server**

With the dev server running, on the rnaseq-rc upload form:

1. Type in Sample Details — the counter increments and stays grey.
2. Paste over 100,000 bytes — the counter turns red; submitting reports the error against the field rather than uploading.
3. Select the same file for Data file 1 and Data file 2 — submitting reports the duplicate-name error.

- [ ] **Step 5: Commit**

```bash
git add -A packages/libs
git commit -m "Validate sample details size and data file names in the form

Catches the three cases that would otherwise surface badly: an oversized
sample description only failing during async import, and duplicate or
tab-containing file names reaching VDI, where a flat temp directory turns
a name clash into an opaque 500.

Counts UTF-8 bytes via Blob to match the plugin's own nchar(type =
\"bytes\") check - String.length would count UTF-16 code units and
disagree on any non-ASCII text. A visible counter rather than maxLength,
which would silently truncate a pasted methods section."
```

---

## Task 7: End-to-end verification

The acceptance gate. Neither spec proves itself alone: Spec B must have landed in `vdi-plugin-wrangler` for an import to succeed.

**Files:** none.

- [ ] **Step 1: Confirm the backend is ready**

```bash
curl -s "$VDI_BASE_URL/plugins" | jq -r '.[].dataTypes[] | "\(.name):\(.version)"' | grep rnaseqrc
```

Expected: `rnaseqrc:1.0`.

- [ ] **Step 2: Upload an unstranded dataset**

Through the running dev server, with a count file deliberately named nothing like the old fixed stems — e.g. `HTSeq_output_run3.tsv`. Fill in Sample Details and pick a reference genome.

Expected: upload succeeds; the dataset detail page lists **three** files — your original filename unchanged, `sample-info.txt`, and `manifest.tsv`.

- [ ] **Step 3: Confirm the archive contents**

```bash
curl -s -H "Auth-Key: $AUTH_KEY" "$VDI_BASE_URL/vdi-datasets/$DATASET_ID/files/upload" -o /tmp/upload.zip
unzip -l /tmp/upload.zip
unzip -p /tmp/upload.zip manifest.tsv | cat -A | head
```

Expected: a flat archive, no subdirectories; `manifest.tsv` shows `unstranded\t<your filename>` then `sample-info\tsample-info.txt`, with `cat -A` confirming `^I` tab separators and `$` line ends.

- [ ] **Step 4: Upload a stranded pair**

Two differently-named count files.

Expected: four files in the archive; the manifest lists `sense` then `antisense` in the order the inputs were filled.

- [ ] **Step 5: Confirm the import succeeds**

Watch the dataset's import status through to completion.

Expected: success. A failure naming the data type means the Spec B rename has not landed; a failure about unrecognised filenames means Spec B's manifest support has not landed.

- [ ] **Step 6: Try the collision case**

Upload a count file actually named `sample-info.txt`.

Expected: upload succeeds with no error shown; the archive contains the user's `sample-info.txt` plus a generated `sample-info-1.txt`, and the manifest maps `unstranded` to the former and `sample-info` to the latter.

---

## Notes for the implementer

- **Task ordering matters.** Task 2 leaves a deliberate stub in `UploadFormController` that Task 4 replaces; do not skip ahead. Task 5 is gated on a deployment and can be deferred without blocking 6.
- **`packages/libs/user-datasets` had no tests before this work.** The harness needs no configuration — verified — but you are the first user of it in that package, so treat an odd jest error as environmental before assuming your code is wrong.
- If you need to rebuild a library while a dev server is running: `cd packages/libs/<package> && ~/.volta/bin/yarn build-npm-modules`.
