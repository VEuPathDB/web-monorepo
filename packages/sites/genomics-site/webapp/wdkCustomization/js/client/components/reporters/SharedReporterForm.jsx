import React from 'react';
import * as Wdk from 'wdk-client';

let util = Object.assign({}, Wdk.ComponentUtils, Wdk.ReporterUtils);
let { RadioList, Checkbox } = Wdk.Components;

let SharedReporterForm = React.createClass({

  componentDidMount() {
    let { formState, preferences, question, initializeFormState } = this.props;
    initializeFormState(this.discoverFormState(formState, preferences, question));
  },

  discoverFormState(formState, preferences, question) {
    let currentAttributes = (formState == null ? undefined : formState.attributes);
    let currentTables = (formState == null ? undefined : formState.tables);
    return {
      attributes: util.getAttributeSelections(currentAttributes, preferences, question),
      tables: util.getTableSelections(currentTables),
      includeEmptyTables: util.getValueOrDefault(formState, "includeEmptyTables", true),
      attachmentType: util.getValueOrDefault(formState, "attachmentType", "plain")
    };
  },

  // returns a handler function that will update the form state 
  getUpdateHandler(fieldName) {
    return util.getChangeHandler(fieldName, this.props.onFormChange, this.props.formState);
  },

  render() {
    let { question, recordClass, preferences, formState, onSubmit } = this.props;
    let realFormState = this.discoverFormState(formState, preferences, question);
    return (
      <div>
        {util.getReporterCheckboxList("Choose Attributes", this.getUpdateHandler('attributes'),
          util.getAllAttributes(recordClass, question, util.isInReport), realFormState.attributes)}
        {util.getReporterCheckboxList("Choose Tables", this.getUpdateHandler('tables'),
          util.getAllTables(recordClass, util.isInReport), realFormState.tables)}
        <div>
          <h3>Additional Options:</h3>
          <div style={{marginLeft:"2em"}}>
            <Checkbox value={realFormState.includeEmptyTables} onChange={this.getUpdateHandler('includeEmptyTables')}/>
            <span style={{marginLeft:'0.5em'}}>Include empty tables</span>
          </div>
        </div>
        <div>
          <h3>Download Type:</h3>
          <div style={{marginLeft:"2em"}}>
            <RadioList name="attachmentType" value={realFormState.attachmentType}
                onChange={this.getUpdateHandler('attachmentType')} items={util.attachmentTypes}/>
          </div>
        </div>
        <div style={{width:'30em',textAlign:'center', margin:'0.6em 0'}}>
          <input type="button" value="Submit" onClick={onSubmit}/>
        </div>
      </div>
    );
  }

});

export default SharedReporterForm;
