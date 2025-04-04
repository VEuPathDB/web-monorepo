import React, { ReactNode, useEffect, useRef, useState } from 'react';
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

const isMovingHighlightColor = '#FF3131';

function Dialog(props: Props) {
  const headerNode = useRef<HTMLDivElement>(null);
  useBodyScrollManager(props.open && !!props.modal);
  useRestorePreviousFocus(props.open);

  // keyboard-based placement
  const [isMoving, setIsMoving] = useState(false);
  const [x, setX] = useState<number>();
  const [y, setY] = useState<number>();

  const handlePopupReady = (node: HTMLElement) => {
    const rect = node.getBoundingClientRect();
    setX((x) => (x == null ? -rect.width / 2 : x));
    setY((y) => (y == null ? -rect.height / 2 : y));
  };

  useEffect(() => {
    if (!isMoving) return;

    const handleKey = (e: KeyboardEvent) => {
      let handled = false;

      switch (e.key) {
        case 'ArrowUp':
          setY((y) => (y == null ? y : y - 10));
          handled = true;
          break;
        case 'ArrowDown':
          setY((y) => (y == null ? y : y + 10));
          handled = true;
          break;
        case 'ArrowLeft':
          setX((x) => (x == null ? x : x - 10));
          handled = true;
          break;
        case 'ArrowRight':
          setX((x) => (x == null ? x : x + 10));
          handled = true;
          break;
        case 'Escape':
          setIsMoving(false);
          handled = true;
          break;
      }

      if (handled) {
        e.preventDefault(); // Only block default behavior if we handled the key
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isMoving]);

  // global document keyboard handler(s) while the dialog is open
  useEffect(() => {
    if (!props.open || isMoving) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        props.onClose?.();
      }
    };

    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [props.open, isMoving]);

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
    leftButtons = [
      <button
        title="Toggle keyboard placement mode"
        key="move"
        type="button"
        onClick={() => setIsMoving((prev) => !prev)}
        style={isMoving ? { color: isMovingHighlightColor } : {}}
      >
        <Icon type="move" />
      </button>,
    ],
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
          {isMoving ? <KeyboardMovingHelp /> : props.title}
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
      x={x}
      y={y}
      onMove={(x, y) => {
        setX(x);
        setY(y);
      }}
      onReady={handlePopupReady}
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

function useRestorePreviousFocus(isOpen: boolean) {
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

function KeyboardMovingHelp() {
  return (
    <span style={{ color: isMovingHighlightColor }}>
      ≫ Use arrow keys to move. Press <kbd>Esc</kbd> to exit. ≪
    </span>
  );
}

export default wrappable(Dialog);
