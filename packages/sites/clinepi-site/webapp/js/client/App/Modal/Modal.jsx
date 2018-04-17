import React from 'react';

import './Modal.scss';
import { Mesa } from 'wdk-client/Components';
import { filterKeysFromObject } from 'Client/App/Utils/Utils';

class Modal extends React.Component {
  constructor (props) {
    super(props);
  }

  render () {
    const { when, wrapperClass } = this.props;
    const active = typeof when === 'undefined' ? true : when;
    const wrapperClassName = 'Modal-Wrapper'
      + (active ? ' Modal-Wrapper--Active' : '')
      + (wrapperClass ? ' ' + wrapperClass : '');
    const props = filterKeysFromObject(this.props, [ 'when', 'wrapperClassName' ]);
    return (
      <Mesa.BodyLayer className={wrapperClassName}>
        <div {...props} />
      </Mesa.BodyLayer>
    );
  }
};

export default Modal;
