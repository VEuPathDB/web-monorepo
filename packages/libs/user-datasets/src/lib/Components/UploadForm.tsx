import React, {
  FormEvent,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { Link } from 'react-router-dom';

import { keyBy } from 'lodash';

import {
  TextBox,
  TextArea,
  FileInput,
  RadioList,
  SingleSelect,
  Loading,
} from '@veupathdb/wdk-client/lib/Components';

import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { StrategySummary } from '@veupathdb/wdk-client/lib/Utils/WdkUser';

import { State } from '../StoreModules/UserDatasetUploadStoreModule';
import {
  CompatibleRecordTypes,
  DatasetUploadTypeConfigEntry,
  NewUserDataset,
  ResultUploadConfig,
  UserDataset,
  UserDatasetContact,
  UserDatasetHyperlink,
  UserDatasetPublication,
} from '../Utils/types';

import { FloatingButton, Modal } from '@veupathdb/coreui';
import Banner from '@veupathdb/coreui/lib/components/banners/Banner';
import AddIcon from '@material-ui/icons/Add';
import Trash from '@veupathdb/coreui/lib/components/icons/Trash';

import './UploadForm.scss';

const cx = makeClassNameHelper('UploadForm');

interface Props<T extends string = string> {
  baseUrl: string;
  datasetUploadType: DatasetUploadTypeConfigEntry<T>;
  projectId: string;
  badUploadMessage: State['badUploadMessage'];
  urlParams: Record<string, string>; // Assume we want to support this for all of our new fields
  strategyOptions: StrategySummary[];
  resultUploadConfig?: ResultUploadConfig;
  clearBadUpload: () => void;
  submitForm: (formSubmission: FormSubmission, baseUrl?: string) => void;
  uploadProgress?: number | null;
  dispatchUploadProgress: (progress: number | null) => void;
  supportedFileUploadTypes: string[];
  maxSizeBytes?: number;
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

// ANN think about if this can just pull from the user dataset interface.
interface FormContent {
  name: string;
  summary: string;
  description: string;
  dataUploadSelection: DataUploadSelection;
  dependencies?: UserDataset['dependencies'];
  shortName?: string;
  shortAttribution?: string;
  category?: string;
  publications?: UserDatasetPublication[];
  hyperlinks?: UserDatasetHyperlink[];
  organisms?: string[];
  contacts?: UserDatasetContact[];
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
  uploadProgress,
  dispatchUploadProgress,
  supportedFileUploadTypes,
  maxSizeBytes,
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
  const [shortName, setShortName] = useState(urlParams.datasetShortName ?? '');
  const [shortAttribution, setShortAttribution] = useState(
    urlParams.datasetShortAttribution ?? ''
  );
  const [category, setCategory] = useState(urlParams.datasetCategory ?? '');
  const [publications, setPublications] = useState<UserDatasetPublication[]>(
    []
  );
  const [hyperlinks, setHyperlinks] = useState<UserDatasetHyperlink[]>([]);
  const [organisms, setOrganisms] = useState<string[]>([]);
  const [contacts, setContacts] = useState<UserDatasetContact[]>([]);
  console.log(contacts);
  const [nPublicationInputBoxes, setNPublicationInputBoxes] = useState(0);
  const [nHyperlinkInputBoxes, setNHyperlinkInputBoxes] = useState(0);
  const [nOrganismInputBoxes, setNOrganismInputBoxes] = useState(0);

  // Don't want to really use a ton of state hooks. Instead could get all the info from form data
  // Could replace all the useState hooks with one that contains all the properties.
  // A little more difficult to debug issues with specific input.
  // Neither are super different from react's perspective.
  // There could be a nice utility that reads the big object and based on the properties make inputs.
  // But our current multiple useStates setup is simple :)

  // Is this the same as the edit form?

  // Some of the new imputs are strings, and some are objects. For objects, we'd want
  // individual inputs for each.

  // 0. Write down all the new inputs :)
  // 1. Update the state (whichever direction we take)
  // 2. Add new input fields and connect to state
  // 3. Modify if needed (callbacks, utility functions, etc)
  // 4.

  const [dependencies, setDependencies] =
    useState<UserDataset['dependencies']>();

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
          dependencies,
          shortName,
          shortAttribution,
          category,
          publications,
          hyperlinks,
          organisms,
          contacts,
        }
      );

      if (!formValidation.valid) {
        setErrorMessages(formValidation.errors);
      } else {
        setSubmitting(true);
        submitForm(formValidation.submission, baseUrl);
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
      dependencies,
      dataUploadSelection,
      submitForm,
      shortName,
      shortAttribution,
      category,
      publications,
      hyperlinks,
      organisms,
      contacts,
    ]
  );

  useEffect(() => {
    if (badUploadMessage != null) {
      dispatchUploadProgress(null);
      setErrorMessages([badUploadMessage.message]);
      setSubmitting(false);
    }
  }, [badUploadMessage, dispatchUploadProgress]);

  useEffect(() => {
    return () => {
      clearBadUpload();
    };
  }, [clearBadUpload]);

  const nameInputProps = datasetUploadType.formConfig.name?.inputProps;
  const summaryInputProps = datasetUploadType.formConfig.summary?.inputProps;
  const descriptionInputProps =
    datasetUploadType.formConfig.description?.inputProps;

  const summaryRequired = summaryInputProps?.required ?? true;
  const descriptionRequired = descriptionInputProps?.required ?? false;

  const defaultFileInputField = (
    <FileInput
      accept={
        supportedFileUploadTypes
          ?.map((fileUploadType) => `.${fileUploadType}`)
          .join(',') || undefined
      }
      required={dataUploadMode === 'file'}
      disabled={dataUploadMode !== 'file' || useFixedUploadMethod}
      maxSizeBytes={maxSizeBytes}
      onChange={(file) => {
        const fileWithSpacedRemovedFromName =
          file && new File([file], file?.name.replace(/\s+/g, '_'), file);
        setFile(fileWithSpacedRemovedFromName ?? undefined);
      }}
    />
  );
  const renderFileInput =
    datasetUploadType.formConfig.uploadMethodConfig.file?.render;
  const fileInputField =
    renderFileInput == null
      ? defaultFileInputField
      : renderFileInput({ fieldNode: defaultFileInputField });

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
            {fileInputField}
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

  return (
    <form
      className={cx()}
      style={submitting ? { opacity: '0.5' } : {}}
      onSubmit={onSubmit}
    >
      {errorMessages.length > 0 && <ErrorMessage errors={errorMessages} />}
      <div>
        <h2>{datasetUploadType.uploadTitle}</h2>
        <Banner
          banner={{
            type: 'warning',
            message: (
              <>
                Before uploading your dataset, please ensure your data is
                formatted according to the instructions listed in the{' '}
                <Link to={{ pathname: `${baseUrl}/help` }}>"Help" tab</Link>.
              </>
            ),
          }}
        />
        <div className="formSection formSection--data-set-name">
          <FieldLabel required htmlFor="data-set-name">
            Name
          </FieldLabel>
          <TextBox
            type="input"
            id="data-set-name"
            placeholder="name of the data set"
            {...nameInputProps}
            required
            value={name}
            onChange={setName}
          />
        </div>
        <div className="formSection formSection--data-set-summary">
          <FieldLabel htmlFor="data-set-summary" required={summaryRequired}>
            Summary
          </FieldLabel>
          <TextArea
            type="input"
            id="data-set-summary"
            placeholder="brief summary of the data set contents in a few sentences"
            required={summaryRequired}
            rows={2}
            {...summaryInputProps}
            value={summary}
            onChange={setSummary}
          />
        </div>
        <div className="formSection formSection--data-set-description">
          <FieldLabel
            htmlFor="data-set-description"
            required={descriptionRequired}
          >
            Description
          </FieldLabel>
          <TextArea
            id="data-set-description"
            placeholder="longer description of the data set contents"
            required={descriptionRequired}
            rows={6}
            {...descriptionInputProps}
            value={description}
            onChange={setDescription}
          />
        </div>
        <div className={'formSection'}>
          <details className={cx('--AdditionalDetails')}>
            <summary>Additional Details</summary>
            <div className="additionalDetailsFormSection additionalDetailsFormSection--additionalDetailsField formSection--data-set-shortName">
              <FieldLabel htmlFor="data-set-shortName" required={false}>
                Short Name
              </FieldLabel>
              <TextBox
                type="input"
                id="data-set-shortName"
                placeholder="Short name for the dataset"
                required={false}
                value={shortName}
                onChange={setShortName}
              />
            </div>
            <div className="additionalDetailsFormSection additionalDetailsFormSection--data-set-shortAttribution">
              <FieldLabel htmlFor="data-set-shortAttribution" required={false}>
                Short Attribution
              </FieldLabel>
              <TextBox
                type="input"
                id="data-set-shortAttribution"
                placeholder="Short attribution for the dataset"
                required={false}
                value={shortAttribution}
                onChange={setShortAttribution}
              />
            </div>
            <div className="additionalDetailsFormSection additionalDetailsFormSection--data-set-category">
              <FieldLabel htmlFor="data-set-category" required={false}>
                Category
              </FieldLabel>
              <TextBox
                type="input"
                id="data-set-category"
                placeholder="Category"
                required={false}
                value={category}
                onChange={setCategory}
              />
            </div>
            <div className="additionalDetailsFormSection additionalDetailsFormSection--data-set-publications">
              <FieldLabel
                htmlFor="data-set-publications-pubMedId"
                required={false}
              >
                Publications (Optional)
              </FieldLabel>
              {[...Array(nPublicationInputBoxes).keys()].map((index) => {
                return (
                  <PublicationInput
                    n={index}
                    pubMedId={publications[index]?.pubMedId}
                    onAddPubmedId={(value: string) => {
                      const updatedPublications = [...publications];
                      updatedPublications[index] = {
                        pubMedId: value,
                        citation: updatedPublications[index]?.citation,
                      };
                      setPublications(updatedPublications);
                    }}
                    onRemovePublication={() => {
                      const updatedPublications = [...publications];
                      updatedPublications.splice(index, 1);
                      setPublications(updatedPublications);
                      setNPublicationInputBoxes((n) => n - 1);
                    }}
                    citation={publications[index]?.citation}
                    onAddCitation={(value: string) => {
                      const updatedPublications = [...publications];
                      updatedPublications[index] = {
                        pubMedId: updatedPublications[index]?.pubMedId,
                        citation: value,
                      };
                      setPublications(updatedPublications);
                    }}
                  />
                );
              })}
              <FloatingButton
                text="Add Publication"
                onPress={(event: React.MouseEvent<HTMLButtonElement>) => {
                  event.preventDefault();
                  setNPublicationInputBoxes((n) => n + 1);
                }}
                icon={AddIcon}
              />
            </div>
            <div className="additionalDetailsFormSection additionalDetailsFormSection--data-set-hyperlinks">
              <FieldLabel
                htmlFor="data-set-publications-hyperlinks"
                required={false}
              >
                Hyperlinks (Optional)
              </FieldLabel>
              {[...Array(nHyperlinkInputBoxes).keys()].map((index) => {
                return (
                  <HyperlinkInput
                    n={index}
                    url={hyperlinks[index]?.url}
                    onAddUrl={(value: string) => {
                      const updatedHyperlinks = [...hyperlinks];
                      updatedHyperlinks[index] = {
                        url: value,
                        text: updatedHyperlinks[index]?.text,
                        description: updatedHyperlinks[index]?.description,
                        isPublication: updatedHyperlinks[index]?.isPublication,
                      };
                      setHyperlinks(updatedHyperlinks);
                    }}
                    onRemoveHyperlink={(
                      event: React.MouseEvent<HTMLButtonElement>
                    ) => {
                      event.preventDefault();
                      const updatedHyperlinks = [...hyperlinks];
                      updatedHyperlinks.splice(index, 1);
                      setHyperlinks(updatedHyperlinks);
                      setNHyperlinkInputBoxes((n) => n - 1);
                    }}
                    text={hyperlinks[index]?.text}
                    onAddText={(value: string) => {
                      const updatedHyperlinks = [...hyperlinks];
                      updatedHyperlinks[index] = {
                        url: updatedHyperlinks[index]?.url,
                        text: value,
                        description: updatedHyperlinks[index]?.description,
                        isPublication: updatedHyperlinks[index]?.isPublication,
                      };
                      setHyperlinks(updatedHyperlinks);
                    }}
                    description={hyperlinks[index]?.description}
                    onAddDescription={(value: string) => {
                      const updatedHyperlinks = [...hyperlinks];
                      updatedHyperlinks[index] = {
                        url: updatedHyperlinks[index]?.url,
                        text: updatedHyperlinks[index]?.text,
                        description: value,
                        isPublication: updatedHyperlinks[index]?.isPublication,
                      };
                      setHyperlinks(updatedHyperlinks);
                    }}
                    isPublication={hyperlinks[index]?.isPublication}
                    onAddIsPublication={(value: boolean | undefined) => {
                      const updatedHyperlinks = [...hyperlinks];
                      updatedHyperlinks[index] = {
                        url: updatedHyperlinks[index]?.url,
                        text: updatedHyperlinks[index]?.text,
                        description: updatedHyperlinks[index]?.description,
                        isPublication: value,
                      };
                      setHyperlinks(updatedHyperlinks);
                      return;
                    }}
                  />
                );
              })}
              <FloatingButton
                text="Add Hyperlink"
                onPress={(event: React.MouseEvent<HTMLButtonElement>) => {
                  event.preventDefault();
                  setNHyperlinkInputBoxes((n) => n + 1);
                }}
                icon={AddIcon}
              />
            </div>
            <div className="additionalDetailsFormSection additionalDetailsFormSection--data-set-organisms">
              <FieldLabel
                htmlFor="data-set-publications-organisms"
                required={false}
              >
                Organisms (Optional)
              </FieldLabel>
              <div>
                {[...Array(nOrganismInputBoxes).keys()].map((index) => {
                  return (
                    <div className={cx('--OrganismInputFields')}>
                      <FieldLabel required={false} key={index}>
                        Organism {index + 1}
                      </FieldLabel>
                      <TextBox
                        type="input"
                        id={`data-set-organisms-${index}`}
                        placeholder="Organism"
                        required={false}
                        value={organisms[index]}
                        onChange={(value) => {
                          const updatedOrganisms = [...organisms];
                          updatedOrganisms[index] = value;
                          setOrganisms(updatedOrganisms);
                        }}
                      />
                      <FloatingButton
                        text="Remove"
                        onPress={(
                          event: React.MouseEvent<HTMLButtonElement>
                        ) => {
                          event.preventDefault();
                          const updatedOrganisms = [...organisms];
                          updatedOrganisms.splice(index, 1);
                          setOrganisms(updatedOrganisms);
                          setNOrganismInputBoxes((n) => n - 1);
                        }}
                        icon={Trash}
                      />
                    </div>
                  );
                })}
              </div>
              <FloatingButton
                text="Add Organisms"
                onPress={(event: React.MouseEvent<HTMLButtonElement>) => {
                  event.preventDefault();
                  setNOrganismInputBoxes((n) => n + 1);
                }}
                icon={AddIcon}
              />
            </div>
            <div className="additionalDetailsFormSection additionalDetailsFormSection--data-set-contacts">
              <FieldLabel
                htmlFor="data-set-publications-contacts"
                required={false}
              >
                Contacts (Optional)
              </FieldLabel>
              {contacts.map((contact, index) => {
                return (
                  <ContactInput
                    n={index}
                    name={contact.name}
                    onAddName={(value: string) => {
                      const updatedContacts = [...contacts];
                      updatedContacts[index] = {
                        ...contact,
                        name: value,
                      };
                      setContacts(updatedContacts);
                    }}
                    email={contact.email}
                    onAddEmail={(value: string) => {
                      const updatedContacts = [...contacts];
                      updatedContacts[index] = {
                        ...contact,
                        email: value,
                      };
                      setContacts(updatedContacts);
                    }}
                    affiliation={contact.affiliation}
                    onAddAffiliation={(value: string) => {
                      const updatedContacts = [...contacts];
                      updatedContacts[index] = {
                        ...contact,
                        affiliation: value,
                      };
                      setContacts(updatedContacts);
                    }}
                    city={contact.city}
                    onAddCity={(value: string) => {
                      const updatedContacts = [...contacts];
                      updatedContacts[index] = {
                        ...contact,
                        city: value,
                      };
                      setContacts(updatedContacts);
                    }}
                    state={contact.state}
                    onAddState={(value: string) => {
                      const updatedContacts = [...contacts];
                      updatedContacts[index] = {
                        ...contact,
                        state: value,
                      };
                      setContacts(updatedContacts);
                    }}
                    country={contact.country}
                    onAddCountry={(value: string) => {
                      const updatedContacts = [...contacts];
                      updatedContacts[index] = {
                        ...contact,
                        country: value,
                      };
                      setContacts(updatedContacts);
                    }}
                    address={contact.address}
                    onAddAddress={(value: string) => {
                      const updatedContacts = [...contacts];
                      updatedContacts[index] = {
                        ...contact,
                        address: value,
                      };
                      setContacts(updatedContacts);
                    }}
                    isPrimary={contact.isPrimary}
                    onAddIsPrimary={(value: boolean | undefined) => {
                      const updatedContacts = [...contacts];
                      updatedContacts[index] = {
                        ...contact,
                        isPrimary: value,
                      };
                      setContacts(updatedContacts);
                      return;
                    }}
                    onRemoveContact={(
                      event: React.MouseEvent<HTMLButtonElement>
                    ) => {
                      event.preventDefault();
                      const updatedContacts = [...contacts];
                      updatedContacts.splice(index, 1);
                      setContacts(updatedContacts);
                    }}
                  />
                );
              })}
              <FloatingButton
                text="Add Contact"
                onPress={(event: React.MouseEvent<HTMLButtonElement>) => {
                  event.preventDefault();
                  setContacts((contacts) => [
                    ...contacts,
                    {} as UserDatasetContact,
                  ]);
                }}
                icon={AddIcon}
              />
            </div>
          </details>
        </div>
        {datasetUploadType.formConfig.dependencies && (
          <div className="formSection formSection--data-set-dependencies">
            <FieldLabel
              required={
                datasetUploadType.formConfig.dependencies.required ?? false
              }
            >
              {datasetUploadType.formConfig.dependencies.label}
            </FieldLabel>
            {datasetUploadType.formConfig.dependencies.render({
              value: dependencies,
              onChange: setDependencies,
            })}
          </div>
        )}
        {
          <div className="formSection formSection--data-set-file">
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
      <Modal
        visible={submitting && Boolean(uploadProgress)}
        toggleVisible={() => null}
        styleOverrides={{
          content: {
            size: {
              height: '100%',
              width: '100%',
            },
            padding: {
              right: 10,
              left: 10,
            },
          },
          size: {
            height: 150,
            width: 'auto',
          },
        }}
      >
        <UploadProgress uploadProgress={uploadProgress} />
      </Modal>
      {datasetUploadType.formConfig?.renderInfo?.()}
    </form>
  );
}

