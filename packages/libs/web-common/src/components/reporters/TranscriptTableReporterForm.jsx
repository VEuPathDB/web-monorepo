import TableReporterForm from './TableReporterForm';
import { OrganismParam, MAX_RECOMMENDED_PROPERTY } from '@veupathdb/preferred-organisms/lib/components/OrganismParam';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';

// Transcript Table Reporter is the same as a regular Table Reporter, but need to
//   override the recordClass (Transcript) with Gene to get Gene tables for a Transcript result
let recordClassOverride = {
  recordClass: {
    fullName: 'GeneRecordClasses.GeneRecordClass',
    displayNamePlural: 'Genes'
  },
};

const ORTHOLOGS_TABLE_NAME = 'OrthologsLite';
const ORGANISM_SEARCH_NAME = "GenesByTaxon";
const ORGANISM_PARAM_NAME = 'organism';
const MAX_ORTHOLOG_SELECTED_ORGANISMS = 5;

let OrganismSelection = ({ props }) => {
  let {
    formState,
    formUiState,
    updateFormState,
    updateFormUiState
  } = props;

  let orgParam = useWdkService(
    async (wdkService) => {
      const question = await wdkService.getQuestionAndParameters(ORGANISM_SEARCH_NAME);
      return question.parameters.find(p => p.name === ORGANISM_PARAM_NAME);
    }
  );

  // may need to wait for param to populate (async)
  if (orgParam == null) return null;

  let replacementProperties = !orgParam.properties ? {} :
    { ...orgParam.properties, [MAX_RECOMMENDED_PROPERTY]: undefined };
  orgParam = Object.assign({}, orgParam, {
    minSelectedCount: 1,
    maxSelectedCount: MAX_ORTHOLOG_SELECTED_ORGANISMS,
    properties: replacementProperties
  });

  let orgParamValue = JSON.stringify(formState.orthologOrganisms);

  let paramContext = {
    searchName: ORGANISM_SEARCH_NAME,
    parameter: orgParam,
    paramValues: { [ORGANISM_PARAM_NAME]: orgParamValue }
  };

  const defaultParamUiState = {
    expandedList: [],
    searchTerm: ''
  };

  let uiConfig = Object.assign({}, defaultParamUiState, formUiState);

  // use a custom dispatch function to handle UI state events
  let customDispatch = (action) => {
    switch (action.type) {
      case "enum-param-treebox/set-expanded-list":
        updateFormUiState(Object.assign({}, uiConfig, { "expandedList": action.payload.expandedList }));
        return;
      case "enum-param-treebox/set-search-term":
        updateFormUiState(Object.assign({}, uiConfig, { "searchTerm": action.payload.searchTerm }));
        return;
    }
  }

  let orgParamProps = {
    isSearchPage: false,
    ctx: paramContext,
    parameter: orgParam,
    value: orgParamValue,
    uiConfig: uiConfig,
    uiState: uiConfig,
    dispatch: customDispatch,
    onParamValueChange: (value) => {
      let newOrgArray = JSON.parse(value); // should be an array
      updateFormState(Object.assign({}, formState, { orthologOrganisms: newOrgArray }));
    }
  };

  return (
    <div>
      <h3>Choose the organisms you want orthologs for</h3>
      <OrganismParam {...orgParamProps}/>
    </div>
  );
};

// TODO: find this function elsewhere- it is likely to exist
function findLeaf(term, vocabNode) {
  if (vocabNode.data.term === term) {
    // found this org's node; return whether it is a leaf
    return { found: true, isLeaf: vocabNode.children.length === 0 };
  }
  for (let i = 0; i < vocabNode.children.length; i++) {
    let result = findLeaf(term, vocabNode.children[i]);
    if (result.found) {
      return result;
    }
  }
  return { found: false };
}

/** @type import('./Types').ReporterFormComponent */
let TranscriptTableReporterForm = (props) => {

  // need org tree here to limit number of selected organisms
  const orgParam = useWdkService(
    async (wdkService) => {
      const question = await wdkService.getQuestionAndParameters(ORGANISM_SEARCH_NAME);
      return question.parameters.find(p => p.name === ORGANISM_PARAM_NAME);
    }
  );

  let showOrgSelector = props.formState.tables.length !== 0 && props.formState.tables[0] === ORTHOLOGS_TABLE_NAME;
  let orgSelector = showOrgSelector ? <OrganismSelection props={props} /> : null;

  let onSubmit = !showOrgSelector ? props.onSubmit : () => {
    let selectedOrgs = props.formState.orthologOrganisms;
    if (props.formState.orthologOrganisms == null || props.formState.orthologOrganisms.length === 0) {
      alert ("You must select at least one organism to request an Orthologs table.");
      return;
    }

    let leafOrgs = selectedOrgs.filter(org => {
      let result = findLeaf(org, orgParam.vocabulary);
      return result.found && result.isLeaf;
    });

    if (leafOrgs.length > MAX_ORTHOLOG_SELECTED_ORGANISMS) {
      alert("You can select no more than " + MAX_ORTHOLOG_SELECTED_ORGANISMS + " organisms.");
    }
    else {
      props.onSubmit();
    }
  };
  let newProps = Object.assign({}, props, recordClassOverride, {
    postTableSelectionElement: orgSelector,
    onSubmit: onSubmit
  });
  return <TableReporterForm {...newProps} />;
};

TranscriptTableReporterForm.getInitialState = (downloadFormStoreState) => {
  let newDownloadFormStoreState = Object.assign(
    {},
    downloadFormStoreState,
    recordClassOverride,
    { orthologOrganisms: [] }
  );
  return TableReporterForm.getInitialState(newDownloadFormStoreState);
};

export default TranscriptTableReporterForm;
