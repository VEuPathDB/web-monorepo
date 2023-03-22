import React from 'react';

import 'wdk-client/Components/Overlays/Modal/Modal.scss';
import { BodyLayer } from 'wdk-client/Components/Mesa';
import { useBodyScrollManager } from 'wdk-client/Components/Overlays/BodyScrollManager';

function Modal(props) {
  const { when, wrapperClass, ...otherProps } = props;
  const active = typeof when === 'undefined' ? true : when;
  const wrapperClassName = 'wdk-Modal-Wrapper'
  + (active ? ' wdk-Modal-Wrapper--Active' : '')
  + (wrapperClass ? ' ' + wrapperClass : '');
  
  useBodyScrollManager(active);
  
  return (
    <BodyLayer className={wrapperClassName}>
      <div {...otherProps} />
    </BodyLayer>
  );
}

export default Modal;
