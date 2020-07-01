import React from 'react';
import Icon from 'wdk-client/Components/Icon/IconAlt';
import { Link, TextBox, TextArea, FileInput } from 'wdk-client/Components';
import { UserDatasetMeta, NewUserDataset } from 'wdk-client/Utils/WdkModel';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';

import 'wdk-client/Views/UserDatasets/MicrobiomeDBUploadForm.scss';

type State = UserDatasetMeta & {
  badFormStateMessages: string[];
  submitting: boolean;
  file?: File;
};

type Props = {
  badUploadMessage?: string;
  submitForm: (newUserDataset: NewUserDataset) => void;
};

class MicrobiomeDBUploadForm extends React.Component <Props, State> {

  constructor (props: Props) {
    super(props);
    this.state = {
      name: "",
      summary: "",
      description: "",
      badFormStateMessages: [],
      submitting: false
    };
  }
  badFormStateErrors(){
    const errors: string[] = [];
    if( ! this.state.name ){
      errors.push('Required: data set name');
    }
    if( ! this.state.summary ){
      errors.push('Required: data set summary');
    }
    if( ! this.state.description ){
      errors.push('Required: data set description');
    }
    if( this.state.file == null ){
      errors.push('Required: data file');
    }
    return errors;
  }
  trySubmit(){
    const errors = this.badFormStateErrors();
    if(errors.length){
      this.setState({badFormStateMessages: errors});
    } else {
      const newUserDataset: NewUserDataset = {
        name: this.state.name as string,
        summary: this.state.summary as string,
        description: this.state.description as string,
        datasetType: "biom",
        projects: ["MicrobiomeDB"],
        file: this.state.file as File
      };
      this.setState({submitting: true}, () => this.props.submitForm(newUserDataset));
    } 
  }
  renderErrorMessage(){
    return (
      <div className="ui-state-error" style={{fontSize: "large"}}>
				<div>
        	<Icon fa="exclamation-triangle"/>
          &nbsp; Could not upload data set
				</div>
        <div className="ui-state-error-text">
          {this.props.badUploadMessage}
        </div>
        {this.state.badFormStateMessages.map((message,ix) => (
          <div key={ix} className="ui-state-error-text">
            {message}
          </div>
        ))}
      </div>
    );
  }
  renderForm () {
    return (
      <fieldset>
        <div className="formSection">
          <label htmlFor="data-set-name">Name<sup className="supAsterisk">*</sup>:<br/></label>
          <TextBox
            type="input" id="data-set-name" required={true} placeholder="name of the data set"
            onChange={(name) => this.setState({name})} 
          />
        </div>
        <div className="formSection">
          <label htmlFor="data-set-summary">Summary<sup className="supAsterisk">*</sup>:<br/></label>
          <TextBox
            type="input" id="data-set-summary" required={true} placeholder="brief summary of the data set contents"
            onChange={(summary) => this.setState({summary})} 
          />
        </div>
        <div className="formSection">
          <label htmlFor="data-set-description">Description<sup className="supAsterisk">*</sup>:<br/></label>
          <TextArea
            id="data-set-description" required={true} placeholder="brief description of the data set contents"
            onChange={(description) => this.setState({description})} 
          />
        </div>
        <div className="formSection">
          <label htmlFor="data-set-file">Data File:<br/></label>
          <FileInput id="data-set-file" onChange={ (file) => this.setState({file: file || undefined}) } />
          <div>Maximum size 1GB. </div>
        </div>
      </fieldset>
    );
  }

  renderInfo(){
    return (
      <p className="formInfo">
        <span>* </span> All form fields are required.
        <br/>
        <br/>
        We accept any file in the <a href="http://biom-format.org">BIOM format</a>, either JSON-based (BIOM 1.0) or HDF5 (BIOM 2.0+).
        <br/>
        <br/>
        If possible, try including taxonomic information and rich sample details in your file. This will allow you to select groups of samples and create meaningful comparisons at a desired aggregation level, using our filtering and visualisation tools.
        <br/>
        <br/>
        For more information, visit our <Link to="static-content/MicrobiomeDB/faq.html">FAQs page</Link>.
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

  render(){
    return (
      <div className="microbiomeDBUploadForm" style={this.state.submitting ? {opacity:"0.5"} : {}}>
        {(this.props.badUploadMessage != null || this.state.badFormStateMessages.length > 0 ) && this.renderErrorMessage()}
        {this.renderForm()}
        {this.renderSubmit()}
        {this.renderInfo()}
      </div>
    );
  }
}

export default wrappable(MicrobiomeDBUploadForm);

