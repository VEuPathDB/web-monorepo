import React from 'react';
import { Mesa } from '@veupathdb/wdk-client/lib/Components';
import { useBodyScrollManager } from '@veupathdb/wdk-client/lib/Components/Overlays/BodyScrollManager';

import './Modal.scss';

function Modal(props) {
  const { when, wrapperClassName, ...divProps } = props;
  const active = typeof when === 'undefined' ? true : when;
  const finalWrapperClassName = 'Modal-Wrapper'
    + (active ? ' Modal-Wrapper--Active' : '')
    + (wrapperClassName ? ' ' + wrapperClassName : '');
  useBodyScrollManager(active);
  return (
    <Mesa.BodyLayer className={finalWrapperClassName}>
      <div {...divProps} />
    </Mesa.BodyLayer>
  );
}

export default Modal;
