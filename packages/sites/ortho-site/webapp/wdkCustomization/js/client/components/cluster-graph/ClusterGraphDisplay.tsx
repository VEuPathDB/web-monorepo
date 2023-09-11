import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { groupBy, mapValues, orderBy } from 'lodash';

import { HelpIcon, Link } from '@veupathdb/wdk-client/lib/Components';

import {
  EdgeType,
  EdgeTypeOption,
  NodeDisplayType,
  PAGE_TITLE_HELP,
  ProteinType,
  corePeripheralLegendColors,
  corePeripheralLegendOrder,
  edgeTypeOptionOrder,
  edgeTypeDisplayNames,
  initialEdgeTypeSelections,
  nodeDisplayTypeOrder,
  nodeDisplayTypeDisplayNames,
} from 'ortho-client/utils/clusterGraph';
import {
  GraphInformationTabKey,
  GraphInformationTabProps,
  graphInformationBaseTabConfigs,
} from 'ortho-client/utils/graphInformation';
import { GroupLayout } from 'ortho-client/utils/groupLayout';
import { TaxonUiMetadata } from 'ortho-client/utils/taxons';

import { ClusterGraphCanvas } from 'ortho-client/components/cluster-graph/ClusterGraphCanvas';
import { GraphControls } from 'ortho-client/components/cluster-graph/GraphControls';
import { GraphInformation } from 'ortho-client/components/cluster-graph/GraphInformation';
import { NodeDetails } from 'ortho-client/components/cluster-graph/NodeDetails';
import { SequenceList } from 'ortho-client/components/cluster-graph/SequenceList';

import './ClusterGraphDisplay.scss';

interface Props {
  groupName: string;
  layout: GroupLayout;
  taxonUiMetadata: TaxonUiMetadata;
  corePeripheralMap: Record<string, ProteinType>;
}

const GROUP_RECORD_URL_SEGMENT = '/record/group';