function UploadProgress({
  uploadProgress,
}: {
  uploadProgress?: number | null;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '1em',
        fontSize: '1.5em',
        height: '100%',
      }}
    >
      {uploadProgress && uploadProgress !== 100 && (
        <>
          <progress id="file" max="100" value={uploadProgress} />
          <label htmlFor="file">Uploading...</label>
        </>
      )}
      {uploadProgress === 100 && (
        <>
          <Loading style={{ padding: '1em' }} />
          <span>Waiting on server response...</span>
        </>
      )}
    </div>
  );
}

interface FieldLabelProps
  extends React.DetailedHTMLProps<
    React.LabelHTMLAttributes<HTMLLabelElement>,
    HTMLLabelElement
  > {
  children: ReactNode;
  required: boolean;
}

function FieldLabel({ children, required, ...labelProps }: FieldLabelProps) {
  return (
    <label {...labelProps}>
      {children}
      {required ? '*' : null}
    </label>
  );
}

function ErrorMessage({ errors }: { errors: string[] }) {
  return (
    <Banner
      banner={{
        type: 'error',
        message: (
          <div style={{ lineHeight: 1.5 }}>
            <span>Could not upload data set</span>
            {errors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </div>
        ),
      }}
    />
  );
}

function validateForm<T extends string = string>(
  projectId: string,
  datasetUploadType: DatasetUploadTypeConfigEntry<T>,
  enableResultUploadMethod: boolean,
  formContent: FormContent
): FormValidation {
  const { name, summary, description, dataUploadSelection, dependencies } =
    formContent;

  if (
    datasetUploadType.formConfig.dependencies?.required &&
    dependencies == null
  ) {
    return {
      valid: false,
      errors: [`Required: ${datasetUploadType.formConfig.dependencies.label}`],
    };
  }

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
      errors: [
        'The provided data URL does not seem valid. A valid URL must start with "http://" or "https://".',
      ],
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
      dependencies,
      visibility: 'private',
    },
  };
}

