import React, { useCallback, useEffect, useState } from 'react';

import { Checkbox, RadioList, SliderInput, TextBox, Tooltip } from 'wdk-client/Components';

import { EdgeTypeOption, EdgeType, NodeDisplayType } from '../../utils/clusterGraph';

type Props = EdgeOptionsProps & NodeOptionsProps;

export function GraphControls({
  edgeTypeOptions,
  selectEdgeTypeOption,
  minEValueExp,
  maxEValueExp,
  eValueExp,
  selectEValueExp,
  nodeDisplayTypeOptions,
  selectedNodeDisplayType,
  setSelectedNodeDisplayType,
  legendEntries,
  legendHeaders
}: Props) {
  return (
    <div className="GraphControls">
      <EdgeOptions
        edgeTypeOptions={edgeTypeOptions}
        selectEdgeTypeOption={selectEdgeTypeOption}
        minEValueExp={minEValueExp}
        maxEValueExp={maxEValueExp}
        eValueExp={eValueExp}
        selectEValueExp={selectEValueExp}
      />
      <NodeOptions
        nodeDisplayTypeOptions={nodeDisplayTypeOptions}
        selectedNodeDisplayType={selectedNodeDisplayType}
        setSelectedNodeDisplayType={setSelectedNodeDisplayType}
        legendEntries={legendEntries}
        legendHeaders={legendHeaders}
      />
    </div>
  );
}

interface EdgeOptionsProps {
  edgeTypeOptions: EdgeTypeOption[];
  selectEdgeTypeOption: (selectedEdge: EdgeType, newValue: boolean) => void;
  minEValueExp: number;
  maxEValueExp: number;
  eValueExp: number;
  selectEValueExp: (newEValueExp: number) => void;
}

function EdgeOptions({
  edgeTypeOptions,
  selectEdgeTypeOption,
  minEValueExp,
  maxEValueExp,
  eValueExp,
  selectEValueExp
}: EdgeOptionsProps) {
  const { internalEValueText, setInternalEValueText } = useInternalEValueTextState(
    minEValueExp,
    maxEValueExp,
    eValueExp,
    selectEValueExp
  );

  return (
    <div className="EdgeOptions">
      <details open>
        <summary>
          Edge Options
        </summary>
        <fieldset className="EdgeTypeOptions">
          <legend>
            Edge Type
          </legend>
          {
            edgeTypeOptions.map(
              ({ key, display, isSelected }) =>
                <div className="EdgeTypeOption" key={key}>
                  <Checkbox
                    key={key}
                    value={isSelected}
                    onChange={newValue => selectEdgeTypeOption(key, newValue)}
                  />
                  <label>
                    {display}
                  </label>
                </div>
            )
          }
        </fieldset>
        <fieldset className="ScoreControl">
          <legend>
            E-Value Cutoff
          </legend>
          <div className="EValueHead">
            <div>
              Max E-Value:
            </div>
            <div className="EValueText">
              1E
              <TextBox
                value={internalEValueText}
                onChange={setInternalEValueText}
              />
            </div>
          </div>
          <SliderInput
            className="EValueSlider"
            value={eValueExp}
            min={minEValueExp}
            max={maxEValueExp}
            step={1}
            onChange={selectEValueExp}
          />
        </fieldset>
      </details>
    </div>
  );
}

function useInternalEValueTextState(
  minEValueExp: EdgeOptionsProps['minEValueExp'],
  maxEValueExp: EdgeOptionsProps['maxEValueExp'],
  eValueExp: EdgeOptionsProps['eValueExp'],
  selectEValueExp: EdgeOptionsProps['selectEValueExp']
) {
  const [ internalEValueText, setInternalEValueText ] = useState(String(eValueExp));

  useEffect(() => {
    setInternalEValueText(String(eValueExp));
  }, [ eValueExp ]);

  useEffect(() => {
    const numericValue = Number(internalEValueText);

    if (
      minEValueExp <= numericValue &&
      numericValue <= maxEValueExp &&
      eValueExp !== numericValue
    ) {
      selectEValueExp(numericValue);
    }
  }, [ internalEValueText ]);

  return {
    internalEValueText,
    setInternalEValueText
  };
}

interface NodeOptionsProps {
  nodeDisplayTypeOptions: { value: NodeDisplayType, display: React.ReactNode, disabled?: boolean }[];
  selectedNodeDisplayType: NodeDisplayType;
  setSelectedNodeDisplayType: (newNodeDisplayType: NodeDisplayType) => void;
  legendEntries: Record<string, LegendEntryProps[]>;
  legendHeaders: Record<NodeDisplayType, React.ReactNode>;
}

function NodeOptions({
  nodeDisplayTypeOptions,
  selectedNodeDisplayType,
  setSelectedNodeDisplayType,
  legendEntries,
  legendHeaders
}: NodeOptionsProps) {
  const onNodeDisplayTypeChange = useCallback((newValue: string) => {
    setSelectedNodeDisplayType(newValue as NodeDisplayType);
  }, [ setSelectedNodeDisplayType ]);

  return (
    <div className="NodeOptions">
      <details open>
        <summary>
          Node Options
        </summary>
        <fieldset>
          <legend>
            Show Nodes By
          </legend>
          <RadioList
            name="node-display-type"
            value={selectedNodeDisplayType}
            items={nodeDisplayTypeOptions}
            onChange={onNodeDisplayTypeChange}
          />
          <div className={`ControlSection ${selectedNodeDisplayType}`}>
            <div className={`LegendHeader`}>
              {legendHeaders[selectedNodeDisplayType]}
            </div>
            {
              legendEntries[selectedNodeDisplayType].map(
                taxonLegendEntry => <LegendEntry {...taxonLegendEntry} />
              )
            }
          </div>
        </fieldset>
      </details>
    </div>
  );
}

export interface LegendEntryProps {
  key: string;
  symbol: React.ReactNode;
  description: string;
  tooltip?: React.ReactNode;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const TOOLTIP_POSITION = {
  my: 'top left',
  at: 'bottom right'
};

function LegendEntry({ symbol, tooltip, description, onMouseEnter, onMouseLeave }: LegendEntryProps) {
  const legendContent = (
    <div className="LegendEntry" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      {symbol}
      {description}
    </div>
  );

  return tooltip == null
    ? legendContent
    : <Tooltip content={tooltip} showDelay={0} position={TOOLTIP_POSITION} >
        {legendContent}
      </Tooltip>;
}