export function ClusterGraphDisplay({
  corePeripheralMap,
  groupName,
  layout,
  taxonUiMetadata,
}: Props) {
  const proteinCount = useMemo(
    () => Object.keys(layout.nodes).length,
    [layout]
  );

  const { edgeTypeOptions, highlightedEdgeType, selectedEdgeTypes } =
    useEdgeTypeControl(layout);

  const { minEValueExp, maxEValueExp, eValueExp, selectEValueExp } =
    useScoreControl(layout);

  const {
    nodeDisplayTypeOptions,
    selectedNodeDisplayType,
    setSelectedNodeDisplayType,
    legendEntries,
    legendHeaders,
    highlightedLegendNodeIds,
  } = useNodeDisplayTypeControl(layout, corePeripheralMap, taxonUiMetadata);

  const {
    activeTab,
    selectedNode,
    setActiveTab,
    setSelectedNode,
    tabs,
    highlightedSequenceNodeId,
    highlightedBlastEdgeId,
  } = useGraphInformationTabs(layout);

  const onClickNode = useCallback(
    (clickedNode: string) => {
      setSelectedNode(clickedNode);
      setActiveTab('node-details');
    },
    [setSelectedNode, setActiveTab]
  );

  return (
    <div className="ClusterGraphDisplay">
      <div className="Header">
        <h1>
          Cluster Graph: {groupName} ({proteinCount} proteins)
          <HelpIcon>{PAGE_TITLE_HELP}</HelpIcon>
        </h1>
        <Link
          to={`${GROUP_RECORD_URL_SEGMENT}/${groupName}`}
          className="BackToGroupPageLink"
        >
          <button type="button" className="btn">
            Back to Group page
          </button>
        </Link>
      </div>
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
        corePeripheralMap={corePeripheralMap}
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
  const [selectedEdgeTypes, setSelectedEdgeTypes] = useState<
    Record<EdgeType, boolean>
  >(initialEdgeTypeSelections);
  const [highlightedEdgeType, setHighlightedEdgeType] =
    useState<EdgeType | undefined>(undefined);

  useEffect(() => {
    setSelectedEdgeTypes(initialEdgeTypeSelections);
  }, [layout]);

  const edgeTypeOptions: EdgeTypeOption[] = useMemo(
    () =>
      edgeTypeOptionOrder.map((edgeType) => ({
        key: edgeType,
        display: edgeTypeDisplayNames[edgeType],
        isSelected: selectedEdgeTypes[edgeType],
        onChange: (selected: boolean) => {
          setSelectedEdgeTypes({
            ...selectedEdgeTypes,
            [edgeType]: selected,
          });
        },
        onMouseOver: () => {
          setHighlightedEdgeType(edgeType);
        },
        onMouseOut: () => {
          setHighlightedEdgeType(undefined);
        },
      })),
    [selectedEdgeTypes]
  );

  return {
    edgeTypeOptions,
    highlightedEdgeType,
    selectedEdgeTypes,
  };
}

function useScoreControl(layout: GroupLayout) {
  const [eValueExp, setEValueExp] = useState(layout.maxEvalueExp + 1);

  useEffect(() => {
    setEValueExp(layout.maxEvalueExp + 1);
  }, [layout]);

  return {
    minEValueExp: layout.minEvalueExp - 1,
    maxEValueExp: layout.maxEvalueExp + 1,
    eValueExp,
    selectEValueExp: setEValueExp,
  };
}

function useNodeDisplayTypeControl(
  layout: GroupLayout,
  corePeripheralMap: Props['corePeripheralMap'],
  taxonUiMetadata: TaxonUiMetadata
) {
  const initialNodeDisplayTypeSelection = 'taxa';

  const [selectedNodeDisplayType, setSelectedNodeDisplayType] =
    useState<NodeDisplayType>(initialNodeDisplayTypeSelection);
  const [highlightedLegendNodeIds, setHighlightedLegendNodeIds] = useState<
    string[]
  >([]);

  useEffect(() => {
    setSelectedNodeDisplayType(initialNodeDisplayTypeSelection);
  }, [layout]);

  const taxonLegendEntries = useTaxonLegendEntries(
    layout,
    taxonUiMetadata,
    setHighlightedLegendNodeIds
  );
  const ecNumberLegendEntries = useEcNumberLegendEntries(layout);
  const pfamDomainLegendEntries = usePfamDomainLegendEntries(layout);
  const corePeripheralLegendEntries = useCorePeripheralLegendEntries(
    layout,
    corePeripheralMap
  );

  const legendEntries = {
    taxa: taxonLegendEntries,
    'ec-numbers': ecNumberLegendEntries,
    'pfam-domains': pfamDomainLegendEntries,
    'core-peripheral': corePeripheralLegendEntries,
  };

  const legendHeaders = {
    taxa: 'Mouse over a taxon legend to highlight sequences of that taxon.',
    'ec-numbers': 'The EC Numbers are rendered in a pie chart for each gene.',
    'pfam-domains':
      'The PFam Domains are rendered in a pie chart for each gene.',
    'core-peripheral':
      'The core and peripheral proteins are colored as shown below.',
  };

  const nodeDisplayTypeOptions = useMemo(
    () =>
      nodeDisplayTypeOrder.map((nodeDisplayType) => ({
        value: nodeDisplayType,
        display: nodeDisplayTypeDisplayNames[nodeDisplayType],
        disabled: legendEntries[nodeDisplayType].length === 0,
      })),
    []
  );

  return {
    highlightedLegendNodeIds,
    legendEntries,
    legendHeaders,
    nodeDisplayTypeOptions,
    selectedNodeDisplayType,
    setSelectedNodeDisplayType,
  };
}

function useTaxonLegendEntries(
  { taxonCounts, group: { genes } }: GroupLayout,
  { taxonOrder, species }: TaxonUiMetadata,
  setHighlightedLegendNodeIds: (newNodeIds: string[]) => void
) {
  return useMemo(() => {
    const speciesInLegend = taxonOrder.filter(
      (taxonAbbrev) => taxonCounts[taxonAbbrev] > 0
    );

    return speciesInLegend.map((taxonAbbrev) => {
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
            (memo, [nodeId, geneEntry]) => {
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
        },
      };
    });
  }, [taxonCounts, genes]);
}

