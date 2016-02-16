import React from 'react';
import * as Wdk from 'wdk-client';

let util = Object.assign({}, Wdk.ComponentUtils, Wdk.ReporterUtils);
let { RadioList, Checkbox } = Wdk.Components;

let attachmentTypes = [
  { value: "text", display: "Text File" },
  { value: "excel", display: "Excel File**" },
  { value: "plain", display: "Show in Browser"}
];

let TabularReporterForm = React.createClass({

  componentDidMount() {
    let { formState, preferences, question, initializeFormState } = this.props;
    initializeFormState(this.discoverFormState(formState, preferences, question));
  },

  discoverFormState(formState, preferences, question) {
    let currentAttributes = (formState == null ? undefined : formState.attributes);
    return {
      attributes: util.getAttributeSelections(currentAttributes, preferences, question),
      includeHeader: util.getValueOrDefault(formState, "includeHeader", true),
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
        <div>
          <h3>Additional Options:</h3>
          <div style={{marginLeft:"2em"}}>
            <Checkbox value={realFormState.includeHeader} onChange={this.getUpdateHandler('includeHeader')}/>
            <span style={{marginLeft:'0.5em'}}>Include header row (column names)</span>
          </div>
        </div>
        <div>
          <h3>Download Type and Format:</h3>
          <div style={{marginLeft:"2em"}}>
            <RadioList value={realFormState.attachmentType} items={attachmentTypes}
              onChange={this.getUpdateHandler('attachmentType')}/>
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
          complete results, please choose "Text File".
        </div>
        <hr/>
      </div>
    );
  }

});

export default TabularReporterForm;
