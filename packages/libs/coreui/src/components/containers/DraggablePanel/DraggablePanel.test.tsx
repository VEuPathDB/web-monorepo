import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";

describe("Draggable Panels", () => {
  test("dragging a panel changes where it lives.", () => {
    const defaultPosition = { x: 50, y: 50 };
    render(
      <DraggablePanel
        defaultPosition={defaultPosition}
        panelTitle="Panel Title"
        isOpen
        onDragComplete={() => {}}
        onPanelDismiss={() => {}}
      >
        <p>Panel contents</p>
      </DraggablePanel>
    );
    const panel = screen.getByText("Panel contents");
    const location: DOMRect = panel.getBoundingClientRect();

    expect(location.x).toEqual(defaultPosition.x);
    expect(location.y).toEqual(defaultPosition.y);

    const destinationCoordinates = { x: 200, y: 200 };
    const dragHandle = screen.getByText("Panel Title");
    drag(dragHandle, destinationCoordinates);

    expect(location.x).toEqual(destinationCoordinates.x);
    expect(location.y).toEqual(destinationCoordinates.y);
  });

  test("you can open and close panels", () => {
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
            panelTitle="My Filters"
            onDragComplete={() => {}}
            onPanelDismiss={() => setPanelIsOpen(false)}
          >
            <p>Look at all these filters</p>
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
          panelTitle="My Extra Ordinary Data"
          onDragComplete={() => {}}
          onPanelDismiss={() => {}}
        >
          <p>This is extra ordinary data</p>
        </DraggablePanel>
      </>
    );

    expect(screen.getByText("Look at all these filters")).toBeVisible();

    fireEvent.click(screen.getByText("Close My Extraordinary Data"));
    expect(screen.getByText("Look at all these filters")).not.toBeVisible();
    expect(screen.getByText("This is extra ordinary data")).toBeVisible();

    fireEvent.click(screen.getByText("Toggle Filters Panel"));
    expect(screen.getByText("Look at all these filters")).toBeVisible();
  });

  test("provides developers with data after a user's drag has completed", () => {
    const handleOnDragComplete = jest.fn();

    const defaultPosition = { x: 50, y: 50 };
    render(
      <DraggablePanel
        defaultPosition={defaultPosition}
        panelTitle="Panel Title"
        isOpen
        onDragComplete={handleOnDragComplete}
        onPanelDismiss={() => {}}
      >
        <p>Panel contents</p>
      </DraggablePanel>
    );
    const dragHandle = screen.getByText("Panel Title");
    const destinationCoordinates = { x: 51, y: 51 };
    drag(dragHandle, destinationCoordinates);

    expect(handleOnDragComplete).toHaveBeenCalledWith({ x: 51, y: 51 });
  });
});

function drag(element, destinationCoordinates) {}
