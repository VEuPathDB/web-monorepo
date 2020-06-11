// change this to have more/less bands
const BAND_COUNT = 4;

// 13 colors used for 4-band domain coloring
const COLORS = [
  "rgb(71, 145, 213)",  // dark blue
  "rgb(193, 235, 248)", // light blue
  "orange",
  "rgb(235, 235, 0)",  // yellow
  "black",
  "rgb(190, 190, 190)", // grey
  "rgb(255, 192, 203)", // light red
  "rgb(223, 42, 42)",   // dark red
  "rgb(144, 238, 144)", // light green
  "rgb(0, 145, 0)",     // dark green
  "rgb(216, 87, 216)",  // purple
  "rgb(206, 169, 73)",  // brown
  "white"
];

// COLORS is a curated list of colors. Four colors are combined based on
// the pfam ID (see below) to create a 4-band coloring. The number 4 was
// chosen with the idea that the number of pfam domains would not surpass
// 13^4 (28,561) for quite some time. If it does, then untouched, this
// will scale to 5 bands (where appropriate). This will also scale if
// additional colors are added.
//
// The pfam ID is of the form "PF#####" where the numbers are sequential.
// We will slice out the numeric part of the ID and compute its elements
// in base {COLORS.length}.
//
// Number.toString will do this with a numeric argument. The values are 0-indexed.
// For values larger than 9, lowercase alpha characters are used beginning
// with "a".
//
// Likewise, parseInt will convert a String to a Number in the given radix.
export function assignColors(pfamId: string) {
  // Parse the numeric part of the Pfam ID as an integer and get its
  // elements in base {COLORS.length}
  const terms = parseInt(pfamId.slice(2), 10).toString(COLORS.length);

  // Pad with zeros so we can get the number of colors needed
  const paddedTerms = terms.padStart(BAND_COUNT, '0');

  // Transform each term into a color
  return [...paddedTerms].map(
    term => COLORS[parseInt(term, COLORS.length)]
  );
}
