import React from 'react';
import * as Wdk from 'wdk-client';

let util = Object.assign({}, Wdk.ComponentUtils, Wdk.ReporterUtils);
let { RadioList, ReporterCheckboxList } = Wdk.Components;

let includeHeaderValues = [
  { value: "true", display: "Include" },
  { value: "false", display: "Exclude" }
];

let attachmentTypes = [
  { value: "text", display: "Text File" },
  { value: "excel", display: "Excel File**" },
  { value: "plain", display: "Show in Browser"}
];

let TabularReporterForm = React.createClass({

  componentDidMount() {
    let { formState, preferences, question, onFormChange, onFormUiChange } = this.props;
    let newFormState = this.discoverFormState(formState, preferences, question);
    onFormChange(newFormState);
    // currently no special UI state on this form
    onFormUiChange({});
  },

  discoverFormState(formState, preferences, question) {
    let currentAttributes = (formState == null ? undefined : formState.attributes);
    return {
      attributes: util.getAttributeSelections(currentAttributes, preferences, question),
      includeHeader: util.getValueOrDefault(formState, "includeHeader", "true"),
      attachmentType: util.getValueOrDefault(formState, "attachmentType", "plain")
    };
  },

  onAttributesChange(newAttributes) {
    this.props.onFormChange(Object.assign({}, this.props.formState, { attributes: newAttributes }));
  },

  onIncludeHeaderChange(newValue) {
    newValue = (newValue === "true"); // convert from string -> boolean
    this.props.onFormChange(Object.assign({}, this.props.formState, { includeHeader: newValue }));
  },

  onAttachmentTypeChange(newValue) {
    this.props.onFormChange(Object.assign({}, this.props.formState, { attachmentType: newValue }));
  },

  render() {
    let { question, recordClass, preferences, formState, onSubmit } = this.props;
    let realFormState = this.discoverFormState(formState, preferences, question);
    let includeHeaderStr = (realFormState.includeHeader ? "true" : "false");
    return (
      <div>
        <ReporterCheckboxList
          name="attributes" title="Choose Attributes"
          allValues={util.getAllAttributes(recordClass, question, util.isInReport)}
          selectedValueNames={realFormState.attributes}
          onChange={this.onAttributesChange}/>
        <div>
          <h3>Column Names:</h3>
          <div style={{marginLeft:"2em"}}>
            <RadioList name="includeHeader" className="" value={includeHeaderStr}
                onChange={this.onIncludeHeaderChange} items={includeHeaderValues}/>
          </div>
        </div>
        <div>
          <h3>Download Type and Format:</h3>
          <div style={{marginLeft:"2em"}}>
            <RadioList name="attachmentType" className="" value={realFormState.attachmentType}
                onChange={this.onAttachmentTypeChange} items={attachmentTypes}/>
          </div>
        </div>
        <div style={{width:'30em',textAlign:'center', margin:'0.6em 0'}}>
          <input type="button" value="Submit" onClick={onSubmit}/>
        </div>
        <hr/>
        <div style={{margin:'0.5em 2em'}}>
          **Note: If you choose "Excel File" as Download Type, you can only download a
          maximum 10M (in bytes) of the results and the rest will be discarded.<br/>
          Opening a huge Excel file may crash your system. If you need to get the
          complete results, please choose "Text File" or "Show in Browser".
        </div>
        <hr/>
      </div>
    );
  }

});

export default TabularReporterForm;