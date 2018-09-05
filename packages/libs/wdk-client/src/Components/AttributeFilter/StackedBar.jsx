import PropTypes from 'prop-types';
import React from 'react';

export default function StackedBar(props) {
  return (
    <div className="bar">
      <div className="fill" style={{
        width: (props.count / props.populationSize * 100) + '%'
      }}/>
      <div className="fill filtered" style={{
        width: (props.filteredCount / props.populationSize * 100) + '%'
      }}/>
    </div>
  );
}

StackedBar.propTypes = {
  count: PropTypes.number.isRequired,
  filteredCount: PropTypes.number.isRequired,
  populationSize: PropTypes.number.isRequired
}
