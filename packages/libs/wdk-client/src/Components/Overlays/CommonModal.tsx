import React from 'react';
import {makeClassNameHelper} from 'wdk-client/Utils/ComponentUtils';
import Dialog from 'wdk-client/Components/Overlays/Dialog';

import './CommonModal.scss';

const cx = makeClassNameHelper('CommonModal');

interface Props {
  children: React.ReactNode;
  title?: React.ReactNode;
  onGoBack?: () => void;
  onClose?: () => void;
}

export default function CommonModal(props: Props) {
  const { children, title, onClose, onGoBack } = props;
  const leftButtons = onGoBack && [
    <button type="button" onClick={() => onGoBack()}>
      <i className="fa fa-arrow-left"/>
    </button>
  ]
  return (
    <Dialog open modal className={cx()} title={title} leftButtons={leftButtons} onClose={onClose}>
      <div className={cx('--Content')}>
        {children}
      </div>
    </Dialog>
  );
}
