import React from 'react';
import CategoriesCheckboxTree from '../../Components/CheckboxTree/CategoriesCheckboxTree';
import { CategoryTreeNode, getAllLeafIds } from '../../Utils/CategoryUtils';
import { getChangeHandler } from '../../Utils/ComponentUtils';
import { Ontology } from "../../Utils/OntologyUtils";
import { Question, RecordClass } from "../../Utils/WdkModel";
import { State } from "./DownloadFormReducer";
import ReporterSortMessage from './ReporterSortMessage';
import { addPk, getAttributesChangeHandler, getAttributeSelections, getAttributeTree, getTableTree } from './reporterUtils';

type Props<T, U> = {
  scope: string;
  question: Question;
  recordClass: RecordClass;
  summaryView: string;
  ontology: Ontology<CategoryTreeNode>;
  formState: any;
  formUiState: any;
  updateFormState: (state: T) => T;
  updateFormUiState: (uiState: U) => U;
  onSubmit: () => void;
}

function WdkServiceJsonReporterForm<T, U>(props: Props<T, U>) {
  let { scope, question, recordClass, ontology, formState, formUiState, updateFormState, updateFormUiState, onSubmit } = props;
  let getUpdateHandler = (fieldName: string) => getChangeHandler(fieldName, updateFormState, formState);
  let getUiUpdateHandler = (fieldName: string) => getChangeHandler(fieldName, updateFormUiState, formUiState);
  return (
    <div>
      <ReporterSortMessage scope={scope}/>
      <CategoriesCheckboxTree
        title="Choose Columns:"
        leafType="columns"
        searchBoxPlaceholder="Search Columns..."
        tree={getAttributeTree(ontology, recordClass.name, question)}

        selectedLeaves={formState.attributes}
        expandedBranches={formUiState.expandedAttributeNodes}
        searchTerm={formUiState.attributeSearchText}

        onChange={getAttributesChangeHandler('attributes', updateFormState, formState, recordClass)}
        onUiChange={getUiUpdateHandler('expandedAttributeNodes')}
        onSearchTermChange={getUiUpdateHandler('attributeSearchText')}
      />

      <CategoriesCheckboxTree
        title="Choose Tables:"
        leafType="columns"
        searchBoxPlaceholder="Search Tables..."
        tree={getTableTree(ontology, recordClass.name)}

        selectedLeaves={formState.tables}
        expandedBranches={formUiState.expandedTableNodes}
        searchTerm={formUiState.tableSearchText}

        onChange={getUpdateHandler('tables')}
        onUiChange={getUiUpdateHandler('expandedTableNodes')}
        onSearchTermChange={getUiUpdateHandler('tableSearchText')}
      />

      <div style={{width:'30em',textAlign:'center', margin:'0.6em 0'}}>
        <button className="btn" type="submit" onClick={onSubmit}>Get {recordClass.displayNamePlural}</button>
      </div>
    </div>
  );
}

namespace WdkServiceJsonReporterForm {
  export function getInitialState(downloadFormState: State) {
    let attribs: string[], tables: string[];

    let { scope, question, recordClass, ontology, preferences } = downloadFormState;

    if (preferences == null || ontology == null || question == null || recordClass == null) {
      console.warn('DownloadForm state is missing data. Using empty attribute and tables.', downloadFormState);
      attribs = tables = [];
    }

    // select all attribs and tables for record page, else column user prefs and no tables
    else {
      attribs = (scope === 'results' ?
        addPk(getAttributeSelections(preferences, question), recordClass) :
        addPk(getAllLeafIds(getAttributeTree(ontology, recordClass.name, question)), recordClass));
      tables = (scope === 'results' ? [] :
        getAllLeafIds(getTableTree(ontology, recordClass.name)));
    }
    return {
      formState: {
        attributes: attribs,
        tables:tables
      },
      formUiState: {
        expandedAttributeNodes: null,
        attributeSearchText: "",
        expandedTableNodes: null,
        tableSearchText: ""
      }
    };
  }
}

export default WdkServiceJsonReporterForm;
