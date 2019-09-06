import React from 'react';

/**
 * Legend used for all filters
 */
export default function FilterLegend(props) {
  return (
    <div className="filter-param-legend">
      <div>
        <div className="bar"><div className="fill"></div></div>
        <div className="label">All {props.displayName} having "{props.activeField.display}"</div>
      </div>
      <div>
        <div className="bar"><div className="fill filtered"></div></div>
        <div className="label">Remaining {props.displayName} when <em>other</em> criteria have been applied.</div>
      </div>
    </div>
  );
}
  // TODO Either remove the commented code below, or replace using provided total counts
  // const totalCounts = Seq.from(props.distribution)
  //   // FIXME Always filter nulls when they are moved to different section for non-range fields
  //   .filter(entry => !isRange(props.activeField) || entry.value != null)
  //   .reduce(concatCounts, { count: 0, filteredCount: 0 });

  // return (
  //   <div className="filter-param-legend">
  //     <div>
  //       <div className="bar"><div className="fill"></div></div>
  //       <div className="label"><strong>{totalCounts.count} {props.displayName}</strong> &ndash; All {props.displayName} having "{props.activeField.display}"</div>
  //     </div>
  //     <div>
  //       <div className="bar"><div className="fill filtered"></div></div>
  //       <div className="label"><strong>{totalCounts.filteredCount} {props.displayName}</strong> &ndash; Matching {props.displayName} when <em>other</em> criteria have been applied.</div>
  //     </div>
  //   </div>
  // )

/**
 * Creates a count object where `count` and `filteredCount` are the sum of
 * `countsA` and `countsB` properties.
 */
// FIXME Remove eslint rule when counts and percentages are figured out
// eslint-disable-next-line no-unused-vars, require-jsdoc
function concatCounts(countsA, countsB) {
  return {
    count: countsA.count + countsB.count,
    filteredCount: countsA.filteredCount + countsB.filteredCount
  }
}
