import * as Wdk from 'wdk-client';
import ExcelNote from './ExcelNote';

let util = Object.assign({}, Wdk.ComponentUtils, Wdk.ReporterUtils, Wdk.CategoryUtils);
let { CategoriesCheckboxTree, RadioList, Checkbox, ReporterSortMessage } = Wdk.Components;

let TranscriptAttributesReporterForm = props => {

  let { scope, question, recordClass, formState, formUiState, onFormChange, onFormUiChange, onSubmit, ontology } = props;
  let getUpdateHandler = fieldName => util.getChangeHandler(fieldName, onFormChange, formState);
  let getUiUpdateHandler = fieldName => util.getChangeHandler(fieldName, onFormUiChange, formUiState);

  let transcriptAttribChangeHandler = newAttribsArray => {
    onFormChange(Object.assign({}, formState, { ['attributes']:
      util.addPk(util.prependAttrib('source_id', newAttribsArray), recordClass) }));
  };

  return (
    <div>
      <ReporterSortMessage scope={scope}/>
      <div>
        <h3>Choose Rows:</h3>
        <div style={{marginLeft:"2em"}}>
          <label>
            <Checkbox value={formState.applyFilter} onChange={getUpdateHandler('applyFilter')}/>
            <span style={{marginLeft:'0.5em'}}>Include only one transcript per gene (the longest)</span>
          </label>
        </div>
      </div>
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
          onChange={transcriptAttribChangeHandler}
          onUiChange={getUiUpdateHandler('expandedAttributeNodes')}
          onSearchTermChange={getUiUpdateHandler('attributeSearchText')}
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

function getUserPrefFilterValue(prefs) {
  let prefValue = prefs['representativeTranscriptOnly'];
  return (prefValue !== undefined && prefValue === "true");
}

TranscriptAttributesReporterForm.getInitialState = (downloadFormStoreState, userStoreState) => {
  let { scope, step, question, recordClass, ontology } = downloadFormStoreState;
  // select all attribs and tables for record page, else column user prefs and no tables
  let attribs = util.addPk(util.prependAttrib('source_id',
      (scope === 'results' ?
          util.getAttributeSelections(userStoreState.preferences, question) :
          util.getAllLeafIds(util.getAttributeTree(ontology, recordClass.name, question)))), recordClass);
  return {
    formState: {
      attributes: attribs,
      includeHeader: true,
      attachmentType: "plain",
      applyFilter: getUserPrefFilterValue(userStoreState.preferences)
    },
    formUiState: {
      expandedAttributeNodes: null,
      attributeSearchText: ""
    }
  };
}

export default TranscriptAttributesReporterForm;
