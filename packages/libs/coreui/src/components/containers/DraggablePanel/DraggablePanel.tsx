import { CSSProperties, ReactNode, useState } from "react";
import Draggable, { DraggableEvent, DraggableData } from "react-draggable";
import CloseIcon from "@material-ui/icons/Close";
import { FloatingButton } from "../../buttons";
import { css, SerializedStyles } from "@emotion/react";
import { DragHandle } from "@material-ui/icons";
import { p } from "../../../styleDefinitions/typography";
import { H6 } from "../../typography";

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
  /** This controls weather the panel is visible or not. */
  isOpen: boolean;
  /** This event fires when the user's drag completes. */
  onDragComplete?: (
    destinationCoordinates: DraggablePanelCoordinatePair
  ) => void;
  /** This event fires when the user dismisses a visible panel. */
  onPanelDismiss?: () => void;
};

const visuallyHidden = {
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: "1px",
  overflow: "hidden",
  position: "absolute",
  whiteSpace: "nowrap",
  width: "1px",
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
  cursor: pointer;
  padding: 0 1rem;
  &:hover {
    opacity: 0.3;
  }
`;

export function DraggablePanel({
  children,
  defaultPosition,
  isOpen,
  onDragComplete,
  onPanelDismiss,
  panelTitleForAccessibilityOnly,
}: DraggablePanelProps) {
  const [didDrag, setDidDrag] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const dragHandleStyles: SerializedStyles = css`
    cursor: ${isDragging ? "grabbing" : "grab"};
    background: rgb(242, 242, 242);
    height: 2rem;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
  `;

  if (!isOpen) return null;

  return (
    <Draggable
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
        `}
      >
        <div className="dragHandle" css={dragHandleStyles}>
          <div aria-hidden style={{ marginLeft: "1rem" }}>
            <DragHandle />
          </div>
          <strong>
            <H6
              additionalStyles={{
                fontWeight: "bold",
              }}
            >
              {panelTitleForAccessibilityOnly}
            </H6>
          </strong>
          {onPanelDismiss && (
            <div
              className="no-cursor" // Prevent this from initiating
            >
              <button css={closeButtonStyles} onClick={onPanelDismiss}>
                <span style={screenReaderOnly}>
                  Close {panelTitleForAccessibilityOnly}
                </span>
                <CloseIcon aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
        {children}
      </div>
    </Draggable>
  );
}
