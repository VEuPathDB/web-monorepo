import { OrientationDefault, AxisTruncationConfig } from '../types/plots';
import { Shape } from 'plotly.js';
import { NumberOrDate, NumberOrDateRange, NumberRange } from '../types/general';

export type extendedDependentAxisRangeType = {
  minStart: number | string;
  min: number | string;
  maxStart: number | string;
  max: number | string;
};

//DKDK A function to generate layout.shapes for truncated axis
export function truncationLayoutShapes(
  orientation = OrientationDefault,
  standardIndependentAxisRange: NumberOrDateRange | undefined,
  // standardDependentAxisRange: NumberOrDateRange | undefined,
  extendedIndependentAxisRange: NumberOrDateRange | undefined,
  extendedDependentAxisRange: extendedDependentAxisRangeType | undefined,
  axisTruncationConfig?: AxisTruncationConfig
  // dependentAxisLogScale?: boolean,
) {
  //DKDK this will be used with conditions
  let truncationLayoutShapes: Partial<Shape>[] = [{}];

  //DKDK independent axis min
  if (axisTruncationConfig?.independentAxis?.min) {
    truncationLayoutShapes = [
      ...truncationLayoutShapes,
      {
        type: 'rect',
        line: {
          width: 0,
          dash: 'dash',
        },
        fillcolor: '#e6e6e6',
        opacity: 1,
        xref: orientation === 'vertical' ? 'x' : 'paper',
        yref: orientation === 'vertical' ? 'paper' : 'y',
        x0: orientation === 'vertical' ? extendedIndependentAxisRange?.min : 0,
        x1: orientation === 'vertical' ? standardIndependentAxisRange?.min : 1,
        y0: orientation === 'vertical' ? 0 : extendedIndependentAxisRange?.min,
        y1: orientation === 'vertical' ? 1 : standardIndependentAxisRange?.min,
      },
    ];
  }

  //DKDK independent axis max
  if (axisTruncationConfig?.independentAxis?.max) {
    truncationLayoutShapes = [
      ...truncationLayoutShapes,
      {
        type: 'rect',
        line: {
          width: 0,
          dash: 'dash',
          color: '#999999',
        },
        fillcolor: '#e6e6e6',
        opacity: 1,
        xref: orientation === 'vertical' ? 'x' : 'paper',
        yref: orientation === 'vertical' ? 'paper' : 'y',
        x0: orientation === 'vertical' ? standardIndependentAxisRange?.max : 0,
        x1: orientation === 'vertical' ? extendedIndependentAxisRange?.max : 1,
        y0: orientation === 'vertical' ? 0 : standardIndependentAxisRange?.max,
        y1: orientation === 'vertical' ? 1 : extendedIndependentAxisRange?.max,
      },
    ];
  }

  //DKDK dependent axis max
  if (axisTruncationConfig?.dependentAxis?.max) {
    truncationLayoutShapes = [
      ...truncationLayoutShapes,
      {
        type: 'rect',
        line: {
          width: 0,
          dash: 'dash',
        },
        fillcolor: '#e6e6e6',
        opacity: 1,
        xref: orientation === 'vertical' ? 'paper' : 'x',
        yref: orientation === 'vertical' ? 'y' : 'paper',
        // x0: orientation === 'vertical' ? 0 : standardDependentAxisRange?.max,
        // x1: orientation === 'vertical' ? 1 : extendedDependentAxisRange?.max,
        // y0: orientation === 'vertical' ? standardDependentAxisRange?.max : 0,
        // y1: orientation === 'vertical' ? extendedDependentAxisRange?.max : 1,
        x0:
          orientation === 'vertical' ? 0 : extendedDependentAxisRange?.maxStart,
        x1: orientation === 'vertical' ? 1 : extendedDependentAxisRange?.max,
        y0:
          orientation === 'vertical' ? extendedDependentAxisRange?.maxStart : 0,
        y1: orientation === 'vertical' ? extendedDependentAxisRange?.max : 1,
      },
    ];
  }

  //DKDK dependent axis min
  if (axisTruncationConfig?.dependentAxis?.min) {
    truncationLayoutShapes = [
      ...truncationLayoutShapes,
      {
        type: 'rect',
        line: {
          width: 0,
          dash: 'dash',
        },
        fillcolor: '#e6e6e6',
        opacity: 1,
        xref: orientation === 'vertical' ? 'paper' : 'x',
        yref: orientation === 'vertical' ? 'y' : 'paper',
        // x0: orientation === 'vertical' ? 0 : standardDependentAxisRange?.min,
        // x1: orientation === 'vertical' ? 1 : extendedDependentAxisRange?.min,
        // y0: orientation === 'vertical' ? standardDependentAxisRange?.min : 0,
        // y1: orientation === 'vertical' ? extendedDependentAxisRange?.min : 1,
        x0:
          orientation === 'vertical' ? 0 : extendedDependentAxisRange?.minStart,
        x1: orientation === 'vertical' ? 1 : extendedDependentAxisRange?.min,
        y0:
          orientation === 'vertical' ? extendedDependentAxisRange?.minStart : 0,
        y1: orientation === 'vertical' ? extendedDependentAxisRange?.min : 1,
      },
    ];
  }

  console.log('truncationLayoutShapes = ', truncationLayoutShapes);

  //DKDK remove undefined element (e.g., initial empty one)
  const filteredTruncationLayoutShapes = truncationLayoutShapes.filter(
    (shape) => {
      if (
        shape.x0 != null &&
        shape.x1 != null &&
        shape.y0 != null &&
        shape.y1 != null
      ) {
        return shape;
      }
    }
  );

  return filteredTruncationLayoutShapes;
}
