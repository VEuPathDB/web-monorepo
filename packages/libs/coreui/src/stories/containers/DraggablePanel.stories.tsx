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
import { orange, green } from "../../definitions/colors";

export default {
  title: "Containers/DraggablePanel",
  component: DraggablePanel,
} as Meta;

const Template: Story<DraggablePanelProps> = (args) => {
  const [panelOneIsOpen, setPanelOneIsOpen] = useState<boolean>(true);
  const [panelOneCoordinates, setPanelOneCoordinates] =
    useState<DraggablePanelCoordinatePair>({
      x: 0,
      y: 0,
    });

  const [panelTwoIsOpen, setPanelTwoIsOpen] = useState<boolean>(true);

  // https://beta.reactjs.org/reference/react/Children
  // https://beta.reactjs.org/reference/react/Children#accepting-an-array-of-objects-as-a-prop
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

  return <StackOrderingKeeper draggablePanelProps={panelDefinitionOjects} />;

  return (
    <UIThemeProvider
      theme={{
        palette: {
          primary: { hue: green, level: 600 },
          secondary: { hue: orange, level: 500 },
        },
      }}
    >
      <div
        css={css`
          display: flex;
          flex-direction: column;
          height: 95vh;
        `}
      >
        <div
          css={css`
            display: flex;
            justify-content: space-around;
            padding: 1rem 0;
          `}
        >
          <button onClick={() => setPanelOneIsOpen((isOpen) => !isOpen)}>
            {panelOneIsOpen ? "Close" : "Open"} <strong>Panel 1</strong> from up
            here!
          </button>
          <button onClick={() => setPanelTwoIsOpen((isOpen) => !isOpen)}>
            {panelTwoIsOpen ? "Close" : "Open"} <strong>Panel 2</strong> from up
            here!
          </button>
        </div>
        <DraggablePanel
          confineToParentContainer
          isOpen={panelOneIsOpen}
          onPanelDismiss={() => setPanelOneIsOpen(false)}
          panelTitle="Panel 1"
          showPanelTitle
          initialPanelWidth="700px"
          initialPanelHeight="200px"
          onDragComplete={setPanelOneCoordinates}
        >
          <div
            css={css`
              display: flex;
              flex-direction: column;
              justify-content: space-between;
            `}
          >
            <pre
              css={css`
                padding-left: 1rem;
              `}
            >
              Coordinates (updates when you complete your dragging):{" "}
              {JSON.stringify(panelOneCoordinates)}
            </pre>
            {getHtmlTable()}
          </div>
        </DraggablePanel>
        <br />
        <DraggablePanel
          confineToParentContainer
          isOpen={panelTwoIsOpen}
          onPanelDismiss={() => setPanelTwoIsOpen(false)}
          panelTitle="Panel 2"
          showPanelTitle
          onDragComplete={() => {}}
          initialPanelWidth="200px"
        >
          <div
            css={css`
              background: white;
              display: flex;
              flex-direction: column;
              padding: 0rem 0.5rem;
            `}
          >
            {getMenuHtml()}
          </div>
        </DraggablePanel>
      </div>
    </UIThemeProvider>
  );
};

export const Default = Template.bind({});

function getMenuHtml() {
  return (
    <div
      css={css`
        font-family: sans-serif;
        padding: 1rem;
      `}
    >
      <form>
        <h3>Complicated Menu</h3>
        <div>
          <p>Audio settings:</p>
          <div>
            <input type="range" id="volume" name="volume" min={0} max={11} />
            <label htmlFor="volume">Volume</label>
          </div>
          <div>
            <input
              type="range"
              id="cowbell"
              name="cowbell"
              min={0}
              max={100}
              defaultValue={90}
              step={10}
            />
            <label htmlFor="cowbell">Cowbell</label>
          </div>
        </div>
        <fieldset>
          <legend>Select a maintenance drone:</legend>
          <div>
            <input
              type="radio"
              id="huey"
              name="drone"
              defaultValue="huey"
              defaultChecked
            />
            <label htmlFor="huey">Huey</label>
          </div>
          <div>
            <input type="radio" id="dewey" name="drone" defaultValue="dewey" />
            <label htmlFor="dewey">Dewey</label>
          </div>
          <div>
            <input type="radio" id="louie" name="drone" defaultValue="louie" />
            <label htmlFor="louie">Louie</label>
          </div>
        </fieldset>
      </form>
    </div>
  );
}

