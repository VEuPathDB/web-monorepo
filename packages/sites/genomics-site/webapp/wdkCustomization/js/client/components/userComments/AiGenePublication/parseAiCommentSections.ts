export interface AiCommentSections {
  /** Text under the "Executive summary:" heading (heading itself stripped). */
  summary: string;
  /** Everything from the "Details:" heading onward (heading itself stripped). */
  details: string;
}

const EXECUTIVE_SUMMARY_HEADING = 'executive summary:';
const DETAILS_HEADING = 'details:';

/**
 * Splits an AI-generated comment into its "Executive summary:" and "Details:"
 * sections so the card can render the summary in a <summary> element and the
 * rest in an expandable <details> element.
 *
 * Detection is deliberately strict so human-written comments are never
 * reformatted:
 *  - "Executive summary:" must be the first non-empty line (case-insensitive,
 *    surrounding whitespace ignored). Requiring it first guarantees we never
 *    silently drop any preamble text.
 *  - A later standalone "Details:" line marks the boundary.
 *  - Both resulting sections must be non-empty.
 *
 * Returns null when the content doesn't match this shape; callers should then
 * render the content unchanged as plain text.
 */
export function parseAiCommentSections(
  content: string
): AiCommentSections | null {
  const lines = content.split(/\r?\n/);

  // The "Executive summary:" heading must be the first non-empty line.
  let firstNonEmpty = 0;
  while (firstNonEmpty < lines.length && lines[firstNonEmpty].trim() === '') {
    firstNonEmpty++;
  }
  if (
    firstNonEmpty >= lines.length ||
    lines[firstNonEmpty].trim().toLowerCase() !== EXECUTIVE_SUMMARY_HEADING
  ) {
    return null;
  }

  // Find the "Details:" boundary somewhere after the summary heading.
  const summaryStart = firstNonEmpty + 1;
  let detailsHeading = -1;
  for (let i = summaryStart; i < lines.length; i++) {
    if (lines[i].trim().toLowerCase() === DETAILS_HEADING) {
      detailsHeading = i;
      break;
    }
  }
  if (detailsHeading === -1) {
    return null;
  }

  const summary = lines.slice(summaryStart, detailsHeading).join('\n').trim();
  const details = lines
    .slice(detailsHeading + 1)
    .join('\n')
    .trim();

  if (summary === '' || details === '') {
    return null;
  }

  return { summary, details };
}
