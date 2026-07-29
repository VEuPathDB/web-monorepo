import JSZip from 'jszip';

/**
 * Transforms an RNAseq-RC upload file into a .zip containing:
 * - The user's data file (.tsv or .tab)
 * - A SamplesDescrip.txt file created from the provided description
 *
 * @param file - User's uploaded file (.tsv, .tab, or .zip)
 * @param samplesDescription - Text content for SamplesDescrip.txt (optional)
 * @returns A .zip File containing the data file and SamplesDescrip.txt
 */
export async function transformRnaSeqRcUpload(
  file: File,
  samplesDescription?: string
): Promise<File> {
  const zip = new JSZip();
  const fileName = file.name.toLowerCase();

  // Check if user uploaded a .zip file
  if (fileName.endsWith('.zip')) {
    // Load the existing zip
    const existingZip = await JSZip.loadAsync(file);

    // Copy all files except SamplesDescrip.txt
    const copyPromises: Promise<void>[] = [];
    existingZip.forEach((relativePath: string, zipEntry: JSZip.JSZipObject) => {
      if (relativePath !== 'SamplesDescrip.txt' && !zipEntry.dir) {
        copyPromises.push(
          zipEntry.async('blob').then((blob: Blob) => {
            zip.file(relativePath, blob);
          })
        );
      }
    });
    await Promise.all(copyPromises);

    // Add SamplesDescrip.txt if description provided
    if (samplesDescription) {
      const samplesDescripBlob = new Blob([samplesDescription], {
        type: 'text/plain',
      });
      zip.file('SamplesDescrip.txt', samplesDescripBlob);
    } else {
      // Keep existing SamplesDescrip.txt if present and no new description
      const existingSamplesDescrip = existingZip.file('SamplesDescrip.txt');
      if (existingSamplesDescrip) {
        const blob = await existingSamplesDescrip.async('blob');
        zip.file('SamplesDescrip.txt', blob);
      }
    }
  } else if (fileName.endsWith('.tsv') || fileName.endsWith('.tab')) {
    // User uploaded a plain .tsv or .tab file
    // Add the data file to the zip
    zip.file(file.name, file);

    // Create and add SamplesDescrip.txt
    const samplesDescripContent = samplesDescription || '';
    const samplesDescripBlob = new Blob([samplesDescripContent], {
      type: 'text/plain',
    });
    zip.file('SamplesDescrip.txt', samplesDescripBlob);
  } else {
    throw new Error(
      `Unsupported file type: ${file.name}. Please upload a .tsv, .tab, or .zip file.`
    );
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