// Create publication input UI
interface PublicationInputProps {
  n: number;
  pubMedId: string;
  onAddPubmedId: (value: string) => void;
  onAddCitation: (value: string) => void;
  onRemovePublication: () => void;
  citation?: string;
}

function PublicationInput(props: PublicationInputProps): JSX.Element {
  const {
    n,
    pubMedId,
    onAddPubmedId,
    onRemovePublication,
    onAddCitation,
    citation,
  } = props;
  return (
    <div className={cx('--NestedInputContainer')}>
      <div className={cx('--NestedInputTitle')}>
        <FieldLabel required={false} style={{ fontSize: '1.2em' }}>
          Publication {n + 1}
        </FieldLabel>
        <FloatingButton
          text="Remove"
          onPress={onRemovePublication}
          icon={Trash}
        />
      </div>
      <div className={cx('--NestedInputFields')}>
        <FieldLabel required>PubMed ID</FieldLabel>
        <TextBox
          type="input"
          id={`data-set-publications-pubMedId-${n}`}
          placeholder="PubMed ID"
          required
          value={pubMedId}
          onChange={onAddPubmedId}
        />
        <FieldLabel required={false}>Citation</FieldLabel>
        <TextBox
          type="input"
          id={`data-set-publications-citation-${n}`}
          placeholder="Citation"
          required={false}
          value={citation}
          onChange={onAddCitation}
        />
      </div>
    </div>
  );
}

