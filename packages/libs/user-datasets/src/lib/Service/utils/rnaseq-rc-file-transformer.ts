import JSZip from 'jszip';

/**
 * Transforms an RNAseq-RC upload file into a .zip containing:
 * - The user's data file (.tsv, .tab, or .txt)
 * - A sample-info.txt file created from the provided description
 * - Optionally, an antisense data file
 * - A stranded-manifest.txt file (only if antisense file is provided)
 *
 * @param file - User's uploaded sense/unstranded file (.tsv, .tab, or .txt)
 * @param samplesDescription - Text content for sample-info.txt (optional)
 * @param antisenseFile - Optional antisense data file (.tsv, .tab, or .txt)
 * @returns A .zip File containing the data file(s), sample-info.txt, and optionally stranded-manifest.txt
 */
export async function transformRnaSeqRcUpload(
  file: File,
  samplesDescription?: string,
  antisenseFile?: File
): Promise<File> {
  const zip = new JSZip();
  const fileName = file.name.toLowerCase();

  // User uploaded a plain .tsv, .tab, or .txt file
  if (
    fileName.endsWith('.tsv') ||
    fileName.endsWith('.tab') ||
    fileName.endsWith('.txt')
  ) {
    // Add the data file to the zip
    zip.file(file.name, file);

    // Create and add sample-info.txt
    const sampleInfoContent = samplesDescription || '';
    const sampleInfoBlob = new Blob([sampleInfoContent], {
      type: 'text/plain',
    });
    zip.file('sample-info.txt', sampleInfoBlob);

    // Generate stranded-manifest.txt only if antisense file is provided
    if (antisenseFile) {
      let manifestContent = `${file.name}\tsense\n`;
      manifestContent += `${antisenseFile.name}\tantisense\n`;

      const manifestBlob = new Blob([manifestContent], {
        type: 'text/plain',
      });
      zip.file('stranded-manifest.txt', manifestBlob);
    }
  } else {
    throw new Error(
      `Unsupported file type: ${file.name}. Please upload a .tsv, .tab, or .txt file.`
    );
  }

  // Add antisense file if provided
  if (antisenseFile) {
    const antisenseFileName = antisenseFile.name.toLowerCase();
    if (
      antisenseFileName.endsWith('.tsv') ||
      antisenseFileName.endsWith('.tab') ||
      antisenseFileName.endsWith('.txt')
    ) {
      // Add antisense file without renaming
      zip.file(antisenseFile.name, antisenseFile);
    } else {
      throw new Error(
        `Unsupported antisense file type: ${antisenseFile.name}. Please upload a .tsv, .tab, or .txt file.`
      );
    }
  }

  // Generate the final zip file
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const zipFileName = file.name.endsWith('.zip')
    ? file.name
    : file.name.replace(/\.(tsv|tab)$/i, '.zip');

  // DEBUG: Log what files are in the zip
  const fileList: string[] = [];
  zip.forEach((relativePath: string, zipEntry: JSZip.JSZipObject) => {
    fileList.push(relativePath);
  });
  console.log('Final zip contents:', fileList);
  console.log('Final zip size:', zipBlob.size);

  return new File([zipBlob], zipFileName, { type: 'application/zip' });
}
