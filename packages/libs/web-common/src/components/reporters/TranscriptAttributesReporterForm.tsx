import React from 'react';
import {
  CategoriesCheckboxTree,
  Checkbox,
  RadioList,
  ReporterSortMessage,
} from '@veupathdb/wdk-client/lib/Components';
import * as ComponentUtils from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import * as ReporterUtils from '@veupathdb/wdk-client/lib/Views/ReporterForm/reporterUtils';
import * as CategoryUtils from '@veupathdb/wdk-client/lib/Utils/CategoryUtils';
import {
  RecordClass,
  Question,
} from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { Ontology } from '@veupathdb/wdk-client/lib/Utils/OntologyUtils';
import TabularReporterFormSubmitButtons from './TabularReporterFormSubmitButtons';
import ExcelNote from './ExcelNote';
import { LinksPosition } from '@veupathdb/coreui/lib/components/inputs/checkboxes/CheckboxTree/CheckboxTree';
import { ReporterFormComponent } from './Types';

const util = Object.assign({}, ComponentUtils, ReporterUtils, CategoryUtils);

const SINGLE_TRANSCRIPT_VIEW_FILTER_VALUE = {
  name: 'representativeTranscriptOnly',
  value: {},
};

const IN_BASKET_VIEW_FILTER_VALUE = {
  name: 'in_basket_filter',
  value: {},
};

interface ViewFilter {
  name: string;
  value: any;
}

interface TranscriptAttributesFormState {
  attributes: string[];
  includeHeader: boolean;
  attachmentType: string;
}

interface TranscriptAttributesFormUiState {
  expandedAttributeNodes: string[] | null;
  attributeSearchText: string;
}

interface TranscriptAttributesReporterFormProps {
  scope: string;
  question: Question;
  recordClass: RecordClass;
  formState: TranscriptAttributesFormState;
  formUiState: TranscriptAttributesFormUiState;
  viewFilters?: ViewFilter[];
  updateFormState: (formState: TranscriptAttributesFormState) => void;
  updateFormUiState: (formUiState: TranscriptAttributesFormUiState) => void;
  updateViewFilters: (viewFilters: ViewFilter[]) => void;
  onSubmit: (event: React.MouseEvent<HTMLButtonElement>) => void;
  ontology: Ontology<any>;
  includeSubmit: boolean;
}

