// Miscellaneous utility types/functions for Dataset Params
export type DatasetItem = (string | null)[];

export const datasetItemToString = (datasetItem: DatasetItem) =>
  datasetItem.filter(id => id !== null).join('______');
  