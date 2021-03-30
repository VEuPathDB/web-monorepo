// sample legend
import React from 'react';

interface LegendListRadioButtonProps {
  legendType: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  selectedOption?: string;
  // use yAxisRange[1]
  dependentAxisRange?: number[];
}

// add commas
function numberWithCommas(x: number) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export default function LegendListRadioButton(
  props: LegendListRadioButtonProps
) {
  // add tutorial image (for now)
  if (props.legendType == 'categorical') {
    return null;
  } else {
    return (
      <>
        {/*  add two <br /> for better display */}
        <br />
        <br />
        {/*  add onChange inside the <input> to avoid typescript error */}
        <div className="legend-list-radio-button">
          <div className="legend-list-radio-button-title">
            <b>Y-axis scaling</b>
          </div>
          {/*  for non-clickable label */}
          {/* <input type="radio" value="Regional" name="legendListRadio" onChange={props.onChange} checked={props.selectedOption === "Regional"}/> Regional (0 - {numberWithCommas(props.yAxisRangeValue)})
            <br />
            <input type="radio" value="Individual" name="legendListRadio" onChange={props.onChange} checked={props.selectedOption === "Individual"}/> Per-marker (varies) */}
          {/*  for clickable label */}
          <input
            id="Regional"
            type="radio"
            value="Regional"
            name="legendListRadio"
            onChange={props.onChange}
            checked={props.selectedOption === 'Regional'}
          />
          &nbsp;
          <label htmlFor="Regional">
            {' '}
            {/* changed to array style */}
            Regional (
            {props.dependentAxisRange && props.dependentAxisRange[0]
              ? numberWithCommas(props.dependentAxisRange[0])
              : 0}{' '}
            -{' '}
            {props.dependentAxisRange && props.dependentAxisRange[1]
              ? numberWithCommas(props.dependentAxisRange[1])
              : 0}
            )
          </label>
          <br />
          <input
            id="Individual"
            type="radio"
            value="Individual"
            name="legendListRadio"
            onChange={props.onChange}
            checked={props.selectedOption === 'Individual'}
          />
          &nbsp;
          <label htmlFor="Individual"> Per-marker (varies)</label>
        </div>
      </>
    );
  }
}
