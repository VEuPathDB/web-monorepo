import L from 'leaflet';

import BoundsDriftMarker, { BoundsDriftMarkerProps } from './BoundsDriftMarker';
import BarPlot from '../plots/BarPlot';
//import Histogram from '../plots/Histogram';
// import NumberRange type def
import { NumberRange } from '../types/general';
import { last } from 'lodash';

import {
  ContainerStylesAddon,
  DependentAxisLogScaleAddon,
  MarkerScaleAddon,
  MarkerScaleDefault,
} from '../types/plots';

export type BaseMarkerData = {
  value: number;
  label: string;
  color?: string;
};

export interface ChartMarkerProps
  extends BoundsDriftMarkerProps,
    MarkerScaleAddon,
    DependentAxisLogScaleAddon {
  borderColor?: string;
  borderWidth?: number;
  data: BaseMarkerData[];
  isAtomic?: boolean; // add a special thumbtack icon if this is true (it's a marker that won't disaggregate if zoomed in further)
  // changed to dependentAxisRange
  dependentAxisRange?: NumberRange | null; // y-axis range for setting global max
  onClick?: (event: L.LeafletMouseEvent) => void | undefined;
  /** x-axis title for marker (defaults to sum of data[].value) */
  markerLabel?: string;
  /** cumulative mode: when true, the total count shown will be the last value, not the sum of the values.
   * See cumulative prop in DonutMarker.tsx for context. */
  cumulative?: boolean;
}

/**
 *  this is a SVG histogram/chart marker icon
 * - no (drop) shadow
 * - no gap between bars
 * - accordingly icon size could be reduced
 */
export default function ChartMarker(props: ChartMarkerProps) {
  const selectedMarkers = props.selectedMarkers;
  const setSelectedMarkers = props.setSelectedMarkers;

  const { html: svgHTML, size, sumValuesString } = chartMarkerSVGIcon(props);

  // set icon
  let HistogramIcon: any = L.divIcon({
    // add class, highlight-chartmarker, for panning
    className:
      'leaflet-canvas-icon ' + 'marker-id-' + props.id + ' chart-marker',
    iconSize: new L.Point(size, size),
    iconAnchor: new L.Point(size / 2, size / 2), // location of topleft corner: this is used for centering of the icon like transform/translate in CSS
    html: svgHTML, // divIcon HTML svg code generated above
  });

  // anim check duration exists or not
  let duration: number = props.duration ? props.duration : 300;

  const plotSize = 200;
  const marginSize = 5;
  const popupSize = plotSize + 2 * marginSize;

  const popupPlot = (
    <BarPlot
      data={{
        series: [
          {
            name: 'do not display me',
            label: props.data.map(({ label }) => label),
            value: props.data.map(({ value }) => value),
            color: props.data.map(({ color }) => color ?? ''),
          },
        ],
      }}
      orientation="vertical"
      containerStyles={{
        width: plotSize + 'px',
        height: plotSize + 'px',
      }}
      spacingOptions={{
        marginLeft: marginSize,
        marginRight: marginSize,
        marginTop: marginSize,
        marginBottom: marginSize,
      }}
      displayLegend={false}
      displayLibraryControls={false}
      interactive={false}
      dependentAxisLabel=""
      independentAxisLabel={`Total: ${sumValuesString}`}
      // dependentAxisRange is an object with {min, max} (NumberRange)
      dependentAxisRange={props.dependentAxisRange ?? undefined}
      showValues={true}
      showIndependentAxisTickLabel={false}
      dependentAxisLogScale={props.dependentAxisLogScale}
    />
  );

  return (
    // anim
    <BoundsDriftMarker
      id={props.id}
      position={props.position}
      bounds={props.bounds}
      icon={HistogramIcon}
      duration={duration}
      popupContent={{
        content: popupPlot,
        size: {
          height: popupSize,
          width: popupSize,
        },
      }}
      showPopup={props.showPopup}
      popupClass="histogram-popup"
      // pass // selectedMarkers state and setState
      selectedMarkers={selectedMarkers}
      setSelectedMarkers={setSelectedMarkers}
    />
  );
}

type ChartMarkerStandaloneProps = Omit<
  ChartMarkerProps,
  | 'id'
  | 'position'
  | 'bounds'
  | 'onClick'
  | 'duration'
  | 'showPopup'
  | 'popupClass'
  | 'popupContent'
> &
  ContainerStylesAddon;

