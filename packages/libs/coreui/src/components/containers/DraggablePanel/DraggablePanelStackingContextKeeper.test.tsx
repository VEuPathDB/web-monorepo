import { render, screen } from "@testing-library/react";
import { DraggablePanel } from "./DraggablePanel";
import { DraggablePanelStackingContextKeeper } from "./DraggablePanelStackingContextKeeper";
import { drag } from "./handyFunctionsForDraggingTests";

describe("<DraggablePanelStackingConextKeeper />", () => {
  test("panels are layered from most-to-least recently dragged", () => {
    const panel3 = "Panel 3";
    const panel2 = "Panel 2";
    const panel1 = "Panel 1";

    render(
      <DraggablePanelStackingContextKeeper>
        <DraggablePanel
          defaultPosition={{ x: 0, y: 0 }}
          isOpen
          onDragComplete={() => {}}
          onPanelDismiss={() => {}}
          panelTitle={panel1}
          showPanelTitle
        >
          <p>{panel1}</p>
        </DraggablePanel>
        <DraggablePanel
          defaultPosition={{ x: 0, y: 0 }}
          isOpen
          onDragComplete={() => {}}
          onPanelDismiss={() => {}}
          panelTitle={panel2}
          showPanelTitle
        >
          <p>{panel2}</p>
        </DraggablePanel>
        <DraggablePanel
          defaultPosition={{ x: 0, y: 0 }}
          isOpen
          onDragComplete={() => {}}
          onPanelDismiss={() => {}}
          panelTitle={panel3}
          showPanelTitle
        >
          <p>{panel3}</p>
        </DraggablePanel>
      </DraggablePanelStackingContextKeeper>
    );

    const dragMeLast = screen.getByText("Panel 1");
    const dragMeMiddle = screen.getByText("Panel 2");
    const dragMeFirst = screen.getByText("Panel 3");

    drag(dragMeFirst, { clientX: 50, clientY: 50 });
    drag(dragMeMiddle, { clientX: 60, clientY: 60 });
    drag(dragMeLast, { clientX: 70, clientY: 70 });

    /**
     * Asserting on z-index values makes this test brittle to refactoring. Is there
     * another way to programmatically determine stacking order?
     */
    expect(Number(dragMeLast.style.zIndex)).toBeGreaterThan(
      Number(dragMeMiddle.style.zIndex)
    );
    expect(Number(dragMeMiddle.style.zIndex)).toBeGreaterThan(
      Number(dragMeFirst.style.zIndex)
    );
  });
});
