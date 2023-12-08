import { range } from 'd3';
import { truncateWithEllipsis } from '../../utils/axis-tick-label-ellipsis';

// set props for custom legend function
export interface PlotLegendGradientProps {
  legendMax: number;
  legendMin: number;
  valueToColorMapper: (a: number) => string;
  valueToTickStringMapper?: (a: number) => string;
  nTicks?: number; // MUST be odd!
  showMissingness?: boolean;
}

// make gradient colorscale legend into a component so it can be more easily incorporated into DK's custom legend if we need
export default function PlotGradientLegend({
  legendMax,
  legendMin,
  valueToColorMapper,
  valueToTickStringMapper = (val: number) => val.toPrecision(3),
  nTicks = 5,
  showMissingness,
}: PlotLegendGradientProps) {
  // Declare constants
  const gradientBoxHeight = 150;
  const gradientBoxWidth = 20;
  const tickLength = 4;
  const tickFontSize = '0.8em';
  const legendTextSize = '1.0em';

  // Create gradient stop points from the colorscale from values [legendMin TO legendMax] at an arbitrary 50 step resolution
  const numStopPoints = 50;
  const legendStep = (legendMax - legendMin) / (numStopPoints - 1);
  const fudge = legendStep / 10; // to get an inclusive range from d3 we have to make a slightly too-large max
  const stopPoints = range(legendMin, legendMax + fudge, legendStep).map(
    (value: number, index: number) => {
      const stopPercentage = (100 * index) / (numStopPoints - 1) + '%';
      const color = valueToColorMapper(value);
      return (
        <stop
          offset={stopPercentage}
          stopColor={color}
          key={'gradientStop' + index}
        />
      );
    }
  );

  // Create ticks
  const ticks = range(nTicks).map((a: number) => {
    const location: number =
      gradientBoxHeight - gradientBoxHeight * (a / (nTicks! - 1)); // draw bottom to top
    return (
      <g className="axisTick" overflow="visible" key={'gradientTick' + a}>
        <line
          x1={gradientBoxWidth + 1}
          x2={gradientBoxWidth + tickLength + 1}
          y1={location}
          y2={location}
          stroke="black"
          strokeWidth="1px"
        ></line>
        <text
          x={gradientBoxWidth + 4 + tickLength}
          y={location}
          dominantBaseline="middle"
          fontSize={tickFontSize}
        >
          {valueToTickStringMapper(
            (a / (nTicks! - 1)) * (legendMax - legendMin) + legendMin
          )}
        </text>
      </g>
    );
  });

  return (
    <div>
      <svg
        id="gradientLegend"
        height={gradientBoxHeight + 20}
        width={gradientBoxWidth + 80}
      >
        <defs>
          <linearGradient id="linearGradient" x1="0" x2="0" y1="1" y2="0">
            {stopPoints}
          </linearGradient>
        </defs>
        <g style={{ transform: 'translate(5px, 10px)' }}>
          <rect
            width={gradientBoxWidth}
            height={gradientBoxHeight}
            fill="url(#linearGradient)"
            stroke="black"
            strokeWidth={1}
          ></rect>
          {ticks}
        </g>
      </svg>
      {showMissingness && (
        <div style={{ display: 'flex' }}>
          <div style={{ width: '2em' }}>
            <div
              style={{
                textAlign: 'center',
                fontWeight: 'normal',
                fontSize: `calc(1.5 * ${legendTextSize})`,
                color: '#999',
              }}
            >
              &times;
            </div>
          </div>
          <label
            title={'No data'}
            style={{
              cursor: 'default',
              display: 'flex',
              alignItems: 'center',
              fontSize: legendTextSize,
              color: '#999',
              margin: 0,
            }}
          >
            <i>{truncateWithEllipsis('No data', 20)}</i>
          </label>
        </div>
      )}
    </div>
  );
}