function useEcNumberLegendEntries({
  group: { ecNumbers, genes },
}: GroupLayout) {
  return useMemo(() => {
    const orderedEcNumberEntries = orderBy(
      Object.values(ecNumbers),
      [(value) => value.count, (value) => value.index],
      ['desc', 'asc']
    );

    return orderedEcNumberEntries.map(
      ({ code, color, count, description }) => ({
        key: code,
        symbol: renderSimpleLegendSymbol(color),
        description: `${code} (${count})`,
        tooltip: description,
      })
    );
  }, [ecNumbers, genes]);
}

function usePfamDomainLegendEntries({
  group: { genes, pfamDomains },
}: GroupLayout) {
  return useMemo(() => {
    const orderedPfamDomainEntries = orderBy(
      Object.values(pfamDomains),
      [(value) => value.count, (pfamDomain) => pfamDomain.index],
      ['desc', 'asc']
    );

    return orderedPfamDomainEntries.map(
      ({ accession, color, count, description }) => ({
        key: accession,
        symbol: renderSimpleLegendSymbol(color),
        description: `${accession} (${count})`,
        tooltip: description,
      })
    );
  }, [pfamDomains, genes]);
}

function useCorePeripheralLegendEntries(
  { group: { genes } }: GroupLayout,
  corePeripheralMap: Props['corePeripheralMap']
) {
  return useMemo(() => {
    const proteinsByType = groupBy(
      Object.entries(genes),
      ([_, gene]) => corePeripheralMap[gene.taxon.abbrev]
    );

    const legendCountsByProteinType = mapValues(
      proteinsByType,
      (proteinsOfType) => proteinsOfType.length
    );

    const nodeIdsByProteinType = mapValues(proteinsByType, (proteinsOfType) =>
      proteinsOfType.map(([nodeId]) => nodeId)
    );

    return corePeripheralLegendOrder.map((proteinType) => {
      const count = legendCountsByProteinType[proteinType] ?? 0;
      const color = corePeripheralLegendColors[proteinType];
      const nodesOfType = nodeIdsByProteinType[proteinType];

      return {
        key: proteinType,
        symbol: renderSimpleLegendSymbol(color),
        description: `${proteinType} (${count})`,
        tooltip: (
          <React.Fragment>
            There are {count} {proteinType.toLowerCase()} proteins.
          </React.Fragment>
        ),
      };
    });
  }, [corePeripheralMap, genes]);
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
        stroke="black"
        strokeWidth="1"
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
  const [activeTab, setActiveTab] =
    useState<GraphInformationTabKey>('sequence-list');
  const [selectedNode, setSelectedNode] =
    useState<string | undefined>(undefined);

  const [highlightedSequenceNodeId, setHighlightedSequenceNodeId] =
    useState<string | undefined>(undefined);
  const [highlightedBlastEdgeId, setHighlightedBlastEdgeId] =
    useState<string | undefined>(undefined);

  const tabs = graphInformationBaseTabConfigs.map((baseConfig) => {
    const TabContentComponent = graphInformationTabComponents[baseConfig.key];

    return {
      ...baseConfig,
      content: (
        <TabContentComponent
          layout={layout}
          selectedNode={selectedNode}
          setHighlightedSequenceNodeId={setHighlightedSequenceNodeId}
          setHighlightedBlastEdgeId={setHighlightedBlastEdgeId}
        />
      ),
    };
  });

  return {
    activeTab,
    highlightedSequenceNodeId,
    highlightedBlastEdgeId,
    setActiveTab,
    selectedNode,
    setSelectedNode,
    tabs,
  };
}

const graphInformationTabComponents: Record<
  GraphInformationTabKey,
  React.ComponentType<GraphInformationTabProps>
> = {
  'sequence-list': SequenceList,
  'node-details': NodeDetails,
};