// UI for hyperlinks
interface HyperlinkInputProps {
  n: number;
  url: string;
  text: string;
  onAddUrl: (value: string) => void;
  onAddText: (value: string) => void;
  onAddDescription: (value: string) => void;
  onAddIsPublication: (value: boolean | undefined) => void;
  onRemoveHyperlink: (event: React.MouseEvent<HTMLButtonElement>) => void;
  description?: string;
  isPublication?: boolean;
}

function HyperlinkInput(props: HyperlinkInputProps): JSX.Element {
  const {
    n,
    url,
    onAddUrl,
    onRemoveHyperlink,
    text,
    onAddText,
    description,
    onAddDescription,
    isPublication,
    onAddIsPublication,
  } = props;
  console.log('in component', isPublication);
  return (
    <div className={cx('--NestedInputContainer')}>
      <div className={cx('--NestedInputTitle')}>
        <FieldLabel required={false} style={{ fontSize: '1.2em' }}>
          Hyperlink {n + 1}
        </FieldLabel>
        <FloatingButton
          text="Remove"
          onPress={onRemoveHyperlink}
          icon={Trash}
        />
      </div>
      <div className={cx('--NestedInputFields')}>
        <FieldLabel required>URL</FieldLabel>
        <TextBox
          type="input"
          id={`data-set-hyperlink-url-${n}`}
          placeholder="url"
          required
          value={url}
          onChange={onAddUrl}
        />
        <FieldLabel required>Text</FieldLabel>
        <TextBox
          type="input"
          id={`data-set-hyperlink-text-${n}`}
          placeholder="Text to show for the hyperlink"
          value={text}
          onChange={onAddText}
        />
        <FieldLabel required={false}>Description</FieldLabel>
        <TextBox
          type="input"
          id={`data-set-hyperlink-description-${n}`}
          placeholder="Description of the hyperlink"
          value={description}
          required={false}
          onChange={onAddDescription}
        />
        <FieldLabel required={false}>Is publication?</FieldLabel>
        <RadioList
          name={`isPublication-${n}`}
          className="horizontal"
          value={
            isPublication === true
              ? 'true'
              : isPublication === false
              ? 'false'
              : 'undefined'
          }
          onChange={(value) => {
            onAddIsPublication(
              value === 'true' ? true : value === 'false' ? false : undefined
            );
          }}
          items={[
            { value: 'true', display: 'Yes' },
            { value: 'false', display: 'No' },
            { value: 'undefined', display: 'NA' },
          ]}
        />
      </div>
    </div>
  );
}

