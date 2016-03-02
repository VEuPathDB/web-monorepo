import * as Wdk from 'wdk-client';

let util = Object.assign({}, Wdk.ComponentUtils, Wdk.ReporterUtils, Wdk.OntologyUtils);
let { RadioList, Checkbox, CheckboxTree } = Wdk.Components;
let { isQualifying, addSearchSpecificSubtree } = eupathdb.attributeCheckboxTree;

let SharedReporterForm = props => {

  let { question, recordClass, formState, onFormChange, onSubmit, ontology } = props;
  let attributeTree = util.getTree(ontology, isQualifying('download'));
  let getUpdateHandler = fieldName => util.getChangeHandler(fieldName, onFormChange, formState);

  return (
    <div>
      {util.getReporterCheckboxList("Choose Attributes", getUpdateHandler('attributes'),
        util.getAllAttributes(recordClass, question, util.isInReport), formState.attributes)}
      {util.getReporterCheckboxList("Choose Tables", getUpdateHandler('tables'),
        util.getAllTables(recordClass, util.isInReport), formState.tables)}
      <div>
        <h3>Additional Options:</h3>
        <div style={{marginLeft:"2em"}}>
          <Checkbox value={formState.includeEmptyTables} onChange={getUpdateHandler('includeEmptyTables')}/>
          <span style={{marginLeft:'0.5em'}}>Include empty tables</span>
        </div>
      </div>
      <div>
        <h3>Download Type:</h3>
        <div style={{marginLeft:"2em"}}>
          <RadioList name="attachmentType" value={formState.attachmentType}
              onChange={getUpdateHandler('attachmentType')} items={util.attachmentTypes}/>
        </div>
      </div>
      <div style={{width:'30em',textAlign:'center', margin:'0.6em 0'}}>
        <input type="button" value="Submit" onClick={onSubmit}/>
      </div>
    </div>
  );
};

SharedReporterForm.getInitialState = (downloadFormStoreState, userStoreState) => ({
  formState: {
    attributes: util.getAttributeSelections(
        userStoreState.preferences, downloadFormStoreState.question),
    tables: [],
    includeEmptyTables: true,
    attachmentType: "plain"
  },
  formUiState: null
});

export default SharedReporterForm;
