import * as Wdk from 'wdk-client';

let util = Object.assign({}, Wdk.ComponentUtils, Wdk.ReporterUtils, Wdk.CategoryUtils);
let { CategoriesCheckboxTree, RadioList, Checkbox, ReporterSortMessage } = Wdk.Components;

let TableReporterForm = props => {

  let { scope, question, recordClass, formState, formUiState, onFormChange, onFormUiChange, onSubmit, ontology } = props;
  let getUpdateHandler = fieldName => util.getChangeHandler(fieldName, onFormChange, formState);
  let getUiUpdateHandler = fieldName => util.getChangeHandler(fieldName, onFormUiChange, formUiState);

  return (
    <div>
      <ReporterSortMessage scope={scope}/>
      <CategoriesCheckboxTree
          // title and layout of the tree
          title="Choose a Table"
          searchBoxPlaceholder="Search Tables..."
          tree={util.getTableTree(ontology, recordClass.name, question)}
          isMultiPick={false}

          // state of the tree
          selectedLeaves={formState.tables}
          expandedBranches={formUiState.expandedTableNodes}
          searchTerm={formUiState.tableSearchText}
          isMultiPick={false}

          // change handlers for each state element controlled by the tree
          onChange={getUpdateHandler('tables')}
          onUiChange={getUiUpdateHandler('expandedTableNodes')}
          onSearchTermChange={getUiUpdateHandler('tableSearchText')}
      />
      <div>
        <h3>Additional Options:</h3>
        <div style={{marginLeft:"2em"}}>
          <label>
            <Checkbox value={formState.includeHeader} onChange={getUpdateHandler('includeHeader')}/>
            <span style={{marginLeft:'0.5em'}}>Include header row (column names)</span>
          </label>
        </div>
      </div>
      <div>
        <h3>Download Type and Format:</h3>
        <div style={{marginLeft:"2em"}}>
          <RadioList value={formState.attachmentType} items={util.tabularAttachmentTypes}
            onChange={getUpdateHandler('attachmentType')}/>
        </div>
      </div>
      <div style={{width:'30em',textAlign:'center', margin:'0.6em 0'}}>
        <input type="button" value="Submit" onClick={onSubmit}/>
      </div>
      <hr/>
      <div style={{margin:'0.5em 2em'}}>
        <ExcelNote/>
      </div>
      <hr/>
    </div>
  );
}

TableReporterForm.getInitialState = (downloadFormStoreState, userStoreState) => {
  let tableTree = util.getTableTree(
      downloadFormStoreState.ontology,
      downloadFormStoreState.recordClass.name,
      downloadFormStoreState.question);
  let firstLeafName = util.findFirstLeafId(tableTree);
  return {
    formState: {
      stepId: downloadFormStoreState.step.id.toString(),
      tables: [ firstLeafName ],
      includeHeader: true,
      attachmentType: "plain"
    },
    formUiState: {
      expandedTableNodes: null,
      tableSearchText: ""
    }
  };
}

export default TableReporterForm;
