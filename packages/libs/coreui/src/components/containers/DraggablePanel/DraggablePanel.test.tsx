import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { DraggableProps } from "react-draggable";
import {
  DraggablePanel,
  DraggablePanelCoordinatePair,
  DraggablePanelProps,
} from "./DraggablePanel";

describe("Draggable Panels", () => {
  test("dragging a panel changes where it lives.", () => {
    const defaultPosition: DraggablePanelCoordinatePair = { x: 0, y: 0 };
    const panelTitle = "Study Filters Panel";
    const handleOnDragComplete = jest.fn();
    render(
      <DraggablePanel
        defaultPosition={defaultPosition}
        isOpen
        onDragComplete={handleOnDragComplete}
        onPanelDismiss={() => {}}
        panelTitle={panelTitle}
        showPanelTitle
      >
        <p>Panel contents</p>
      </DraggablePanel>
    );
    const panelDragHandle = screen.getByText(`Close ${panelTitle}`);

    const destinationCoordinates = { clientX: 73, clientY: 22 };

    drag(panelDragHandle, destinationCoordinates);

    /**
     * I really don't like assert on implementation details. If we change React dragging librbaries,
     * this assertion could break and raise a false positive. That said, jsdom doesn't render layouts
     * like a legit browser so we're left with this and data-testids. The data-testid is nice because
     * at least we're in control of that so we can make sure that doesn't change if we swap dragging
     * providers. See conversations like: https://softwareengineering.stackexchange.com/questions/234024/unit-testing-behaviours-without-coupling-to-implementation-details
     */
    const panelFromDataTestId = screen.getByTestId(`${panelTitle} dragged`);
    expect(panelFromDataTestId.style.transform).toEqual(
      `translate(${destinationCoordinates.clientX}px,${destinationCoordinates.clientY}px)`
    );

    expect(panelFromDataTestId).toBeTruthy();
    expect(handleOnDragComplete).toHaveBeenCalled();
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
            panelTitle="My Filters"
            onDragComplete={() => {}}
            onPanelDismiss={() => setPanelIsOpen(false)}
            showPanelTitle
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
          panelTitle="My Extra Ordinary Data"
          onDragComplete={() => {}}
          onPanelDismiss={() => {}}
          showPanelTitle
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
    ).not.toBeVisible();
    expect(screen.queryByText("I will be with you forever.")).toBeVisible();

    fireEvent.click(screen.getByText("Toggle Filters Panel"));
    expect(
      screen.getByText("I might be here or I might be gone")
    ).toBeVisible();
  });
  test("panels are layered from most-to-least recently dragged", () => {
    const panelDefinitionOjects: DraggablePanelProps[] = [
      "Panel 1",
      "Panel 2",
      "Panel 3",
    ].map((panelTitle) => {
      return {
        children: () => <p>Panel Contents</p>,
        panelTitle,
        showPanelTitle: true,
        isOpen: true,
      };
    });

    render(<StackOrderingKeeper draggablePanelProps={panelDefinitionOjects} />);

    const dragMeFirst = screen.getByText("Panel 3");
    const dragMeMiddle = screen.getByText("Panel 2");
    const dragMeLast = screen.getByText("Panel 1");

    drag(dragMeFirst, { clientX: 50, clientY: 50 });
    drag(dragMeMiddle, { clientX: 60, clientY: 60 });
    drag(dragMeLast, { clientX: 70, clientY: 70 });

    /**
     * Asserting on z-index values makes this test brittle to refactoring. Is there
     * another way to programmatically determine stacking order?
     */
    const firstDraggedZIndex = getZIndexValue(
      screen.getByTestId(`Panel 3 dragged`)
    );
    const middleDraggedZIndex = getZIndexValue(
      screen.getByTestId(`Panel 2 dragged`)
    );
    const lastDraggedZIndex = getZIndexValue(
      screen.getByTestId(`Panel 1 dragged`)
    );

    expect(Number(lastDraggedZIndex)).toBeGreaterThan(
      Number(middleDraggedZIndex)
    );
    expect(Number(middleDraggedZIndex)).toBeGreaterThan(
      Number(firstDraggedZIndex)
    );
  });
});

/**
 * So we're pretty limited as regards js-dom and dragging. Here's what I would like to do:
 * 1. Simulate dragging events on the draggable element.
 * 2. Find the element, getBoundingClientRect for the element
 * 3. Assert that the coordinates moved predictably.
 *
 * Here's the reality: jsdom doesn't do any rendering, so getBoundingClientRect() always
 * returns 0,0,0,0. That won't change (even foreseeable long-term).
 * You can try to mock the function to emulate the results you'd expect.
 * https://github.com/jsdom/jsdom/issues/1590#issuecomment-243228840
 *
 * @param element
 * @param destinationCoordinates
 */
function drag(
  element: HTMLElement,
  destinationCoordinates: { clientX: number; clientY: number }
): void {
  fireEvent.mouseDown(element);
  fireEvent.mouseMove(element, destinationCoordinates);
  fireEvent.mouseUp(element);
}

type StackOrderingKeeper = { draggablePanelProps: DraggablePanelProps[] };
function StackOrderingKeeper({ draggablePanelProps }: StackOrderingKeeper) {
  const [zIndicies, setZIndicies] = useState<string[]>([]);

  return (
    <div>
      {draggablePanelProps.map((props) => {
        const zIndex = zIndicies.findIndex(
          (panelTitle) => panelTitle === props.panelTitle
        );
        return (
          <DraggablePanel
            isOpen
            panelTitle={props.panelTitle}
            showPanelTitle
            key={props.panelTitle}
            onDragStart={() => {
              setZIndicies((currentList) => {
                return currentList
                  .filter((panelTitle) => panelTitle !== props.panelTitle)
                  .concat(props.panelTitle);
              });
            }}
            styleOverrides={{
              zIndex: zIndex > -1 ? zIndex : "unset",
            }}
          >
            content...
          </DraggablePanel>
        );
      })}
    </div>
  );
}

function getZIndexValue(element: HTMLElement) {
  return window.getComputedStyle(element).zIndex;
}

// JSDom (which is used by jest) does not implement layout/rendering.
// we create this mock to simply simulate a desktop view with a width of 1000
function mockResizeObserver() {
  return {
    width: 1000,
    height: 1000,
  };
}
