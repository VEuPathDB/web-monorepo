/**
 * The filter bar count's tooltip: which records the count includes. Like the
 * pre-redesign map header, it lists the time window and the marker variable
 * only when they apply. The count is not limited to the current view, and
 * it includes records with no coordinates (which can't be on the map); how
 * many of those there are is added when there are any.
 */
export function mapCountTooltip({
  entityName,
  timeWindow,
  markerVariableName,
  unmappedCount,
}: {
  /** plural display name of the location entity */
  entityName: string;
  timeWindow?: { start: string; end: string; variableName: string };
  markerVariableName?: string;
  /** how many of the counted records have no coordinates */
  unmappedCount?: number;
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
  reasons.push('are anywhere, not just in the current view');
  const lines = [
    `${entityName} that:`,
    ...reasons.map((reason) => `• ${reason}`),
    `out of all ${entityName} in the study`,
  ];
  if (unmappedCount != null && unmappedCount > 0)
    lines.push(
      '',
      unmappedCount === 1
        ? "1 of these has no coordinates, so isn't on the map: switch to the Dataset Explorer to see it more easily."
        : `${unmappedCount} of these have no coordinates, so aren't on the map: switch to the Dataset Explorer to see them more easily.`
    );
  return lines.join('\n');
}
