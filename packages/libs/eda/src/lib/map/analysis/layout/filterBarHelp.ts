export type FilterBarHelpKey = 'filters' | 'timeline' | 'count';

export interface FilterBarHelpSection {
  key: FilterBarHelpKey;
  /** shown on the section and on its pin in the bar */
  number: number;
}

interface CountHelpArgs {
  /** the plural location entity, e.g. "Regions" */
  entityName: string;
  /** a timeline window is drawn and switched on */
  windowApplies: boolean;
  /** the variable on the markers, when markers can be drawn */
  markerVariableName?: string;
}

/**
 * The sections of the filter bar's help panel, numbered in the order they
 * appear in the bar. The timeline's section is left out when it isn't shown.
 */
export function filterBarHelpSections({
  showTimeline,
}: CountHelpArgs & { showTimeline: boolean }): FilterBarHelpSection[] {
  const keys: FilterBarHelpKey[] = showTimeline
    ? ['filters', 'timeline', 'count']
    : ['filters', 'count'];
  return keys.map((key, i) => ({ key, number: i + 1 }));
}

/** what the count in the filter bar includes, in a sentence */
export function countHelpText({
  entityName,
  windowApplies,
  markerVariableName,
}: CountHelpArgs): string {
  // (the count is not limited to the view, nor to records with coordinates,
  // so it isn't "on the map")
  const clauses = [
    `${entityName} matching your filters`,
    ...(windowApplies ? ['inside the timeline window'] : []),
    ...(markerVariableName != null
      ? [`with data for the marker variable (${markerVariableName})`]
      : []),
    `out of all ${entityName} in the dataset`,
  ];
  return `${clauses.join(
    ', '
  )}. It counts the whole dataset, not just what's in view. Hover it for the details.`;
}
