import { CSSProperties, ReactNode, useState } from 'react';
import Draggable, { DraggableEvent, DraggableData } from 'react-draggable';
import { css } from '@emotion/react';
import useResizeObserver from 'use-resize-observer';
import { gray } from '../../../definitions/colors';
import { screenReaderOnly } from '../../../styleDefinitions/typography';
import { useUITheme } from '../../theming';
import DismissButton from '../../notifications/DismissButton';
import { H6 } from '../../typography';

export type DraggablePanelCoordinatePair = {
  x: number;
  y: number;
};

export type DraggablePanelStyleOverrides = {
  boxShadow?: CSSProperties['boxShadow'];
  height?: CSSProperties['height'];
  margin?: CSSProperties['margin'];
  minHeight?: CSSProperties['minHeight'];
  minWidth?: CSSProperties['minWidth'];
  padding?: CSSProperties['padding'];
  resize?: CSSProperties['resize'];
  width?: CSSProperties['width'];
  zIndex?: CSSProperties['zIndex'];
  overflow?: CSSProperties['overflow'];
};

export type HeightAndWidthInPixels = {
  height: number;
  width: number;
};

export type DraggablePanelProps = {
  /** The contents of the Draggable Panel. */
  children: ReactNode;
  /** If set this element will only be able to move within the confines of it's parent elenent. If unset or false, the element will go wherever the user drags it. */
  confineToParentContainer?: boolean;
  /** If provided, the panel will live here instead of where they originally live, as defined in the CSS & HTML. */
  defaultPosition?: DraggablePanelCoordinatePair;
  /** This controls weather the panel is visible or not. */
  isOpen: boolean;
  /** This meaningful text is used to both render a title and ensure a more WAI-compliant experience.  */
  panelTitle: string;
  /** This allows developers to show or hide the panel title. */
  showPanelTitle: boolean;
  /** This surfaces configurable CSS properties for the <DraggablePanel /> */
  styleOverrides?: DraggablePanelStyleOverrides;
  /** This event fires when the user's drag completes. */
  onDragComplete?: (
    destinationCoordinates: DraggablePanelCoordinatePair
  ) => void;
  /** This event fires when the user's drag begins. */
  onDragStart?: () => void;
  /** This event fires when the user dismisses a visible panel. If you supply nothing, then the close button will not render. */
  onPanelDismiss?: () => void;
  /** This event fires when the user resizes the height or width of the panel. */
  onPanelResize?: (heightAndWidth: HeightAndWidthInPixels) => void;
  /** HeaderButtons component for gear icon at SAM Legend */
  headerButtons?: React.FC;
};

