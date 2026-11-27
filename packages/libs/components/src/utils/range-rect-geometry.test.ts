import * as DateMath from 'date-arithmetic';
import { rangeToRectGeometry } from './range-rect-geometry';

describe('rangeToRectGeometry', () => {
  test('a vertical number range spans the x range and the whole height', () => {
    expect(
      rangeToRectGeometry({ min: 1, max: 5 }, 'vertical', 'number')
    ).toEqual({ xref: 'x', yref: 'paper', x0: 1, x1: 5, y0: 0, y1: 1 });
  });

  test('a horizontal number range spans the y range and the whole width', () => {
    expect(
      rangeToRectGeometry({ min: 1, max: 5 }, 'horizontal', 'number')
    ).toEqual({ xref: 'paper', yref: 'y', x0: 0, x1: 1, y0: 1, y1: 5 });
  });

  test('a date range reaches the end of its max day', () => {
    const max = '2020-01-31T00:00:00Z';
    const endOfDay = DateMath.add(new Date(max), 0.9999, 'day').toISOString();
    expect(
      rangeToRectGeometry(
        { min: '2020-01-01T00:00:00Z', max },
        'vertical',
        'date'
      )
    ).toEqual({
      xref: 'x',
      yref: 'paper',
      x0: '2020-01-01T00:00:00Z',
      x1: endOfDay,
      y0: 0,
      y1: 1,
    });
    expect(endOfDay.startsWith('2020-01-31T23:5')).toBe(true);
  });

  test('without a value type the range is treated as dates', () => {
    const max = '2020-01-31T00:00:00Z';
    expect(
      rangeToRectGeometry(
        { min: '2020-01-01T00:00:00Z', max },
        'vertical',
        undefined
      ).x1
    ).toBe(DateMath.add(new Date(max), 0.9999, 'day').toISOString());
  });
});
