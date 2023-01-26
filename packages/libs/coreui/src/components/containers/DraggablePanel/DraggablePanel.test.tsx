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
        onClose={() => {}}
      >
        <p>Guard bees that stand watch at the entrance of the hive</p>
      </DraggablePanel>
    );
    const panel = screen.getByText(
      "Guard bees that stand watch at the entrance of the hive"
    );
    const location: DOMRect = panel.getBoundingClientRect();

    expect(location.x).toEqual(defaultPosition.x);
    expect(location.y).toEqual(defaultPosition.y);

    const destinationCoordinates = { x: 200, y: 200 };
    const dragHandle = screen.getByText("Panel Title");
    drag(dragHandle, destinationCoordinates);

    expect(location.x).toEqual(destinationCoordinates.x);
    expect(location.y).toEqual(destinationCoordinates.y);
  });

  test("you can close opened panels", () => {
    const defaultPosition = { x: 50, y: 50 };

    function ToggleButtonAndPanel() {
      const [isOpen, setIsOpen] = useState(true);
      return (
        <>
          <button onClick={() => setIsOpen((isOpen) => !isOpen)}>
            Toggle panel
          </button>
          <DraggablePanel
            defaultPosition={defaultPosition}
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            panelTitle="My Extraordinary Data"
          >
            <p>This is extraordinary data</p>
          </DraggablePanel>
        </>
      );
    }

    render(
      <>
        <ToggleButtonAndPanel />
        <DraggablePanel
          defaultPosition={defaultPosition}
          isOpen
          onClose={() => {}}
          panelTitle="My Extra Ordinary Data"
        >
          <p>This is extra ordinary data</p>
        </DraggablePanel>
      </>
    );

    const panelOfInterest = screen.getByText("This is extraordinary data");
    expect(panelOfInterest).toBeInTheDocument();

    fireEvent.click(screen.getByText("Close My Extraordinary Data"));

    expect(
      screen.getByText("This is extraordinary data")
    ).not.toBeInTheDocument();

    expect(screen.getByText("This is extra ordinary data")).toBeInTheDocument();
  });

  test("you can open closed panels.", () => {
    const defaultPosition = { x: 50, y: 50 };
    render(
      <DraggablePanel
        isOpen={false}
        onClose={() => {}}
        panelTitle="Filters"
        defaultPosition={defaultPosition}
      >
        <p>I am closed</p>
      </DraggablePanel>
    );

    expect(screen.getByText("I am closed")).not.toBeInTheDocument();
    render(
      <DraggablePanel
        defaultPosition={defaultPosition}
        isOpen={true}
        onClose={() => {}}
        panelTitle="Filters"
      >
        <p>I am closed</p>
      </DraggablePanel>
    );
    expect(screen.getByText("I am closed")).not.toBeInTheDocument();
  });
});

function drag(element, destinationCoordinates) {}
