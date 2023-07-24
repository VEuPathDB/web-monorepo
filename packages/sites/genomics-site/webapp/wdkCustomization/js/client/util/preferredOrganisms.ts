import { RecordInstance } from '@veupathdb/wdk-client/lib/Utils/WdkModel';

const ORGANISM_RECORD_CLASS_NAME = 'OrganismRecordClasses.OrganismRecordClass';
const ORGANISM_NAME_ATTR = 'organism_name';

const DATASET_RECORD_CLASS_NAME = 'DatasetRecordClasses.DatasetRecordClass';
const VERSION_TABLE = 'Version';
const ORGANISM_COLUMN = 'organism';

export function isPreferredOrganism(
  organismRecord: RecordInstance,
  preferredOrganisms: Set<string>
) {
  const nameAttribute = organismRecord.attributes[ORGANISM_NAME_ATTR];

  if (typeof nameAttribute !== 'string') {
    if (organismRecord.recordClassName === ORGANISM_RECORD_CLASS_NAME) {
      throw new Error(
        `Expected '${ORGANISM_NAME_ATTR}' string attribute for organism record ${JSON.stringify(
          organismRecord.id
        )}`
      );
    }

    return false;
  }

  return preferredOrganisms.has(nameAttribute);
}

export function isPreferredDataset(
  datasetRecord: RecordInstance,
  preferredOrganisms: Set<string>
) {
  const versionTable = datasetRecord.tables[VERSION_TABLE];

  if (versionTable == null) {
    if (datasetRecord.recordClassName === DATASET_RECORD_CLASS_NAME) {
      throw new Error(
        `Failed to resolve expected '${VERSION_TABLE}' table for dataset record ${JSON.stringify(
          datasetRecord.id
        )}`
      );
    }

    return false;
  }

  // Treat datasets with an empty Version table as being "preferred,"
  // as they are presumed to be applicable to all organisms
  if (versionTable.length === 0) {
    return true;
  }

  return versionTable.some(({ [ORGANISM_COLUMN]: organism }) => {
    if (typeof organism !== 'string') {
      throw new Error(
        `Expected the '${VERSION_TABLE}' table to have a string-valued '${ORGANISM_COLUMN}' column`
      );
    }

    return preferredOrganisms.has(organism) || organism === 'ALL';
  });
}
