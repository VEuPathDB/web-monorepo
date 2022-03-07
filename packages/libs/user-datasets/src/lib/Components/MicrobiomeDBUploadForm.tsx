import React from 'react';
import Icon from '@veupathdb/wdk-client/lib/Components/Icon/IconAlt';
import {
  TextBox,
  TextArea,
  FileInput,
  RadioList,
} from '@veupathdb/wdk-client/lib/Components';
import { wrappable } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

import { UserDatasetMeta, NewUserDataset } from '../Utils/types';

import '../Components/MicrobiomeDBUploadForm.scss';

type State = UserDatasetMeta & {
  badFormStateMessages: string[];
  submitting: boolean;
  url?: string;
  dataUploadMode: 'url' | 'file';
  file?: File;
};

type Props = {
  badUploadMessage?: string;
  urlParams: Record<string, string>;
  submitForm: (newUserDataset: NewUserDataset) => void;
};

class MicrobiomeDBUploadForm extends React.Component<Props, State> {
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
        datasetType: 'biom',
        projects: ['MicrobiomeDB'],
        file: this.state.url
          ? new File(
              [this.state.url],
              `${this.state.name.replace(/\W+/g, '_')}.path-to.biom`
            )
          : (this.state.file as File),
      };
      this.setState({ submitting: true }, () =>
        this.props.submitForm(newUserDataset)
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
                        placeholder="Address of a data BIOM file from the Web"
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

  renderInfo() {
    return (
      <p className="formInfo">
        <span>* </span> All form fields are required.
        <br />
        <br />
        We accept any file in the{' '}
        <a href="http://biom-format.org">BIOM format</a>, either JSON-based
        (BIOM 1.0) or HDF5 (BIOM 2.0+). The maximum allowed file size is 1GB.
        <br />
        <br />
        If possible, try including taxonomic information and rich sample details
        in your file. This will allow you to select groups of samples and create
        meaningful comparisons at a desired aggregation level, using our
        filtering and visualisation tools.
      </p>
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
        className="microbiomeDBUploadForm"
        style={this.state.submitting ? { opacity: '0.5' } : {}}
      >
        {(this.props.badUploadMessage != null ||
          this.state.badFormStateMessages.length > 0) &&
          this.renderErrorMessage()}
        {this.renderForm()}
        {this.renderSubmit()}
        {this.renderInfo()}
      </div>
    );
  }
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

export default wrappable(MicrobiomeDBUploadForm);
