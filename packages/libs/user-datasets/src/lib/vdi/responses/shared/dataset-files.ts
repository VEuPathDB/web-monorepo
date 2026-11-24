import * as io from 'io-ts';

const datasetFileDetails = io.type({
  fileName: io.string,
  fileSize: io.number,
});
export type DatasetFileDetails = io.TypeOf<typeof datasetFileDetails>;

const datasetZipDetails = io.type({
  zipSize: io.number,
  contents: io.readonlyArray(datasetFileDetails),
});

export const datasetFileListing = io.partial({
  upload: datasetZipDetails,
  install: datasetZipDetails,
  documents: io.readonlyArray(datasetFileDetails),
  datasetProperties: io.readonlyArray(datasetFileDetails),
});
export type DatasetFileListing = io.TypeOf<typeof datasetFileListing>;
