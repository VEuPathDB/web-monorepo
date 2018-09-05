/**
 * Just some constants for use below
 * @public epoch : indicates the default local 'beginning of time'
 *    set to 1970 initially, following UNIX's lead
 * @public currentYear : the current calendar year
 *    also indicates the default local 'end of time' (dec 31 $currentYear)
 * @public monthNames
 *    duh, obvious
**/

interface DateObject {
  day: number;
  month: number;
  year: number;
};

interface DateRangeObject {
  start: DateObject;
  end: DateObject;
}

export const epoch: number = 1970;
export const currentYear: number = (new Date()).getFullYear();
export const monthNames: string[] = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ];

export function generateYearList (start = epoch, end = currentYear): number[] {
  let output = [];
  let cursor = start;
  while (cursor <= end) { output.push(cursor++); };
  return output;
};

export function generateMonthList (start = 1, end = 12): number[] {
  let output = [];
  let cursor = start;
  while (cursor <= end) { output.push(cursor++); }
  return output;
};

export function generateMonthNameList (start = 1, end = 12): string[] {
  let list = generateMonthList(start, end);
  return list.map(getMonthName);
};

export function getMonthName (monthNumber = 1): string {
  let monthIndex = monthNumber - 1;
  return monthNames[monthIndex];
};

export function getDaysInMonth (monthNumber = 1, year = currentYear): number {
  let analog = new Date(year, monthNumber, 0);
  return analog.getDate();
};

export function generateDayListByMonth (monthNumber = 1, year = currentYear): number[] {
  let dayCount = getDaysInMonth(monthNumber, year);
  let cursor = 1;
  let output = [];
  while (cursor <= dayCount) { output.push(cursor++); }
  return output;
};

export function formatDate (_year = currentYear, _month = 1, _day = 1): string {
  const year = _year.toString();
  const month = _month.toString();
  const day = _day.toString();
  return [
    year.length === 4 ? year : currentYear.toString(),
    month.length === 1 ? '0' + month : month,
    day.length === 1 ? '0' + day : day
  ].join('-');
};

export function formatDateObject ({ year = currentYear, month = 1, day = 1 }): string {
  return formatDate(year, month, day);
};

export function isValidDateString (dateString: string): boolean {
  if (typeof dateString !== 'string') return false;
  if (!dateString.match(/([0-9]{4,4})-([0-9]{2,2})-([0-9]{2,2})/)) return false;
  const segments: number[] = dateString.split('-').map((segment: string) => parseInt(segment));
  const [ year, month, day ] = segments;
  if (month > 12 || day > getDaysInMonth(month, year)) return false;
  return true;
};

export function isValidDateObject (dateObject: object): boolean {
  const acceptableKeys: string[] = [ 'year', 'month', 'day' ];
  return Object.entries(dateObject)
    .filter((entry: any[]) => {
      const [ key, value ] = entry;
      return acceptableKeys.includes(key) && typeof value === 'number'
    })
    .length === 3;
};

export function monthHasDay (day: number, month: number, year = currentYear): boolean {
  if (typeof day === 'undefined' || typeof month === 'undefined') return false;
  if (day <= 28) return true;
  return generateDayListByMonth(month, year).indexOf(day) >= 0;
};

export function conformDayWithinMonth (day: number, month: number, year: number): number {
  const cutoff = getDaysInMonth(month, year);
  return day < cutoff ? day : cutoff;
};

export function conformDateToBounds (targetDate: DateObject, targetBounds: DateRangeObject): DateObject {
  let { year, month, day } = targetDate;
  let { start, end } = targetBounds;

  start = isValidDateObject(start) ? start : getEpochStart();
  end = isValidDateObject(end) ? end : getEpochEnd();
  day = conformDayWithinMonth(day, month, year);

  if (year < start.year) year = start.year;
  else if (year > end.year) year = end.year;

  if (year === start.year && month < start.month) month = start.month;
  else if (year === end.year && month > end.month) month = end.month;

  if (year === start.year && month === start.month && day < start.day) day = start.day;
  else if (year === end.year && month === end.month && day > end.day) day = end.day;

  return { year, month, day };
};

export function parseDate (dateString: string): DateObject {
  if (!isValidDateString(dateString)) throw new Error('invalid date given to [parseDate()]: ' + dateString);
  let [ year, month, day ] = dateString.split('-').map(function numParse (segment: string): number { return parseInt(segment) });
  return { year, month, day };
};

/* - = - = - = - = - = - = - = - = - = - = - = - = - = - = - = - = - = - = - =
                            Next/Previous Month/Day
- = - = - = - = - = - = - = - = - = - = - = - = - = - = - = - = - = - = - = -*/

export function getEpochStart (year = epoch, month = 1, day = 1): DateObject {
  return { year, month, day };
};

export function getEpochEnd (year = currentYear, month = 12, day = 31): DateObject {
  return { year, month, day };
};

export function getPreviousMonth (monthNumber: number): number {
  return monthNumber > 1 ? --monthNumber : 12;
};

export function getNextMonth (monthNumber: number): number {
  return monthNumber < 12 ? ++monthNumber : 1;
};

export function getPreviousDay (targetDate: DateObject): DateObject {
  let { day, month, year } = targetDate;
  if (day > 1) {
    day--;
  } else {
    month = getPreviousMonth(month);
    if (month === 12) year--;
    day = getDaysInMonth(month, year);
  }
  return { day, month, year };
};

export function getPreviousDayString (dateString: string): string {
  return formatDateObject(getPreviousDay(parseDate(dateString)));
};

export function getNextDay (targetDate: DateObject): DateObject {
  let { day, month, year } = targetDate;
  let lastDay = getDaysInMonth(month, year);
  if (day < lastDay) {
    day++;
  } else {
    month = getNextMonth(month);
    if (month === 1) year++;
    day = 1;
  }
  return { day, month, year };
};

export function getNextDayString (dateString: string): string {
  return formatDateObject(getNextDay(parseDate(dateString)));
};

export function dateIsAfter (dateString: string, checkAgainstDateString: string): boolean {
  const date: DateObject = parseDate(dateString);
  const check: DateObject = parseDate(checkAgainstDateString);
  return (date.year > check.year) ||
         (date.year === check.year && date.month > check.month) ||
         (date.year === check.year && date.month === check.month && date.day > check.day);
};

export function dateIsBefore (dateString: string, checkAgainstDateString: string): boolean {
  const date: DateObject = parseDate(dateString);
  const check: DateObject = parseDate(checkAgainstDateString);
  return (date.year < check.year) ||
         (date.year === check.year && date.month < check.month) ||
         (date.year === check.year && date.month === check.month && date.day < check.day);
};
