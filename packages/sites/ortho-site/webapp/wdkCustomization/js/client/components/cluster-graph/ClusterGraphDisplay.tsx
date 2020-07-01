import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { orderBy } from 'lodash';

import {
  EdgeType,
  EdgeTypeOption,
  NodeDisplayType,
  edgeTypeOptionOrder,
  edgeTypeDisplayNames,
  initialEdgeTypeSelections,
  nodeDisplayTypeOrder,
  nodeDisplayTypeDisplayNames
} from '../../utils/clusterGraph';
import {
  GraphInformationTabKey,
  GraphInformationTabProps,
  graphInformationBaseTabConfigs
} from '../../utils/graphInformation';
import { GroupLayout } from '../../utils/groupLayout';
import { TaxonUiMetadata } from '../../utils/taxons';

import { ClusterGraphCanvas } from './ClusterGraphCanvas';
import { GraphControls } from './GraphControls';
import { GraphInformation } from './GraphInformation';
import { Instructions } from './Instructions';
import { NodeDetails } from './NodeDetails';
import { SequenceList } from './SequenceList';

import './ClusterGraphDisplay.scss';

interface Props {
  layout: GroupLayout;
  taxonUiMetadata: TaxonUiMetadata;
}

export function ClusterGraphDisplay({ layout, taxonUiMetadata }: Props) {
  const { edgeTypeOptions, selectEdgeTypeOption } = useEdgeTypeControl(layout);
  const { minEValueExp, maxEValueExp, eValueExp, selectEValueExp } = useScoreControl(layout);

  const {
    nodeDisplayTypeOptions,
    selectedNodeDisplayType,
    setSelectedNodeDisplayType,
    legendEntries,
    legendHeaders
  } = useNodeDisplayTypeControl(layout, taxonUiMetadata);

  const {
    activeTab,
    selectedNode,
    setActiveTab,
    setSelectedNode,
    tabs
  } = useGraphInformationTabs(layout);

  return (
    <div className="ClusterGraphDisplay">
      <Instructions />
      <GraphControls
        edgeTypeOptions={edgeTypeOptions}
        selectEdgeTypeOption={selectEdgeTypeOption}
        minEValueExp={minEValueExp}
        maxEValueExp={maxEValueExp}
        eValueExp={eValueExp}
        selectEValueExp={selectEValueExp}
        nodeDisplayTypeOptions={nodeDisplayTypeOptions}
        selectedNodeDisplayType={selectedNodeDisplayType}
        setSelectedNodeDisplayType={setSelectedNodeDisplayType}
        legendEntries={legendEntries}
        legendHeaders={legendHeaders}
      />
      <ClusterGraphCanvas />
      <GraphInformation
        activeTab={activeTab}
        selectedNode={selectedNode}
        setActiveTab={setActiveTab}
        setSelectedNode={setSelectedNode}
        tabs={tabs}
      />
    </div>
  );
}

function useEdgeTypeControl(layout: GroupLayout) {
  const [ selectedEdgeTypes, setSelectedEdgeTypes ] = useState<Record<EdgeType, boolean>>(initialEdgeTypeSelections);

  const selectEdgeTypeOption = useCallback((selectedEdge: EdgeType, newValue: boolean) => {
    setSelectedEdgeTypes({
      ...selectedEdgeTypes,
      [selectedEdge]: newValue
    });
  }, [ selectedEdgeTypes ]);

  useEffect(() => {
    setSelectedEdgeTypes(initialEdgeTypeSelections);
  }, [ layout ]);

  const edgeTypeOptions: EdgeTypeOption[] = useMemo(
    () => edgeTypeOptionOrder.map(
      edgeType => ({
        key: edgeType,
        display: edgeTypeDisplayNames[edgeType],
        isSelected: selectedEdgeTypes[edgeType]
      })
    ),
    [ selectedEdgeTypes ]
  );

  return {
    edgeTypeOptions,
    selectEdgeTypeOption
  };
}

function useScoreControl(layout: GroupLayout) {
  const initialEValue = layout.maxEvalueExp - Math.round((layout.maxEvalueExp - layout.minEvalueExp) / 5.0);

  const [ eValueExp, setEValueExp ] = useState(initialEValue);

  useEffect(() => {
    setEValueExp(initialEValue);
  }, [ layout ]);

  return {
    minEValueExp: layout.minEvalueExp - 1,
    maxEValueExp: layout.maxEvalueExp + 1,
    eValueExp,
    selectEValueExp: setEValueExp
  };
}

