// Primitive component for creating a popup window

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import TabbableContainer from '../../Components/Display/TabbableContainer';

type Props = {
  className?: string;
  /** Content of popup */
  children: React.ReactElement<any>;
};

function Popup({ className, children }: Props) {
  const content = (
    <TabbableContainer autoFocus className={className || ''}>
      {children}
    </TabbableContainer>
  );
  return ReactDOM.createPortal(content, document.body);
}

export default Popup;
