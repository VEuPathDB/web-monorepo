import React, { useCallback, useEffect, useState } from 'react';

import {
  Checkbox,
  HelpIcon,
  RadioList,
  SliderInput,
  TextBox,
  Tooltip
} from '@veupathdb/wdk-client/lib/Components';

import {
  EDGE_OPTIONS_HELP,
  EdgeTypeOption,
  NODE_OPTIONS_HELP,
  NodeDisplayType
} from 'ortho-client/utils/clusterGraph';

import { GraphAccordion } from 'ortho-client/components/cluster-graph/GraphAccordion';

import './GraphControls.scss';

type Props = EdgeOptionsProps & NodeOptionsProps;

export function GraphControls({
  edgeTypeOptions,
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
  minEValueExp: number;
  maxEValueExp: number;
  eValueExp: number;
  selectEValueExp: (newEValueExp: number) => void;
}

function EdgeOptions({
  edgeTypeOptions,
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

  const title = (
    <div>
      Edge Options
      <HelpIcon>
        {EDGE_OPTIONS_HELP}
      </HelpIcon>
    </div>
  );

  return (
    <div className="EdgeOptions">
      <GraphAccordion title={title}>
        <fieldset className="EdgeTypeControl">
          <legend>
            Edge Type
          </legend>
          <div className="EdgeTypeOptions">
            {
              edgeTypeOptions.map(
                ({ key, display, isSelected, onChange, onMouseOver, onMouseOut }) =>
                  <div
                    className="EdgeTypeOption"
                    key={key}
                    onMouseOver={onMouseOver}
                    onMouseOut={onMouseOut}
                  >
                    <Checkbox
                      value={isSelected}
                      onChange={onChange}
                    />
                    <label>
                      {display}
                    </label>
                  </div>
              )
            }
          </div>
        </fieldset>
        <fieldset className="ScoreControl">
          <legend>
            E-Value Cutoff
          </legend>
          <div className="EValueHeader">
            <span>
              Max E-Value:
            </span>
            <span className="EValueText">
              1E
              <TextBox
                value={internalEValueText}
                onChange={setInternalEValueText}
              />
            </span>
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
      </GraphAccordion>
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
  legendEntries: Record<NodeDisplayType, LegendEntryProps[]>;
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

  const title = (
    <div>
      Node Options
      <HelpIcon>
        {NODE_OPTIONS_HELP}
      </HelpIcon>
    </div>
  );

  return (
    <div className="NodeOptions">
      <GraphAccordion title={title}>
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
        </fieldset>
        <div className={`ControlSection ${selectedNodeDisplayType}`}>
          <div className="LegendHeader">
            {legendHeaders[selectedNodeDisplayType]}
          </div>
          <div className="LegendContent">
            {
              legendEntries[selectedNodeDisplayType].map(
                taxonLegendEntry => <LegendEntry {...taxonLegendEntry} />
              )
            }
          </div>
        </div>
      </GraphAccordion>
    </div>
  );
}

export interface LegendEntryProps {
  key: string;
  symbol: React.ReactNode;
  description: string;
  tooltip?: React.ReactNode;
  onMouseOver?: () => void;
  onMouseOut?: () => void;
}

const TOOLTIP_POSITION = {
  my: 'top left',
  at: 'bottom right'
};

function LegendEntry({ symbol, tooltip, description, onMouseOver, onMouseOut }: LegendEntryProps) {
  const legendContent = (
    <div className="LegendEntry" onMouseOver={onMouseOver} onMouseOut={onMouseOut}>
      {symbol}
      {description}
    </div>
  );

  return tooltip == null
    ? legendContent
    : <Tooltip content={tooltip} showDelay={0} position={TOOLTIP_POSITION}>
        {legendContent}
      </Tooltip>;
}
