import React, { useState } from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';
import { LinePlotProps } from '../../plots/LinePlot';
import EzTimeFilter, {
  EZTimeFilterDataProp,
} from '../../components/plotControls/EzTimeFilter';
import { DraggablePanel } from '@veupathdb/coreui/lib/components/containers';

export default {
  title: 'Plot Controls/EzTimeFilter',
  component: EzTimeFilter,
} as Meta;

// GEMS1 Case Control; x: Enrollment date; y: Weight
const LineplotData = {
  series: [
    {
      x: [
        '2007-11-01',
        '2007-12-01',
        '2008-01-01',
        '2008-02-01',
        '2008-03-01',
        '2008-04-01',
        '2008-05-01',
        '2008-06-01',
        '2008-07-01',
        '2008-08-01',
        '2008-09-01',
        '2008-10-01',
        '2008-11-01',
        '2008-12-01',
        '2009-01-01',
        '2009-02-01',
        '2009-03-01',
        '2009-04-01',
        '2009-05-01',
        '2009-06-01',
        '2009-07-01',
        '2009-08-01',
        '2009-09-01',
        '2009-10-01',
        '2009-11-01',
        '2009-12-01',
        '2010-01-01',
        '2010-02-01',
        '2010-03-01',
        '2010-04-01',
        '2010-05-01',
        '2010-06-01',
        '2010-07-01',
        '2010-08-01',
        '2010-09-01',
        '2010-10-01',
        '2010-11-01',
        '2010-12-01',
        '2011-01-01',
        '2011-02-01',
        '2011-03-01',
      ],
      y: [
        9.4667, 8.9338, 8.7881, 8.8275, 8.9666, 8.9188, 8.8984, 8.5207, 8.8826,
        8.8885, 8.918, 9.0428, 9.2326, 9.2678, 9.2778, 9.2791, 9.3129, 9.3575,
        9.547, 9.1614, 8.8183, 9.0783, 9.3669, 9.1692, 9.2234, 9.2269, 9.3905,
        9.3198, 9.0729, 9.4823, 9.2846, 9.2275, 9.0953, 9.2941, 9.2566, 9.6933,
        9.5211, 9.4618, 8.697, 8.718, 7.8882,
      ],
      binLabel: [
        '2007-11-01 - 2007-12-01',
        '2007-12-01 - 2008-01-01',
        '2008-01-01 - 2008-02-01',
        '2008-02-01 - 2008-03-01',
        '2008-03-01 - 2008-04-01',
        '2008-04-01 - 2008-05-01',
        '2008-05-01 - 2008-06-01',
        '2008-06-01 - 2008-07-01',
        '2008-07-01 - 2008-08-01',
        '2008-08-01 - 2008-09-01',
        '2008-09-01 - 2008-10-01',
        '2008-10-01 - 2008-11-01',
        '2008-11-01 - 2008-12-01',
        '2008-12-01 - 2009-01-01',
        '2009-01-01 - 2009-02-01',
        '2009-02-01 - 2009-03-01',
        '2009-03-01 - 2009-04-01',
        '2009-04-01 - 2009-05-01',
        '2009-05-01 - 2009-06-01',
        '2009-06-01 - 2009-07-01',
        '2009-07-01 - 2009-08-01',
        '2009-08-01 - 2009-09-01',
        '2009-09-01 - 2009-10-01',
        '2009-10-01 - 2009-11-01',
        '2009-11-01 - 2009-12-01',
        '2009-12-01 - 2010-01-01',
        '2010-01-01 - 2010-02-01',
        '2010-02-01 - 2010-03-01',
        '2010-03-01 - 2010-04-01',
        '2010-04-01 - 2010-05-01',
        '2010-05-01 - 2010-06-01',
        '2010-06-01 - 2010-07-01',
        '2010-07-01 - 2010-08-01',
        '2010-08-01 - 2010-09-01',
        '2010-09-01 - 2010-10-01',
        '2010-10-01 - 2010-11-01',
        '2010-11-01 - 2010-12-01',
        '2010-12-01 - 2011-01-01',
        '2011-01-01 - 2011-02-01',
        '2011-02-01 - 2011-03-01',
        '2011-03-01 - 2011-04-01',
      ],
      binSampleSize: [
        {
          N: 18,
        },
        {
          N: 804,
        },
        {
          N: 1186,
        },
        {
          N: 1475,
        },
        {
          N: 1665,
        },
        {
          N: 1609,
        },
        {
          N: 1706,
        },
        {
          N: 1803,
        },
        {
          N: 1943,
        },
        {
          N: 1874,
        },
        {
          N: 1475,
        },
        {
          N: 1503,
        },
        {
          N: 1545,
        },
        {
          N: 1393,
        },
        {
          N: 1641,
        },
        {
          N: 1893,
        },
        {
          N: 1913,
        },
        {
          N: 1916,
        },
        {
          N: 1882,
        },
        {
          N: 1967,
        },
        {
          N: 1699,
        },
        {
          N: 1697,
        },
        {
          N: 1263,
        },
        {
          N: 1774,
        },
        {
          N: 1620,
        },
        {
          N: 1450,
        },
        {
          N: 1893,
        },
        {
          N: 1628,
        },
        {
          N: 1552,
        },
        {
          N: 1722,
        },
        {
          N: 1698,
        },
        {
          N: 1604,
        },
        {
          N: 1544,
        },
        {
          N: 1368,
        },
        {
          N: 1302,
        },
        {
          N: 1250,
        },
        {
          N: 1254,
        },
        {
          N: 751,
        },
        {
          N: 527,
        },
        {
          N: 267,
        },
        {
          N: 51,
        },
      ],
      name: 'Data',
      mode: 'lines+markers',
      opacity: 0.7,
      marker: {
        color: 'rgb(136,34,85)',
        symbol: 'circle',
      },
    },
  ],
};

