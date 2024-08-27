import React, {
  CSSProperties,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
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
};

const resizeStyling: CSSProperties = {
  resize: 'both',
  overflow: 'auto',
  minHeight: 100,
};

function Dialog(props: Props) {
  const headerNode = useRef<HTMLDivElement>(null);
  useBodyScrollManager(props.open && !!props.modal);
  useRestorePreviousFocus(props.open);
  const [isDragging, setIsDragging] = useState(false);
  const [initialOffset, setInitialOffset] =
    useState<{ left: number; top: number } | undefined>(undefined);

  if (!props.open) return null;

  const {
    onClose = () => {},
    buttons = [
      <button key="close" type="button" onClick={() => onClose()}>
        <Icon type="close" />
      </button>,
    ],
    leftButtons,
    draggable = true,
  } = props;

  const handleDragStart = (e: React.MouseEvent) => {
    setIsDragging(true);
    if (headerNode.current && !initialOffset) {
      const popupRect =
        headerNode.current.parentElement?.getBoundingClientRect();
      setInitialOffset({
        left: e.clientX - (popupRect?.left ?? 0),
        top: e.clientY - (popupRect?.top ?? 0),
      });
    }
  };

  const handleDrag = (e: React.MouseEvent) => {
    if (isDragging && headerNode.current && initialOffset) {
      const popupContainer = headerNode.current.parentElement;
      if (popupContainer) {
        const popupRect = popupContainer.getBoundingClientRect();
        const left =
          popupContainer.offsetLeft +
          (e.clientX - popupRect.left) -
          initialOffset.left;
        const top =
          popupContainer.offsetTop +
          (e.clientY - popupRect.top) -
          initialOffset.top;
        popupContainer.style.left = left + 'px';
        popupContainer.style.top = top + 'px';
      }
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setInitialOffset(undefined);
  };

  const content = (
    <div
      onKeyDown={handleKeyDown}
      className={makeClassName(props.className, '', props.modal && 'modal')}
      style={props.resizable ? resizeStyling : undefined}
    >
      <div
        ref={headerNode}
        className={makeClassName(
          props.className,
          'Header',
          draggable ? ' draggable' : ''
        )}
        {...(draggable
          ? {
              onMouseDown: handleDragStart,
              onMouseMove: handleDrag,
              onMouseUp: handleDragEnd,
            }
          : {})}
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
      <div className={makeClassName(props.className, 'Content')}>
        {props.children}
      </div>
    </div>
  );

  return (
    <Popup className={makeClassName(props.className, 'PopupWrapper')}>
      {content}
    </Popup>
  );

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape' || event.key === 'Esc') {
      onClose();
    }
  }
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

export default wrappable(Dialog);
