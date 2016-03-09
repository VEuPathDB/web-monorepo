import * as Wdk from 'wdk-client';

let util = Object.assign({}, Wdk.ComponentUtils, Wdk.ReporterUtils);
let { ReporterCheckboxList, RadioList, Checkbox } = Wdk.Components;

let attachmentTypes = [
  { value: "text", display: "Text File" },
  { value: "excel", display: "Excel File**" },
  { value: "plain", display: "Show in Browser"}
];

let TabularReporterForm = props => {

  let { question, recordClass, formState, onFormChange, onSubmit } = props;
  let getUpdateHandler = fieldName => util.getChangeHandler(fieldName, onFormChange, formState);

  return (
    <div>
      <ReporterCheckboxList title="Choose Attributes"
          onChange={getUpdateHandler('attributes')}
          fields={util.getAllAttributes(recordClass, question, util.isInReport)}
          selectedFields={formState.attributes}/>
      <div>
        <h3>Additional Options:</h3>
        <div style={{marginLeft:"2em"}}>
          <Checkbox value={formState.includeHeader} onChange={getUpdateHandler('includeHeader')}/>
          <span style={{marginLeft:'0.5em'}}>Include header row (column names)</span>
        </div>
      </div>
      <div>
        <h3>Download Type and Format:</h3>
        <div style={{marginLeft:"2em"}}>
          <RadioList value={formState.attachmentType} items={attachmentTypes}
            onChange={getUpdateHandler('attachmentType')}/>
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

TabularReporterForm.getInitialState = (downloadFormStoreState, userStoreState) => ({
  formState: {
    attributes: util.getAttributeSelections(
        userStoreState.preferences, downloadFormStoreState.question),
    includeHeader: true,
    attachmentType: "plain"
  },
  formUiState: null
});

export default TabularReporterForm;
