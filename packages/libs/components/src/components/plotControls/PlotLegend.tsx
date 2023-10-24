import React from 'react';
import { ContainerStylesAddon } from '../../types/plots';
import PlotListLegend, { PlotListLegendProps } from './PlotListLegend';
import PlotGradientLegend, {
  PlotLegendGradientProps,
} from './PlotGradientLegend';
import PlotBubbleLegend, { PlotLegendBubbleProps } from './PlotBubbleLegend';

interface PlotLegendBaseProps extends ContainerStylesAddon {
  legendTitle?: string;
  isClickable?: boolean;
}

export type PlotLegendProps = PlotLegendBaseProps &
  (
    | ({ type: 'list' } & PlotListLegendProps)
    | ({ type: 'colorscale' } & PlotLegendGradientProps)
    | ({ type: 'bubble' } & PlotLegendBubbleProps)
  );

export default function PlotLegend({
  type,
  legendTitle,
  containerStyles,
  ...otherProps
}: PlotLegendProps) {
  const legendTextSize = '1.0em';
  const isClickable = otherProps.isClickable ?? true;

  return (
    <>
      {/* add a condition to show legend for single overlay data */}
      {((type === 'list' &&
        ((otherProps as PlotListLegendProps).legendItems.length > 1 ||
          (otherProps as PlotListLegendProps).showOverlayLegend)) ||
        type === 'colorscale' ||
        type === 'bubble') && (
        <div
          style={{
            display: 'inline-block', // for general usage (e.g., story)
            border: '1px solid #dedede',
            boxShadow: '1px 1px 4px #00000066',
            padding: '1em',
            // implementing scrolling for vertical direction
            maxHeight: 250, // same height with Scatterplot R-square table
            width: 400,
            overflowX: 'hidden',
            overflowY: 'auto',
            cursor: isClickable ? 'pointer' : 'default',
            ...containerStyles,
          }}
        >
          <div
            title={legendTitle}
            // style={{ cursor: 'pointer', fontSize: legendTextSize, fontWeight: 'bold', margin: '0 0 0 0.15em' }}
            style={{
              cursor: isClickable ? 'pointer' : 'default',
              fontSize: legendTextSize,
              fontWeight: 'bold',
              marginLeft: '0.15em',
              marginBottom: '0.5em',
            }}
          >
            {legendTitle}
          </div>
          {type === 'list' && (
            <PlotListLegend {...(otherProps as PlotListLegendProps)} />
          )}
          {type === 'colorscale' && (
            <PlotGradientLegend {...(otherProps as PlotLegendGradientProps)} />
          )}
          {type === 'bubble' && (
            <PlotBubbleLegend {...(otherProps as PlotLegendBubbleProps)} />
          )}
        </div>
      )}
    </>
  );
}
