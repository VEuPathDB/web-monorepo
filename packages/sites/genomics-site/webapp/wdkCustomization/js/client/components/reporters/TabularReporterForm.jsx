import * as Wdk from 'wdk-client';

let util = Object.assign({}, Wdk.ComponentUtils, Wdk.ReporterUtils, Wdk.CategoryUtils);
let { CategoriesCheckboxTree, RadioList, Checkbox, ReporterSortMessage } = Wdk.Components;

let TabularReporterForm = props => {

  let { scope, question, recordClass, formState, formUiState, onFormChange, onFormUiChange, onSubmit, ontology } = props;
  let getUpdateHandler = fieldName => util.getChangeHandler(fieldName, onFormChange, formState);
  let getUiUpdateHandler = fieldName => util.getChangeHandler(fieldName, onFormUiChange, formUiState);

  return (
    <div>
      <ReporterSortMessage scope={scope}/>
      <CategoriesCheckboxTree
          // title and layout of the tree
          title="Choose Columns:"
          searchBoxPlaceholder="Search Columns..."
          tree={util.getAttributeTree(ontology, recordClass.name, question)}

          // state of the tree
          selectedLeaves={formState.attributes}
          expandedBranches={formUiState.expandedAttributeNodes}
          searchTerm={formUiState.attributeSearchText}
      
          // change handlers for each state element controlled by the tree
          onChange={util.getAttributesChangeHandler('attributes', onFormChange, formState, recordClass)}
          onUiChange={getUiUpdateHandler('expandedAttributeNodes')}
          onSearchTermChange={getUiUpdateHandler('attributeSearchText')}
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

TabularReporterForm.getInitialState = (downloadFormStoreState, userStoreState) => {
  let { scope, question, recordClass, ontology } = downloadFormStoreState;
  // select all attribs and tables for record page, else column user prefs and no tables
  let attribs = (scope === 'results' ?
      util.addPk(util.getAttributeSelections(userStoreState.preferences, question), recordClass) :
      util.addPk(util.getAllLeafIds(util.getAttributeTree(ontology, recordClass.name, question)), recordClass));
  return {
    formState: {
      attributes: attribs,
      includeHeader: true,
      attachmentType: "plain"
    },
    formUiState: {
      expandedAttributeNodes: null,
      attributeSearchText: ""
    }
  };
}

export default TabularReporterForm;
