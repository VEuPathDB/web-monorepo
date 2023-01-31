import { css } from "@emotion/react";
import { Story, Meta } from "@storybook/react/types-6-0";
import React from "react";
import { useState } from "react";
import { FilledButton } from "../../components/buttons";
import {
  DraggablePanel,
  DraggablePanelProps,
} from "../../components/containers/DraggablePanel/DraggablePanel";
import UIThemeProvider from "../../components/theming/UIThemeProvider";
import { H1, H4 } from "../../components/typography";
import { orange, green } from "../../definitions/colors";
import { p } from "../../styleDefinitions/typography";

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
      <div
        css={css`
          display: flex;
          flex-direction: column;
        `}
      >
        <div>
          <H4 additionalStyles={{ margin: 0 }}>Some notable things</H4>
          <p css={p}>
            Because the parent component never specifies where this panel should
            live, its last location is forgotten whenever its closed. If we
            don't want this behavior, then the parent component will keep track
            of where the component was dragged to. The panel's job is to get
            dragged.
          </p>
        </div>
        <KeepTrackOfOpenedAndClosedState>
          {(isOpen, setIsOpen) => {
            return (
              <DraggablePanel
                isOpen={isOpen}
                onPanelDismiss={() => setIsOpen(false)}
                panelTitleForAccessibilityOnly="Estimated water requirements for various foods"
                showPanelTitle
                initialPanelWidth="700px"
                initialPanelHeight="200px"
                onDragComplete={() => {}}
              >
                <div
                  css={css`
                    display: flex;
                    flex-direction: column;
                    overflow: scroll;
                  `}
                >
                  {getHtmlData()}
                </div>
              </DraggablePanel>
            );
          }}
        </KeepTrackOfOpenedAndClosedState>
        <KeepTrackOfOpenedAndClosedState>
          {(isOpen, setIsOpen) => {
            return (
              <DraggablePanel
                isOpen={isOpen}
                onPanelDismiss={() => setIsOpen(false)}
                panelTitleForAccessibilityOnly="Something Else"
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
                  {getMenu()}
                </div>
              </DraggablePanel>
            );
          }}
        </KeepTrackOfOpenedAndClosedState>
      </div>
    </UIThemeProvider>
  );
};

export const Default = Template.bind({});

function KeepTrackOfOpenedAndClosedState({ children }) {
  const [isOpen, setIsOpened] = useState(true);

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        margin: "2rem 0",
      }}
    >
      <FilledButton
        onPress={() => setIsOpened(!isOpen)}
        text={`${isOpen ? "Close" : "Open"} the panel from over here!`}
      ></FilledButton>
      <div
        css={css`
          margin-top: 1rem;
          z-index: 100000;
        `}
      >
        {children(isOpen, setIsOpened)}
      </div>
    </div>
  );
}

function getMenu() {
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

function getHtmlData() {
  return (
    <div
      css={css`
        background: white;
        overflow: scroll;
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
