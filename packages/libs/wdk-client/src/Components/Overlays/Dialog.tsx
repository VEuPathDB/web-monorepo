import React, { ReactNode, useEffect, useRef } from 'react';
import Icon from '../../Components/Icon/Icon';
import { useBodyScrollManager } from '../../Components/Overlays/BodyScrollManager';
import Popup from '../../Components/Overlays/Popup';
import { makeClassNameHelper, wrappable } from '../../Utils/ComponentUtils';

import '../../Components/Overlays/Dialog.css';

type Props = {
  open: boolean;
  children: ReactNode;
  modal?: boolean;
  title?: ReactNode;
  leftButtons?: ReactNode[];
  buttons?: ReactNode[];
  draggable?: boolean;
  resizable?: boolean;
  className?: string;
  onOpen?: () => void;
  onClose?: () => void;
  contentRef?: React.RefObject<HTMLDivElement>; // a ref for resetting vertical scroll, for example
};

function Dialog(props: Props) {
  const headerNode = useRef<HTMLDivElement>(null);
  useBodyScrollManager(props.open && !!props.modal);
  useRestorePrevoiusFocus(props.open);

  // global document keyboard handler(s) while the dialog is open
  useEffect(() => {
    if (!props.open) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        props.onClose?.();
      }
    };

    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [props.open]);

  if (!props.open) return null;

  const {
    onClose = () => {},
    buttons = [
      <button
        title="Keyboard shortcut: ESC"
        key="close"
        type="button"
        onClick={() => onClose()}
      >
        <Icon type="close" />
      </button>,
    ],
    leftButtons,
  } = props;

  const content = (
    <div className={makeClassName(props.className, '', props.modal && 'modal')}>
      <div
        ref={headerNode}
        className={makeClassName(props.className, 'Header')}
      >
        <div className={makeClassName(props.className, 'LeftButtons')}>
          {leftButtons}
        </div>
        <div className={makeClassName(props.className, 'Title')}>
          {props.title}
        </div>
        <div className={makeClassName(props.className, 'RightButtons')}>
          {buttons}
        </div>
      </div>
      <div
        className={makeClassName(props.className, 'Content')}
        ref={props.contentRef}
      >
        {props.children}
      </div>
    </div>
  );

  return (
    <Popup
      className={makeClassName(props.className, 'PopupWrapper')}
      dragHandleSelector={() => headerNode.current as HTMLDivElement}
      open={props.open}
      resizable={props.resizable}
    >
      {content}
    </Popup>
  );
}

let c = makeClassNameHelper('wdk-Dialog');
let c2 = makeClassNameHelper(' ');

function makeClassName(className?: string, suffix = '', ...modifiers: any[]) {
  return (
    c(suffix, ...modifiers) +
    (className ? c2(className + suffix, ...modifiers) : '')
  );
}

function useRestorePrevoiusFocus(isOpen: boolean) {
  const previousActiveRef = useRef<Element | null>();
  useEffect(() => {
    if (isOpen) {
      previousActiveRef.current = document.activeElement;
    } else {
      restoreFocus();
    }

    return restoreFocus;

    function restoreFocus() {
      if (previousActiveRef.current instanceof HTMLElement) {
        previousActiveRef.current.focus();
      }
    }
  }, [isOpen]);
}

export default wrappable(Dialog);