export const TimeFilter: Story<LinePlotProps> = (args: any) => {
  // converting lineplot data to visx format
  const timeFilterData: EZTimeFilterDataProp[] = LineplotData.series[0].x.map(
    (value, index) => {
      // return { x: value, y: LineplotData.series[0].y[index] };
      return { x: value, y: LineplotData.series[0].y[index] >= 9 ? 1 : 0 };
    }
  );

  // set initial selectedRange
  const [selectedRange, setSelectedRange] = useState<
    { start: string; end: string } | undefined
  >({
    start: timeFilterData[0].x,
    end: timeFilterData[timeFilterData.length - 1].x,
  });

  // set time filter width
  const timeFilterWidth = 750;

  // set initial position: shrink
  const [defaultPosition, setDefaultPosition] = useState({
    x: window.innerWidth / 2 - timeFilterWidth / 2,
    y: 0,
  });

  // set DraggablePanel key
  const [key, setKey] = useState(0);

  // set button text
  const [buttonText, setButtonText] = useState('Expand');

  const expandPosition = () => {
    setButtonText('Shrink');
    setKey((currentKey) => currentKey + 1);
    setDefaultPosition({
      x: window.innerWidth / 2 - timeFilterWidth / 2,
      y: 50,
    });
  };

  const resetPosition = () => {
    setButtonText('Expand');
    setKey((currentKey) => currentKey + 1);
    setDefaultPosition({
      x: window.innerWidth / 2 - timeFilterWidth / 2,
      y: 0,
    });
    // initialize range
    setSelectedRange({
      start: timeFilterData[0].x,
      end: timeFilterData[timeFilterData.length - 1].x,
    });
  };

  // set constant values
  const defaultSymbolSize = 0.8;
  const defaultColor = '#333';

  return (
    <DraggablePanel
      key={key}
      showPanelTitle
      panelTitle={'Time slider'}
      defaultPosition={defaultPosition}
      isOpen={true}
      styleOverrides={{
        zIndex: 10,
      }}
    >
      <div
        style={{
          width: timeFilterWidth,
          height: 160,
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr repeat(1, auto) 1fr',
            gridColumnGap: '5px',
            justifyContent: 'center',
            paddingTop: '1em',
          }}
        >
          {/* display start to end value */}
          <div style={{ gridColumnStart: 2 }}>
            {selectedRange?.start} ~ {selectedRange?.end}
          </div>
        </div>
        <EzTimeFilter
          data={timeFilterData}
          selectedRange={selectedRange}
          setSelectedRange={setSelectedRange}
          width={720}
          height={100}
          // line color of the selectedRange
          brushColor={'lightblue'}
          // add opacity
          brushOpacity={0.4}
          // axis tick and tick label color
          axisColor={'#000'}
          // whether movement of Brush should be disabled
          disableDraggingSelection={buttonText === 'Expand'}
          // disable brush selection: pass []
          resizeTriggerAreas={buttonText === 'Expand' ? [] : ['left', 'right']}
        />
        {/* add a Expand or something like that to change position */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'right',
            fontSize: defaultSymbolSize + 'em',
          }}
        >
          {/* reset position to hide panel title */}
          <div style={{ marginTop: '-0.3em', marginRight: '1em' }}>
            <button
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: 'blue',
                cursor: 'pointer',
              }}
              type="button"
              onClick={buttonText === 'Expand' ? expandPosition : resetPosition}
            >
              {buttonText === 'Expand' ? (
                <i className="fa fa-expand" aria-hidden="true"></i>
              ) : (
                <i className="fa fa-compress" aria-hidden="true"></i>
              )}
              &nbsp; {buttonText}
            </button>
          </div>
        </div>
      </div>
    </DraggablePanel>
  );
};
