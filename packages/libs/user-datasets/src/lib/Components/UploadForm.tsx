import React, {
  FormEvent,
  ReactNode,
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

import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { StrategySummary } from '@veupathdb/wdk-client/lib/Utils/WdkUser';

import { State } from '../StoreModules/UserDatasetUploadStoreModule';
import {
  CompatibleRecordTypes,
  DatasetUploadTypeConfigEntry,
  NewUserDataset,
  ResultUploadConfig,
} from '../Utils/types';

import './UploadForm.scss';

const cx = makeClassNameHelper('UploadForm');

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

type DataUploadMode = 'file' | 'url' | 'strategy' | 'step';

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

  const { useFixedUploadMethod: useFixedUploadMethodStr } = urlParams;

  const useFixedUploadMethod = useMemo(
    () => useFixedUploadMethodStr === 'true',
    [useFixedUploadMethodStr]
  );

  const displayUrlUploadMethod =
    datasetUploadType.formConfig.uploadMethodConfig.url?.offer !== false;

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
      ? 'step'
      : urlParams.datasetStrategyRootStepId && enableStrategyUploadMethod
      ? 'strategy'
      : urlParams.datasetUrl && displayUrlUploadMethod
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

  const uploadMethodItems = [
    {
      value: 'file',
      disabled: useFixedUploadMethod,
      display: (
        <React.Fragment>
          <FieldLabel
            htmlFor="data-set-file"
            required={dataUploadMode === 'file'}
          >
            Upload File
          </FieldLabel>
          <div
            id="data-set-file"
            className={cx(
              '--UploadMethodField',
              dataUploadMode !== 'file' && 'disabled'
            )}
          >
            <FileInput
              required={dataUploadMode === 'file'}
              disabled={dataUploadMode !== 'file' || useFixedUploadMethod}
              onChange={(file) => {
                setFile(file ?? undefined);
              }}
            />
          </div>
        </React.Fragment>
      ),
    },
  ]
    .concat(
      !displayUrlUploadMethod
        ? []
        : [
            {
              value: 'url',
              disabled: useFixedUploadMethod,
              display: (
                <React.Fragment>
                  <FieldLabel
                    htmlFor="data-set-url"
                    required={dataUploadMode === 'url'}
                  >
                    Upload URL
                  </FieldLabel>
                  <TextBox
                    type="input"
                    className={cx(
                      '--UploadMethodField',
                      dataUploadMode !== 'url' && 'disabled'
                    )}
                    id="data-set-url"
                    placeholder="Address of a data file from the Web"
                    value={url}
                    required={dataUploadMode === 'url'}
                    disabled={dataUploadMode !== 'url' || useFixedUploadMethod}
                    onChange={setUrl}
                  />
                </React.Fragment>
              ),
            },
          ]
    )
    .concat(
      !displayStrategyUploadMethod
        ? []
        : [
            {
              value: 'strategy',
              disabled: !enableStrategyUploadMethod || useFixedUploadMethod,
              display: (
                <React.Fragment>
                  <FieldLabel
                    htmlFor="data-set-strategy"
                    required={dataUploadMode === 'strategy'}
                  >
                    Upload Strategy
                  </FieldLabel>
                  <div
                    id="data-set-strategy"
                    className={cx(
                      '--UploadMethodField',
                      dataUploadMode !== 'strategy' && 'disabled'
                    )}
                  >
                    <SingleSelect
                      value={`${stepId}`}
                      items={strategyOptions.map((option) => ({
                        value: `${option.rootStepId}`,
                        display: `${option.name}${!option.isSaved ? '*' : ''}`,
                      }))}
                      required={dataUploadMode === 'strategy'}
                      onChange={(value) => {
                        setStepId(Number(value));
                      }}
                    />
                  </div>
                </React.Fragment>
              ),
            },
          ]
    );

  const summaryRequired = datasetUploadType.formConfig.summary?.required;
  const descriptionRequired =
    datasetUploadType.formConfig.description?.required;

  return (
    <form
      className={cx()}
      style={submitting ? { opacity: '0.5' } : {}}
      onSubmit={onSubmit}
    >
      {errorMessages.length > 0 && <ErrorMessage errors={errorMessages} />}
      <div>
        <h2>{datasetUploadType.uploadTitle}</h2>
        <div className="formSection">
          <FieldLabel htmlFor="data-set-name">Name</FieldLabel>
          <br />
          <TextBox
            type="input"
            id="data-set-name"
            required
            placeholder="name of the data set"
            value={name}
            onChange={setName}
          />
        </div>
        <div className="formSection">
          <FieldLabel htmlFor="data-set-summary" required={summaryRequired}>
            Summary
          </FieldLabel>
          <TextBox
            type="input"
            id="data-set-summary"
            required={summaryRequired}
            placeholder="brief summary of the data set contents"
            value={summary}
            onChange={setSummary}
          />
        </div>
        <div className="formSection">
          <FieldLabel
            htmlFor="data-set-description"
            required={descriptionRequired}
          >
            Description
          </FieldLabel>
          <TextArea
            id="data-set-description"
            required={descriptionRequired}
            placeholder="brief description of the data set contents"
            value={description}
            onChange={setDescription}
          />
        </div>
        {
          <div className="formSection">
            {uploadMethodItems.length === 1 ? (
              <div className={cx('--UploadMethodSelector')}>
                <div className={cx('--FixedUploadItem')}>
                  {uploadMethodItems[0].display}
                </div>
              </div>
            ) : (
              <RadioList
                name="data-set-radio"
                className={cx('--UploadMethodSelector')}
                value={dataUploadMode}
                onChange={(value) => {
                  if (
                    value !== 'url' &&
                    value !== 'file' &&
                    value !== 'strategy'
                  ) {
                    throw new Error(
                      `Unrecognized upload method '${value}' encountered.`
                    );
                  }

                  setDataUploadMode(value);
                }}
                items={uploadMethodItems}
              />
            )}
          </div>
        }
      </div>
      <button type="submit" className="btn" disabled={submitting}>
        Upload Data Set
      </button>
      {datasetUploadType.formConfig?.renderInfo?.()}
    </form>
  );
}

interface FieldLabelProps
  extends React.DetailedHTMLProps<
    React.LabelHTMLAttributes<HTMLLabelElement>,
    HTMLLabelElement
  > {
  children: ReactNode;
  required?: boolean;
}

function FieldLabel({
  children,
  required = true,
  ...labelProps
}: FieldLabelProps) {
  return (
    <label {...labelProps}>
      {children}
      {required ? '*' : null}
    </label>
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
