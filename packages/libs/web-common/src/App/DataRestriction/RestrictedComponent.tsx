import React, { ReactEventHandler, ReactNode } from 'react';

import { NotFoundController } from '@veupathdb/wdk-client/lib/Controllers';

import { ApprovalStatus } from 'ebrc-client/hooks/dataRestriction';

interface Props {
  approvalStatus: ApprovalStatus;
  children: ReactNode;
}

export function RestrictedComponent({
  approvalStatus,
  children,
}: Props) {
  return approvalStatus === 'study-not-found' ? (
    <NotFoundController />
  ) : // always wrap children with a div to prevent them from being unmounted
  approvalStatus === 'loading' ? (
    <div style={{ visibility: 'hidden' }}>{children}</div>
  ) : approvalStatus === 'approved' ? (
    <div>{children}</div>
  ) : (
    <div
      style={{
        pointerEvents: 'none',
        filter: 'blur(6px)',
      }}
      onSubmit={stopEvent}
      onSelect={stopEvent}
      onClickCapture={stopEvent}
      onChangeCapture={stopEvent}
      onInputCapture={stopEvent}
      onFocusCapture={stopEvent}
      onKeyDownCapture={stopEvent}
      onKeyUpCapture={stopEvent}
      onKeyPressCapture={stopEvent}
    >
      {children}
    </div>
  );
}

const stopEvent: ReactEventHandler = (event) => {
  event.stopPropagation();
  event.preventDefault();
};
