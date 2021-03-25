/**
 * Convenience function to get around issue with Firefox new Date() not being able to convert
 * 2001Z or 2001-01-01Z
 */
export function ISODateStringToZuluDate(ISODate: string): Date {
  // extend 2001 or 2001-02 to 2001-01-01 and 2001-02-01 respectively
  let fixedISODate = ISODate;
  while (fixedISODate.length == 4 || fixedISODate.length == 7) {
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
  console.log(`${ISODate} to ${fixedISODate}`);
  return new Date(fixedISODate);
}
