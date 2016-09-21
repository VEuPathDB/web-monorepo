import * as Wdk from 'wdk-client';

let util = Object.assign({}, Wdk.ComponentUtils, Wdk.ReporterUtils, Wdk.OntologyUtils, Wdk.CategoryUtils);
let { CategoriesCheckboxTree, RadioList, Checkbox, ReporterSortMessage } = Wdk.Components;

let SharedReporterForm = props => {

  let { scope, question, recordClass, formState, formUiState, updateFormState, updateFormUiState, onSubmit, globalData: { ontology } } = props;
  let getUpdateHandler = fieldName => util.getChangeHandler(fieldName, updateFormState, formState);
  let getUiUpdateHandler = fieldName => util.getChangeHandler(fieldName, updateFormUiState, formUiState);

  return (
    <div>
      <div className="eupathdb-ReporterForm eupathdb-ReporterForm__shared">
        <ReporterSortMessage scope={scope}/>

        <div className="eupathdb-ReporterFormGroup eupathdb-ReporterFormGroup__columns">
          <CategoriesCheckboxTree
              // title and layout of the tree
              title="Choose Attributes"
              searchBoxPlaceholder="Search Attributes..."
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

        <div className="eupathdb-ReporterFormGroup eupathdb-ReporterFormGroup__tables">
          <CategoriesCheckboxTree
            // title and layout of the tree
            title="Choose Tables"
            searchBoxPlaceholder="Search Tables..."
            tree={util.getTableTree(ontology, recordClass.name)}

            // state of the tree
            selectedLeaves={formState.tables}
            expandedBranches={formUiState.expandedTableNodes}
            searchTerm={formUiState.tableSearchText}

            // change handlers for each state element controlled by the tree
            onChange={getUpdateHandler('tables')}
            onUiChange={getUiUpdateHandler('expandedTableNodes')}
            onSearchTermChange={getUiUpdateHandler('tableSearchText')}
          />
        </div>

        <div className="eupathdb-ReporterFormGroup eupathdb-ReporterFormGroup__otherOptions">
          <div className="eupathdb-ReporterFormDownloadType">
            <h3>Download Type</h3>
            <div>
              <RadioList name="attachmentType" value={formState.attachmentType}
                onChange={getUpdateHandler('attachmentType')} items={util.attachmentTypes}/>
            </div>
          </div>
          <div className="eupathdb-ReporterFormAddtionOptions">
            <h3>Additional Options</h3>
            <div>
              <label>
                <Checkbox value={formState.includeEmptyTables} onChange={getUpdateHandler('includeEmptyTables')}/>
                <span style={{marginLeft:'0.5em'}}>Include empty tables</span>
              </label>
            </div>
          </div>
        </div>

      </div>

      <div className="eupathdb-ReporterFormSubmit">
        <input type="submit" value="Submit" onClick={onSubmit}/>
      </div>
    </div>
  );
};

SharedReporterForm.getInitialState = (downloadFormStoreState) => {
  let { scope, question, recordClass, globalData: { ontology, preferences } } = downloadFormStoreState;
  // select all attribs and tables for record page, else column user prefs and no tables
  let allReportScopedAttrs = util.getAllLeafIds(util.getAttributeTree(ontology, recordClass.name, question));
  let attribs = util.addPk((scope === 'results' ?
      util.getAttributeSelections(preferences, question, allReportScopedAttrs) :
      allReportScopedAttrs), recordClass);
  let tables = (scope === 'results' ? [] :
      util.getAllLeafIds(util.getTableTree(ontology, recordClass.name)));
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
