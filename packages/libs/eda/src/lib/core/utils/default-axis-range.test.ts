import { numberDateDefaultAxisRange } from './default-axis-range';
import { NumberVariable } from '../types/study';
import { NumberRange } from '../types/general';
import { MAX_DISTRIBUTION_BINS } from '../constants';

function makeIntegerVariable(
  distributionDefaults: NumberVariable['distributionDefaults']
): NumberVariable {
  return {
    id: 'VAR_TEST',
    providerLabel: 'test',
    displayName: 'Test integer variable',
    hideFrom: [],
    type: 'integer',
    units: '',
    dataShape: 'continuous',
    distinctValuesCount: 5,
    isTemporal: false,
    isFeatured: false,
    isMergeKey: false,
    isMultiValued: false,
    distributionDefaults,
  };
}

describe('numberDateDefaultAxisRange - max bins protection', () => {
  // Real-life bug: a year-like integer variable with values 2000..2004,
  // continuous, binWidth 1. Because rangeMin (2000) !== rangeMax (2004),
  // the histogram's lower bound was set to 0, producing 2004 bins for a
  // displayRangeMin..displayRangeMax of 0..2004, exceeding the backend's
  // 2000-bin limit. https://github.com/VEuPathDB/web-monorepo (year integers)
  it('does not produce more than the max allowed bins for a large-valued integer variable', () => {
    const binWidth = 1;
    const variable = makeIntegerVariable({
      rangeMin: 2000,
      rangeMax: 2004,
      binWidth,
    });

    const range = numberDateDefaultAxisRange(
      variable,
      undefined,
      undefined,
      undefined
    ) as NumberRange;

    const binCount = (range.max - range.min) / binWidth;
    expect(binCount).toBeLessThanOrEqual(MAX_DISTRIBUTION_BINS);

    // and the range must still cover the data
    expect(range.min).toBeLessThanOrEqual(2000);
    expect(range.max).toBeGreaterThanOrEqual(2004);
  });

  it('still starts ordinary positive integer variables at zero', () => {
    const variable = makeIntegerVariable({
      rangeMin: 5,
      rangeMax: 100,
      binWidth: 1,
    });

    const range = numberDateDefaultAxisRange(
      variable,
      undefined,
      undefined,
      undefined
    ) as NumberRange;

    expect(range.min).toBe(0);
    expect(range.max).toBe(100);
  });
});