// UI for contacts
interface ContactInputProps {
  n: number;
  name: string;
  email?: string;
  affiliation?: string;
  city?: string;
  state?: string;
  country?: string;
  address?: string;
  isPrimary?: boolean;
  onAddName: (value: string) => void;
  onAddEmail: (value: string) => void;
  onAddAffiliation: (value: string) => void;
  onAddCity: (value: string) => void;
  onAddState: (value: string) => void;
  onAddCountry: (value: string) => void;
  onAddAddress: (value: string) => void;
  onAddIsPrimary: (value: boolean | undefined) => void;
  onRemoveContact: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

function ContactInput(props: ContactInputProps): JSX.Element {
  const {
    n,
    name,
    email,
    affiliation,
    city,
    state,
    country,
    address,
    isPrimary,
    onAddName,
    onAddEmail,
    onAddAffiliation,
    onAddCity,
    onAddState,
    onAddCountry,
    onAddAddress,
    onAddIsPrimary,
    onRemoveContact,
  } = props;
  return (
    <div className={cx('--NestedInputContainer')}>
      <div className={cx('--NestedInputTitle')}>
        <FieldLabel required={false} style={{ fontSize: '1.2em' }}>
          Contact {n + 1}
        </FieldLabel>
        <FloatingButton text="Remove" onPress={onRemoveContact} icon={Trash} />
      </div>
      <div className={cx('--NestedInputFields')}>
        <FieldLabel required>Name</FieldLabel>
        <TextBox
          type="input"
          id={`data-set-contacts-name-${n}`}
          placeholder="Name"
          required
          value={name}
          onChange={onAddName}
        />
        <FieldLabel required={false}>Email</FieldLabel>
        <TextBox
          type="input"
          id={`data-set-contacts-email-${n}`}
          placeholder="Email"
          required={false}
          value={email}
          onChange={onAddEmail}
        />
        <FieldLabel required={false}>Affiliation</FieldLabel>
        <TextBox
          type="input"
          id={`data-set-contacts-affiliation-${n}`}
          placeholder="Affiliation"
          required={false}
          value={affiliation}
          onChange={onAddAffiliation}
        />
        <FieldLabel required={false}>City</FieldLabel>
        <TextBox
          type="input"
          id={`data-set-contacts-city-${n}`}
          placeholder="City"
          required={false}
          value={city}
          onChange={onAddCity}
        />
        <FieldLabel required={false}>State</FieldLabel>
        <TextBox
          type="input"
          id={`data-set-contacts-state-${n}`}
          placeholder="State"
          required={false}
          value={state}
          onChange={onAddState}
        />
        <FieldLabel required={false}>Country</FieldLabel>
        <TextBox
          type="input"
          id={`data-set-contacts-country-${n}`}
          placeholder="Country"
          required={false}
          value={country}
          onChange={onAddCountry}
        />
        <FieldLabel required={false}>Address</FieldLabel>
        <TextBox
          type="input"
          id={`data-set-contacts-address-${n}`}
          placeholder="Address"
          required={false}
          value={address}
          onChange={onAddAddress}
        />
        <FieldLabel required={false}>Is primary?</FieldLabel>
        <RadioList
          name={`isPrimary-${n}`}
          className="horizontal"
          value={
            isPrimary === true
              ? 'true'
              : isPrimary === false
              ? 'false'
              : 'undefined'
          }
          onChange={(value) => {
            onAddIsPrimary(
              value === 'true' ? true : value === 'false' ? false : undefined
            );
          }}
          items={[
            { value: 'true', display: 'Yes' },
            { value: 'false', display: 'No' },
            { value: 'undefined', display: 'NA' },
          ]}
        />
      </div>
    </div>
  );
}

function isCompleteDataUploadSelection(
  dataUploadSelection: DataUploadSelection
): dataUploadSelection is CompleteDataUploadSelection {
  return Object.values(dataUploadSelection).every((value) => value != null);
}

// https://stackoverflow.com/a/43467144
function isValidUrl(string: string) {
  let url: URL;
  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }
  return url.protocol === 'http' || url.protocol === 'https';
}

export default UploadForm;
