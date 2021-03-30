// sample legend
import React, { useState, useRef } from 'react';
// import legend Dropdown component
import LegendListDropDown from './LegendListDropDown';
// legend list considering square icon case
import LegendListGeneral from './LegendListGeneral';
// legend radio button for histogram marker
import LegendListRadioButton from './LegendListRadioButton';
// legend tutorial info
import LegendListInfo from './LegendListInfo';
// import legend css for positioning: place this at the end of other CSS to override pre-existing ones
import './legend-style.css';

// type def for legend: some are set to optional for now
export interface LegendProps {
  // className: string
  legendType: string; //'categorical' | 'numeric' | 'date',
  data: {
    label: string; // categorical e.g. "Anopheles gambiae"
    // numeric e.g. "10-20"
    value: number;
    color: string;
  }[];
  variableLabel?: string; // e.g. Species or Age
  quantityLabel?: string; // ** comment below
  tickLabelsVisible?: boolean;

  onShowFilter?: () => {}; // callback to open up filter panel
  onShowVariableChooser?: () => {}; // callback to open up variable selector

  // send state for legend radio button
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  selectedOption?: string;

  // add dropdown props for dynamic change
  dropdownTitle: string;
  dropdownHref: string[];
  dropdownItemText: string[];
  // use yAxisRange[1]
  dependentAxisRange?: number[];
  // send legend number text
  legendInfoNumberText?: string;
}

// make legend at the map without using L.Control: perhaps send props to make circle or square?
// For now, just use different component for square
// show/hide legend
const MapVEuLegendSampleListHide = (props: LegendProps) => {
  // simplifying
  let legendIconClass = '';
  if (props.legendType === 'categorical') {
    legendIconClass = 'legend-contents';
  } else {
    legendIconClass = 'legend-contents-numeric';
  }

  // make ref & typing
  const legendWrapper = useRef() as React.MutableRefObject<HTMLInputElement>;
  // check legend status to determine show/hide text at button: default is false so that legend is hidden
  const [legendStatus, setlegendStatus] = useState(false);
  const legendShowHideButtonClick = (e: React.MouseEvent) => {
    const wrapper = legendWrapper ? legendWrapper.current : undefined;
    if (wrapper) {
      wrapper.classList.toggle('hiding-legend');
      setlegendStatus(
        wrapper.classList.contains('hiding-legend') ? true : false
      );
    }
  };

  return (
    // add wrapper divs for showing and hiding legend
    <>
      <div ref={legendWrapper} className="legend-wrapper">
        <div className="legend-nav">
          {/*  add below divs for benefeting from pre-existing CSS (vb-popbio-maps.css)         */}
          <div className="info legend">
            <div className={legendIconClass}>
              {/*  add react-bootstrap dropdown and dynamically generate menu items */}
              <LegendListDropDown
                legendType={props.legendType}
                dropdownTitle={props.dropdownTitle}
                dropdownHref={props.dropdownHref}
                dropdownItemText={props.dropdownItemText}
              />
              {/*  legend list  */}
              <LegendListGeneral
                // legendType={legendTypeValue}
                data={props.data}
                // divElement={div}
                // add legendType props for handling icons
                legendType={props.legendType}
                // used for legend info text, e.g., Collections
                legendInfoNumberText={props.legendInfoNumberText}
              />
              {/*  add radio button component here */}
              <LegendListRadioButton
                legendType={props.legendType}
                onChange={props.onChange}
                selectedOption={props.selectedOption}
                dependentAxisRange={props.dependentAxisRange}
              />
              {/*  add tutorial info component here */}
              <LegendListInfo
                // for now, let's use image
                legendType={props.legendType}
                // used for legend info texts, e.g., Collection Date, Collections
                dropdownTitle={props.dropdownTitle}
                legendInfoNumberText={props.legendInfoNumberText}
              />
            </div>
          </div>
        </div>
      </div>
      {/*  button to control show/hide legend */}
      <div className="legend-display-button active">
        <button
          className="legend-nav-icon"
          onClick={(e) => legendShowHideButtonClick(e)}
        >
          {' '}
          {legendStatus ? 'Show' : ' Hide'} Legend{' '}
        </button>
      </div>
    </>
  );
};

// hide
export default MapVEuLegendSampleListHide;
