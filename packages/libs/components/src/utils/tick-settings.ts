import { NumberOrDateRange } from '../types/general';
import { logScaleDtick } from './logscale-dtick';

interface tickSettingsType {
  dtick: number | undefined;
  showexponent: 'all' | 'none' | 'first' | 'last' | undefined;
  exponentformat: 'none' | 'e' | 'E' | 'power' | 'SI' | 'B';
  minexponent?: number;
}

export function tickSettings(
  logScale: boolean,
  range: NumberOrDateRange | undefined,
  valueType:
    | 'string'
    | 'number'
    | 'date'
    | 'longitude'
    | 'category'
    | undefined,
  dataLength?: number
): tickSettingsType {
  const axisDtick =
    range != null && range.min != null && range.max != null && logScale
      ? logScaleDtick(range)
      : undefined;

  return {
    // tickformat is conflicted with exponentformat
    dtick: dataLength != null && dataLength === 0 ? undefined : axisDtick,
    showexponent: 'all',
    exponentformat:
      valueType === 'date' || (axisDtick != null && axisDtick < 1)
        ? 'none'
        : 'power',
    minexponent: 3,
  };
}
