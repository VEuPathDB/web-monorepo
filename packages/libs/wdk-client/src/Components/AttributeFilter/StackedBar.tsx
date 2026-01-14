import React from 'react';

type Props = {
  /** The count of matching records */
  count: number;

  /** The count of filtered records */
  filteredCount: number;

  /** The total population size used for percentage calculations */
  populationSize: number;

  /** Color for the main bar fill. Defaults to '#aaaaaa' */
  fillBarColor?: string;

  /** Color for the filtered bar fill. Defaults to '#DA7272' */
  fillFilteredBarColor?: string;
};

/**
 * A stacked bar visualization showing count and filteredCount as percentages
 * of the total populationSize
 */
export default function StackedBar(props: Props) {
  // Set bar colors
  const fillBarColor = props.fillBarColor || '#aaaaaa';
  const fillFilteredBarColor = props.fillFilteredBarColor || '#DA7272';

  return (
    <div className="bar">
      <div
        className="fill"
        style={{
          width: (props.count / props.populationSize) * 100 + '%',
          backgroundColor: fillBarColor,
        }}
      />
      <div
        className="fill filtered"
        style={{
          width: (props.filteredCount / props.populationSize) * 100 + '%',
          backgroundColor: fillFilteredBarColor,
        }}
      />
    </div>
  );
}
