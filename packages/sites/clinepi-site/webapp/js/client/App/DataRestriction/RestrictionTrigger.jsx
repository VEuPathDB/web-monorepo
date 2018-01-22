import React from 'react';

class RestrictionTrigger extends React.Component {
  constructor (props) {
    super(props);
  }

  trigger () {
    const detail = { studyId: 'DS_0ad509829e' };
    document.dispatchEvent(new CustomEvent('DataRestricted', { detail }));
  }

  render () {
    const style = {
      display: 'block',
      margin: '10px auto',
      fontSize: '25px',
      padding: '30px'
    };
    return <button onClick={this.trigger} style={style}>Trigger Restriction Modal</button>
  }
};

export default RestrictionTrigger;
