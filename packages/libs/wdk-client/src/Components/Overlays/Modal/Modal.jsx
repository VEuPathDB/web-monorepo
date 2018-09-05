import React from 'react';

import './Modal.scss';
import { BodyLayer } from '../../Mesa';

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
