import React from 'react';

import 'wdk-client/Components/Overlays/Modal/Modal.scss';
import { BodyLayer } from 'wdk-client/Components/Mesa';

class Modal extends React.Component {
  constructor (props) {
    super(props);
  }

  render () {
    const { when, wrapperClass, ...otherProps } = this.props;
    const active = typeof when === 'undefined' ? true : when;
    const wrapperClassName = 'wdk-Modal-Wrapper'
      + (active ? ' wdk-Modal-Wrapper--Active' : '')
      + (wrapperClass ? ' ' + wrapperClass : '');
    return (
      <BodyLayer className={wrapperClassName}>
        <div {...otherProps} />
      </BodyLayer>
    );
  }
};

export default Modal;
