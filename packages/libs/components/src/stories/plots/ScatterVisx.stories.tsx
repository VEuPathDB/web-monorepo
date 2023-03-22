import { XYChart, Tooltip, Axis, Grid, GlyphSeries } from '@visx/xychart';
import ScatterPlot from '../../../lib/plots/ScatterPlot';
import { Story, Meta } from '@storybook/react/types-6-0';
import { DivIcon } from 'leaflet';
import { AxisBottom } from '@visx/axis';
import { scaleLinear } from '@visx/scale';

export default {
  title: 'Plots/VisxScatter',
  component: ScatterPlot,
} as Meta;

const data1 = [
  { x: 10, y: 50 },
  { x: 20, y: 10 },
  { x: 5, y: 20 },
];

const data2 = [
  { x: 3, y: 30 },
  { x: 40, y: 40 },
  { x: 1, y: 80 },
];

interface TemplateProps {}

const Template: Story<TemplateProps> = (args) => {
  const accessors = {
    xAccessor: (d: any) => d.x,
    yAccessor: (d: any) => d.y,
  };

  const bottomScale = scaleLinear({
    domain: [-4, 4],
    range: [-1, 8],
    nice: true,
  });

  return (
    <XYChart
      height={300}
      xScale={{ type: 'linear' }}
      yScale={{ type: 'linear' }}
    >
      <Axis orientation="bottom" label="Bottom axis" />
      {/* <AxisBottom scale={bottomScale} top={40}/> */}
      <Axis orientation="left" />
      <Grid columns={false} numTicks={4} />
      <GlyphSeries dataKey="Stuff 1" data={data1} {...accessors} />
      <GlyphSeries dataKey="Stuff 2" data={data2} {...accessors} />
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
