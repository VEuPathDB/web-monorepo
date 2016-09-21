import * as Wdk from 'wdk-client';
import ExcelNote from './ExcelNote';

let util = Object.assign({}, Wdk.ComponentUtils, Wdk.ReporterUtils, Wdk.CategoryUtils);
let { CategoriesCheckboxTree, RadioList, Checkbox, ReporterSortMessage } = Wdk.Components;

let TabularReporterForm = props => {

  let { scope, question, recordClass, formState, formUiState, updateFormState, updateFormUiState, onSubmit, globalData: { ontology } } = props;
  let getUpdateHandler = fieldName => util.getChangeHandler(fieldName, updateFormState, formState);
  let getUiUpdateHandler = fieldName => util.getChangeHandler(fieldName, updateFormUiState, formUiState);

  return (
    <div>
      <ReporterSortMessage scope={scope}/>

      <div className="eupathdb-ReporterForm">
        <div className="eupathdb-ReporterFormGroup eupathdb-ReporterFormGroup__right">
          <CategoriesCheckboxTree
              // title and layout of the tree
              title="Choose Columns"
              searchBoxPlaceholder="Search Columns..."
              tree={util.getAttributeTree(ontology, recordClass.name, question)}

              // state of the tree
              selectedLeaves={formState.attributes}
              expandedBranches={formUiState.expandedAttributeNodes}
              searchTerm={formUiState.attributeSearchText}
          
              // change handlers for each state element controlled by the tree
              onChange={util.getAttributesChangeHandler('attributes', updateFormState, formState, recordClass)}
              onUiChange={getUiUpdateHandler('expandedAttributeNodes')}
              onSearchTermChange={getUiUpdateHandler('attributeSearchText')}
          />
        </div>
        <div className="eupathdb-ReporterFormGroup eupathdb-ReporterFormGroup__left">
          <div>
            <h3>Download Type</h3>
            <div>
              <RadioList value={formState.attachmentType} items={util.tabularAttachmentTypes}
                onChange={getUpdateHandler('attachmentType')}/>
            </div>
          </div>
          <div>
            <h3>Additional Options</h3>
            <div>
              <label>
                <Checkbox value={formState.includeHeader} onChange={getUpdateHandler('includeHeader')}/>
                <span style={{marginLeft:'0.5em'}}>Include header row (column names)</span>
              </label>
            </div>
          </div>
          <div style={{margin:'2em 0'}}>
            <input type="submit" value="Submit" onClick={onSubmit}/>
          </div>
        </div>
      </div>

      <hr/>
      <div style={{margin:'0.5em 2em'}}>
        <ExcelNote/>
      </div>
      <hr/>
    </div>
  );
}

TabularReporterForm.getInitialState = (downloadFormStoreState) => {
  let { scope, question, recordClass, globalData: { ontology, preferences } } = downloadFormStoreState;
  // select all attribs and tables for record page, else column user prefs and no tables
  let allReportScopedAttrs = util.getAllLeafIds(util.getAttributeTree(ontology, recordClass.name, question));
  let attribs = util.addPk((scope === 'results' ?
      util.getAttributeSelections(preferences, question, allReportScopedAttrs) :
      allReportScopedAttrs), recordClass);
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
