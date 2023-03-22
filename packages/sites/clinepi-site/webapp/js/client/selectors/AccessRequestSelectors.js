import { get } from 'lodash';

import AccessRequestTextArea from '../controllers/AccessRequestTextArea';
import AccessRequestTextField from '../controllers/AccessRequestTextField';

export const formValues = ({ formValues }) => formValues;

export const userId = ({ userId }) => userId;

export const loaded = ({ study }) => !!study; 
export const datasetId = ({ study }) => get(
  study,
  'attributes.dataset_id',
  ''
);
export const studyName = ({ study }) => get(
  study,
  'attributes.display_name'
);
export const requestNeedsApproval = ({ study }) => get(
  study,
  'attributes.request_needs_approval'
);
export const downloadLink = ({ study }) => get(
  study,
  'attributes.bulk_download_url.url'
);
export const labels = ({ study }) => {
  const profileLabels = {
    'request_date': 'Date of Request',
    'requester_name': 'Your Name',
    'requester_email': 'Your Email Address',
    'organization': 'Your Organization'
  };

  const inputLabels = JSON.parse(
    get(
      study,
      'attributes.request_access_fields',
      '{}'
    )
  );

  return {
    ...profileLabels,
    ...inputLabels
  };
};

export const notFound = ({ loadingError }) => !!loadingError;

export const disableSubmit = ({ submitting }) => submitting;

export const successfullySubmitted = ({ successfullySubmitted }) => successfullySubmitted;

export const submissionError = ({ submissionError }) => submissionError;

export const alreadyRequested = ({ alreadyRequested }) => alreadyRequested;

export const title = state => `Data Access Request for ${studyName(state)}`;

export const fieldElements = state => {
  const labelMap = labels(state);

  return [
    { key: 'request_date', FieldComponent: AccessRequestTextField },
    { key: 'requester_name', FieldComponent: AccessRequestTextField },
    { key: 'requester_email', FieldComponent: AccessRequestTextField },
    { key: 'organization', FieldComponent: AccessRequestTextField },
    { key: 'purpose', FieldComponent: AccessRequestTextArea, onChangeKey: 'onChangePurpose' },
    { key: 'prior_auth', FieldComponent: AccessRequestTextArea, onChangeKey: 'onChangePriorAuth' },
    { key: 'research_question', FieldComponent: AccessRequestTextArea, onChangeKey: 'onChangeResearchQuestion' },
    { key: 'analysis_plan', FieldComponent: AccessRequestTextArea, onChangeKey: 'onChangeAnalysisPlan' },
    { key: 'dissemination_plan', FieldComponent: AccessRequestTextArea, onChangeKey: 'onChangeDisseminationPlan' }
  ].reduce(
    (memo, field) => labelMap[field.key] 
      ? [
          ...memo, 
          { ...field, label: `${labelMap[field.key]}:` } 
        ] 
      : memo,
    []
  );
};
