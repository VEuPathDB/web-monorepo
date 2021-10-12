import {
  TimeDelta,
  NumberOrDateRange,
} from '@veupathdb/components/lib/types/general';
import { isTimeUnit } from '@veupathdb/components/lib/types/guards';

/**
 * Convenience function to pad an incomplete date to Jan-01 as required
 * and to add the time component (as midnight UTC/Zulu)
 */
export function padISODateTime(ISODate: string): string {
  // extend 2001 or 2001-02 to 2001-01-01 and 2001-02-01 respectively
  let fixedISODateTime = ISODate;
  while (fixedISODateTime.length === 4 || fixedISODateTime.length === 7) {
    fixedISODateTime = fixedISODateTime + '-01';
  }

  // add the time as T00:00:00 if needed
  if (fixedISODateTime.indexOf('T') < 0) {
    fixedISODateTime = fixedISODateTime + 'T00:00:00';
  }

  // add the Z for Zulu time zone
  if (!fixedISODateTime.endsWith('Z')) {
    fixedISODateTime = fixedISODateTime + 'Z';
  }
  return fixedISODateTime;
}

/**
 * Take a number or date range and if it's a date range,
 * convert min and max to full ISO format datetimes.
 */
export function fullISODateRange(
  range: NumberOrDateRange,
  valueType: 'number' | 'date'
): NumberOrDateRange {
  return valueType === 'number'
    ? range
    : {
        min: padISODateTime(range.min as string),
        max: padISODateTime(range.max as string),
      };
}

/**
 * Parse, for example, the time-based binWidth returned from the
 * back end, which originates from an R package (insert here)
 */
export function parseTimeDelta(input: string): TimeDelta {
  const splitInput = input.split(/\s+/);
  const value = splitInput.length === 2 ? Number(splitInput[0]) : 1;
  const unitRaw = splitInput.length === 2 ? splitInput[1] : splitInput[0];
  const unitSingular = unitRaw.replace(/s$/, '');
  const unitPlural = unitSingular + 's';
  const unit = isTimeUnit(unitSingular)
    ? unitSingular
    : isTimeUnit(unitPlural)
    ? unitPlural
    : 'month';
  return { value, unit };
}

/**
 * Converts an ISO datetime string to a display format.
 *
 * If the timezone is missing, it is presumed to be GMT.
 */
export function convertISOToDisplayFormat(datetime: string) {
  return new Date(padISODateTime(datetime)).toUTCString().slice(5);
}
