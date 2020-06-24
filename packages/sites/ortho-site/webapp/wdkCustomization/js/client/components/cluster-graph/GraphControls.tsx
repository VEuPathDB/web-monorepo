import React, { useEffect, useState } from 'react';

import { Checkbox, SliderInput, TextBox } from 'wdk-client/Components';

import { EdgeTypeOption, EdgeType } from '../../utils/clusterGraph';

type Props = EdgeOptionsProps;

export function GraphControls({
  edgeTypeOptions,
  selectEdgeTypeOption,
  minEValueExp,
  maxEValueExp,
  eValueExp,
  selectEValueExp
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
