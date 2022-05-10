import React, {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { keyBy } from 'lodash';

import Icon from '@veupathdb/wdk-client/lib/Components/Icon/IconAlt';
import {
  TextBox,
  TextArea,
  FileInput,
  RadioList,
  SingleSelect,
} from '@veupathdb/wdk-client/lib/Components';

import { StrategySummary } from '@veupathdb/wdk-client/lib/Utils/WdkUser';

import { State } from '../StoreModules/UserDatasetUploadStoreModule';
import {
  CompatibleRecordTypes,
  DatasetUploadTypeConfigEntry,
  NewUserDataset,
  ResultUploadConfig,
} from '../Utils/types';

import './UploadForm.scss';

interface Props<T extends string = string> {
  baseUrl: string;
  datasetUploadType: DatasetUploadTypeConfigEntry<T>;
  projectId: string;
  badUploadMessage: State['badUploadMessage'];
  urlParams: Record<string, string>;
  strategyOptions: StrategySummary[];
  resultUploadConfig?: ResultUploadConfig;
  clearBadUpload: () => void;
  submitForm: (newUserDataset: FormSubmission, redirectTo?: string) => void;
}

type DataUploadMode = 'file' | 'url' | 'result';

type DataUploadSelection =
  | { type: 'file'; file?: File }
  | { type: 'url'; url?: string }
  | {
      type: 'result';
      stepId?: number;
      compatibleRecordTypes?: CompatibleRecordTypes;
    };

type CompleteDataUploadSelection = Required<DataUploadSelection>;

interface FormContent {
  name: string;
  summary: string;
  description: string;
  dataUploadSelection: DataUploadSelection;
}

export type FormValidation = InvalidForm | ValidForm;

export interface InvalidForm {
  valid: false;
  errors: string[];
}

export interface ValidForm {
  valid: true;
  submission: FormSubmission;
}

export interface FormSubmission extends Omit<NewUserDataset, 'uploadMethod'> {
  dataUploadSelection: CompleteDataUploadSelection;
}

function UploadForm({
  badUploadMessage,
  baseUrl,
  datasetUploadType,
  projectId,
  urlParams,
  strategyOptions,
  resultUploadConfig,
  clearBadUpload,
  submitForm,
}: Props) {
  const strategyOptionsByStrategyId = useMemo(
    () => keyBy(strategyOptions, (option) => option.strategyId),
    [strategyOptions]
  );

  const { useFixedUploadMethod } = urlParams;

  const displayStrategyUploadMethod =
    datasetUploadType.formConfig.uploadMethodConfig.result?.offerStrategyUpload;

  const enableStrategyUploadMethod =
    Boolean(displayStrategyUploadMethod) && strategyOptions.length > 0;

  const [name, setName] = useState(urlParams.datasetName ?? '');
  const [summary, setSummary] = useState(urlParams.datasetSummary ?? '');
  const [description, setDescription] = useState(
    urlParams.datasetDescription ?? ''
  );

  const [dataUploadMode, setDataUploadMode] = useState<DataUploadMode>(
    urlParams.datasetStepId
      ? 'result'
      : urlParams.datasetStrategyRootStepId && enableStrategyUploadMethod
      ? 'result'
      : urlParams.datasetUrl
      ? 'url'
      : 'file'
  );
  const [file, setFile] = useState<File>();
  const [url, setUrl] = useState(urlParams.datasetUrl ?? '');
  const initialStepId = useMemo(() => {
    const parsedStepIdParam = Number(urlParams.datasetStepId);

    if (isFinite(parsedStepIdParam)) {
      return parsedStepIdParam;
    }

    const parsedStrategyIdParam = Number(urlParams.datasetStrategyId);

    return !enableStrategyUploadMethod || !isFinite(parsedStrategyIdParam)
      ? strategyOptions[0]?.rootStepId
      : strategyOptionsByStrategyId[parsedStrategyIdParam]?.rootStepId;
  }, [
    urlParams.datasetStepId,
    urlParams.datasetStrategyId,
    strategyOptions,
    strategyOptionsByStrategyId,
    enableStrategyUploadMethod,
  ]);
  const [stepId, setStepId] = useState(initialStepId);

  useEffect(() => {
    setStepId(initialStepId);
  }, [initialStepId]);

  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const dataUploadSelection = useMemo((): DataUploadSelection => {
    if (dataUploadMode === 'file') {
      return { type: 'file', file };
    }

    if (dataUploadMode === 'url') {
      return { type: 'url', url };
    }

    if (resultUploadConfig == null) {
      throw new Error('This data set type does not support result uploads.');
    }

    if (stepId == null) {
      return { type: 'result' };
    }

    return {
      type: 'result',
      stepId,
      compatibleRecordTypes: resultUploadConfig.compatibleRecordTypes,
    };
  }, [dataUploadMode, file, url, resultUploadConfig, stepId]);

  const onSubmit = useCallback(
    (event: FormEvent) => {
      event.preventDefault();

      const formValidation = validateForm(
        projectId,
        datasetUploadType,
        enableStrategyUploadMethod,
        {
          name,
          summary,
          description,
          dataUploadSelection,
        }
      );

      if (!formValidation.valid) {
        setErrorMessages(formValidation.errors);
      } else {
        setSubmitting(true);
        submitForm(formValidation.submission, `${baseUrl}/recent`);
      }
    },
    [
      baseUrl,
      projectId,
      datasetUploadType,
      enableStrategyUploadMethod,
      name,
      summary,
      description,
      dataUploadSelection,
      submitForm,
    ]
  );

  useEffect(() => {
    if (badUploadMessage != null) {
      setErrorMessages([badUploadMessage.message]);
      setSubmitting(false);
    }
  }, [badUploadMessage]);

  useEffect(() => {
    return () => {
      clearBadUpload();
    };
  }, [clearBadUpload]);

  return (
    <form
      className="UploadForm"
      style={submitting ? { opacity: '0.5' } : {}}
      onSubmit={onSubmit}
    >
      {errorMessages.length > 0 && <ErrorMessage errors={errorMessages} />}
      <div>
        <h2>{datasetUploadType.uploadTitle}</h2>
        <div className="formSection">
          <label htmlFor="data-set-name">
            Name<sup className="supAsterisk">*</sup>:<br />
          </label>
          <TextBox
            type="input"
            id="data-set-name"
            required={true}
            placeholder="name of the data set"
            value={name}
            onChange={setName}
          />
        </div>
        <div className="formSection">
          <label htmlFor="data-set-summary">
            Summary<sup className="supAsterisk">*</sup>:<br />
          </label>
          <TextBox
            type="input"
            id="data-set-summary"
            required={true}
            placeholder="brief summary of the data set contents"
            value={summary}
            onChange={setSummary}
          />
        </div>
        <div className="formSection">
          <label htmlFor="data-set-description">
            Description<sup className="supAsterisk">*</sup>:<br />
          </label>
          <TextArea
            id="data-set-description"
            required={true}
            placeholder="brief description of the data set contents"
            value={description}
            onChange={setDescription}
          />
        </div>
        {!useFixedUploadMethod && (
          <div className="formSection" style={{ minHeight: '8em' }}>
            <RadioList
              name="data-set-radio"
              value={dataUploadMode}
              onChange={(value) => {
                if (value !== 'url' && value !== 'file' && value !== 'result') {
                  throw new Error(
                    `Unrecognized upload method '${value}' encountered.`
                  );
                }

                setDataUploadMode(value);
              }}
              items={[
                {
                  value: 'file',
                  disabled: false,
                  display: (
                    <React.Fragment>
                      <label htmlFor="data-set-file">
                        {dataUploadMode === 'file' ? (
                          <React.Fragment>
                            Data File<sup className="supAsterisk">*</sup>:
                          </React.Fragment>
                        ) : (
                          'Data File'
                        )}
                        <br />
                      </label>
                      {dataUploadMode === 'file' && (
                        <FileInput
                          id="data-set-file"
                          onChange={(file) => {
                            setFile(file ?? undefined);
                          }}
                        />
                      )}
                    </React.Fragment>
                  ),
                },
                {
                  value: 'url',
                  disabled: false,
                  display: (
                    <React.Fragment>
                      <label htmlFor="data-set-url">
                        {dataUploadMode === 'url' ? (
                          <React.Fragment>
                            Data URL<sup className="supAsterisk">*</sup>:
                          </React.Fragment>
                        ) : (
                          'Data URL'
                        )}
                        <br />
                      </label>
                      {dataUploadMode === 'url' && (
                        <TextBox
                          type="input"
                          id="data-set-url"
                          placeholder="Address of a data file from the Web"
                          value={url}
                          onChange={setUrl}
                        />
                      )}
                    </React.Fragment>
                  ),
                },
              ].concat(
                !displayStrategyUploadMethod
                  ? []
                  : [
                      {
                        value: 'result',
                        disabled: !displayStrategyUploadMethod,
                        display: (
                          <React.Fragment>
                            <label htmlFor="data-set-url">
                              {dataUploadMode === 'result' ? (
                                <React.Fragment>
                                  Strategy<sup className="supAsterisk">*</sup>:
                                </React.Fragment>
                              ) : (
                                'Strategy'
                              )}
                              <br />
                            </label>
                            {dataUploadMode === 'result' && (
                              <SingleSelect
                                value={`${stepId}`}
                                items={strategyOptions.map((option) => ({
                                  value: `${option.rootStepId}`,
                                  display: `${option.name}${
                                    !option.isSaved ? '*' : ''
                                  }`,
                                }))}
                                onChange={(value) => {
                                  setStepId(Number(value));
                                }}
                              />
                            )}
                          </React.Fragment>
                        ),
                      },
                    ]
              )}
            />
          </div>
        )}
      </div>
      <button type="submit" className="btn" disabled={submitting}>
        Upload Data Set
      </button>
      {datasetUploadType.formConfig.renderInfo()}
    </form>
  );
}

function ErrorMessage({ errors }: { errors: string[] }) {
  return (
    <div className="ui-state-error" style={{ fontSize: 'large' }}>
      <div>
        <Icon fa="exclamation-triangle" />
        &nbsp; Could not upload data set
      </div>
      {errors.map((error, ix) => (
        <div key={ix} className="ui-state-error-text">
          {error}
        </div>
      ))}
    </div>
  );
}

function validateForm<T extends string = string>(
  projectId: string,
  datasetUploadType: DatasetUploadTypeConfigEntry<T>,
  enableResultUploadMethod: boolean,
  formContent: FormContent
): FormValidation {
  const { name, summary, description, dataUploadSelection } = formContent;

  if (!isCompleteDataUploadSelection(dataUploadSelection)) {
    return {
      valid: false,
      errors: !enableResultUploadMethod
        ? ['Required: data file or URL']
        : ['Required: data file, URL, or strategy'],
    };
  }

  if (
    dataUploadSelection.type === 'url' &&
    !isValidUrl(dataUploadSelection.url)
  ) {
    return {
      valid: false,
      errors: ['The provided data URL does not seem valid'],
    };
  }

  return {
    valid: true,
    submission: {
      name,
      summary,
      description,
      datasetType: datasetUploadType.type,
      projects: [projectId],
      dataUploadSelection,
    },
  };
}

function isCompleteDataUploadSelection(
  dataUploadSelection: DataUploadSelection
): dataUploadSelection is CompleteDataUploadSelection {
  return Object.values(dataUploadSelection).every((value) => value != null);
}

// https://stackoverflow.com/a/43467144
function isValidUrl(string: string) {
  try {
    new URL(string);
  } catch (_) {
    return false;
  }
  return true;
}

export default UploadForm;
