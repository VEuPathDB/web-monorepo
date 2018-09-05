import React from 'react';

class RowCounter extends React.PureComponent {
  constructor (props) {
    super(props);
  }

  render () {
    let { count, noun, filtered, start, end } = this.props;
    let filterString = !filtered ? null : <span className="faded"> ({filtered} filtered)</span>;
    let countString = (<span><b>{count}</b> {noun}</span>);
    let allResultsShown = (!start || !end || (start === 1 && end === count));

    if (!allResultsShown) {
      countString = (
        <span>
          {noun} <b>{start}</b> - <b>{end}</b> of <b>{count}</b>
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
