import { XYChart, Tooltip, Axis, Grid, LineSeries } from '@visx/xychart';
import ScatterPlot from '../../../lib/plots/ScatterPlot';
import { Story, Meta } from '@storybook/react/types-6-0';
import { DivIcon } from 'leaflet';

export default {
  title: 'Plots/VisxScatter',
  component: ScatterPlot,
} as Meta;

const data1 = [
  { x: '2020-01-01', y: 50 },
  { x: '2020-01-02', y: 10 },
  { x: '2020-01-03', y: 20 },
];

const data2 = [
  { x: '2020-01-01', y: 30 },
  { x: '2020-01-02', y: 40 },
  { x: '2020-01-03', y: 80 },
];

interface TemplateProps {}

const Template: Story<TemplateProps> = (args) => {
  const accessors = {
    xAccessor: (d: any) => d.x,
    yAccessor: (d: any) => d.y,
  };

  return (
    <XYChart height={300} xScale={{ type: 'band' }} yScale={{ type: 'linear' }}>
      <Axis orientation="bottom" />
      <Grid columns={false} numTicks={4} />
      <LineSeries dataKey="Line 1" data={data1} {...accessors} />
      <LineSeries dataKey="Line 2" data={data2} {...accessors} />
      <Tooltip
        snapTooltipToDatumX
        snapTooltipToDatumY
        showVerticalCrosshair
        showSeriesGlyphs
        renderTooltip={({ tooltipData, colorScale }) => (
          <div>
            <div style={{ color: colorScale!(tooltipData!.nearestDatum!.key) }}>
              {tooltipData!.nearestDatum!.key}
            </div>
            {accessors.xAccessor(tooltipData!.nearestDatum!.datum)}
            {', '}
            {accessors.yAccessor(tooltipData!.nearestDatum!.datum)}
          </div>
        )}
      />
    </XYChart>
  );
};

export const Default = Template.bind({});
