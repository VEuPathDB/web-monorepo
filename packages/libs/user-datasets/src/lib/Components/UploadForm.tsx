import React, { useMemo, useState } from 'react';
import Icon from '@veupathdb/wdk-client/lib/Components/Icon/IconAlt';
import {
  TextBox,
  TextArea,
  FileInput,
  RadioList,
} from '@veupathdb/wdk-client/lib/Components';

import {
  DatasetUploadTypeConfigEntry,
  NewUserDataset,
  UserDatasetMeta,
} from '../Utils/types';

import './UploadForm.scss';

interface Props<T extends string = string> {
  baseUrl: string;
  datasetUploadType: DatasetUploadTypeConfigEntry<T>;
  projectId: string;
  badUploadMessage?: string;
  urlParams: Record<string, string>;
  submitForm: (newUserDataset: NewUserDataset, redirectTo?: string) => void;
}

interface State extends UserDatasetMeta {
  badFormStateMessages: string[];
  submitting: boolean;
  url?: string;
  dataUploadMode: 'url' | 'file';
  file?: File;
}

class UploadForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      name: this.props.urlParams.datasetName || '',
      summary: this.props.urlParams.datasetSummary || '',
      description: this.props.urlParams.datasetDescription || '',
      url: this.props.urlParams.datasetUrl || '',
      dataUploadMode: this.props.urlParams.datasetUrl ? 'url' : 'file',
      badFormStateMessages: [],
      submitting: false,
    };
  }
  badFormStateErrors() {
    const errors: string[] = [];
    if (!this.state.name) {
      errors.push('Required: data set name');
    }
    if (!this.state.summary) {
      errors.push('Required: data set summary');
    }
    if (!this.state.description) {
      errors.push('Required: data set description');
    }
    if (this.state.file == null && !this.state.url) {
      errors.push('Required: data file or URL');
    }
    if (this.state.url && !isValidUrl(this.state.url)) {
      errors.push('The provided data URL does not seem valid');
    }
    return errors;
  }
  trySubmit() {
    const errors = this.badFormStateErrors();
    if (errors.length) {
      this.setState({ badFormStateMessages: errors });
    } else {
      const newUserDataset: NewUserDataset = {
        name: this.state.name as string,
        summary: this.state.summary as string,
        description: this.state.description as string,
        datasetType: this.props.datasetUploadType.type,
        projects: [this.props.projectId],
        uploadMethod: this.state.url
          ? {
              type: 'url',
              url: this.state.url,
            }
          : {
              type: 'file',
              file: this.state.file as File,
            },
      };
      this.setState({ submitting: true }, () =>
        this.props.submitForm(newUserDataset, `${this.props.baseUrl}/recent`)
      );
    }
  }
  renderErrorMessage() {
    return (
      <div className="ui-state-error" style={{ fontSize: 'large' }}>
        <div>
          <Icon fa="exclamation-triangle" />
          &nbsp; Could not upload data set
        </div>
        <div className="ui-state-error-text">{this.props.badUploadMessage}</div>
        {this.state.badFormStateMessages.map((message, ix) => (
          <div key={ix} className="ui-state-error-text">
            {message}
          </div>
        ))}
      </div>
    );
  }
  renderForm() {
    return (
      <div>
        <h2>{this.props.datasetUploadType.uploadTitle}</h2>
        <div className="formSection">
          <label htmlFor="data-set-name">
            Name<sup className="supAsterisk">*</sup>:<br />
          </label>
          <TextBox
            type="input"
            id="data-set-name"
            required={true}
            placeholder="name of the data set"
            value={this.state.name}
            onChange={(name) => this.setState({ name })}
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
            value={this.state.summary}
            onChange={(summary) => this.setState({ summary })}
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
            value={this.state.description}
            onChange={(description) => this.setState({ description })}
          />
        </div>
        <div className="formSection" style={{ minHeight: '8em' }}>
          <RadioList
            name="data-set-radio"
            value={this.state.dataUploadMode}
            onChange={(value) => {
              if (value === 'url' || value === 'file') {
                this.setState({ dataUploadMode: value });
              }
            }}
            items={[
              {
                value: 'file',
                display: (
                  <React.Fragment>
                    <label htmlFor="data-set-file">
                      {this.state.dataUploadMode === 'file' ? (
                        <React.Fragment>
                          Data File<sup className="supAsterisk">*</sup>:
                        </React.Fragment>
                      ) : (
                        'Data File'
                      )}
                      <br />
                    </label>
                    {this.state.dataUploadMode === 'file' && (
                      <FileInput
                        id="data-set-file"
                        onChange={(file) =>
                          this.setState(
                            file ? { file: file, url: '' } : { file: undefined }
                          )
                        }
                      />
                    )}
                  </React.Fragment>
                ),
              },
              {
                value: 'url',
                display: (
                  <React.Fragment>
                    <label htmlFor="data-set-url">
                      {this.state.dataUploadMode === 'url' ? (
                        <React.Fragment>
                          Data URL<sup className="supAsterisk">*</sup>:
                        </React.Fragment>
                      ) : (
                        'Data URL'
                      )}
                      <br />
                    </label>
                    {this.state.dataUploadMode === 'url' && (
                      <TextBox
                        type="input"
                        id="data-set-url"
                        placeholder="Address of a data file from the Web"
                        value={this.state.url}
                        onChange={(url) => this.setState({ url })}
                      />
                    )}
                  </React.Fragment>
                ),
              },
            ]}
          />
        </div>
      </div>
    );
  }

  renderSubmit() {
    return (
      <button type="submit" className="btn" onClick={() => this.trySubmit()}>
        Upload Data Set
      </button>
    );
  }

  render() {
    return (
      <div
        className="UploadForm"
        style={this.state.submitting ? { opacity: '0.5' } : {}}
      >
        {(this.props.badUploadMessage != null ||
          this.state.badFormStateMessages.length > 0) &&
          this.renderErrorMessage()}
        {this.renderForm()}
        {this.renderSubmit()}
        {this.props.datasetUploadType.formConfig.renderInfo()}
      </div>
    );
  }
}

type DataUploadMode = 'file' | 'url';

type DataUploadSelection =
  | { type: 'file'; file?: File }
  | { type: 'url'; url?: string };

type CompleteDataUploadSelection = Required<DataUploadSelection>;

function NewUploadForm(props: Props) {
  const [name, setName] = useState(props.urlParams.datasetName ?? '');
  const [summary, setSummary] = useState(props.urlParams.datasetSummary ?? '');
  const [description, setDescription] = useState(
    props.urlParams.datasetDescription ?? ''
  );

  const [dataUploadMode, setDataUploadMode] = useState<DataUploadMode>(
    props.urlParams.datasetUrl ? 'url' : 'file'
  );
  const [file, setFile] = useState<File>();
  const [url, setUrl] = useState(props.urlParams.datasetUrl ?? '');

  const [badFormSubmitMessages, setBadFormSubmitMessages] = useState<string[]>(
    []
  );
  const [submitting, setSubmitting] = useState(false);

  const dataUploadSelection = useMemo(
    (): DataUploadSelection =>
      dataUploadMode === 'file' ? { type: 'file', file } : { type: 'url', url },
    [dataUploadMode, file, url]
  );
}

function isCompleteDataUploadSelection(
  dataUploadSelection: DataUploadSelection
): dataUploadSelection is CompleteDataUploadSelection {
  return dataUploadSelection.type === 'file'
    ? dataUploadSelection.file != null
    : dataUploadSelection.url != null;
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
