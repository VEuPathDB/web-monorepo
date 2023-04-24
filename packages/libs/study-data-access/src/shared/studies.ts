import { WdkService } from '@veupathdb/wdk-client/lib/Core';
import { RecordInstance } from '@veupathdb/wdk-client/lib/Utils/WdkModel';

export type Study = RecordInstance;

const attributeNames = {
  DISPLAY_NAME: 'display_name',
  DATASET_ID: 'dataset_id',
  EMAIL: 'email',
  BULK_DOWNLOAD_URL: 'bulk_download_url',
  POLICY_URL: 'policy_url',
  REQUEST_NEEDS_APPROVAL: 'request_needs_approval',
  STUDY_ACCESS: 'study_access',
};

export async function fetchStudies(wdkService: WdkService) {
  const datasetRecordClass = await wdkService.findRecordClass('dataset');

  const requiredAttributes = [
    attributeNames.DISPLAY_NAME,
    attributeNames.DATASET_ID,
    attributeNames.EMAIL,
  ];

  const optionalAttributes = [
    attributeNames.BULK_DOWNLOAD_URL,
    attributeNames.POLICY_URL,
    attributeNames.REQUEST_NEEDS_APPROVAL,
    attributeNames.STUDY_ACCESS,
  ];

  const attributes = requiredAttributes.concat(
    optionalAttributes.filter(
      (attr) => attr in datasetRecordClass.attributesMap
    )
  );

  return await wdkService.getAnswerJson(
    {
      searchName: 'AllDatasets',
      searchConfig: { parameters: {} },
    },
    {
      attributes,
      tables: [],
    }
  );
}

export function getStudyId(record: RecordInstance) {
  return getStringAttributeValue(record, attributeNames.DATASET_ID);
}

export function getStudyName(record: RecordInstance) {
  return getStringAttributeValue(record, attributeNames.DISPLAY_NAME);
}

export function getStudyAccess(record: RecordInstance) {
  return getStringAttributeValue(
    record,
    attributeNames.STUDY_ACCESS
  )?.toLowerCase();
}

export function getStudyEmail(record: RecordInstance) {
  return getStringAttributeValue(record, attributeNames.EMAIL);
}

export function getStudyPolicyUrl(record: RecordInstance) {
  return getStringAttributeValue(record, attributeNames.POLICY_URL);
}

export function getStudyRequestNeedsApproval(record: RecordInstance) {
  return getStringAttributeValue(record, attributeNames.REQUEST_NEEDS_APPROVAL);
}

function getStringAttributeValue(
  record: RecordInstance,
  attributeName: string
) {
  const attributeValue = record.attributes[attributeName];
  if (typeof attributeValue === 'string') return attributeValue;
  return null;
}
