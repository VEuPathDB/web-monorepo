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
import { GroupLayout } from '../../utils/groupLayout';
import { TaxonUiMetadata } from '../../utils/taxons';

import { ClusterGraphCanvas } from './ClusterGraphCanvas';
import { GraphControls, LegendEntryProps } from './GraphControls';
import { GraphInformation } from './GraphInformation';
import { Instructions } from './Instructions';

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
    legendEntries
  } = useNodeDisplayTypeControl(layout, taxonUiMetadata);

  return (
    <div>
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
      />
      <ClusterGraphCanvas />
      <GraphInformation />
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

  const legendEntries: Record<NodeDisplayType, LegendEntryProps[]> = {
    'taxa': taxonLegendEntries,
    'ec-numbers': ecNumberLegendEntries,
    'pfam-domains': pfamDomainLegendEntries
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
          symbol: (
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
          ),
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
      value => value.index
    );

    return orderedEcNumberEntries.map(
      ({ code, color, count }) => ({
        key: code,
        symbol: (
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
        ),
        description: `${code} (${count})`
      })
    );
  }, [ ecNumbers ])
}

function usePfamDomainLegendEntries({ group: { pfamDomains } }: GroupLayout) {
  return useMemo(() => {
    const orderedPfamDomainEntries = orderBy(
      Object.values(pfamDomains),
      pfamDomain => pfamDomain.index
    );

    return orderedPfamDomainEntries.map(
      ({ accession, color, count, description }) => ({
        key: accession,
        symbol: (
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
        ),
        description: `${accession} (${count})`,
        tooltip: description
      })
    );
  }, [ pfamDomains ])
}
