import React from 'react';
import { RadioList, Checkbox, ReporterSortMessage, CategoriesCheckboxTree } from 'wdk-client/Components';
import * as ComponentUtils from 'wdk-client/Utils/ComponentUtils';
import * as ReporterUtils from 'wdk-client/Views/ReporterForm/reporterUtils';
import * as CategoryUtils from 'wdk-client/Utils/CategoryUtils';
import ExcelNote from './ExcelNote';

let util = Object.assign({}, ComponentUtils, ReporterUtils, CategoryUtils);

let TableReporterForm = props => {

  let { scope, question, recordClass, formState, formUiState, updateFormState, updateFormUiState, onSubmit, ontology, includeSubmit } = props;
  let getUpdateHandler = fieldName => util.getChangeHandler(fieldName, updateFormState, formState);
  let getUiUpdateHandler = fieldName => util.getChangeHandler(fieldName, updateFormUiState, formUiState);

  return (
    <div>
      <ReporterSortMessage scope={scope}/>

      <div className="eupathdb-ReporterForm">
        <div className="eupathdb-ReporterFormGroup eupathdb-ReporterFormGroup__tables">
          <CategoriesCheckboxTree
              // title and layout of the tree
              title="Choose a Table"
              searchBoxPlaceholder="Search Tables..."
              tree={util.getTableTree(ontology, recordClass.fullName, question)}

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
        </div>
        <div className="eupathdb-ReporterFormGroup eupathdb-ReporterFormGroup__otherOptions">
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
        </div>
      </div>

      { includeSubmit &&
        <div className="eupathdb-ReporterFormSubmit">
          <button className="btn" type="submit" onClick={onSubmit}>Get {recordClass.displayNamePlural}</button>
        </div>
      }
      <hr/>
      <div style={{margin:'0.5em 2em'}}>
        <ExcelNote/>
      </div>
      <hr/>
    </div>
  );
}

TableReporterForm.getInitialState = (downloadFormStoreState) => {
  let tableTree = util.getTableTree(
      downloadFormStoreState.ontology,
      downloadFormStoreState.recordClass.fullName,
      downloadFormStoreState.question);
  let firstLeafName = util.findFirstLeafId(tableTree);
  return {
    formState: {
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
