import { CSSProperties, ReactNode, useState } from "react";
import Draggable, { DraggableEvent, DraggableData } from "react-draggable";
import CloseIcon from "@material-ui/icons/Close";
import { FloatingButton } from "../../buttons";
import { css, SerializedStyles } from "@emotion/react";
import { DragHandle } from "@material-ui/icons";
import { H6 } from "../../typography";
import { gray } from "../../../definitions/colors";
import { CloseCircle } from "../../icons";

export type DraggablePanelCoordinatePair = {
  x: number;
  y: number;
};

export type DraggablePanelProps = {
  /** The contents of the Draggable Panel. */
  children: ReactNode;
  /** If provided, the panel will live here instead of where they originally live, as defined in the CSS & HTML. */
  defaultPosition?: DraggablePanelCoordinatePair;
  /** This meaningful text is used to ensure WAI-compliant experience.  */
  panelTitleForAccessibilityOnly: string;
  /** This allows developers to show or hide the panel title. */
  showPanelTitle: boolean;
  /** This allows you to specify how tall your panel should be. */
  initialPanelHeight?: string;
  /** This allows you to specify how wide your panel should be. */
  initialPanelWidth?: string;
  /** This controls weather the panel is visible or not. */
  isOpen: boolean;
  /** This event fires when the user's drag completes. */
  onDragComplete?: (
    destinationCoordinates: DraggablePanelCoordinatePair
  ) => void;
  /** This event fires when the user dismisses a visible panel. */
  onPanelDismiss?: () => void;
};

const screenReaderOnly: CSSProperties = {
  position: "absolute",
  left: "-10000px",
  top: "auto",
  width: "1px",
  height: "1px",
  overflow: "hidden",
};

const closeButtonStyles = css`
  all: unset;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  padding: 0 1rem;
  &:hover {
    opacity: 0.3;
  }
  height: 100%;
`;

export function DraggablePanel({
  children,
  defaultPosition,
  initialPanelHeight,
  initialPanelWidth,
  isOpen,
  onDragComplete,
  onPanelDismiss,
  panelTitleForAccessibilityOnly,
  showPanelTitle,
}: DraggablePanelProps) {
  const [didDrag, setDidDrag] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const dragHandleStyles: SerializedStyles = css`
    cursor: ${isDragging ? "grabbing" : "grab"};
    background: ${gray[200]};
    height: 2rem;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
  `;

  // if (!isOpen) return null;

  return (
    <Draggable
      bounds="parent"
      handle=".dragHandle"
      onDrag={(event: DraggableEvent, data: DraggableData) => {
        !didDrag && setDidDrag(true);
      }}
      onStart={() => setIsDragging(true)}
      onStop={(event: DraggableEvent, data: DraggableData) => {
        if (!onDragComplete) return;

        setIsDragging(false);

        onDragComplete({
          x: data.lastX,
          y: data.lastY,
        });
      }}
      defaultPosition={defaultPosition || { x: 0, y: 0 }}
    >
      <div
        data-testid={`${panelTitleForAccessibilityOnly} ${
          didDrag ? "dragged" : "not dragged"
        }`}
        css={css`
          box-shadow: rgba(50, 50, 93, 0.25) 0px 2px 5px -1px,
            rgba(0, 0, 0, 0.3) 0px 1px 3px -1px;
          min-width: 250px;
          background: white;

          width: ${initialPanelWidth || "unset"};
          ${isOpen === false &&
          `
          visibility: hidden;
          `}
        `}
      >
        <div className="dragHandle" css={dragHandleStyles}>
          <div
            aria-hidden
            css={css`
              margin-left: 1rem;
            `}
          >
            <DragHandle />
          </div>
          <strong>
            <H6
              additionalStyles={{
                fontWeight: "bold",
                color: "black",
                margin: 0,
              }}
            >
              {showPanelTitle && panelTitleForAccessibilityOnly}
            </H6>
          </strong>
          {onPanelDismiss && (
            <div
              css={{ height: "100%" }}
              className="no-cursor" // Prevent this from initiating a drag
            >
              <button css={closeButtonStyles} onClick={onPanelDismiss}>
                <span style={screenReaderOnly}>
                  Close {panelTitleForAccessibilityOnly}
                </span>
                <CloseCircle fontSize="1.5rem" fill={gray[600]} aria-hidden />
              </button>
            </div>
          )}
        </div>
        <div
          css={css`
            width: ${initialPanelWidth || "unset"};
            height: ${initialPanelHeight || "unset"};
            overflow: scroll;
          `}
        >
          {children}
        </div>
      </div>
    </Draggable>
  );
}
