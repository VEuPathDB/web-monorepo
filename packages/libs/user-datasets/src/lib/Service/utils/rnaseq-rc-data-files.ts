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

/**
 * First filename containing a tab, or undefined.
 *
 * Tabs are legal in POSIX filenames and would break the manifest's
 * tab-separated parse. In practice they cannot reach here: `sanitizeFileName`
 * runs at the input boundary and its `/\s+/g` already replaces tabs with
 * underscores. This check is defence-in-depth against a caller that bypasses
 * that boundary, not a condition this code expects to see triggered.
 */
export function hasTabInName(files: readonly File[]): string | undefined {
  return files.find((f) => f.name.includes('\t'))?.name;
}

/**
 * Name of a user file that collides with the manifest's own reserved name
 * (case-insensitively), or undefined.
 *
 * Unlike `sample-info.txt`, the manifest's generated name must never yield to
 * a user file: nothing in the manifest records the manifest's own filename,
 * so the plugin can only find it by the literal name `manifest.tsv`. Form
 * validation uses this to reject such a file before `buildRnaSeqRcDataFiles`
 * ever runs; the check inside `buildRnaSeqRcDataFiles` itself is
 * defence-in-depth for a caller that skips that validation.
 */
export function findManifestNameCollision(
  files: readonly File[]
): string | undefined {
  return files.find((f) => f.name.toLowerCase() === MANIFEST_NAME.toLowerCase())
    ?.name;
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

  // The manifest's name must never yield: nothing records it, so the plugin
  // can only find it by the literal name `manifest.tsv`. Form validation
  // should already have rejected this before calling in; this is
  // defence-in-depth against a caller that skips that validation.
  const manifestCollision = findManifestNameCollision(dataFiles);
  if (manifestCollision != null)
    throw new Error(
      `"${manifestCollision}" is a reserved name (used internally for the ` +
        `manifest) - please rename your file.`
    );

  // sample-info.txt's generated name yields to the user's, since the
  // manifest carries the name-to-role mapping and nothing requires a
  // generated file to keep its preferred name. Reserve it before writing the
  // manifest so its contents and the archive agree. Comparisons are
  // case-insensitive to match how the downstream plugin locates files.
  const taken = new Set(dataFiles.map((f) => f.name.toLowerCase()));

  const sampleInfoName = deCollide(SAMPLE_INFO_NAME, taken);
  taken.add(sampleInfoName.toLowerCase());

  const manifestName = MANIFEST_NAME;

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

/**
 * True if `name` ends with one of `allowedExtensions`, case-insensitively.
 *
 * Exported so callers checking the same thing (form validation) share this
 * logic rather than keeping a second, independently-maintained copy that
 * could drift from this one.
 */
export function hasAllowedExtension(
  name: string,
  allowedExtensions: readonly string[]
): boolean {
  const lower = name.toLowerCase();
  return allowedExtensions.some((ext) => lower.endsWith(ext.toLowerCase()));
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
