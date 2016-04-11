import * as Wdk from 'wdk-client';

let util = Object.assign({}, Wdk.ComponentUtils, Wdk.ReporterUtils, Wdk.OntologyUtils);
let { CategoriesCheckboxTree, RadioList, Checkbox } = Wdk.Components;

let SharedReporterForm = props => {

  let { question, recordClass, formState, formUiState, onFormChange, onFormUiChange, onSubmit, ontology } = props;
  let getUpdateHandler = fieldName => util.getChangeHandler(fieldName, onFormChange, formState);
  let getUiUpdateHandler = fieldName => util.getChangeHandler(fieldName, onFormUiChange, formUiState);

  return (
    <div>
      <CategoriesCheckboxTree
          // title and layout of the tree
          title="Choose Attributes"
          searchBoxPlaceholder="Search Attributes..."
          tree={util.getAttributeTree(ontology, recordClass, question)}

          // state of the tree
          selectedLeaves={formState.attributes}
          expandedBranches={formUiState.expandedAttributeNodes}
          searchText={formUiState.attributeSearchText}

          // change handlers for each state element controlled by the tree
          onChange={getUpdateHandler('attributes')}
          onUiChange={getUiUpdateHandler('expandedAttributeNodes')}
          onSearchTextChange={getUiUpdateHandler('attributeSearchText')}
      />

      <CategoriesCheckboxTree
          // title and layout of the tree
          title="Choose Tables"
          searchBoxPlaceholder="Search Tables..."
          tree={util.getTableTree(ontology, recordClass)}

          // state of the tree
          selectedLeaves={formState.tables}
          expandedBranches={formUiState.expandedTableNodes}
          searchText={formUiState.tableSearchText}

          // change handlers for each state element controlled by the tree
          onChange={getUpdateHandler('tables')}
          onUiChange={getUiUpdateHandler('expandedTableNodes')}
          onSearchTextChange={getUiUpdateHandler('tableSearchText')}
      />

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
  formUiState: {
    expandedAttributeNodes: null,
    attributeSearchText: "",
    expandedTableNodes: null,
    tableSearchText: ""
  }
});

export default SharedReporterForm;