const TranscriptAttributesReporterForm: ReporterFormComponent = (
  props: TranscriptAttributesReporterFormProps
) => {
  const {
    scope,
    question,
    recordClass,
    formState,
    formUiState,
    viewFilters,
    updateFormState,
    updateFormUiState,
    updateViewFilters,
    onSubmit,
    ontology,
    includeSubmit,
  } = props;
  const getUpdateHandler = (fieldName: string) =>
    util.getChangeHandler(fieldName, updateFormState, formState);
  const getUiUpdateHandler = (fieldName: string) =>
    util.getChangeHandler(fieldName, updateFormUiState, formUiState);

  const transcriptAttribChangeHandler = (newAttribsArray: string[]) => {
    updateFormState(
      Object.assign({}, formState, {
        attributes: prependAppropriateIds(
          newAttribsArray,
          formState.applyOneTranscriptPerGeneFilter,
          recordClass
        ),
      })
    );
  };

  const transcriptPerGeneChangeHandler = (isChecked: boolean) => {
    const nextViewFilters =
      viewFilters?.filter(
        (filterValue) =>
          filterValue.name !== SINGLE_TRANSCRIPT_VIEW_FILTER_VALUE.name
      ) ?? [];
    if (isChecked) {
      nextViewFilters.push(SINGLE_TRANSCRIPT_VIEW_FILTER_VALUE);
    }
    updateViewFilters(nextViewFilters);
    updateFormState(
      Object.assign({}, formState, {
        attributes: prependAppropriateIds(
          formState.attributes,
          isChecked,
          recordClass
        ),
      })
    );
  };

  const inBasketFilterChangeHandler = (isChecked: boolean) => {
    const nextViewFilters =
      viewFilters?.filter(
        (filterValue) => filterValue.name !== IN_BASKET_VIEW_FILTER_VALUE.name
      ) ?? [];
    if (isChecked) {
      nextViewFilters.push(IN_BASKET_VIEW_FILTER_VALUE);
    }
    updateViewFilters(nextViewFilters);
  };

  return (
    <div>
      <ReporterSortMessage scope={scope} />
      <div className="eupathdb-ReporterFormWrapper">
        <div className="eupathdb-ReporterForm">
          <div className="eupathdb-ReporterFormGroup eupathdb-ReporterFormGroup__columns">
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
              onChange={transcriptAttribChangeHandler}
              onUiChange={getUiUpdateHandler('expandedAttributeNodes')}
              onSearchTermChange={getUiUpdateHandler('attributeSearchText')}
              linksPosition={LinksPosition.Top}
            />
          </div>

          <div className="eupathdb-ReporterFormGroup eupathdb-ReporterFormGroup__otherOptions">
            <div>
              <h3>Choose Rows</h3>
              <div>
                <label>
                  <Checkbox
                    value={
                      viewFilters?.some(
                        (f) =>
                          f.name === SINGLE_TRANSCRIPT_VIEW_FILTER_VALUE.name
                      ) ?? false
                    }
                    onChange={transcriptPerGeneChangeHandler}
                  />
                  <span style={{ marginLeft: '0.5em' }}>
                    Include only one transcript per gene (the longest)
                  </span>
                </label>
              </div>
              <div>
                <label>
                  <Checkbox
                    value={
                      viewFilters?.some(
                        (f) => f.name === IN_BASKET_VIEW_FILTER_VALUE.name
                      ) ?? false
                    }
                    onChange={inBasketFilterChangeHandler}
                  />
                  <span style={{ marginLeft: '0.5em' }}>
                    Include only genes in your basket
                  </span>
                </label>
              </div>
            </div>
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
            <TabularReporterFormSubmitButtons
              onSubmit={onSubmit}
              recordClass={recordClass}
            />
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

function prependAppropriateIds(
  selectedAttributes: string[],
  applyOneTranscriptPerGeneFilterChecked: boolean,
  recordClass: RecordClass
): string[] {
  // per Redmine #22888, don't include transcript ID when filter box is checked and add back if unchecked
  const nonIdAttrs = selectedAttributes.filter(
    (attr) => ![recordClass.recordIdAttributeName, 'source_id'].includes(attr)
  );
  return util.addPk(
    applyOneTranscriptPerGeneFilterChecked
      ? nonIdAttrs
      : util.prependAttrib('source_id', nonIdAttrs),
    recordClass
  );
}

function getUserPrefFilterValue(prefs: any): boolean {
  const prefValue = prefs.project['representativeTranscriptOnly'];
  return prefValue !== undefined && prefValue === 'true';
}

TranscriptAttributesReporterForm.getInitialState = (
  downloadFormStoreState: any
) => {
  const { scope, question, recordClass, ontology, preferences } =
    downloadFormStoreState;
  // select all attribs and tables for record page, else column user prefs and no tables
  const allReportScopedAttrs = util.getAllLeafIds(
    util.getAttributeTree(ontology, recordClass.fullName, question)
  );
  let selectedAttributes =
    scope === 'results'
      ? util.getAttributeSelections(preferences, question, allReportScopedAttrs)
      : allReportScopedAttrs;
  const oneTranscriptPerGeneFilterChecked = getUserPrefFilterValue(preferences);
  selectedAttributes = prependAppropriateIds(
    selectedAttributes,
    oneTranscriptPerGeneFilterChecked,
    recordClass
  );
  return {
    formState: {
      attributes: selectedAttributes,
      includeHeader: true,
      attachmentType: 'plain',
    },
    formUiState: {
      expandedAttributeNodes: null,
      attributeSearchText: '',
    },
    viewFilters: oneTranscriptPerGeneFilterChecked
      ? [SINGLE_TRANSCRIPT_VIEW_FILTER_VALUE]
      : undefined,
  };
};

export default TranscriptAttributesReporterForm;
