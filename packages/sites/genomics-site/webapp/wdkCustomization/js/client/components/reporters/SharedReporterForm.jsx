import React from 'react';
import * as Wdk from 'wdk-client';

let util = Object.assign({}, Wdk.ComponentUtils, Wdk.ReporterUtils);
let { RadioList, ReporterCheckboxList } = Wdk.Components;

let includeEmptyTablesValues = [
  { value: "true", display: "Include" },
  { value: "false", display: "Exclude" }
];

let attachmentTypes = [
  { value: "text", display: "Text File" },
  { value: "plain", display: "Show in Browser"}
];

let SharedReporterForm = React.createClass({

  componentDidMount() {
    let { formState, preferences, question, onFormChange, onFormUiChange } = this.props;
    let newFormState = this.discoverFormState(formState, preferences, question);
    onFormChange(newFormState);
    // currently no special UI state on this form
    onFormUiChange({});
  },

  discoverFormState(formState, preferences, question) {
    let currentAttributes = (formState == null ? undefined : formState.attributes);
    let currentTables = (formState == null ? undefined : formState.tables);
    return {
      attributes: util.getAttributeSelections(currentAttributes, preferences, question),
      tables: util.getTableSelections(currentTables),
      includeEmptyTables: util.getValueOrDefault(formState, "includeEmptyTables", "true"),
      attachmentType: util.getValueOrDefault(formState, "attachmentType", "plain")
    };
  },

  // returns a handler function that will update the form state 
  getUpdateHandler(fieldName) {
    return (newValue => {
      this.props.onFormChange(Object.assign({}, this.props.formState, { [fieldName]: newValue }));
    });
  },

  // need a custom handler to convert string value to boolean
  onIncludeEmptyTablesChange(newValue) {
    newValue = (newValue === "true"); // convert from string -> boolean
    this.props.onFormChange(Object.assign({}, this.props.formState, { includeEmptyTables: newValue }));
  },

  render() {
    let { question, recordClass, preferences, formState, onSubmit } = this.props;
    let realFormState = this.discoverFormState(formState, preferences, question);
    let includeEmptyTablesStr = (realFormState.includeEmptyTables ? "true" : "false");
    return (
      <div>
        <ReporterCheckboxList
          name="attributes" title="Choose Attributes"
          allValues={util.getAllAttributes(recordClass, question, util.isInReport)}
          selectedValueNames={realFormState.attributes}
          onChange={this.getUpdateHandler('attributes')}/>
        <ReporterCheckboxList
          name="tables" title="Choose Tables"
          allValues={util.getAllTables(recordClass, util.isInReport)}
          selectedValueNames={realFormState.tables}
          onChange={this.getUpdateHandler('tables')}/>
        <div>
          <h3>Empty Tables:</h3>
          <div style={{marginLeft:"2em"}}>
            <RadioList name="includeEmptyTables" value={includeEmptyTablesStr}
                onChange={this.onIncludeEmptyTablesChange} items={includeEmptyTablesValues}/>
          </div>
        </div>
        <div>
          <h3>Download Type:</h3>
          <div style={{marginLeft:"2em"}}>
            <RadioList name="attachmentType" value={realFormState.attachmentType}
                onChange={this.getUpdateHandler('attachmentType')} items={attachmentTypes}/>
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