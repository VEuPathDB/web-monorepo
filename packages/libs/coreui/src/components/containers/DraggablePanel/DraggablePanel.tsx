import { ReactNode, useState } from "react";
import Draggable, { DraggableEvent, DraggableData } from "react-draggable";
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
  /** This meaningful text is used to both render a title and ensure a more WAI-compliant experience.  */
  panelTitle: string;
  /** This allows developers to show or hide the panel title. */
  showPanelTitle: boolean;
  /** This allows you to specify how tall your panel should be. */
  initialPanelHeight?: string;
  /** This allows you to specify how wide your panel should be. */
  initialPanelWidth?: string;
  /** If set this element will only be able to move within the confines of it's parent elenent. If unset or false, the element will go wherever the user drags it. */
  confineToParentContainer?: boolean;
  /** This controls weather the panel is visible or not. */
  isOpen: boolean;
  /** This event fires when the user's drag completes. */
  onDragComplete?: (
    destinationCoordinates: DraggablePanelCoordinatePair
  ) => void;
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
  onPanelDismiss,
  panelTitle,
  showPanelTitle,
}: DraggablePanelProps) {
  const [wasDragged, setWasDragged] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const dragHandle: SerializedStyles = css`
    align-items: center;
    border-radius: 7px 7px 0 0;
    background: ${gray[100]};
    cursor: ${isDragging ? "grabbing" : "grab"};
    display: flex;
    height: 2rem;
    justify-content: space-between;
    position: relative;
    width: 100%;
  `;

  const panel = css`
    border-radius: 7px;
    box-shadow: rgba(50, 50, 93, 0.25) 0px 2px 5px -1px,
      rgba(0, 0, 0, 0.3) 0px 1px 3px -1px;
    min-width: 250px;
    background: white;
    width: ${initialPanelWidth || "unset"};
    ${isOpen === false &&
    `
    visibility: hidden;
    `}
  `;

  const panelContents = css`
    border-radius: 7px;
    height: ${initialPanelHeight || "unset"};
    overflow: scroll;
    width: ${initialPanelWidth || "unset"};
  `;

  const dismissButton = css`
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
  `;

  function handleDrag() {
    !wasDragged && setWasDragged(true);
  }

  function handleDragStart() {
    setIsDragging(true);
  }

  function handleOnDragStop(_: DraggableEvent, data: DraggableData) {
    if (!onDragComplete) return;

    setIsDragging(false);

    onDragComplete({
      x: data.lastX,
      y: data.lastY,
    });
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
        data-testid={`${panelTitle} ${wasDragged ? "dragged" : "not dragged"}`}
        css={panel}
      >
        <div className="dragHandle" css={dragHandle}>
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
              {showPanelTitle && panelTitle}
            </H6>
          </strong>
          {onPanelDismiss && (
            <div
              css={css`
                height: 100%;
              `}
            >
              <button css={dismissButton} onClick={onPanelDismiss}>
                <span css={screenReaderOnly}>Close {panelTitle}</span>
                <CloseCircle fontSize="1.5rem" fill={gray[600]} aria-hidden />
              </button>
            </div>
          )}
        </div>
        <div css={panelContents}>{children}</div>
      </div>
    </Draggable>
  );
}
