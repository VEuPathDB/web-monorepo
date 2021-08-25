import { AxisTruncationConfig } from '../types/plots';
import { NumberOrDate, NumberOrDateRange, NumberRange } from '../types/general';
import { extendedDependentAxisRangeType } from '../utils/truncation-layout-shapes';

//DKDK A function to generate truncated dependent axis layout range
export function truncatedDependentAxisLayoutRange(
  axisTruncationConfig?: AxisTruncationConfig,
  dataDependentAxisRange?: NumberOrDateRange,
  extendedDependentAxisRange?: extendedDependentAxisRangeType,
  dependentAxisLogScale?: boolean
) {
  const truncatedYAxisLayoutRange =
    axisTruncationConfig?.dependentAxis?.min &&
    axisTruncationConfig?.dependentAxis.max
      ? [
          extendedDependentAxisRange?.min,
          extendedDependentAxisRange?.max,
        ].map((val) =>
          dependentAxisLogScale && val != null
            ? val < 0
              ? 0
              : Math.log10(val as number)
            : val
        )
      : !axisTruncationConfig?.dependentAxis?.min &&
        axisTruncationConfig?.dependentAxis?.max
      ? [
          dataDependentAxisRange?.min,
          extendedDependentAxisRange?.max,
        ].map((val) =>
          dependentAxisLogScale && val != null
            ? val < 0
              ? 0
              : Math.log10(val as number)
            : val
        )
      : axisTruncationConfig?.dependentAxis?.min &&
        !axisTruncationConfig?.dependentAxis.max
      ? [
          extendedDependentAxisRange?.min,
          dataDependentAxisRange?.max,
        ].map((val) =>
          dependentAxisLogScale && val != null
            ? val < 0
              ? 0
              : Math.log10(val as number)
            : val
        )
      : [dataDependentAxisRange?.min, dataDependentAxisRange?.max].map((val) =>
          dependentAxisLogScale && val != null
            ? val < 0
              ? 0
              : Math.log10(val as number)
            : val
        );

  return truncatedYAxisLayoutRange;
}