export default function DraggablePanel(props: DraggablePanelProps) {
  const {
    confineToParentContainer,
    children,
    defaultPosition = { x: 0, y: 0 },
    isOpen,
    onDragComplete,
    onDragStart,
    onPanelDismiss,
    onPanelResize,
    panelTitle,
    showPanelTitle,
    styleOverrides,
    // make the first letter capital as headerButtons is a component
    headerButtons: HeaderButtons,
  } = props;

  const theme = useUITheme();

  const [wasDragged, setWasDragged] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [panelPosition, setPanelPosition] =
    useState<DraggablePanelCoordinatePair>(defaultPosition);

  function handleOnDrag(_: DraggableEvent, data: DraggableData) {
    !wasDragged && setWasDragged(true);
    setPanelPosition({
      x: data.x,
      y: data.y,
    });
  }

  function handleOnDragStart(e: DraggableEvent) {
    if ((e.target as HTMLElement).closest('button')) return;
    setIsDragging(true);

    if (onDragStart) onDragStart();
  }

  function handleOnDragStop(e: DraggableEvent, data: DraggableData) {
    if ((e.target as HTMLElement).closest('button')) return;
    setIsDragging(false);

    if (onDragComplete) {
      onDragComplete({
        x: data.lastX,
        y: data.lastY,
      });
    }
  }

  const { ref } = useResizeObserver({
    box: 'border-box',
    onResize: ({ height, width }) => {
      if (!onPanelResize || !height || !width) return;

      onPanelResize({
        height: height,
        width: width,
      });
    },
  });

  const {
    ref: containerRef,
    height: conainerHeight,
    width: containerWidth,
  } = useResizeObserver({
    box: 'border-box',
  });

  const finalPosition = confineToParentContainer
    ? constrainPositionOnScreen(
        panelPosition,
        containerWidth,
        conainerHeight,
        window
      )
    : panelPosition;

  // set maximum text length for the panel title
  const maxPanelTitleTextLength = 25;

  return (
    <Draggable
      bounds={confineToParentContainer ? 'parent' : false}
      handle=".dragHandle"
      onDrag={handleOnDrag}
      onStart={handleOnDragStart}
      onStop={handleOnDragStop}
      defaultPosition={finalPosition}
      position={finalPosition}
    >
      <div
        ref={containerRef}
        // As the attribute's name suggests, this helps with automated testing.
        // At the moment, jsdom and dragging is a bad combo for testing.
        data-testid={`${panelTitle} ${wasDragged ? 'dragged' : 'not dragged'}`}
        css={css`
          background: white;
          border-radius: 7px;
          box-shadow: ${styleOverrides?.boxShadow ??
          `rgba(50, 50, 93, 0.25) 0px 2px 5px -1px,
          rgba(0, 0, 0, 0.3) 0px 1px 3px -1px`};
          position: absolute;
          top: 0;
          visibility: ${isOpen === false ? 'hidden' : 'visible'};
          z-index: ${styleOverrides?.zIndex ?? 'auto'};
          margin: ${cssLengthToString(styleOverrides?.margin) ?? 'margin'};
        `}
      >
        <div
          className="dragHandle"
          css={css`
            align-items: center;
            border-radius: 7px 7px 0 0;
            background: ${theme?.palette?.primary?.hue[100] ?? gray[100]};
            cursor: ${isDragging ? 'grabbing' : 'grab'};
            display: grid;
            grid-template-columns: 1fr repeat(1, auto) 1fr;
            grid-column-gap: 5px;
            height: 2rem;
            justify-content: center;
            // Because the panels are positioned absolutely and overflow auto,
            // the handle will get lost when the user scrolls down. We can pin the
            // handle (which includes the panel title and dismiss button) to
            // the top of the panel with position sticky and top 0.
            position: sticky;
            top: 0;
            // We give the drag handle a z-index of 2 and the content's container a
            // z-index of 1, thereby ensuring the drag handle renders above the content.
            z-index: 2;
            width: 100%;
          `}
        >
          <div
            css={css`
              grid-column-start: 2;
            `}
          >
            <H6
              additionalStyles={{
                fontWeight: 'bold',
                fontSize: 14,
                padding: '0 10px',
              }}
            >
              {/* ellipsis and tooltip for panel title */}
              <span
                css={showPanelTitle ? null : screenReaderOnly}
                title={panelTitle}
              >
                {truncateWithEllipsis(panelTitle, maxPanelTitleTextLength)}
              </span>
            </H6>
          </div>
          {onPanelDismiss && (
            <div
              css={css`
                position: absolute;
                right: 0;
              `}
            >
              <DismissButton
                buttonText={`Close ${panelTitle}`}
                onClick={onPanelDismiss}
              />
            </div>
          )}
          {/* add gear button */}
          {HeaderButtons != null && <HeaderButtons />}
        </div>
        <div
          ref={ref}
          css={css`
            // Hey, so you need to explicitly set overflow wherever
            // you plan to use resize.
            overflow: ${styleOverrides?.overflow ?? 'auto'};
            resize: ${styleOverrides?.resize ?? 'none'};
            border-radius: 7px;
            // We want the content to render below the drag handle, so let's put this
            // container in the same stacking context as the drag handle by giving it
            // position: relative. Then, we'll give the drag handle a z-index of 2
            // and the content's container a z-index of 1.
            position: relative;
            z-index: 1;
            // If resize is set, you can consider these two values as
            // initial heights and widths.
            height: ${cssLengthToString(styleOverrides?.height) ??
            'fit-content'};
            width: ${cssLengthToString(styleOverrides?.width) ?? 'fit-content'};
            min-height: ${cssLengthToString(styleOverrides?.minHeight) ?? 0};
            min-width: ${cssLengthToString(styleOverrides?.minWidth) ?? 0};
          `}
        >
          {children}
        </div>
      </div>
    </Draggable>
  );
}

function isPanelXAxisOffScreen(
  position: DraggablePanelCoordinatePair,
  panelWidth: number,
  browserWidth: number
): boolean {
  const xPlusWidth = position.x + panelWidth;
  return xPlusWidth > browserWidth;
}

function isPanelYAxisOffScreen(
  position: DraggablePanelCoordinatePair,
  panelHeight: number,
  browserHeight: number
): boolean {
  const yPlusHeight = position.y + panelHeight;
  return yPlusHeight > browserHeight;
}

/**
 * This solves the problem of a resizing panel. Everything on the web is a box.
 * When that box resizes, the top-left corner maintains its position while the
 * bottom and/or right grow.
 * @param position
 * @param panelWidth
 * @param panelHeight
 * @param window
 * @returns A coordinate pair that places the panel nearest to the original position.
 * but ensuring that the panel is on screen.
 */
function constrainPositionOnScreen(
  position: DraggablePanelCoordinatePair,
  panelWidth = 0,
  panelHeight = 0,
  window: Window
): DraggablePanelCoordinatePair {
  const { innerHeight, innerWidth } = window;
  const isXOffScreen = isPanelXAxisOffScreen(position, panelWidth, innerWidth);
  const isYOffScreen = isPanelYAxisOffScreen(
    position,
    panelHeight,
    innerHeight
  );
  const GUTTER = 10;
  const rightMostX = innerWidth - panelWidth - GUTTER;
  const bottomMostY = innerHeight - panelHeight - GUTTER;

  return {
    x: isXOffScreen ? rightMostX : position.x,
    y: isYOffScreen ? bottomMostY : position.y,
  };
}

// function for ellipsis
export const truncateWithEllipsis = (label: string, maxLabelLength: number) => {
  return (label || '').length > maxLabelLength
    ? (label || '').substring(0, maxLabelLength - 2) + '...'
    : label;
};

function cssLengthToString(value?: string | number): string | undefined {
  switch (typeof value) {
    case 'number':
      return value + 'px';
    default:
      return value;
  }
}
