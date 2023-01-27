import { ReactNode } from "react";

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
  onDragComplete: () => DraggablePanelCoordinatePair;
  /** This event fires when the user dismisses a visible panel. */
  onPanelDismiss: () => void;
};

export function DraggablePanel({ children }: DraggablePanelProps) {}