function getHtmlTable() {
  return (
    <div
      css={css`
        background: white;
        padding: 1rem;

        caption {
          font-weight: bold;
          padding: 1rem 0;
          font-size: 24px;
        }

        td,
        th {
          border: 1px solid #777;
          padding: 0.5rem;
          text-align: center;
        }

        table {
          border-collapse: collapse;
          font-family: monospace;
        }

        tbody tr:nth-child(odd) {
          background: #eee;
        }
        caption {
          font-size: 0.8rem;
        }
      `}
    >
      <table className="wikitable sortable mw-collapsible jquery-tablesorter mw-made-collapsible">
        <caption>
          Estimated water requirements for various foods
          <sup id="cite_ref-48" className="reference">
            <a href="#cite_note-48">[48]</a>
          </sup>
          <span
            className="mw-collapsible-toggle mw-collapsible-toggle-default"
            role="button"
            tabIndex={0}
            aria-expanded="true"
          >
            <a className="mw-collapsible-text">hide</a>
          </span>
        </caption>
        <thead>
          <tr>
            <th
              className="headerSort"
              tabIndex={0}
              role="columnheader button"
              title="Sort ascending"
            >
              Food Types
            </th>
            <th
              className="headerSort"
              tabIndex={0}
              role="columnheader button"
              title="Sort ascending"
            >
              Litre per kilocalorie
            </th>
            <th
              className="headerSort"
              tabIndex={0}
              role="columnheader button"
              title="Sort ascending"
            >
              Litre per gram of protein
            </th>
            <th
              className="headerSort"
              tabIndex={0}
              role="columnheader button"
              title="Sort ascending"
            >
              Litre per kilogram
            </th>
            <th
              className="headerSort"
              tabIndex={0}
              role="columnheader button"
              title="Sort ascending"
            >
              Litre per gram of fat
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Sugar crops</td>
            <td>0.69</td>
            <td>0.0</td>
            <td>197</td>
            <td>0.0</td>
          </tr>
          <tr>
            <td>Vegetables</td>
            <td>1.34</td>
            <td>26</td>
            <td>322</td>
            <td>154</td>
          </tr>
          <tr>
            <td>Starchy roots</td>
            <td>0.47</td>
            <td>31</td>
            <td>387</td>
            <td>226</td>
          </tr>
          <tr>
            <td>Fruits</td>
            <td>2.09</td>
            <td>180</td>
            <td>962</td>
            <td>348</td>
          </tr>
          <tr>
            <td>Cereals</td>
            <td>0.51</td>
            <td>21</td>
            <td>1644</td>
            <td>112</td>
          </tr>
          <tr>
            <td>Oil crops</td>
            <td>0.81</td>
            <td>16</td>
            <td>2364</td>
            <td>11</td>
          </tr>
          <tr>
            <td>Pulses</td>
            <td>1.19</td>
            <td>19</td>
            <td>4055</td>
            <td>180</td>
          </tr>
          <tr>
            <td>Nuts</td>
            <td>3.63</td>
            <td>139</td>
            <td>9063</td>
            <td>47</td>
          </tr>
          <tr>
            <td>Milk</td>
            <td>1.82</td>
            <td>31</td>
            <td>1020</td>
            <td>33</td>
          </tr>
          <tr>
            <td>Eggs</td>
            <td>2.29</td>
            <td>29</td>
            <td>3265</td>
            <td>33</td>
          </tr>
          <tr>
            <td>Chicken meat</td>
            <td>3.00</td>
            <td>34</td>
            <td>4325</td>
            <td>43</td>
          </tr>
          <tr>
            <td>Butter</td>
            <td>0.72</td>
            <td>0.0</td>
            <td>5553</td>
            <td>6.4</td>
          </tr>
          <tr>
            <td>Pig meat</td>
            <td>2.15</td>
            <td>57</td>
            <td>5988</td>
            <td>23</td>
          </tr>
          <tr>
            <td>Sheep/goat meat</td>
            <td>4.25</td>
            <td>63</td>
            <td>8763</td>
            <td>54</td>
          </tr>
          <tr>
            <td>Bovine meat</td>
            <td>10.19</td>
            <td>112</td>
            <td>15415</td>
            <td>153</td>
          </tr>
        </tbody>
        <tfoot />
      </table>
    </div>
  );
}

type StackOrderingKeeper = { draggablePanelProps: DraggablePanelProps[] };
function StackOrderingKeeper({ draggablePanelProps }: StackOrderingKeeper) {
  const [zIndicies, setZIndicies] = useState<string[]>([]);

  return (
    <div>
      {draggablePanelProps.map((props) => {
        const indexOfelement = zIndicies.findIndex(
          (panelTitle) => panelTitle === props.panelTitle
        );
        const zIndex = indexOfelement > 0 ? indexOfelement : 0;
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
              zIndex,
            }}
          >
            content... my z: {zIndex}
          </DraggablePanel>
        );
      })}
    </div>
  );
}
