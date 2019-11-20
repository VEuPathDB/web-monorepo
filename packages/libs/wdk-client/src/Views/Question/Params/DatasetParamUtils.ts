// Miscellaneous utility types/functions for Dataset Params
export type DatasetItem = (string | null)[];

export const datasetItemToString = (datasetItem: DatasetItem) =>
  datasetItem.filter(id => id !== null).join('______');

export const idListToArray = (idList = '') =>
  idList.split(/[;,\s]+/g).filter(id => id.length > 0);
