const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

interface Ymd {
  year: number;
  month: number; // 1-12
  day: number;
}

function parseYmd(date: string): Ymd {
  const [year, month, day] = date.split('-').map(Number);
  return { year, month, day };
}

/**
 * A short label for a timeline window given as `YYYY-MM-DD` dates, at a
 * resolution suited to its length: years for two years or more, months for
 * two months or more, otherwise days. Parts shared by both ends are not
 * repeated (`Mar–Aug 2016`, `3–14 Mar 2016`).
 */
export function formatTimeWindowLabel(range: {
  start: string;
  end: string;
}): string {
  const s = parseYmd(range.start);
  const e = parseYmd(range.end);
  const months =
    (e.year - s.year) * 12 + (e.month - s.month) - (e.day < s.day ? 1 : 0);
  const monthName = (d: Ymd) => MONTHS[d.month - 1];

  let startText: string;
  let endText: string;
  if (months >= 24) {
    startText = String(s.year);
    endText = String(e.year);
  } else if (months >= 2) {
    endText = `${monthName(e)} ${e.year}`;
    startText = s.year === e.year ? monthName(s) : `${monthName(s)} ${s.year}`;
  } else {
    endText = `${e.day} ${monthName(e)} ${e.year}`;
    startText =
      s.year !== e.year
        ? `${s.day} ${monthName(s)} ${s.year}`
        : s.month !== e.month
        ? `${s.day} ${monthName(s)}`
        : String(s.day);
    if (range.start === range.end) return endText;
  }
  return startText === endText ? endText : `${startText}–${endText}`;
}
