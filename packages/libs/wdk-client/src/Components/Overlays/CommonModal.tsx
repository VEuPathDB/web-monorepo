import React from 'react';
import { makeClassNameHelper } from '../../Utils/ComponentUtils';
import Dialog from '../../Components/Overlays/Dialog';
import makeSnackbarProvider from '@veupathdb/coreui/lib/components/notifications/SnackbarProvider';

import './CommonModal.scss';

const cx = makeClassNameHelper('CommonModal');

// A SnackbarProvider scoped to the modal so that snackbars triggered from
// inside a modal render within the modal's portal DOM (above the backdrop),
// rather than behind it in the page-level snackbar container.
const ModalSnackbarProvider = makeSnackbarProvider();

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
      <i className="fa fa-arrow-left" />
    </button>,
  ];
  return (
    <Dialog
      open
      modal
      className={cx()}
      title={title}
      leftButtons={leftButtons}
      onClose={onClose}
    >
      <ModalSnackbarProvider styleProps={{}}>
        <div className={cx('--Content')}>{children}</div>
      </ModalSnackbarProvider>
    </Dialog>
  );
}
