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
  groupName: string;
  layout: GroupLayout;
  taxonUiMetadata: TaxonUiMetadata;
}

export function ClusterGraphDisplay({
  groupName,
  layout,
  taxonUiMetadata
}: Props) {
  const {
    edgeTypeOptions,
    highlightedEdgeType,
    selectedEdgeTypes
  } = useEdgeTypeControl(layout);

  const {
    minEValueExp,
    maxEValueExp,
    eValueExp,
    selectEValueExp
  } = useScoreControl(layout);

  const {
    nodeDisplayTypeOptions,
    selectedNodeDisplayType,
    setSelectedNodeDisplayType,
    legendEntries,
    legendHeaders,
    highlightedLegendNodeIds
  } = useNodeDisplayTypeControl(layout, taxonUiMetadata);

  const {
    activeTab,
    selectedNode,
    setActiveTab,
    setSelectedNode,
    tabs,
    highlightedSequenceNodeId,
    highlightedBlastEdgeId
  } = useGraphInformationTabs(layout);

  const onClickNode = useCallback((clickedNode: string) => {
    setSelectedNode(clickedNode);
    setActiveTab('node-details');
  }, [ setSelectedNode, setActiveTab ]);

  return (
    <div className="ClusterGraphDisplay">
      <Instructions
        groupName={groupName}
        maxEValueExp={layout.maxEvalueExp}
      />
      <GraphControls
        edgeTypeOptions={edgeTypeOptions}
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
      <ClusterGraphCanvas
        layout={layout}
        taxonUiMetadata={taxonUiMetadata}
        selectedNodeDisplayType={selectedNodeDisplayType}
        highlightedEdgeType={highlightedEdgeType}
        highlightedLegendNodeIds={highlightedLegendNodeIds}
        eValueExp={eValueExp}
        selectedEdgeTypes={selectedEdgeTypes}
        highlightedSequenceNodeId={highlightedSequenceNodeId}
        highlightedBlastEdgeId={highlightedBlastEdgeId}
        onClickNode={onClickNode}
      />
      <GraphInformation
        activeTab={activeTab}
        selectedNode={selectedNode}
        setActiveTab={setActiveTab}
        tabs={tabs}
      />
    </div>
  );
}

function useEdgeTypeControl(layout: GroupLayout) {
  const [ selectedEdgeTypes, setSelectedEdgeTypes ] = useState<Record<EdgeType, boolean>>(initialEdgeTypeSelections);
  const [ highlightedEdgeType, setHighlightedEdgeType ] = useState<EdgeType | undefined>(undefined);

  useEffect(() => {
    setSelectedEdgeTypes(initialEdgeTypeSelections);
  }, [ layout ]);

  const edgeTypeOptions: EdgeTypeOption[] = useMemo(
    () => edgeTypeOptionOrder.map(
      edgeType => ({
        key: edgeType,
        display: edgeTypeDisplayNames[edgeType],
        isSelected: selectedEdgeTypes[edgeType],
        onChange: (selected: boolean) => {
          setSelectedEdgeTypes({
            ...selectedEdgeTypes,
            [edgeType]: selected
          });
        },
        onMouseOver: () => {
          setHighlightedEdgeType(edgeType);
        },
        onMouseOut: () => {
          setHighlightedEdgeType(undefined);
        }
      })
    ),
    [ selectedEdgeTypes ]
  );

  return {
    edgeTypeOptions,
    highlightedEdgeType,
    selectedEdgeTypes
  };
}

function useScoreControl(layout: GroupLayout) {
  const [ eValueExp, setEValueExp ] = useState(layout.maxEvalueExp + 1);

  useEffect(() => {
    setEValueExp(layout.maxEvalueExp + 1);
  }, [ layout ]);

  return {
    minEValueExp: layout.minEvalueExp - 1,
    maxEValueExp: layout.maxEvalueExp + 1,
    eValueExp,
    selectEValueExp: setEValueExp
  };
}

