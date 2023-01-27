import { AccessAlarm } from "@material-ui/icons";
import { Story, Meta } from "@storybook/react/types-6-0";
import React from "react";
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
      <DraggablePanel
        isOpen
        onPanelDismiss={() => {}}
        panelTitleForAccessibilityOnly="tt"
        onDragComplete={() => {}}
      >
        <div
          style={{
            border: "1px solid pink",
            width: 200,
            height: 200,
            display: "flex",
            flexDirection: "column",
            overflow: "scroll",
          }}
        >
          <DummyContent />
        </div>
      </DraggablePanel>
    </UIThemeProvider>
  );
};

export const Default = Template.bind({});

function DummyContent() {
  return (
    <div>
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Tenetur
        exercitationem eaque cumque impedit nisi. Tempora, maiores temporibus
        quibusdam nostrum dignissimos voluptatem non quo harum reprehenderit
        aliquam corporis nobis veritatis numquam.
      </p>
    </div>
  );
}
