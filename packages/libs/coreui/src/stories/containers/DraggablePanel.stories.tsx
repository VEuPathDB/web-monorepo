import React from "react";
import { Story, Meta } from "@storybook/react/types-6-0";
import { useState } from "react";
import {
  DraggablePanel,
  DraggablePanelCoordinatePair,
  DraggablePanelProps,
  HeightAndWidthInPixels,
} from "../../components/containers/DraggablePanel/DraggablePanel";
import UIThemeProvider from "../../components/theming/UIThemeProvider";
import { mutedMagenta, gray } from "../../definitions/colors";

export default {
  title: "Containers/DraggablePanel",
  component: DraggablePanel,
} as Meta;

interface DraggablePanelStoryProps extends DraggablePanelProps {
  backgroundColorForStorybookOnly: string;
  includeDismissButton: boolean;
}

const Template: Story<DraggablePanelStoryProps> = (args) => {
  const panelDefinitionOjects: DraggablePanelStoryProps[] = [
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

type StackOrderingKeeperProps = { draggablePanelProps: DraggablePanelStoryProps[] };

function StackOrderingKeeper({
  draggablePanelProps,
}: StackOrderingKeeperProps) {
  const [zIndicies, setZIndicies] = useState<string[]>(
    draggablePanelProps.map((props) => props.panelTitle)
  );

  const [panelOpenDictionary, setPanelOpenDictionary] = useState(
    draggablePanelProps.reduce((acc, props) => {
      acc[props.panelTitle] = true;
      return acc;
    }, {})
  );

  const [dimensionByPanelTitleDictionary, setDimensionsByPanelTitleDictionary] =
    useState<{ [key: string]: HeightAndWidthInPixels }>(
      draggablePanelProps.reduce((acc, props) => {
        acc[props.panelTitle] = {
          height: props.styleOverrides?.height,
          width: props.styleOverrides?.width,
        };
        return acc;
      }, {})
    );
  const [positionByPanelTitleDictionary, setPositionByPanelTitleDictionary] =
    useState<{ [key: string]: DraggablePanelCoordinatePair }>(
      draggablePanelProps.reduce((dictionary, props, index) => {
        dictionary[props.panelTitle] = {
          x: (index + 15) * 25,
          y: (index + 7) * 25,
        };
        return dictionary;
      }, {})
    );

  function togglePanelOpen(panelTitle) {
    setPanelOpenDictionary((currentMap) => ({
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

  function setDestinationCoordinatesOnDragComplete(
    destinationCoordinates: DraggablePanelCoordinatePair,
    panelTitle: string
  ) {
    setPositionByPanelTitleDictionary((currentMap) => {
      return {
        ...currentMap,
        [panelTitle]: destinationCoordinates,
      };
    });
  }

  return (
    <div
      style={{
        position: "relative",
        height: "97vh",
        border: "3px solid coral",
      }}
    >
      <ul
        style={{
          display: "flex",
          justifyContent: "space-around",
          listStyle: "none",
        }}
      >
        {draggablePanelProps.map((props) => {
          const isOpen = panelOpenDictionary[props.panelTitle];
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
      {draggablePanelProps.map((props) => {
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
            defaultPosition={positionByPanelTitleDictionary[props.panelTitle]}
            confineToParentContainer
            key={props.panelTitle}
            isOpen={panelOpenDictionary[props.panelTitle]}
            onPanelDismiss={
              props.includeDismissButton ? handleOnPanelDismiss : undefined
            }
            panelTitle={props.panelTitle}
            showPanelTitle={props.showPanelTitle}
            onDragStart={() => movePanelToTopLayer(props.panelTitle)}
            onDragComplete={(destinationCoordinates) => {
              setDestinationCoordinatesOnDragComplete(
                destinationCoordinates,
                props.panelTitle
              );
            }}
            onPanelResize={(dimensions: HeightAndWidthInPixels) =>
              setDimensionsByPanelTitleDictionary((currentDictionary) => {
                return {
                  ...currentDictionary,
                  [props.panelTitle]: dimensions,
                };
              })
            }
            styleOverrides={{
              zIndex,
              margin: "0 0 1rem 0",
              width: "500px",
              height: "200px",
              minHeight: "175px",
              minWidth: "285px",
              ...props.styleOverrides,
            }}
          >
            {/* This is just nonsense to fill the panel with content */}
            <div
              onClick={() => {
                movePanelToTopLayer(props.panelTitle);
              }}
              style={{
                padding: "1rem",
                fontFamily: "sans-serif",
              }}
            >
              <h2>{props.panelTitle} Content</h2>
              <p>
                Panel Dimensions:{" "}
                {JSON.stringify(
                  dimensionByPanelTitleDictionary[props.panelTitle]
                )}
              </p>
              <p>
                Panel Position:{" "}
                {JSON.stringify(
                  positionByPanelTitleDictionary[props.panelTitle]
                )}
              </p>

              <div
                style={{
                  height: 25,
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
