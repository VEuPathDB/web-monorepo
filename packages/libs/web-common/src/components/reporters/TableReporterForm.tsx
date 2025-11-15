import React from 'react';
import {
  RadioList,
  Checkbox,
  ReporterSortMessage,
  CategoriesCheckboxTree,
} from '@veupathdb/wdk-client/lib/Components';
import * as ComponentUtils from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import * as ReporterUtils from '@veupathdb/wdk-client/lib/Views/ReporterForm/reporterUtils';
import * as CategoryUtils from '@veupathdb/wdk-client/lib/Utils/CategoryUtils';
import {
  RecordClass,
  Question,
} from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { Ontology } from '@veupathdb/wdk-client/lib/Utils/OntologyUtils';
import ExcelNote from './ExcelNote';
import { LinksPosition } from '@veupathdb/coreui/lib/components/inputs/checkboxes/CheckboxTree/CheckboxTree';
import { ReporterFormComponent } from './Types';

const util = Object.assign({}, ComponentUtils, ReporterUtils, CategoryUtils);

interface TableFormState {
  tables: string[];
  includeHeader: boolean;
  attachmentType: string;
}

interface TableFormUiState {
  expandedTableNodes: string[] | null;
  tableSearchText: string;
}

interface TableReporterFormProps {
  scope: string;
  question: Question;
  recordClass: RecordClass;
  formState: TableFormState;
  formUiState: TableFormUiState;
  updateFormState: (formState: TableFormState) => void;
  updateFormUiState: (formUiState: TableFormUiState) => void;
  onSubmit: (event: React.MouseEvent<HTMLButtonElement>) => void;
  ontology: Ontology<any>;
  includeSubmit: boolean;
}

const TableReporterForm: ReporterFormComponent = (
  props: TableReporterFormProps
) => {
  const {
    scope,
    question,
    recordClass,
    formState,
    formUiState,
    updateFormState,
    updateFormUiState,
    onSubmit,
    ontology,
    includeSubmit,
  } = props;
  const getUpdateHandler = (fieldName: string) =>
    util.getChangeHandler(fieldName, updateFormState, formState);
  const getUiUpdateHandler = (fieldName: string) =>
    util.getChangeHandler(fieldName, updateFormUiState, formUiState);

  return (
    <div>
      <ReporterSortMessage scope={scope} />
      <div className="eupathdb-ReporterFormWrapper">
        <div className="eupathdb-ReporterForm">
          <div className="eupathdb-ReporterFormGroup eupathdb-ReporterFormGroup__tables">
            <CategoriesCheckboxTree
              // title and layout of the tree
              title="Choose a Table"
              searchBoxPlaceholder="Search Tables..."
              searchIconPosition="right"
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
              linksPosition={LinksPosition.Top}
              styleOverrides={{
                treeSection: {
                  ul: {
                    padding: 0,
                  },
                },
              }}
            />
          </div>
          <div className="eupathdb-ReporterFormGroup eupathdb-ReporterFormGroup__otherOptions">
            <div>
              <h3>Download Type</h3>
              <div>
                <RadioList
                  value={formState.attachmentType}
                  items={util.tabularAttachmentTypes}
                  onChange={getUpdateHandler('attachmentType')}
                />
              </div>
            </div>
            <div>
              <h3>Additional Options</h3>
              <div>
                <label>
                  <Checkbox
                    value={formState.includeHeader}
                    onChange={getUpdateHandler('includeHeader')}
                  />
                  <span style={{ marginLeft: '0.5em' }}>
                    Include header row (column names)
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {includeSubmit && (
          <div className="eupathdb-ReporterFormSubmit">
            <button className="btn" type="submit" onClick={onSubmit}>
              Get {recordClass.displayNamePlural}
            </button>
          </div>
        )}
      </div>
      <hr />
      <div style={{ margin: '0.5em 2em' }}>
        <ExcelNote />
      </div>
      <hr />
    </div>
  );
};

TableReporterForm.getInitialState = (downloadFormStoreState: any) => {
  const tableTree = util.getTableTree(
    downloadFormStoreState.ontology,
    downloadFormStoreState.recordClass.fullName,
    downloadFormStoreState.question
  );
  const firstLeafName = util.findFirstLeafId(tableTree);
  return {
    formState: {
      tables: [firstLeafName],
      includeHeader: true,
      attachmentType: 'plain',
    },
    formUiState: {
      expandedTableNodes: null,
      tableSearchText: '',
    },
  };
};

export default TableReporterForm;
