import { stripHTML } from './DomUtils';

/**
 * Determines if an attribute value is short enough to display inline.
 * Short attributes have less than 150 characters of text content.
 *
 * @param value - The attribute value from record.attributes[attributeName]
 * @returns true if the attribute is short (< 150 characters), false otherwise
 */
export function isShortAttribute(
  value: string | { displayText?: string; url: string } | null | undefined,
): boolean {
  const textLength =
    value == null
      ? -1
      : typeof value === 'string'
        ? stripHTML(value).length
        : value.displayText != null
          ? stripHTML(value.displayText).length
          : value.url.length;

  return textLength < 150;
}
