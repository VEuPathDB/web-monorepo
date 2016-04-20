import * as Wdk from 'wdk-client';

let util = Object.assign({}, Wdk.ComponentUtils, Wdk.ReporterUtils);
let { CategoriesCheckboxTree, RadioList, Checkbox } = Wdk.Components;

let TableReporterForm = props => {

  let { question, recordClass, formState, formUiState, onFormChange, onFormUiChange, onSubmit, ontology } = props;
  let getUpdateHandler = fieldName => util.getChangeHandler(fieldName, onFormChange, formState);
  let getUiUpdateHandler = fieldName => util.getChangeHandler(fieldName, onFormUiChange, formUiState);

  return (
    <div>
      <CategoriesCheckboxTree
          // title and layout of the tree
          title="Choose a Table"
          searchBoxPlaceholder="Search Tables..."
          tree={util.getTableTree(ontology, recordClass, question)}
          isMultiPick={false}

          // state of the tree
          selectedLeaves={formState.tables}
          expandedBranches={formUiState.expandedTableNodes}
          searchText={formUiState.tableSearchText}
          isMultiPick={false}

          // change handlers for each state element controlled by the tree
          onChange={getUpdateHandler('tables')}
          onUiChange={getUiUpdateHandler('expandedTableNodes')}
          onSearchTextChange={getUiUpdateHandler('tableSearchText')}
      />
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
          <RadioList value={formState.attachmentType} items={util.tabularAttachmentTypes}
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

TableReporterForm.getInitialState = (downloadFormStoreState, userStoreState) => ({
  formState: {
    stepId: downloadFormStoreState.step.id.toString(),
    tables: [],
    includeHeader: true,
    attachmentType: "plain"
  },
  formUiState: {
    expandedTableNodes: null,
    tableSearchText: ""
  }
});

export default TableReporterForm;
