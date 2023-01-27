import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { DraggablePanel, DraggablePanelCoordinatePair } from "./DraggablePanel";

describe("Draggable Panels", () => {
  test("dragging a panel changes where it lives.", () => {
    const defaultPosition: DraggablePanelCoordinatePair = { x: 0, y: 0 };
    const panelTitleForAccessibilityOnly = "Study Filters Panel";
    render(
      <DraggablePanel
        defaultPosition={defaultPosition}
        panelTitleForAccessibilityOnly={panelTitleForAccessibilityOnly}
        isOpen
        onDragComplete={() => {}}
        onPanelDismiss={() => {}}
      >
        <p>Panel contents</p>
      </DraggablePanel>
    );
    const panel = screen.getByText("Panel contents");
    const initialLocation: DOMRect = panel.getBoundingClientRect();

    expect(initialLocation.x).toEqual(defaultPosition.x);
    expect(initialLocation.y).toEqual(defaultPosition.y);

    const destinationCoordinates = { x: 73, y: 22 };

    drag(panel, destinationCoordinates);

    expect(
      screen.getByTestId(`${panelTitleForAccessibilityOnly} dragged`)
    ).toBeTruthy();
  });

  test("you can open and close panels", async () => {
    const defaultPosition = { x: 50, y: 50 };

    function ToggleButtonAndDraggablePanel() {
      const [panelIsOpen, setPanelIsOpen] = useState(true);
      return (
        <>
          <button onClick={() => setPanelIsOpen((isOpen) => !isOpen)}>
            Toggle Filters Panel
          </button>
          <DraggablePanel
            defaultPosition={defaultPosition}
            isOpen={panelIsOpen}
            panelTitleForAccessibilityOnly="My Filters"
            onDragComplete={() => {}}
            onPanelDismiss={() => setPanelIsOpen(false)}
          >
            <p>I might be here or I might be gone</p>
          </DraggablePanel>
        </>
      );
    }

    render(
      <>
        <ToggleButtonAndDraggablePanel />
        <DraggablePanel
          defaultPosition={defaultPosition}
          isOpen
          panelTitleForAccessibilityOnly="My Extra Ordinary Data"
          onDragComplete={() => {}}
          onPanelDismiss={() => {}}
        >
          <p>I will be with you forever.</p>
        </DraggablePanel>
      </>
    );

    expect(
      screen.getByText("I might be here or I might be gone")
    ).toBeVisible();

    const closePanel = screen.getByText("Close My Filters");
    fireEvent.click(closePanel);

    expect(
      screen.queryByText("I might be here or I might be gone")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("I will be with you forever.")
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText("Toggle Filters Panel"));
    expect(
      screen.getByText("I might be here or I might be gone")
    ).toBeInTheDocument();
  });

  test("provides developers with data after a user's drag has completed", () => {
    const handleOnDragComplete = jest.fn();

    const defaultPosition = { x: 0, y: 0 };
    render(
      <DraggablePanel
        defaultPosition={defaultPosition}
        panelTitleForAccessibilityOnly="Panel Title"
        isOpen
        onDragComplete={handleOnDragComplete}
        onPanelDismiss={() => {}}
      >
        <p>Panel contents</p>
      </DraggablePanel>
    );
    const dragHandle = screen.getByText("Panel contents");
    const destinationCoordinates = { x: 0, y: 0 };
    drag(dragHandle, destinationCoordinates);

    expect(handleOnDragComplete).toHaveBeenCalledWith({ x: 0, y: 0 });
  });
});

function drag(
  element: HTMLElement,
  destinationCoordinates: DraggablePanelCoordinatePair
): void {
  fireEvent.mouseDown(element);
  fireEvent.mouseMove(element, destinationCoordinates);
  fireEvent.mouseUp(element);
}
