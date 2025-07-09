import React, {
  ReactNode,
  useCallback,
  useEffect,
  useId,
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
  /**
   * An optional description for screen readers only
   */
  description?: ReactNode;
  /**
   * Optional arrays of buttons for the title bar.
   * Note that the default buttons provide onClose and
   * keyboard-positioning functionality, which you will need to restore.
   */
  buttons?: ReactNode[];
  leftButtons?: ReactNode[];

  draggable?: boolean;
  resizable?: boolean;
  className?: string;
  onOpen?: () => void;
  onClose?: () => void;
  /**
   * A ref for resetting vertical scroll, for example.
   * Also enables keyboard toggling between main page content and popup
   * (non-modal mode only)
   */
  contentRef?: React.RefObject<HTMLDivElement>;
  /**
   * A ref to the div to return keyboard focus to when toggling
   * focus out of the popup.
   */
  parentRef?: React.RefObject<HTMLElement>;
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
  const [hasMoved, setHasMoved] = useState(false);
  const [hasAutoCentered, setHasAutoCentered] = useState(false);
  const didSkipInitialResize = useRef(false);

  const handlePopupReady = useCallback(
    (node: HTMLElement) => {
      const rect = node.getBoundingClientRect();
      setPopupWidth(rect.width);
      setPopupHeight(rect.height);
      // Only set position offsets (from center of window)
      // if they haven't been set yet:
      setX((x) => (x == null ? -rect.width / 2 : x));
      setY((y) => (y == null ? -rect.height / 2 : y));

      // Only install our observer if the user hasn’t already
      // moved the popup, and we haven’t yet auto-centered once:
      if (!hasMoved && !hasAutoCentered) {
        const observer = new ResizeObserver(([entry]) => {
          if (!didSkipInitialResize.current) {
            // This is the "initial" callback. Not really a resize. Ignore it.
            didSkipInitialResize.current = true;
            return;
          }
          const { width, height } = entry.contentRect;
          setX(-width / 2);
          setY(-height / 2);
          setHasAutoCentered(true);
          // stop observing after first resize
          observer.disconnect();
        });
        observer.observe(node);
      }
    },
    [hasMoved, hasAutoCentered]
  );

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
          setHasMoved(true);
          handled = true;
          break;
        case 'ArrowDown':
          setY((y) => (y == null ? y : clampY(y + moveAmount)));
          setHasMoved(true);
          handled = true;
          break;
        case 'ArrowLeft':
          setX((x) => (x == null ? x : clampX(x - moveAmount)));
          setHasMoved(true);
          handled = true;
          break;
        case 'ArrowRight':
          setX((x) => (x == null ? x : clampX(x + moveAmount)));
          setHasMoved(true);
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

  // keyboard-based focus toggling
  const [focusState, setFocusState] = useState<'popup' | 'parent'>('parent');
  const [showFocusHint, setShowFocusHint] = useState(false);

  // cancel focus hint if showing a new title
  useEffect(() => {
    if (props.title) {
      setShowFocusHint(false);
    }
  }, [props.title]);

  const closeHandler = useCallback(() => {
    props.onClose?.();

    if (props.parentRef?.current) {
      props.parentRef.current.focus();
    }
    setFocusState('parent');
  }, [props.onClose]);

  // keep keyboard focus state in sync with mouse-based events
  useEffect(() => {
    // set focusState on change to open
    if (props.open) {
      setFocusState('popup');
    }
  }, [props.open]);

  // global document keyboard handler(s) while the dialog is open
  useEffect(() => {
    if (!props.open || isMoving) return;

    const handleKeys = (e: KeyboardEvent) => {
      // ESC key closes popup
      if (e.key === 'Escape' || e.key === 'Esc') {
        closeHandler();
      }
      // F/f key toggles focus between popup content
      // (only if `props.contentRef` and `props.parentRef` are provided, and not for modals)
      if (e.key === 'F' || e.key === 'f') {
        if (
          !props.modal &&
          props.contentRef?.current &&
          props.parentRef?.current
        ) {
          if (focusState === 'parent') {
            props.contentRef.current.focus();
            setFocusState('popup');
          } else {
            props.parentRef.current.focus();
            setFocusState('parent');
          }
        }
      }
      // M key to enter toggle keyboard moving mode
      if (e.key === 'M' || e.key === 'm') {
        setIsMoving(true);
      }
      // Tab will do its normal thing but also show the focus key help
      if (e.key == 'Tab') {
        setShowFocusHint(true);
        setTimeout(() => setShowFocusHint(false), 5000); // auto-hide after 5s
      }
    };

    document.addEventListener('keydown', handleKeys);
    return () => document.removeEventListener('keydown', handleKeys);
  }, [
    props.open,
    closeHandler,
    isMoving,
    props.contentRef,
    props.parentRef,
    focusState,
  ]);

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

  // aria-related
  const titleId = useId();
  const descriptionId = useId();

  if (!props.open) return null;

  const {
    buttons = [
      <button
        title="Close this dialog (shortcut key: ESC)"
        key="close"
        type="button"
        onClick={() => closeHandler()}
      >
        <Icon type="close" />
      </button>,
    ],
    leftButtons = [
      <button
        title="Toggle keyboard placement mode (shortcut key: M)"
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
    <div
      role="dialog"
      aria-labelledby={titleId}
      aria-describedby={props.description ? descriptionId : undefined}
      aria-modal={props.modal}
      className={makeClassName(props.className, '', props.modal && 'modal')}
    >
      <div
        ref={headerNode}
        className={makeClassName(props.className, 'Header')}
      >
        <div className={makeClassName(props.className, 'LeftButtons')}>
          {leftButtons}
        </div>
        <div id={titleId} className={makeClassName(props.className, 'Title')}>
          {isMoving ? (
            <KeyboardMovingHelp />
          ) : showFocusHint && props.contentRef && props.parentRef ? (
            <FocusToggleHelp />
          ) : (
            props.title
          )}
        </div>
        <div className={makeClassName(props.className, 'RightButtons')}>
          {buttons}
        </div>
      </div>
      <div
        className={makeClassName(props.className, 'Content')}
        ref={props.contentRef}
      >
        {props.description && (
          <p id={descriptionId} className="wdk-Dialog-screen-reader-only">
            {props.description}
          </p>
        )}
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
        setHasMoved(true);
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
    <span
      style={{
        color: isMovingHighlightColor,
        marginLeft: 42, // these margins avoid clipping
        marginRight: 42, // the red text
      }}
    >
      ≫ Use arrow keys to move. Press <kbd>Esc</kbd> to exit. ≪
    </span>
  );
}

function FocusToggleHelp() {
  return (
    <span style={{ color: isMovingHighlightColor }}>
      ↹ Press <kbd>F</kbd> to toggle focus. ↹
    </span>
  );
}

export default wrappable(Dialog);
