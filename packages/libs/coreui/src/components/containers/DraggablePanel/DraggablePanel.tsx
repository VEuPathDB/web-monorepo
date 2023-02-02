import { CSSProperties, ReactNode, useState } from "react";
import Draggable, { DraggableEvent, DraggableData } from "react-draggable";
import { css } from "@emotion/react";
import { DragHandle } from "@material-ui/icons";
import { gray } from "../../../definitions/colors";
import { CloseCircle } from "../../icons";
import { primaryFont } from "../../../styleDefinitions/typography";

export type DraggablePanelCoordinatePair = {
  x: number;
  y: number;
};

export type DraggablePanelStyleOverrides = {
  boxShadow?: CSSProperties["boxShadow"];
  zIndex?: CSSProperties["zIndex"];
};

export type DraggablePanelProps = {
  /** The contents of the Draggable Panel. */
  children: ReactNode;
  /** If set this element will only be able to move within the confines of it's parent elenent. If unset or false, the element will go wherever the user drags it. */
  confineToParentContainer?: boolean;
  /** If provided, the panel will live here instead of where they originally live, as defined in the CSS & HTML. */
  defaultPosition?: DraggablePanelCoordinatePair;
  /** This meaningful text is used to both render a title and ensure a more WAI-compliant experience.  */
  panelTitle: string;
  /** This allows you to specify how tall your panel should be. */
  initialPanelHeight?: string;
  /** This allows you to specify how wide your panel should be. */
  initialPanelWidth?: string;
  /** This controls weather the panel is visible or not. */
  isOpen: boolean;
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
  /** This event fires when the user dismisses a visible panel. */
  onPanelDismiss?: () => void;
};

const screenReaderOnly = css`
  height: 1px;
  left: -10000px;
  overflow: hidden;
  position: absolute;
  top: auto;
  width: 1px;
`;

export function DraggablePanel({
  confineToParentContainer,
  children,
  defaultPosition,
  initialPanelHeight,
  initialPanelWidth,
  isOpen,
  onDragComplete,
  onDragStart,
  onPanelDismiss,
  panelTitle,
  showPanelTitle,
  styleOverrides,
}: DraggablePanelProps) {
  const [wasDragged, setWasDragged] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  function handleDrag() {
    !wasDragged && setWasDragged(true);
  }

  function handleDragStart() {
    setIsDragging(true);

    if (onDragStart) onDragStart();
  }

  function handleOnDragStop(_: DraggableEvent, data: DraggableData) {
    setIsDragging(false);

    if (onDragComplete) {
      onDragComplete({
        x: data.lastX,
        y: data.lastY,
      });
    }
  }

  return (
    <Draggable
      bounds={confineToParentContainer ? "parent" : false}
      defaultPosition={defaultPosition || { x: 0, y: 0 }}
      handle=".dragHandle"
      onDrag={handleDrag}
      onStart={handleDragStart}
      onStop={handleOnDragStop}
    >
      <div
        // As the attribute's name suggests, this helps with automated testing.
        // At the moment, jsdom and dragging is a bad combo for testing.
        data-testid={`${panelTitle} ${wasDragged ? "dragged" : "not dragged"}`}
        css={css`
          background: white;
          border-radius: 7px;
          box-shadow: rgba(50, 50, 93, 0.25) 0px 2px 5px -1px,
            rgba(0, 0, 0, 0.3) 0px 1px 3px -1px;
          min-width: 250px;
          position: relative;
          width: ${initialPanelWidth || "unset"};
          ${isOpen === false &&
          `
          visibility: hidden;
          `}
          z-index: ${styleOverrides?.zIndex ?? "auto"}
        `}
      >
        <div
          className="dragHandle"
          css={css`
            align-items: center;
            border-radius: 7px 7px 0 0;
            background: ${gray[100]};
            cursor: ${isDragging ? "grabbing" : "grab"};
            display: flex;
            height: 2rem;
            justify-content: space-between;
            position: relative;
            width: 100%;
          `}
        >
          <div
            aria-hidden
            css={css`
              margin-left: 1rem;
            `}
          >
            <DragHandle />
          </div>
          <h2
            css={css`
              font-size: 15px;
              font-weight: bold;
              font-family: ${primaryFont};
            `}
          >
            <span css={showPanelTitle ? null : screenReaderOnly}>
              {panelTitle}
            </span>
          </h2>
          {onPanelDismiss && (
            <div
              css={css`
                height: 100%;
              `}
            >
              <button
                css={css`
                  all: unset;
                  align-items: center;
                  cursor: pointer;
                  display: flex;
                  height: 100%;
                  justify-content: center;
                  padding: 0 1rem;
                  &:hover {
                    opacity: 0.3;
                  }
                `}
                onClick={onPanelDismiss}
              >
                <span css={screenReaderOnly}>Close {panelTitle}</span>
                <CloseCircle fontSize="1.5rem" fill={gray[600]} aria-hidden />
              </button>
            </div>
          )}
        </div>
        <div
          css={css`
            border-radius: 7px;
            height: ${initialPanelHeight || "unset"};
            overflow: scroll;
            width: ${initialPanelWidth || "unset"};
          `}
        >
          {children}
        </div>
      </div>
    </Draggable>
  );
}
