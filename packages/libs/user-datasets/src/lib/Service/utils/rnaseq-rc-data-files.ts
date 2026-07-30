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
