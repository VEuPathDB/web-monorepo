import { useState, useEffect } from 'react';
import TableReporterForm from './TableReporterForm';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { getLeaves } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';

// Transcript Table Reporter is the same as a regular Table Reporter, but need to
//   override the recordClass (Transcript) with Gene to get Gene tables for a Transcript result
const recordClassOverride = {
  recordClass: {
    fullName: 'GeneRecordClasses.GeneRecordClass',
    displayNamePlural: 'Genes',
  },
};

const ORTHOLOGS_TABLE_NAME = 'OrthologsLite';
const ORGANISM_SEARCH_NAME = 'GenesByTaxon';
const ORGANISM_PARAM_NAME = 'organism';
const MAX_ORTHOLOG_SELECTED_ORGANISMS = 5;

const OrganismSelection = ({ props }) => {
  const { formState, formUiState, updateFormState, updateFormUiState } = props;

  // Dynamic import avoids a static dependency on @veupathdb/preferred-organisms in
  // web-common. A static import would break non-genomics site builds (e.g. clinepi-site)
  // that don't have that package. The cleaner long-term fix would be to move OrganismSelection
  // into genomics-site and inject it as a prop, but that requires an extension point in
  // selectReporterComponent (util/reporter.js) which isn't worth the refactor right now.
  const [preferredOrgsModule, setPreferredOrgsModule] = useState(null);

  useEffect(() => {
    import('@veupathdb/preferred-organisms/lib/components/OrganismParam').then(
      setPreferredOrgsModule
    );
  }, []);

  const orgParam = useWdkService(
    async (wdkService) => {
      if (preferredOrgsModule == null) return null;
      const { MAX_RECOMMENDED_PROPERTY } = preferredOrgsModule;
      const question = await wdkService.getQuestionAndParameters(
        ORGANISM_SEARCH_NAME
      );
      const param = question.parameters.find(
        (p) => p.name === ORGANISM_PARAM_NAME
      );
      if (param == null) return null;
      // Remove MAX_RECOMMENDED_PROPERTY to disable the advisory-only maxRecommendedGate;
      // the hard limit is enforced by maxSelectedCount and the submit handler instead.
      const properties = !param.properties
        ? {}
        : { ...param.properties, [MAX_RECOMMENDED_PROPERTY]: undefined };
      return {
        ...param,
        minSelectedCount: 1,
        maxSelectedCount: MAX_ORTHOLOG_SELECTED_ORGANISMS,
        properties,
      };
    },
    [preferredOrgsModule]
  );

  // may need to wait for module or param to populate (async)
  if (preferredOrgsModule == null || orgParam == null) return null;

  const { OrganismParam } = preferredOrgsModule;

  const orgParamValue = JSON.stringify(formState.orthologOrganisms);

  const paramContext = {
    searchName: ORGANISM_SEARCH_NAME,
    parameter: orgParam,
    paramValues: { [ORGANISM_PARAM_NAME]: orgParamValue },
  };

  const defaultParamUiState = {
    expandedList: [],
    searchTerm: '',
  };

  const uiConfig = Object.assign({}, defaultParamUiState, formUiState);

  // use a custom dispatch function to handle UI state events
  const customDispatch = (action) => {
    switch (action.type) {
      case 'enum-param-treebox/set-expanded-list':
        updateFormUiState(
          Object.assign({}, uiConfig, {
            expandedList: action.payload.expandedList,
          })
        );
        return;
      case 'enum-param-treebox/set-search-term':
        updateFormUiState(
          Object.assign({}, uiConfig, { searchTerm: action.payload.searchTerm })
        );
        return;
    }
  };

  const orgParamProps = {
    isSearchPage: false,
    ctx: paramContext,
    parameter: orgParam,
    value: orgParamValue,
    uiConfig: uiConfig,
    uiState: uiConfig,
    dispatch: customDispatch,
    onParamValueChange: (value) => {
      let newOrgArray = JSON.parse(value); // should be an array
      updateFormState(
        Object.assign({}, formState, { orthologOrganisms: newOrgArray })
      );
    },
  };

  return (
    <div>
      <h3>Choose the organisms you want orthologs for</h3>
      <OrganismParam {...orgParamProps} />
    </div>
  );
};

/** @type import('./Types').ReporterFormComponent */
const TranscriptTableReporterForm = (props) => {
  // need org tree here to limit number of selected organisms
  const orgParam = useWdkService(async (wdkService) => {
    const question = await wdkService.getQuestionAndParameters(
      ORGANISM_SEARCH_NAME
    );
    return question.parameters.find((p) => p.name === ORGANISM_PARAM_NAME);
  });

  const showOrgSelector =
    props.formState.tables.length !== 0 &&
    props.formState.tables[0] === ORTHOLOGS_TABLE_NAME;
  const orgSelector = showOrgSelector ? (
    <OrganismSelection props={props} />
  ) : null;

  const onSubmit = !showOrgSelector
    ? props.onSubmit
    : () => {
        const selectedOrgs = props.formState.orthologOrganisms;
        if (
          props.formState.orthologOrganisms == null ||
          props.formState.orthologOrganisms.length === 0
        ) {
          alert(
            'You must select at least one organism to request an Orthologs table.'
          );
          return;
        }

        const leafTerms = new Set(
          getLeaves(orgParam.vocabulary, (node) => node.children).map(
            (node) => node.data.term
          )
        );
        const leafOrgs = selectedOrgs.filter((org) => leafTerms.has(org));

        if (leafOrgs.length > MAX_ORTHOLOG_SELECTED_ORGANISMS) {
          alert(
            `You have selected ${leafOrgs.length} organisms but no more than ${MAX_ORTHOLOG_SELECTED_ORGANISMS} are allowed. Please review your selection.`
          );
        } else {
          props.onSubmit();
        }
      };
  const newProps = Object.assign({}, props, recordClassOverride, {
    postTableSelectionElement: orgSelector,
    onSubmit: onSubmit,
  });
  return <TableReporterForm {...newProps} />;
};

TranscriptTableReporterForm.getInitialState = (downloadFormStoreState) => {
  const newDownloadFormStoreState = Object.assign(
    {},
    downloadFormStoreState,
    recordClassOverride,
    { orthologOrganisms: [] }
  );
  return TableReporterForm.getInitialState(newDownloadFormStoreState);
};

export default TranscriptTableReporterForm;
