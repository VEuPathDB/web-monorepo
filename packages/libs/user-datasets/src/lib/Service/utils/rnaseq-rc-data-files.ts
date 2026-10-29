/**
 * Builds the file set for an rnaseq-rc upload.
 *
 * Files are sent to VDI as separate `dataFile` multipart parts; VDI packs them
 * into a flat archive server-side. See
 * docs/superpowers/specs/2026-07-30-rnaseq-rc-upload-contract.md.
 */

import { newUploadContent, TextUploadContent, UploadContent } from '../Model';
import { ifNotEmpty, takeIf } from '../../Utils/ergonomics';
import { ifDefined, Possible } from '../../Utils';
import { omit } from 'lodash';
import { FIELD_NAME_DATA_FILE, FIELD_NAME_SAMPLE_INFO } from '../../Common/Forms/form-constants';
import { getSamplesDescription, UploadContentMap } from '../Model/utility-types';

/** Cap on sample-info size, mirroring the wrangler plugin's own check. */
export const SAMPLE_INFO_MAX_BYTES = 100000;

const SAMPLE_INFO_NAME = 'sample-info.txt';

export const SAMPLE_INFO_FIELD_NAME = FIELD_NAME_SAMPLE_INFO.toString();

/**
 * Reserved name of the generated manifest file. Exported because callers
 * outside this module (form validation) need to reject a user file that
 * collides with it - see `findManifestNameCollision`.
 */
export const MANIFEST_NAME = 'manifest.tsv';

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

/**
 * First basename appearing more than once, or undefined.
 *
 * Case-insensitive: the downstream plugin locates files by name
 * case-insensitively, so `Counts.tsv` and `counts.tsv` collide even though
 * they differ as strings.
 */
export function findDuplicateFileName(
  files: readonly File[]
): string | undefined {
  const seen = new Set<string>();

  for (const file of files) {
    const key = file.name.toLowerCase();
    if (seen.has(key)) return file.name;
    seen.add(key);
  }

  return undefined;
}

export function buildRnaSeqRcDataFiles(
  dataFiles: UploadContentMap,
): UploadContentMap {
  const inputFiles = Object.values<UploadContent[]>(omit(dataFiles, SAMPLE_INFO_FIELD_NAME)).flat(2);

  if (inputFiles.length < 1)
    throw new Error('Please provide at least one count file.');

  if (inputFiles.length > 2)
    throw new Error('Please provide at most two count files: a sense/antisense pair, or a single unstranded file.');

  // sample-info.txt's generated name yields to the user's, since the
  // manifest carries the name-to-role mapping and nothing requires a
  // generated file to keep its preferred name. Reserve it before writing the
  // manifest so its contents and the archive agree. Comparisons are
  // case-insensitive to match how the downstream plugin locates files.
  const taken = new Set(inputFiles.map((f) => f.name.toLowerCase()));

  const sampleInfoName = deCollide(SAMPLE_INFO_NAME, taken);
  taken.add(sampleInfoName.toLowerCase());

  const roles = inputFiles.length === 2 ? ['sense', 'antisense'] : ['unstranded'];

  const manifestLines = [
    ...inputFiles.map((file, i) => `${roles[i]}\t${file.name}`),
    `sample-info\t${sampleInfoName}`,
  ];

  const samplesDescription = getSamplesDescription(dataFiles)?.value ?? '';

  return {
    ...dataFiles,
    // Replace any existing entry for the samples description part with the new
    // entry and corrected name.
    [SAMPLE_INFO_FIELD_NAME]: [
      newUploadContent(samplesDescription, sampleInfoName, 'text/plain')
    ],
    [FIELD_NAME_DATA_FILE.toString()]: [
      newUploadContent(
        // Trailing newline: the manifest is a line-oriented file and R's
        // readLines warns on an unterminated final line.
        manifestLines.join('\n') + '\n',
        MANIFEST_NAME,
        'text/plain',
      )
    ],
  };
}

/**
 * Returns `desired`, or `<stem>-<n><ext>` for the lowest n making it unused.
 *
 * `taken` is expected to hold lowercased names; the comparison here is
 * case-insensitive to match how the downstream plugin locates files.
 */
function deCollide(desired: string, taken: ReadonlySet<string>): string {
  if (!taken.has(desired.toLowerCase())) return desired;

  const dot = desired.lastIndexOf('.');
  const stem = dot < 0 ? desired : desired.slice(0, dot);
  const ext = dot < 0 ? '' : desired.slice(dot);

  for (let i = 1; ; i++) {
    const candidate = `${stem}-${i}${ext}`;
    if (!taken.has(candidate.toLowerCase())) return candidate;
  }
}