export function ChartMarkerStandalone(props: ChartMarkerStandaloneProps) {
  const { html, size } = chartMarkerSVGIcon(props);
  // NOTE: the font size and line height would normally come from the .leaflet-container class
  // but we won't be using that. You can override these with `containerStyles` if you like.
  return (
    <div
      style={{
        fontSize: '12px',
        lineHeight: 1.5,
        width: size,
        height: size,
        ...props.containerStyles,
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function chartMarkerSVGIcon(props: ChartMarkerStandaloneProps): {
  html: string;
  size: number;
  sumValuesString: string;
} {
  const defaultLineColor = props.borderColor ?? '#7cb5ec'; // '#00000088' was also used before but unsure when
  const borderWidth = props.borderWidth ?? 1;

  // construct histogram marker icon
  const scale = props.markerScale ?? MarkerScaleDefault;
  const size = 40 * scale; // histogram marker icon size: note that popbio/mapveu donut marker icons = 40
  const xSize = 50 * scale; // make the histogram width a bit larger considering the total number space in the bottom of histogram
  const ySize = 50 * scale; // set height differently to host total number at the bottom side
  let svgHTML: string = ''; // divIcon HTML contents

  // set drawing area: without shadow, they are (xSize x ySize)
  svgHTML +=
    '<svg width="' +
    (xSize + 2 * borderWidth) +
    '" height="' +
    (ySize + 2 * borderWidth) +
    '">'; // initiate svg marker icon

  let count = props.data.length;
  let sumValues: number = props.cumulative
    ? last(props.data)?.value ?? 0
    : props.data
        .map((o) => o.value)
        .reduce((a, c) => {
          return a + c;
        }, 0); // summation of data's value per marker icon
  const sumValuesString =
    sumValues <= 0.99 && sumValues > 0
      ? sumValues.toFixed(2)
      : sumValues.toLocaleString(undefined, {
          useGrouping: true,
          maximumFractionDigits: 0,
        });

  // determine min/max (one marker)
  const minMaxPosRange: NumberRange = props.dependentAxisRange
    ? props.dependentAxisRange
    : {
        min: props.dependentAxisLogScale
          ? Math.min(...props.data.map((o) => o.value).filter((a) => a > 0))
          : 0,
        max: Math.max(...props.data.map((o) => o.value).filter((a) => a > 0)),
      };

  const roundX = 10 * scale; // round corner in pixel: 0 = right angle
  const roundY = 10 * scale; // round corner in pixel: 0 = right angle
  const marginX = 5 * scale; // margin to start drawing bars in left and right ends of svg marker: plot area = (size - 2*marginX)
  const marginY = 5 * scale; // margin to start drawing bars in Y

  // thin line: drawing outer box with round corners: changed border color (stroke)
  svgHTML +=
    '<rect x="0" y="0" rx=' +
    roundX +
    ' ry=' +
    roundY +
    ' width=' +
    (xSize + 2 * borderWidth) +
    ' height=' +
    (ySize + 2 * borderWidth) +
    ' fill="white" stroke="' +
    defaultLineColor +
    '" stroke-width="0" opacity="1.0" />';

  // add inner border to avoid the issue of clipped border in svg
  svgHTML +=
    '<rect x=' +
    borderWidth / 2 +
    ' y=' +
    borderWidth / 2 +
    ' rx="9" ry="9" width="' +
    (xSize + borderWidth) +
    '" height="' +
    (ySize + borderWidth) +
    '" fill="white" opacity="1" stroke="' +
    defaultLineColor +
    '" stroke-width="' +
    borderWidth +
    '"/>';

  // initialize variables for using at following if-else
  let barWidth: number, startingX: number, barHeight: number, startingY: number;

  // drawing bars per marker
  props.data.forEach(function (
    el: { color?: string; label: string; value: number },
    index
  ) {
    // for the case of y-axis range input: a global approach that take global max = icon height
    barWidth = (xSize - 2 * marginX) / count; // bar width
    startingX = marginX + borderWidth + barWidth * index; // x in <react> tag: note that (0,0) is top left of the marker icon
    barHeight = props.dependentAxisLogScale // log scale
      ? el.value <= 0
        ? 0
        : // if dependentAxisRange != null, plot with global max
          (Math.log10(el.value / minMaxPosRange.min) /
            Math.log10(minMaxPosRange.max / minMaxPosRange.min)) *
          (size - 2 * marginY)
      : ((el.value - minMaxPosRange.min) /
          (minMaxPosRange.max - minMaxPosRange.min)) *
        (size - 2 * marginY); // bar height: used 2*marginY to have margins at both top and bottom

    startingY = size - marginY - barHeight + borderWidth; // y in <react> tag: note that (0,0) is top left of the marker icon
    // making the last bar, noData
    svgHTML +=
      '<rect x=' +
      startingX +
      ' y=' +
      startingY +
      ' width=' +
      barWidth +
      ' height=' +
      barHeight +
      ' fill=' +
      // empty string does not work: filled with white rgb
      (el.color ?? 'rgb(192,192,192)').replace(/\s/g, '') +
      ' />';
  });

  // add horizontal line: when using inner border (adjust x1)
  svgHTML +=
    '<line x1=' +
    borderWidth +
    ' y1="' +
    (size - 2 + borderWidth) +
    '" x2="' +
    (xSize + borderWidth) +
    '" y2="' +
    (size - 2 + borderWidth) +
    '" style="stroke:' +
    defaultLineColor +
    ';stroke-width:1" />';

  // set the location of total number
  svgHTML +=
    '<text x="50%" y=' +
    (size - 2 + borderWidth + (scale === 1 ? 7 : 7 * 0.9 * scale)) +
    ' font-size="' +
    (scale === 1 ? 1 : 0.75 * scale) +
    'em"' +
    ' dominant-baseline="middle" text-anchor="middle" opacity="1">' +
    (props.markerLabel ?? sumValuesString) +
    '</text>';

  // check isAtomic: draw pushpin if true
  if (props.isAtomic) {
    let pushPinCode = '&#128392;';
    svgHTML +=
      '<text x="89%" y="11%" dominant-baseline="middle" text-anchor="middle" opacity="0.75" font-weight="bold" font-size="1.2em">' +
      pushPinCode +
      '</text>';
  }

  //  closing svg tag
  svgHTML += '</svg>';

  return {
    html: svgHTML,
    size: xSize + marginX + borderWidth,
    sumValuesString,
  };
}

export function getChartMarkerDependentAxisRange(
  data: ChartMarkerProps['data'],
  isLogScale: boolean
) {
  return {
    min: isLogScale
      ? Math.min(
          0.1,
          ...data.filter(({ value }) => value > 0).map(({ value }) => value)
        )
      : 0,
    max: Math.max(...data.map((d) => d.value)),
  };
}
