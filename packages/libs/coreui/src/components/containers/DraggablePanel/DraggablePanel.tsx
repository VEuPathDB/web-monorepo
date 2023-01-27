import { act } from "@testing-library/react";
import { CSSProperties, ReactNode, useState } from "react";
import Draggable, { DraggableEvent, DraggableData } from "react-draggable";

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

export function DraggablePanel({
  children,
  defaultPosition,
  isOpen,
  onDragComplete,
  onPanelDismiss,
  panelTitleForAccessibilityOnly,
}: DraggablePanelProps) {
  const [didDrag, setDidDrag] = useState<boolean>(false);

  if (!isOpen) return null;

  return (
    <div
      data-testid={`${panelTitleForAccessibilityOnly} ${
        didDrag ? "dragged" : "not dragged"
      }`}
    >
      {onPanelDismiss && (
        <button onClick={onPanelDismiss}>
          Close {panelTitleForAccessibilityOnly}
        </button>
      )}
      <Draggable
        onDrag={(event: DraggableEvent, data: DraggableData) => {
          !didDrag && setDidDrag(true);
        }}
        onStop={(event: DraggableEvent, data: DraggableData) => {
          if (!onDragComplete) return;

          onDragComplete({
            x: data.lastX,
            y: data.lastY,
          });
        }}
        defaultPosition={defaultPosition}
      >
        {children}
      </Draggable>
    </div>
  );
}
