import { TimeDelta } from '@veupathdb/components/lib/types/general';
import { isTimeUnit } from '@veupathdb/components/lib/types/guards';

/**
 * Convenience function to get around issue with Firefox new Date() not being able to convert
 * 2001Z or 2001-01-01Z
 */
export function ISODateStringToZuluDate(ISODate: string): Date {
  // extend 2001 or 2001-02 to 2001-01-01 and 2001-02-01 respectively
  let fixedISODate = ISODate;
  while (fixedISODate.length === 4 || fixedISODate.length === 7) {
    fixedISODate = fixedISODate + '-01';
  }

  // add the time as T00:00.000 if needed
  if (fixedISODate.indexOf('T') < 0) {
    fixedISODate = fixedISODate + 'T00:00';
  }

  // add the Z for Zulu time zone
  if (!fixedISODate.endsWith('Z')) {
    fixedISODate = fixedISODate + 'Z';
  }
  return new Date(fixedISODate);
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
  return [value, unit];
}
