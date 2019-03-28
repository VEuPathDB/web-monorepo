import React from 'react';

class RowCounter extends React.PureComponent {
  constructor (props) {
    super(props);
  }

  render () {
    let { count, noun, filteredRowCount, start, end } = this.props;
    let filterString = !filteredRowCount ? null : <span className="faded"> (filtered from a total of {count})</span>;
    const remainingRowCount = !filteredRowCount ? count : count - filteredRowCount;

    let countString = (<span><b>{remainingRowCount}</b> {noun}</span>);
    let allResultsShown = (!start || !end || (start === 1 && end === remainingRowCount));

    if (!allResultsShown) {
      countString = (
        <span>
          {noun} <b>{start}</b> - <b>{end}</b> of <b>{remainingRowCount}</b>
        </span>
      );
    }

    return (
      <div className="RowCounter">
        {countString}
        {filterString}
      </div>
    );
  }
};

export default RowCounter;