function useNodeDisplayTypeControl(layout: GroupLayout, taxonUiMetadata: TaxonUiMetadata) {
  const initialNodeDisplayTypeSelection = 'taxa';

  const [ selectedNodeDisplayType, setSelectedNodeDisplayType ] = useState<NodeDisplayType>(initialNodeDisplayTypeSelection);

  useEffect(() => {
    setSelectedNodeDisplayType(initialNodeDisplayTypeSelection);
  }, [ layout ]);

  const taxonLegendEntries = useTaxonLegendEntries(layout, taxonUiMetadata);
  const ecNumberLegendEntries = useEcNumberLegendEntries(layout);
  const pfamDomainLegendEntries = usePfamDomainLegendEntries(layout);

  const legendEntries = {
    'taxa': taxonLegendEntries,
    'ec-numbers': ecNumberLegendEntries,
    'pfam-domains': pfamDomainLegendEntries
  };

  const legendHeaders = {
    'taxa': 'Mouse over a taxon legend to highlight sequences of that taxon.',
    'ec-numbers': 'The EC Numbers are rendered in a pie chart for each gene.',
    'pfam-domains': 'The PFam Domains are rendered in a pie chart for each gene.'
  };

  const nodeDisplayTypeOptions = useMemo(
    () => nodeDisplayTypeOrder.map(
      nodeDisplayType => ({
        value: nodeDisplayType,
        display: nodeDisplayTypeDisplayNames[nodeDisplayType],
        disabled: legendEntries[nodeDisplayType].length === 0
      })
    ),
    []
  );

  return {
    legendEntries,
    legendHeaders,
    nodeDisplayTypeOptions,
    selectedNodeDisplayType,
    setSelectedNodeDisplayType
  };
}

function useTaxonLegendEntries(
  { taxonCounts }: GroupLayout,
  { taxonOrder, species }: TaxonUiMetadata
) {
  return useMemo(
    () => {
      const speciesInLegend = taxonOrder.filter(taxonAbbrev => taxonCounts[taxonAbbrev] > 0);

      return speciesInLegend.map(taxonAbbrev => {
        const { color, groupColor, name, path } = species[taxonAbbrev];
        const count = taxonCounts[taxonAbbrev];

        return {
          key: taxonAbbrev,
          symbol: renderTaxonLegendSymbol(color, groupColor),
          description: `${taxonAbbrev} (${count})`,
          tooltip: (
            <React.Fragment>
              {path.join('->')}
              <br />
              {name}
            </React.Fragment>
          )
        };
      });
    },
    [ taxonCounts ]
  );
}

function useEcNumberLegendEntries({ group: { ecNumbers } }: GroupLayout) {
  return useMemo(() => {
    const orderedEcNumberEntries = orderBy(
      Object.values(ecNumbers),
      [ value => value.count, value => value.index ],
      [ 'desc', 'asc' ]
    );

    return orderedEcNumberEntries.map(
      ({ code, color, count }) => ({
        key: code,
        symbol: renderSimpleLegendSymbol(color),
        description: `${code} (${count})`
      })
    );
  }, [ ecNumbers ])
}

function usePfamDomainLegendEntries({ group: { pfamDomains } }: GroupLayout) {
  return useMemo(() => {
    const orderedPfamDomainEntries = orderBy(
      Object.values(pfamDomains),
      [ value => value.count, pfamDomain => pfamDomain.index ],
      [ 'desc', 'asc' ]
    );

    return orderedPfamDomainEntries.map(
      ({ accession, color, count, description }) => ({
        key: accession,
        symbol: renderSimpleLegendSymbol(color),
        description: `${accession} (${count})`,
        tooltip: description
      })
    );
  }, [ pfamDomains ])
}

function renderSimpleLegendSymbol(color: string) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
      width="17"
      height="17"
    >
      <circle
        r="6.5"
        cx="8.5"
        cy="8.5"
        fill={color}
      />
    </svg>
  );
}

function renderTaxonLegendSymbol(color: string, groupColor: string) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
      width="17"
      height="17"
    >
      <circle
        r="5.5"
        cx="8.5"
        cy="8.5"
        fill={color}
        stroke={groupColor}
        strokeWidth="3"
      />
    </svg>
  );
}

function useGraphInformationTabs(layout: GroupLayout) {
  const [ activeTab, setActiveTab ] = useState<GraphInformationTabKey>('sequence-list');
  const [ selectedNode, setSelectedNode ] = useState<string | undefined>(layout.nodes['0'].id);

  const tabs = graphInformationBaseTabConfigs.map(
    baseConfig => {
      const TabContentComponent = graphInformationTabComponents[baseConfig.key];

      return ({
        ...baseConfig,
        content: <TabContentComponent layout={layout} />
      });
    }
  );

  return {
    activeTab,
    setActiveTab,
    selectedNode,
    setSelectedNode,
    tabs
  };
}

const graphInformationTabComponents: Record<GraphInformationTabKey, React.ComponentType<GraphInformationTabProps>> = {
  'sequence-list': SequenceList,
  'node-details': NodeDetails
};
