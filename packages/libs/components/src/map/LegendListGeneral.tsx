//type def for legend: some are set to optional for now
//perhaps this goes to Types.ts to avoid duplicate and legendProps can be an extension
interface LegendListProps {
  data: {
    label: string; // categorical e.g. "Anopheles gambiae"
    // numeric e.g. "10-20"
    value: number;
    color: string;
  }[];
  //add this
  legendType: string;
  //used for legend info text, e.g., Collections
  legendInfoNumberText?: string;
}

// truncate any string longer than *max* and append *add* at the end (three ellipses by default)
const truncate = function (string: string, max: number, add?: string) {
  add = add || '...';
  return string.length > max ? string.substring(0, max) + add : string;
};

//add commas
function numberWithCommas(x: number) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// maximum items to display in legend
const MAXIMUM_LEGEND_LIST_ITEMS = 10;

export default function LegendListSquare({
  data,
  legendType,
  legendInfoNumberText,
}: LegendListProps) {
  const legendIconClass = legendType === 'numeric' ? 'legend-square-icon' : '';

  /**
   * If data exceeds maximum items:
   *  1. slice 1 less than the maximum allowed
   *  2. combine the values of the data that were "cut off" into a LegendListProps['data'] object whose label is "Others"
   */
  const displayableData =
    data.length <= MAXIMUM_LEGEND_LIST_ITEMS
      ? data
      : data.slice(0, MAXIMUM_LEGEND_LIST_ITEMS - 1).concat([
          {
            label: 'Others',
            color: 'silver',
            value: data
              .slice(MAXIMUM_LEGEND_LIST_ITEMS - 1)
              .reduce((prev, curr) => prev + curr.value, 0),
          },
        ]);

  return (
    <>
      <div className="legend-field-text"># of {legendInfoNumberText}</div>
      <br />
      {displayableData.map((data, index) => (
        <div key={data.label}>
          <div className={'active-legend-area ' + legendIconClass}>
            <div className="active-legend" title={data.label}>
              <i style={{ background: data.color }}></i>
              {/** 23 characters is max */}
              <em>{truncate(data.label, 22)}</em>
            </div>
          </div>
          <div className="legend-count">{numberWithCommas(data.value)}</div>
          {index < displayableData.length - 1 && <br />}
        </div>
      ))}
    </>
  );
}
