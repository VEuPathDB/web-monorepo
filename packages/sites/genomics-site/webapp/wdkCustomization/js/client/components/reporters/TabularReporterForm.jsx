import React from 'react';
import * as Wdk from 'wdk-client';

let util = Wdk.ReporterUtils;
let { RadioList, ReporterCheckboxList } = Wdk.Components;

let includeHeaderValues = [
  { value: "yes", display: "include" },
  { value: "no", display: "exclude" }
];

let downloadTypes = [
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
      includeHeader: util.getValueOrDefault(formState, "includeHeader", "yes"),
      downloadType: util.getValueOrDefault(formState, "downloadType", "plain")
    };
  },

  onAttributesChange(newAttributes) {
    this.props.onFormChange({
      attributes: newAttributes,
      includeHeader: this.props.formState.includeHeader,
      downloadType: this.props.formState.downloadType
    });
  },

  onIncludeHeaderChange(newValue) {
    this.props.onFormChange({
      attributes: this.props.formState.attributes,
      includeHeader: newValue,
      downloadType: this.props.formState.downloadType
    });
  },

  onDownloadTypeChange(newValue) {
    this.props.onFormChange({
      attributes: this.props.formState.attributes,
      includeHeader: this.props.formState.includeHeader,
      downloadType: newValue
    });
  },

  render() {
    let { question, recordClass, preferences, formState } = this.props;
    let realFormState = this.discoverFormState(formState, preferences, question);
    return (
      <div>
        <ReporterCheckboxList
          name="attributes" title="Choose Attributes"
          allValues={util.getAllAttributes(recordClass, question, util.isInReport)}
          selectedValueNames={realFormState.attributes}
          onChange={this.onAttributesChange}/>
        <div>
          <span>Column Names:</span>
          <RadioList name="includeHeader" className="horizontal-list" value={realFormState.includeHeader}
              onChange={this.onIncludeHeaderChange} items={includeHeaderValues}/>
        </div>
        <div>
          <span>Download Type and Format:</span>
          <RadioList name="downloadType" className="horizontal-list" value={realFormState.downloadType}
              onChange={this.onDownloadTypeChange} items={downloadTypes}/>
        </div>
      </div>
    );
  }

});

export default TabularReporterForm;