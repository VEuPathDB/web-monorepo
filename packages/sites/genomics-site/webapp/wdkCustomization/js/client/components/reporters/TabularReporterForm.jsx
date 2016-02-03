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
  { value: "excel", display: "Excel File" },
  { value: "plain", display: "Show in Browser"}
];

let TabularReporterForm = React.createClass({

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
    let { question, recordClass, preferences, formState } = this.props;
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
      </div>
    );
  }

});

export default TabularReporterForm;