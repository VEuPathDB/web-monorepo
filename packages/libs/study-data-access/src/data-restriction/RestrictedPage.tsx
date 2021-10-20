import React, { ReactEventHandler, ReactNode } from 'react';

import { NotFoundController } from '@veupathdb/wdk-client/lib/Controllers';

import { ApprovalStatus } from './dataRestrictionHooks';
import { Loading } from '@veupathdb/wdk-client/lib/Components';

interface Props {
  approvalStatus: ApprovalStatus;
  children: ReactNode;
}

/**
 * This component is used for rendering pages whose content (children)
 * is protected by a Data Restriction.
 * 
 * The UX is as follows:
 * 
 * (1) While the approvalStatus is loading, the page contents are rendered inside a
 *     "hidden" div
 * 
 * (2) Once the approvalStatus is done loading...
 * 
 * a. If the study does not exist (in the sense that it does not exist in the backend
 *    OR the study is marked as "disabled" by the WDK model), render our usual "not found" page
 *    instead of the page contents
 * 
 * b. If the user is approved to perform the action, display the page contents in an "unhidden" div
 * 
 * c. If the user is not approved to perform the action, display the page contents in a "blurred" div
 *    which stops the propagation of any user-interaction-related DOM events
 */
export function RestrictedPage({
  approvalStatus,
  children,
}: Props) {
  if (approvalStatus === 'study-not-found') return <NotFoundController/>;
  
  // Note: in all cases that include children, a similar structure is used to prevent
  // children from being remounted when approvalStatus changes. This prevents the loss
  // of component state, premature cleanup of effects, etc.

  const wrapperProps: JSX.IntrinsicElements['div'] = approvalStatus === 'loading' ? {
    style: {
      visibility: 'hidden'
    }
  } : approvalStatus === 'not-approved' ? {
    style: {
      pointerEvents: 'none',
      filter: 'blur(6px)'
    },
    onSubmit: stopEvent,
    onSelect: stopEvent,
    onClickCapture: stopEvent,
    onChangeCapture: stopEvent,
    onInputCapture: stopEvent,
    onFocusCapture: stopEvent,
    onKeyDownCapture: stopEvent,
    onKeyUpCapture: stopEvent,
    onKeyPressCapture: stopEvent,

  } : {};
  return (
    <>
      {approvalStatus === 'loading' ? <Loading/> : <></>}
      <div {...wrapperProps}>{children}</div>
    </>
  )
}

const stopEvent: ReactEventHandler = (event) => {
  event.stopPropagation();
  event.preventDefault();
};
