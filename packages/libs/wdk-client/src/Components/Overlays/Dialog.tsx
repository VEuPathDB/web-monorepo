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
const moveAmount = 20;
const edgePadding = 10;

function Dialog(props: Props) {
  const headerNode = useRef<HTMLDivElement>(null);
  useBodyScrollManager(props.open && !!props.modal);
  useRestorePreviousFocus(props.open);

  // keyboard-based placement
  const [isMoving, setIsMoving] = useState(false);
  const [x, setX] = useState<number>();
  const [y, setY] = useState<number>();
  const [popupWidth, setPopupWidth] = useState<number>();
  const [popupHeight, setPopupHeight] = useState<number>();
  const [popupNode, setPopupNode] = useState<HTMLElement>();

  const handlePopupReady = (node: HTMLElement) => {
    setPopupNode(node);
    const rect = node.getBoundingClientRect();
    setPopupWidth(rect.width);
    setPopupHeight(rect.height);
    setX((x) => (x == null ? -rect.width / 2 : x));
    setY((y) => (y == null ? -rect.height / 2 : y));
  };

  useEffect(() => {
    if (!isMoving) return;
    if (popupWidth == null || popupHeight == null) return;

    const minX = -window.innerWidth / 2 + edgePadding;
    const maxX = window.innerWidth / 2 - popupWidth - edgePadding;
    const minY = -window.innerHeight / 2 + edgePadding;
    const maxY = window.innerHeight / 2 - popupHeight - edgePadding;

    // functions to prevent moving the popup out of viewport
    const clampX = (x: number) => Math.min(Math.max(x, minX), maxX);
    const clampY = (y: number) => Math.min(Math.max(y, minY), maxY);

    const handleKeys = (e: KeyboardEvent) => {
      let handled = false;

      switch (e.key) {
        case 'ArrowUp':
          setY((y) => (y == null ? y : clampY(y - moveAmount)));
          handled = true;
          break;
        case 'ArrowDown':
          setY((y) => (y == null ? y : clampY(y + moveAmount)));
          handled = true;
          break;
        case 'ArrowLeft':
          setX((x) => (x == null ? x : clampX(x - moveAmount)));
          handled = true;
          break;
        case 'ArrowRight':
          setX((x) => (x == null ? x : clampX(x + moveAmount)));
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

    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, [isMoving, popupWidth, popupHeight]);

  // global document keyboard handler(s) while the dialog is open
  useEffect(() => {
    if (!props.open || isMoving) return;

    const handleKeys = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        props.onClose?.();
      }
      if (e.key === 'G' || e.key === 'g') {
        console.log('Gee!');
        popupNode?.focus();
      }
    };

    document.addEventListener('keydown', handleKeys);
    return () => document.removeEventListener('keydown', handleKeys);
  }, [props.open, isMoving, popupNode]);

  // constrain popup position to inside the viewport
  useEffect(() => {
    function constrainPosition() {
      if (x == null || y == null || popupWidth == null || popupHeight == null)
        return;
      const padding = edgePadding;

      const minX = -window.innerWidth / 2 + padding;
      const maxX = window.innerWidth / 2 - popupWidth - padding;

      const minY = -window.innerHeight / 2 + padding;
      const maxY = window.innerHeight / 2 - popupHeight - padding;

      setX((x) => Math.min(Math.max(x ?? 0, minX), maxX));
      setY((y) => Math.min(Math.max(y ?? 0, minY), maxY));
    }

    constrainPosition(); // run immediately

    window.addEventListener('resize', constrainPosition);
    return () => window.removeEventListener('resize', constrainPosition);
  }, [x, y, popupWidth, popupHeight]);

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
