import React from 'react';

import MesaController from '../Ui/MesaController';
import MesaState from '../Utils/MesaState';

class Mesa extends React.Component {
  constructor (props) {
    super(props);
  }

  render () {
    const { state, children } = this.props;
    return <MesaController {...state}>{children}</MesaController>
  }
};

export default Mesa;
