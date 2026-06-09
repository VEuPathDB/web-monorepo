/**
 * The maximum number of bins the backend will produce for a single
 * `distribution` request. Exceeding it yields a bad-request response:
 * "Variable ... Maximum number of allowed bins (2000) exceeded."
 *
 * Front-end code that computes histogram ranges/bin widths must keep
 * `(rangeMax - rangeMin) / binWidth` at or below this limit.
 */
export const MAX_DISTRIBUTION_BINS = 2000;
