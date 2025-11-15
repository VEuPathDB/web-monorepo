import React from 'react';
import {
  CategoriesCheckboxTree,
  Checkbox,
  RadioList,
  ReporterSortMessage,
} from '@veupathdb/wdk-client/lib/Components';
import * as CategoryUtils from '@veupathdb/wdk-client/lib/Utils/CategoryUtils';
import * as ComponentUtils from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import * as ReporterUtils from '@veupathdb/wdk-client/lib/Views/ReporterForm/reporterUtils';
import TabularReporterFormSubmitButtons from './TabularReporterFormSubmitButtons';
import ExcelNote from './ExcelNote';
import { LinksPosition } from '@veupathdb/coreui/lib/components/inputs/checkboxes/CheckboxTree/CheckboxTree';
import {
  Question,
  RecordClass,
} from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { CategoryOntology } from '@veupathdb/wdk-client/lib/Utils/CategoryUtils';
import { State } from '@veupathdb/wdk-client/lib/StoreModules/DownloadFormStoreModule';

const util = Object.assign({}, ComponentUtils, ReporterUtils, CategoryUtils);

interface TabularReporterFormProps {
  scope: string;
  question: Question;
  recordClass: RecordClass;
  formState: TabularFormState;
  formUiState: TabularFormUiState;
  updateFormState: (state: TabularFormState) => void;
  updateFormUiState: (uiState: TabularFormUiState) => void;
  onSubmit: () => void;
  ontology: CategoryOntology;
  includeSubmit: boolean;
}

interface TabularFormState {
  attributes: string[];
  includeHeader: boolean;
  attachmentType: string;
}

interface TabularFormUiState {
  expandedAttributeNodes: string[] | null;
  attributeSearchText: string;
}

const TabularReporterForm: React.FC<TabularReporterFormProps> & {
  getInitialState: (downloadFormStoreState: State) => {
    formState: TabularFormState;
    formUiState: TabularFormUiState;
  };
} = (props) => {
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

      <div className="eupathdb-ReporterForm">
        <div className="eupathdb-ReporterFormGroup eupathdb-ReporterFormGroup__right">
          <CategoriesCheckboxTree
            // title and layout of the tree
            title="Choose Columns"
            searchBoxPlaceholder="Search Columns..."
            searchIconPosition="right"
            tree={util.getAttributeTree(
              ontology,
              recordClass.fullName,
              question
            )}
            // state of the tree
            selectedLeaves={formState.attributes}
            expandedBranches={formUiState.expandedAttributeNodes}
            searchTerm={formUiState.attributeSearchText}
            // change handlers for each state element controlled by the tree
            onChange={util.getAttributesChangeHandler(
              'attributes',
              updateFormState,
              formState,
              recordClass
            )}
            onUiChange={getUiUpdateHandler('expandedAttributeNodes')}
            onSearchTermChange={getUiUpdateHandler('attributeSearchText')}
            linksPosition={LinksPosition.Top}
          />
        </div>
        <div className="eupathdb-ReporterFormGroup eupathdb-ReporterFormGroup__left">
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
          {includeSubmit && (
            <div style={{ margin: '2em 0' }}>
              <TabularReporterFormSubmitButtons
                onSubmit={onSubmit}
                recordClass={recordClass}
              />
            </div>
          )}
        </div>
      </div>

      <hr />
      <div style={{ margin: '0.5em 2em' }}>
        <ExcelNote />
      </div>
      <hr />
    </div>
  );
};

TabularReporterForm.getInitialState = (downloadFormStoreState: State) => {
  const { scope, question, recordClass, ontology, preferences } =
    downloadFormStoreState;
  // select all attribs and tables for record page, else column user prefs and no tables
  const allReportScopedAttrs = util.getAllLeafIds(
    util.getAttributeTree(ontology!, recordClass!.fullName, question!)
  );
  const attribs = util.addPk(
    scope === 'results'
      ? util.getAttributeSelections(
          preferences!,
          question!,
          allReportScopedAttrs
        )
      : allReportScopedAttrs,
    recordClass!
  );
  return {
    formState: {
      attributes: attribs,
      includeHeader: true,
      attachmentType: 'plain',
    },
    formUiState: {
      expandedAttributeNodes: null,
      attributeSearchText: '',
    },
  };
};

export default TabularReporterForm;
