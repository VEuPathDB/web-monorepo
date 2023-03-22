import PropTypes from 'prop-types';
import React from 'react';

export default function StackedBar(props) {
  // Set bar colors
  const fillBarColor = props.fillBarColor || "#aaaaaa";
  const fillFilteredBarColor = props.fillFilteredBarColor || "#DA7272";

  return (
    <div className="bar">
      <div className="fill" style={{
        width: (props.count / props.populationSize * 100) + '%',
        backgroundColor: fillBarColor
      }}/>
      <div className="fill filtered" style={{
        width: (props.filteredCount / props.populationSize * 100) + '%',
        backgroundColor: fillFilteredBarColor
      }}/>
    </div>
  );
}

StackedBar.propTypes = {
  count: PropTypes.number.isRequired,
  filteredCount: PropTypes.number.isRequired,
  populationSize: PropTypes.number.isRequired
}
