import React from "react";
import { css } from "@emotion/react";
import { Story, Meta } from "@storybook/react/types-6-0";
import { useState } from "react";
import {
  DraggablePanel,
  DraggablePanelCoordinatePair,
  DraggablePanelProps,
} from "../../components/containers/DraggablePanel/DraggablePanel";
import UIThemeProvider from "../../components/theming/UIThemeProvider";
import { mutedMagenta, gray } from "../../definitions/colors";

export default {
  title: "Containers/DraggablePanel",
  component: DraggablePanel,
} as Meta;

const Template: Story<DraggablePanelProps> = (args) => {
  const panelDefinitionOjects: DraggablePanelProps[] = [
    "Panel 1",
    "Panel 2",
    "Panel 3",
    "Panel 4",
  ].map((panelTitle, panelIndex) => {
    return {
      children: () => <p>Panel Contents</p>,
      panelTitle,
      isOpen: true,
      backgroundColorForStorybookOnly: mutedMagenta[`${panelIndex + 1}00`],
      showPanelTitle: args.showPanelTitle,
      includeDismissButton: args.includeDismissButton,
      styleOverrides: args.styleOverrides,
    };
  });

  return (
    <UIThemeProvider
      theme={{
        palette: {
          primary: { hue: gray, level: 500 },
          secondary: { hue: mutedMagenta, level: 500 },
        },
      }}
    >
      <StackOrderingKeeper draggablePanelProps={panelDefinitionOjects} />;
    </UIThemeProvider>
  );
};

export const Default = Template.bind({});
Default.args = {
  showPanelTitle: true,
  includeDismissButton: true,
  styleOverrides: {},
};

type StackOrderingKeeperProps = { draggablePanelProps: DraggablePanelProps[] };

function StackOrderingKeeper({
  draggablePanelProps,
}: StackOrderingKeeperProps) {
  const [zIndicies, setZIndicies] = useState<string[]>(
    draggablePanelProps.map((props) => props.panelTitle)
  );

  const [panelOpenMap, setPanelOpenMap] = useState(
    draggablePanelProps.reduce((acc, props) => {
      acc[props.panelTitle] = true;
      return acc;
    }, {})
  );

  function togglePanelOpen(panelTitle) {
    setPanelOpenMap((currentMap) => ({
      ...currentMap,
      [panelTitle]: !currentMap[panelTitle],
    }));
  }

  function movePanelToTopLayer(panelTitleToMove: string) {
    setZIndicies((currentList) => {
      return currentList
        .filter((panelTitle) => panelTitle !== panelTitleToMove)
        .concat(panelTitleToMove);
    });
  }

  return (
    <div>
      <ul
        style={{
          display: "flex",
          justifyContent: "space-around",
          listStyle: "none",
        }}
      >
        {draggablePanelProps.map((props) => {
          const isOpen = panelOpenMap[props.panelTitle];
          return (
            <li key={props.panelTitle}>
              <button
                onClick={() => {
                  movePanelToTopLayer(props.panelTitle);
                  togglePanelOpen(props.panelTitle);
                }}
                style={{ backgroundColor: isOpen ? "tomato" : "lightgreen" }}
              >
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",
                    padding: "0.25rem 0.5rem",
                  }}
                >
                  {isOpen ? "Close" : "Open"} {props.panelTitle}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {draggablePanelProps.map((props, propsIndex) => {
        const indexOfelement = zIndicies.findIndex(
          (panelTitle) => panelTitle === props.panelTitle
        );
        const zIndex = indexOfelement > 0 ? indexOfelement : 0;

        function handleOnPanelDismiss() {
          movePanelToTopLayer(props.panelTitle);
          togglePanelOpen(props.panelTitle);
        }

        return (
          <DraggablePanel
            defaultPosition={{ x: 20 * propsIndex, y: 1 * propsIndex }}
            confineToParentContainer
            key={props.panelTitle}
            isOpen={panelOpenMap[props.panelTitle]}
            onPanelDismiss={
              props.includeDismissButton ? handleOnPanelDismiss : undefined
            }
            panelTitle={props.panelTitle}
            showPanelTitle={props.showPanelTitle}
            onDragStart={() => movePanelToTopLayer(props.panelTitle)}
            styleOverrides={{
              zIndex,
              margin: "0 0 1rem 0",
              ...props.styleOverrides,
            }}
          >
            {/* This is just nonsense to fill the panel with content */}
            <div
              style={{
                padding: "1rem",
                maxHeight: 150,
                maxWidth: 500,
                fontFamily: "sans-serif",
              }}
            >
              <h2>{props.panelTitle} Content</h2>
              <div
                style={{
                  height: 25,
                  width: "100%",
                  backgroundColor: props.backgroundColorForStorybookOnly,
                }}
              ></div>
              <p>
                <code>z-index</code>: {zIndex}
              </p>
              <p>
                Lorem ipsum dolor sit, amet consectetur adipisicing elit. Saepe
                labore ut quia harum expedita distinctio eius deserunt, officiis
                inventore velit. Voluptatibus unde eum animi alias, illum
                eligendi ullam facilis consectetur?
              </p>
            </div>
          </DraggablePanel>
        );
      })}
    </div>
  );
}
