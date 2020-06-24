import React, { useCallback, useEffect, useMemo, useState } from 'react';

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

import { ClusterGraphCanvas } from './ClusterGraphCanvas';
import { GraphControls } from './GraphControls';
import { GraphInformation } from './GraphInformation';
import { Instructions } from './Instructions';

interface Props {
  layout: GroupLayout;
}

export function ClusterGraphDisplay({ layout }: Props) {
  const { edgeTypeOptions, selectEdgeTypeOption } = useEdgeTypeOptions(layout);
  const { minEValueExp, maxEValueExp, eValueExp, selectEValueExp } = useScoreControl(layout);

  const { nodeDisplayTypeOptions, selectedNodeDisplayType, setSelectedNodeDisplayType } = useNodeDisplayTypeOptions(layout);

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
      />
      <ClusterGraphCanvas />
      <GraphInformation />
    </div>
  );
}

function useEdgeTypeOptions(layout: GroupLayout) {
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

function useNodeDisplayTypeOptions(layout: GroupLayout) {
  const initialNodeDisplayTypeSelection = 'taxa';

  const [ selectedNodeDisplayType, setSelectedNodeDisplayType ] = useState<NodeDisplayType>(initialNodeDisplayTypeSelection);

  useEffect(() => {
    setSelectedNodeDisplayType(initialNodeDisplayTypeSelection);
  }, [ layout ]);

  const nodeDisplayTypeOptions = useMemo(
    () => nodeDisplayTypeOrder.map(
      nodeDisplayType => ({
        value: nodeDisplayType,
        display: nodeDisplayTypeDisplayNames[nodeDisplayType]
      })
    ),
    []
  );

  return {
    nodeDisplayTypeOptions,
    selectedNodeDisplayType,
    setSelectedNodeDisplayType
  };
}
