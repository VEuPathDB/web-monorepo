import * as Wdk from 'wdk-client';

let util = Object.assign({}, Wdk.ComponentUtils, Wdk.ReporterUtils, Wdk.OntologyUtils, Wdk.CategoryUtils);
let { CategoriesCheckboxTree, RadioList, Checkbox, ReporterSortMessage } = Wdk.Components;

let SharedReporterForm = props => {

  let { scope, question, recordClass, formState, formUiState, onFormChange, onFormUiChange, onSubmit, ontology } = props;
  let getUpdateHandler = fieldName => util.getChangeHandler(fieldName, onFormChange, formState);
  let getUiUpdateHandler = fieldName => util.getChangeHandler(fieldName, onFormUiChange, formUiState);

  return (
    <div>
      <ReporterSortMessage scope={scope}/>
      <CategoriesCheckboxTree
          // title and layout of the tree
          title="Choose Attributes"
          searchBoxPlaceholder="Search Attributes..."
          tree={util.getAttributeTree(ontology, recordClass, question)}

          // state of the tree
          selectedLeaves={formState.attributes}
          expandedBranches={formUiState.expandedAttributeNodes}
          searchTerm={formUiState.attributeSearchText}

          // change handlers for each state element controlled by the tree
          onChange={getUpdateHandler('attributes')}
          onUiChange={getUiUpdateHandler('expandedAttributeNodes')}
          onSearchTermChange={getUiUpdateHandler('attributeSearchText')}
      />

      <CategoriesCheckboxTree
          // title and layout of the tree
          title="Choose Tables"
          searchBoxPlaceholder="Search Tables..."
          tree={util.getTableTree(ontology, recordClass)}

          // state of the tree
          selectedLeaves={formState.tables}
          expandedBranches={formUiState.expandedTableNodes}
          searchTerm={formUiState.tableSearchText}

          // change handlers for each state element controlled by the tree
          onChange={getUpdateHandler('tables')}
          onUiChange={getUiUpdateHandler('expandedTableNodes')}
          onSearchTermChange={getUiUpdateHandler('tableSearchText')}
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

SharedReporterForm.getInitialState = (downloadFormStoreState, userStoreState) => {
  let { scope, question, recordClass, ontology } = downloadFormStoreState;
  // select all attribs and tables for record page, else column user prefs and no tables
  let attribs = (scope === 'results' ?
      util.getAttributeSelections(userStoreState.preferences, question) :
      util.getAllLeafIds(util.getAttributeTree(ontology, recordClass, question)));
  let tables = (scope === 'results' ? [] :
      util.getAllLeafIds(util.getTableTree(ontology, recordClass)));
  return {
    formState: {
      attributes: attribs,
      tables: tables,
      includeEmptyTables: true,
      attachmentType: "plain"
    },
    formUiState: {
      expandedAttributeNodes: null,
      attributeSearchText: "",
      expandedTableNodes: null,
      tableSearchText: ""
    }
  };
}

export default SharedReporterForm;