function useNodeDisplayTypeControl(
  layout: GroupLayout,
  taxonUiMetadata: TaxonUiMetadata
) {
  const initialNodeDisplayTypeSelection = 'taxa';

  const [ selectedNodeDisplayType, setSelectedNodeDisplayType ] = useState<NodeDisplayType>(initialNodeDisplayTypeSelection);
  const [ highlightedLegendNodeIds, setHighlightedLegendNodeIds ] = useState<string[]>([]);

  useEffect(() => {
    setSelectedNodeDisplayType(initialNodeDisplayTypeSelection);
  }, [ layout ]);

  const taxonLegendEntries = useTaxonLegendEntries(layout, taxonUiMetadata, setHighlightedLegendNodeIds);
  const ecNumberLegendEntries = useEcNumberLegendEntries(layout, setHighlightedLegendNodeIds);
  const pfamDomainLegendEntries = usePfamDomainLegendEntries(layout, setHighlightedLegendNodeIds);

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
    highlightedLegendNodeIds,
    legendEntries,
    legendHeaders,
    nodeDisplayTypeOptions,
    selectedNodeDisplayType,
    setSelectedNodeDisplayType
  };
}

function useTaxonLegendEntries(
  { taxonCounts, group: { genes } }: GroupLayout,
  { taxonOrder, species }: TaxonUiMetadata,
  setHighlightedLegendNodeIds: (newNodeIds: string[]) => void
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
          ),
          onMouseOver: () => {
            const nodesOfSpecies = Object.entries(genes).reduce(
              (memo, [ nodeId, geneEntry ]) => {
                if (geneEntry.taxon.abbrev === taxonAbbrev) {
                  memo.push(nodeId);
                }

                return memo;
              },
              [] as string[]
            );

            setHighlightedLegendNodeIds(nodesOfSpecies);
          },
          onMouseOut: () => {
            setHighlightedLegendNodeIds([]);
          }
        };
      });
    },
    [ taxonCounts, genes ]
  );
}

function useEcNumberLegendEntries(
  { group: { ecNumbers, genes } }: GroupLayout,
  setHighlightedLegendNodeIds: (newNodeIds: string[]) => void
) {
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
        description: `${code} (${count})`,
        onMouseOver: () => {
          const nodesWithEcNumber = Object.entries(genes).reduce(
            (memo, [ nodeId, geneEntry ]) => {
              if (geneEntry.ecNumbers.includes(code)) {
                memo.push(nodeId);
              }

              return memo;
            },
            [] as string[]
          );

          setHighlightedLegendNodeIds(nodesWithEcNumber);
        },
        onMouseOut: () => {
          setHighlightedLegendNodeIds([]);
        }
      })
    );
  }, [ ecNumbers, genes ]);
}

function usePfamDomainLegendEntries(
  { group: { genes, pfamDomains } }: GroupLayout,
  setHighlightedLegendNodeIds: (newNodeIds: string[]) => void
) {
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
        tooltip: description,
        onMouseOver: () => {
          const nodesWithEcNumber = Object.entries(genes).reduce(
            (memo, [ nodeId, geneEntry ]) => {
              if (accession in geneEntry.pfamDomains) {
                memo.push(nodeId);
              }

              return memo;
            },
            [] as string[]
          );

          setHighlightedLegendNodeIds(nodesWithEcNumber);
        },
        onMouseOut: () => {
          setHighlightedLegendNodeIds([]);
        }
      })
    );
  }, [ pfamDomains, genes ]);
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
  const [ selectedNode, setSelectedNode ] = useState<string | undefined>(undefined);

  const [ highlightedSequenceNodeId, setHighlightedSequenceNodeId ] = useState<string | undefined>(undefined);
  const [ highlightedBlastEdgeId, setHighlightedBlastEdgeId ] = useState<string | undefined>(undefined);

  const tabs = graphInformationBaseTabConfigs.map(
    baseConfig => {
      const TabContentComponent = graphInformationTabComponents[baseConfig.key];

      return ({
        ...baseConfig,
        content: (
          <TabContentComponent
            layout={layout}
            selectedNode={selectedNode}
            setHighlightedSequenceNodeId={setHighlightedSequenceNodeId}
            setHighlightedBlastEdgeId={setHighlightedBlastEdgeId}
          />
        )
      });
    }
  );

  return {
    activeTab,
    highlightedSequenceNodeId,
    highlightedBlastEdgeId,
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
