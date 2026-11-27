import { AppState } from '../appState';

type TimeSliderConfig = NonNullable<AppState['timeSliderConfig']>;

export interface TimelineState {
  /** the timeline (and its buttons) appear in the filter bar */
  showTimeline: boolean;
  /** the window narrows the count (and shows the pink tag) */
  windowApplies: boolean;
  timeWindow?: { start: string; end: string };
}

/**
 * Whether the filter bar shows the timeline and applies its window. All of
 * it goes together, so there is never a tag (or a narrowed count) for a
 * window that can't be seen, changed or cleared: not while markers can't be
 * drawn, and not when a saved date variable no longer resolves to a date.
 */
export function timelineState({
  canDrawMarkers,
  config,
  variableIsDate,
}: {
  canDrawMarkers: boolean;
  config: TimeSliderConfig | undefined;
  /** the config's variable exists in the study and is a date variable */
  variableIsDate: boolean;
}): TimelineState {
  const showTimeline =
    canDrawMarkers && config?.variable != null && variableIsDate;
  const windowApplies =
    showTimeline && !!config?.active && config?.selectedRange != null;
  return windowApplies && config?.selectedRange
    ? { showTimeline, windowApplies, timeWindow: config.selectedRange }
    : { showTimeline, windowApplies };
}
