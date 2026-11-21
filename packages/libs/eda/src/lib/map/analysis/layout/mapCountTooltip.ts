/**
 * The filter bar count's tooltip: which records the count includes. Like the
 * pre-redesign map header, it lists the time window and the marker variable
 * only when they apply.
 */
export function mapCountTooltip({
  entityName,
  timeWindow,
  markerVariableName,
}: {
  /** plural display name of the location entity */
  entityName: string;
  timeWindow?: { start: string; end: string; variableName: string };
  markerVariableName?: string;
}): string {
  const reasons = ['satisfy all your filters'];
  if (timeWindow)
    reasons.push(
      `are within the timeline window (${timeWindow.variableName}, ${timeWindow.start} to ${timeWindow.end})`
    );
  if (markerVariableName)
    reasons.push(
      `have data for ${markerVariableName} (and the chosen values, if the markers are custom-configured)`
    );
  return [
    `${entityName} that:`,
    ...reasons.map((reason) => `• ${reason}`),
    `out of all ${entityName} in the study`,
  ].join('\n');
}
