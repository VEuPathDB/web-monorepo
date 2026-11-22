export const TIMELINE_MIN_WIDTH = 200;
export const TIMELINE_MAX_WIDTH = 520;
/** the bar's horizontal padding, both sides together */
const BAR_PADDING = 32;
/**
 * what the rest of an inline row needs beside the timeline: the Filters
 * button (~115), a little room for chips or "+N more" (~80), the pink tag
 * (at most 130), the count (~150), the (?) (26), three dividers and the
 * row's gaps (~100)
 */
export const INLINE_RESERVE = 600;
/** below this bar width the timeline gets a row of its own */
export const TIMELINE_BELOW_BREAKPOINT =
  BAR_PADDING + INLINE_RESERVE + TIMELINE_MIN_WIDTH;

export interface TimelineLayout {
  placement: 'inline' | 'below';
  width: number;
}

/**
 * Where the timeline goes in the filter bar, and how wide it is: 40% of the
 * bar (200-520px), but never so wide that the rest of the row can't fit. It
 * depends only on the bar's width - never on the filter chips, the tag or
 * the count - so nothing in the bar ever redraws the timeline.
 */
export function timelineLayout(barWidth: number): TimelineLayout {
  if (barWidth < TIMELINE_BELOW_BREAKPOINT)
    return { placement: 'below', width: barWidth - BAR_PADDING };
  return {
    placement: 'inline',
    width: Math.min(
      TIMELINE_MAX_WIDTH,
      barWidth - BAR_PADDING - INLINE_RESERVE,
      Math.max(TIMELINE_MIN_WIDTH, Math.round(0.4 * barWidth))
    ),
  };
}

/**
 * How many chips (in order) fit in `available` px. When they don't all fit,
 * room is kept for the "+N more" button. Zero-width chips (filters whose
 * chip renders nothing) take no space and no gap.
 */
export function visibleChipCount(
  chipWidths: number[],
  available: number,
  moreButtonWidth: number,
  gap: number
): number {
  // running width of the first k chips, gaps between them included
  const widths: number[] = [0];
  for (const width of chipWidths) {
    const previous = widths[widths.length - 1];
    widths.push(
      width === 0 ? previous : previous + (previous > 0 ? gap : 0) + width
    );
  }
  if (widths[chipWidths.length] <= available) return chipWidths.length;
  for (let k = chipWidths.length - 1; k > 0; k--) {
    const used = widths[k];
    if (used + (used > 0 ? gap : 0) + moreButtonWidth <= available) return k;
  }
  return 0;
}
