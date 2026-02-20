import { NodeData } from '@veupathdb/components/lib/types/plots/network';
import { CollectionVariableTreeNode } from '../../core';
import { EnqueueSnackbar, PresetNotebook, WdkState } from '../Types';

export const wgcnaCorrelationNotebook: PresetNotebook = {
  name: 'wgcnacorrelation',
  displayName: 'WGCNA Correlation Notebook',
  header: ({ submitButtonText, stepNumbers }) =>
    `Use steps 1-${
      stepNumbers.get('wgcna_params') ?? '?'
    } to find a module of interest, then click '${submitButtonText}' to retrieve a list of genes.`,
  projects: ['PlasmoDB', 'HostDB', 'UniDB'],
  cells: [
    {
      id: 'wgcna_correlation_compute',
      type: 'compute',
      title: 'Correlation computation',
      computationName: 'correlation',
      computationId: 'correlation_1',
      numberedHeader: true,
      helperText: (
        <span>
          Configure and run a correlation computation between WGCNA module
          eigengene expression and other features of interest.
        </span>
      ),
      getAdditionalCollectionPredicate:
        (projectId?: string) =>
        (variableCollection: CollectionVariableTreeNode) => {
          // Keep only the plasmo eigengenes for plasmodb...
          if (projectId === 'PlasmoDB') {
            return variableCollection.id === 'EUPATH_0005051';
          }
          // ... and host eigengenes for hostdb
          if (projectId === 'HostDB') {
            return variableCollection.id === 'EUPATH_0005050';
          }
          // If we're in the portal, should return both.
          return true;
        },
      cells: [
        {
          id: 'wgcna_bipartite',
          type: 'visualization',
          title: 'Network visualization of correlation results',
          visualizationName: 'bipartitenetwork',
          visualizationId: 'bipartite_1',
          numberedHeader: true,
          helperText: (
            <span>
              Visualize the correlation results between the two groups in the
              network. Click on nodes to highlight them in the network.
            </span>
          ),
          getVizPluginOptions: (
            wdkState: WdkState,
            enqueueSnackbar: EnqueueSnackbar,
            stepNumbers?: Map<string, number>
          ) => {
            return {
              additionalOnNodeClickAction: (node: NodeData) => {
                const moduleName = String(node.label ?? '').toLowerCase();

                // because this function is part of read-only "configuration" we can
                // hard-code the target parameter name 'wgcnaParam'
                const param = wdkState.parameters?.find(
                  ({ name }) => name === 'wgcnaParam'
                );

                // Early-return type guarding on `param`
                if (param == null) return;
                if (param.type !== 'single-pick-vocabulary') return;
                if (param.displayType === 'treeBox') return; // ← reject the tree-box case
                if (!param.vocabulary || !Array.isArray(param.vocabulary))
                  return;

                // Also guard against no updateParamValue (the main point of this callback)
                if (!wdkState.updateParamValue) return;

                // Do nothing if the node they clicked on is
                // not from the group of modules in the param.
                // Here we assume the structure of the vocabulary coming from the wdk.
                const allowedValues = param.vocabulary.filter(
                  (item): item is [string, string, null] =>
                    Array.isArray(item) && item.length === 3
                );
                if (allowedValues.length === 0) return;

                // Match the clicked node to a vocabulary value. The node label
                // (e.g. "module_4_17nov2025_pfal3d7") may be a suffix of the
                // vocabulary value (e.g. "p_module_4_17nov2025_pfal3d7") due to
                // a data-side prefix, so use case-insensitive endsWith for
                // matching but preserve the original vocabulary value for the
                // param update.
                const matchedEntry = allowedValues.find((item) => {
                  const v = item[0].toLowerCase();
                  return v === moduleName || v.endsWith('_' + moduleName);
                });
                if (!matchedEntry) return;
                const matchedValue = matchedEntry[0];

                // Do nothing if the module they clicked on is already selected.
                const currentValue = wdkState.paramValues?.[param.name];
                if (
                  typeof currentValue === 'string' &&
                  currentValue.toLowerCase() === moduleName
                ) {
                  return;
                }

                // Update module name in the wdk param store
                wdkState.updateParamValue(param, matchedValue);

                // Open snackbar
                const paramStep = stepNumbers?.get('wgcna_params') ?? '?';
                enqueueSnackbar(
                  <span>
                    Updated WGCNA module search parameter in step {paramStep}{' '}
                    to: <strong>{matchedValue}</strong>
                  </span>,
                  { variant: 'info' }
                );
              },
            };
          },
        },
      ],
    },
    {
      id: 'wgcna_params',
      type: 'wdkparam',
      title: 'Run gene search',
      paramNames: ['wgcnaParam', 'wgcna_correlation_cutoff'],
      requiredParamNames: ['wgcnaParam'],
      numberedHeader: true,
      helperText: (
        <span>
          Find genes within a particular module that are strongly correlated
          with the module&apos;s eigengene.
        </span>
      ),
    },
  ],
  isReady: ({ wdkState }) => {
    if (!wdkState) return false;
    const value = wdkState.paramValues['wgcnaParam'];
    // Target wgcnaParam's index-zero makeshift placeholder ("1_choose_module" => "Choose a Module")
    if (value == null || value === '' || value.includes('choose_module'))
      return false;
    return true;
  },
};
