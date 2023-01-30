import { css } from "@emotion/react";
import { AccessAlarm } from "@material-ui/icons";
import { Story, Meta } from "@storybook/react/types-6-0";
import React from "react";
import { useState } from "react";
import {
  DraggablePanel,
  DraggablePanelProps,
} from "../../components/containers/DraggablePanel/DraggablePanel";
import UIThemeProvider from "../../components/theming/UIThemeProvider";
import { orange, green } from "../../definitions/colors";

export default {
  title: "Containers/DraggablePanel",
  component: DraggablePanel,
} as Meta;

const Template: Story<DraggablePanelProps> = (args) => {
  return (
    <UIThemeProvider
      theme={{
        palette: {
          primary: { hue: green, level: 600 },
          secondary: { hue: orange, level: 500 },
        },
      }}
    >
      <h1>Some notable things</h1>
      <p>
        Because the parent component never specifies where this panel should
        live, its last location is forgotten whenever its closed. If we don't
        want this behavior, then the parent component will keep track of where
        the component was dragged to. The panel's job is to get dragged.
      </p>
      <KeepTrackOfOpenedAndClosedState>
        {(isOpen, setIsOpen) => {
          return (
            <DraggablePanel
              isOpen={isOpen}
              onPanelDismiss={() => setIsOpen(false)}
              panelTitleForAccessibilityOnly="Optional Panel Name"
              onDragComplete={() => {}}
            >
              <div
                css={css`
                  display: flex;
                  flex-direction: column;
                  overflow: scroll;
                  padding: 0.25rem 0.5rem;
                `}
              >
                <DummyContent />
              </div>
            </DraggablePanel>
          );
        }}
      </KeepTrackOfOpenedAndClosedState>
    </UIThemeProvider>
  );
};

export const Default = Template.bind({});

function DummyContent() {
  return (
    <div
      css={css`
        background: white;
      `}
    >
      <p>
        Lorem ipsum dolor, sit amet consectetur adipisicing elit. Nihil ipsum
        consequatur alias laudantium pariatur aspernatur tempora doloremque
        possimus, facere autem maxime blanditiis eos ullam nostrum odio ratione
        ducimus! Eum, provident?
      </p>
    </div>
  );
}

function KeepTrackOfOpenedAndClosedState({ children }) {
  const [isOpen, setIsOpened] = useState(true);

  return (
    <div style={{ position: "relative", width: 500 }}>
      <button
        style={{ position: "absolute", right: 0 }}
        onClick={() => setIsOpened(!isOpen)}
      >
        <span>{isOpen ? "Close" : "Open"} the panel from over here!</span>
      </button>
      <div style={{ paddingTop: "2rem" }}>{children(isOpen, setIsOpened)}</div>
    </div>
  );
}
