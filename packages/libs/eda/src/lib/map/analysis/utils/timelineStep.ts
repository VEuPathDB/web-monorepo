import { formatTimeWindowLabel } from './timeWindowLabel';

/** a `YYYY-MM-DD` date range */
export type DateRange = { start: string; end: string };

export interface StepButtonState {
  enabled: boolean;
  tooltip: string;
  /** where the window lands; only when enabled */
  range?: DateRange;
}

/**
 * The timeline's step buttons: whether each can step the window by its own
 * length, and a tooltip saying where it lands (or why it can't).
 */
export function stepButtons({
  selectedRange,
  dataRange,
  active,
}: {
  selectedRange?: DateRange;
  /** the timeline's full date range (steps stay within it) */
  dataRange?: DateRange;
  active: boolean;
}): { back: StepButtonState; forward: StepButtonState } {
  // (a switched-off timeline can't be drawn on, so say that first)
  if (!active) {
    const state = { enabled: false, tooltip: 'The timeline is switched off' };
    return { back: state, forward: state };
  }
  if (selectedRange == null) {
    const state = {
      enabled: false,
      tooltip: 'Draw a window on the timeline first',
    };
    return { back: state, forward: state };
  }

  const current: DateRange = selectedRange;
  // can the window step a whole window-length without leaving the range?
  const diff = toTime(selectedRange.end) - toTime(selectedRange.start);
  const backBlocked =
    dataRange != null &&
    toTime(toYmd(toTime(selectedRange.start) - diff)) < toTime(dataRange.start);
  const forwardBlocked =
    dataRange != null &&
    toTime(toYmd(toTime(selectedRange.end) + diff)) > toTime(dataRange.end);

  function state(
    arrow: 'left' | 'right',
    blocked: boolean,
    verb: string
  ): StepButtonState {
    if (blocked)
      return { enabled: false, tooltip: 'No more data in this direction' };
    const range = newArrowRange(current, arrow);
    return {
      enabled: true,
      tooltip: `${verb}: ${formatTimeWindowLabel(range)}`,
      range,
    };
  }

  return {
    back: state('left', backBlocked, 'Step back'),
    forward: state('right', forwardBlocked, 'Step forward'),
  };
}

function toTime(date: string): number {
  return new Date(date).getTime();
}

function toYmd(time: number): string {
  return new Date(time).toISOString().split('T')[0];
}

/** step a `YYYY-MM-DD` range by its own length, keeping leap days in step */
export function newArrowRange(
  selectedRange: DateRange,
  arrow: 'left' | 'right'
): DateRange {
  const diff =
    new Date(selectedRange.end).getTime() -
    new Date(selectedRange.start).getTime();
  const diffSign = arrow === 'right' ? diff : -diff;

  const newSelectedRange = {
    start: new Date(new Date(selectedRange.start).getTime() + diffSign)
      .toISOString()
      .split('T')[0],
    end: new Date(new Date(selectedRange.end).getTime() + diffSign)
      .toISOString()
      .split('T')[0],
  };

  // unit in milliseconds
  const deltaLeapDaysMS =
    (countLeapDays(newSelectedRange) - countLeapDays(selectedRange)) *
    (1000 * 3600 * 24);

  return {
    start: new Date(
      new Date(newSelectedRange.start).getTime() -
        (arrow === 'left' ? deltaLeapDaysMS : 0)
    )
      .toISOString()
      .split('T')[0],
    end: new Date(
      new Date(newSelectedRange.end).getTime() +
        (arrow === 'right' ? deltaLeapDaysMS : 0)
    )
      .toISOString()
      .split('T')[0],
  };
}

function isLeapYear(year: number) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

// the number of leap days within a date range
function countLeapDays(dateRange: DateRange) {
  const startDate = new Date(dateRange.start);
  const endDate = new Date(dateRange.end);
  let leapDayCount = 0;
  for (
    let year = startDate.getFullYear();
    year <= endDate.getFullYear();
    year++
  ) {
    if (isLeapYear(year)) {
      const leapDay = new Date(year, 1, 29);
      if (leapDay >= startDate && leapDay <= endDate) leapDayCount++;
    }
  }
  return leapDayCount;
}
