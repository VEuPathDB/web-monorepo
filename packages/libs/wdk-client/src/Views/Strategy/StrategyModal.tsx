import React from 'react';
import {makeClassNameHelper} from 'wdk-client/Utils/ComponentUtils';
import Modal from 'wdk-client/Components/Overlays/Modal';

import './StrategyModal.scss';

const cx = makeClassNameHelper('StrategyModal');

interface Props {
  children: React.ReactNode;
  title?: React.ReactNode;
  onGoBack?: () => void;
  onClose?: () => void;
}

export default function StrategyModal(props: Props) {
  const { children, title, onClose, onGoBack } = props;
  return (
    <Modal className={cx()}>
      <div className={cx('--Header')}>
        <div className={cx('--GoBack')}>
          {onGoBack && (
            <button type="button" className="link" onClick={() => onGoBack()}>
              <i className="fa fa-lg fa-arrow-left"/>
            </button>
          )}
        </div>
        <div className={cx('--Title')}>
          {title}
        </div>
        <div className={cx('--Close')}>
          {onClose && (
            <button type="button" className="link" onClick={() => onClose()}>
              <i className="fa fa-lg fa-times"/>
            </button>
          )}
        </div>
      </div>
      <div className={cx('--Content')}>
        {children}
      </div>
    </Modal>
  );
}
