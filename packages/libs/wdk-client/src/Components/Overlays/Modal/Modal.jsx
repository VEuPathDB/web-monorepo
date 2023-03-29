import React from 'react';

import '../../../Components/Overlays/Modal/Modal.scss';
import { BodyLayer } from '../../../Components/Mesa';
import { useBodyScrollManager } from '../../../Components/Overlays/BodyScrollManager';

function Modal(props) {
  const { when, wrapperClass, ...otherProps } = props;
  const active = typeof when === 'undefined' ? true : when;
  const wrapperClassName =
    'wdk-Modal-Wrapper' +
    (active ? ' wdk-Modal-Wrapper--Active' : '') +
    (wrapperClass ? ' ' + wrapperClass : '');

  useBodyScrollManager(active);

  return (
    <BodyLayer className={wrapperClassName}>
      <div {...otherProps} />
    </BodyLayer>
  );
}

export default Modal;
