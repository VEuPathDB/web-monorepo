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

  componentWillMount() {
    let { formState, preferences, question, onFormChange, onFormUiChange } = this.props;
    let newFormState = this.discoverFormState(formState, preferences, question);
    setTimeout(() => {
      onFormChange(newFormState);
      // currently no special UI state on this form
      onFormUiChange({});
    }, 0);
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

  onAttributesChange(newAttributes) {
    this.props.onFormChange(Object.assign({}, this.props.formState, { attributes: newAttributes }));
  },

  onTablesChange(newTables) {
    this.props.onFormChange(Object.assign({}, this.props.formState, { tables: newTables }));
  },

  onIncludeEmptyTablesChange(newValue) {
    newValue = (newValue === "true"); // convert from string -> boolean
    this.props.onFormChange(Object.assign({}, this.props.formState, { includeEmptyTables: newValue }));
  },

  onAttachmentTypeChange(newValue) {
    this.props.onFormChange(Object.assign({}, this.props.formState, { attachmentType: newValue }));
  },

  render() {
    let { question, recordClass, preferences, formState } = this.props;
    let realFormState = this.discoverFormState(formState, preferences, question);
    let includeEmptyTablesStr = (realFormState.includeEmptyTables ? "true" : "false");
    return (
      <div>
        <ReporterCheckboxList
          name="attributes" title="Choose Attributes"
          allValues={util.getAllAttributes(recordClass, question, util.isInReport)}
          selectedValueNames={realFormState.attributes}
          onChange={this.onAttributesChange}/>
        <ReporterCheckboxList
          name="tables" title="Choose Tables"
          allValues={util.getAllTables(recordClass, util.isInReport)}
          selectedValueNames={realFormState.tables}
          onChange={this.onTablesChange}/>
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
                onChange={this.onAttachmentTypeChange} items={attachmentTypes}/>
          </div>
        </div>
      </div>
    );
  }

});

export default SharedReporterForm;