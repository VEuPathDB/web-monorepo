/**
 * Removes parentheses, their contents, and surrounding whitespace.
 * For example, "Hello (world)." becomes "Hello.".
 */
export function removeParentheticals(stringWithParentheses: string): string {
  return stringWithParentheses.replace(/ *\([^)]*\) */g, '');
}

/**
 * Replace parentheticals and surrounding whitespace with a string.
 * For example, "Hello (world)" becomes "Hello{new string}".
 * Useful for replacing parentheticals within a sentence.
 */
export function replaceParentheticals(
  stringWithParentheses: string,
  newString: string
): string {
  return stringWithParentheses.replace(/ *\([^)]*\) */g, newString);
}
