import TableReporterForm from './TableReporterForm';
import { OrganismParam } from '@veupathdb/preferred-organisms/lib/components/OrganismParam';
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

let OrganismSelection = ({ props }) => {
  let {
    formState,
    formUiState,
    updateFormState,
    updateFormUiState
  } = props;

  const orgParam = useWdkService(
    async (wdkService) => {
      const question = await wdkService.getQuestionAndParameters(ORGANISM_SEARCH_NAME);
      return question.parameters.find(p => p.name === ORGANISM_PARAM_NAME);
    }
  );

  // may need to wait for param to populate (async)
  if (orgParam == null) return null;

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
      <h3>Select organisms for which orthologs will be returned</h3>
      <OrganismParam {...orgParamProps}/>
    </div>
  );
};

/** @type import('./Types').ReporterFormComponent */
let TranscriptTableReporterForm = (props) => {
  let showOrgSelector = props.formState.tables.length !== 0 && props.formState.tables[0] === ORTHOLOGS_TABLE_NAME;
  let orgSelector = showOrgSelector ? <OrganismSelection props={props} /> : null;
  let onSubmit = !showOrgSelector ? props.onSubmit : () => {
    if (props.formState.orthologOrganisms == null || props.formState.orthologOrganisms.length === 0) {
      alert ("You must select at least one organism to request an Orthologs table.");
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
