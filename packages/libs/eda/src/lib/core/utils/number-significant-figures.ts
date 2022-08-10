// util to return a number with specific decimal points
export function numberSignificantFigures(
  value: number,
  precision: number
): number {
  return Number.isInteger(value) ? value : Number(value.toPrecision(precision));
}

// Round to specified significant digits
// but if the result is less than the input number, round up towards infinity
//
// Note that this DOES NOT return the unchanged integer input like numberSignificantFigures does.
// Not sure why we did that!
export function numberSignificantFiguresRoundUp(
  value: number,
  precision: number
): number {
  const newValue = Number(value.toPrecision(precision));
  if (newValue < value) {
    const epsilon = signifDigitEpsilon(value, precision);
    const adjusted = newValue + epsilon;
    // round again just in case
    console.log(
      `input ${value} output1 ${Number(
        adjusted.toPrecision(precision)
      )} epsilon ${epsilon}`
    );
    return Number(adjusted.toPrecision(precision));
  }
  console.log(`input ${value} output2 ${newValue}`);
  return newValue;
}

// Round to specified significant digits
// but if the result is greater than the input number, round down towards negative infinity
//
// Note that this DOES NOT return the unchanged integer input like numberSignificantFigures does.
// Not sure why we did that!
export function numberSignificantFiguresRoundDown(
  value: number,
  precision: number
): number {
  const newValue = Number(value.toPrecision(precision));
  if (newValue > value) {
    const epsilon = signifDigitEpsilon(value, precision);
    const adjusted = newValue - epsilon;
    // round again just in case
    return Number(adjusted.toPrecision(precision));
  }
  return newValue;
}

/**
 * signifDigitEpsilon
 *
 * ported from R
 * https://github.com/VEuPathDB/plot.data/blob/3f46dea18f876e5da159ad811b381c094ffb55ad/R/utils.R#L427
 *
 * For any number, return an absolute delta (numeric) at the last
 * significant digit in the number, using the number of digits specified
 *
 * e.g. assuming 3 significant digits
 *
 * 1.23 -> 0.01
 * 11.0 -> 0.1
 * 12.3 -> 0.1
 * 101000 -> 1000
 * 1.20e-05 -> 0.01e-05 == 1.0e-07
 * 0.0123e-05 -> 0.0001e-05 == 1.0e-09
 * -2.34e-02 -> 0.01e-02 == 1.0e-04
 *
 * TO DO: Ought to add some tests for the above...
 **/
function signifDigitEpsilon(x: number, digits: number): number {
  // JavaScript adds trailing zeroes by default
  const rounded = x.toPrecision(digits);

  // split into vector of single characters
  const characters = rounded.split('');

  const result: string[] = [];

  let seenSignificant = false;
  let significantCount = 0;
  // walk through string, looking for first non-zero, non decimal point character
  for (const c in characters) {
    if (c !== '0' && c !== '.') {
      seenSignificant = true;
    }
    if (c === '.') {
      result.push(c);
    } else if (seenSignificant) {
      significantCount++;
      console.log(significantCount);
      if (significantCount < digits - 1) {
        result.push('0');
      } else if (significantCount === digits - 1) {
        result.push('1');
      } else {
        // we're out of the significant digits
        // we must be in the exponent part (if present) or in trailing zeroes (e.g. in 101000 example)
        //  so just copy it over
        result.push(c);
      }
    } else {
      // mask all but the last significant figures with zero
      result.push('0');
    }
  }
  console.log(result);
  return Number(result.join(''));
}
