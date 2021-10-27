import { defaults } from 'plotly.js/src/components/color/attributes';

/** A generator function for the default plotly.js colors.
 *
 *  Usage:
 *    const defaultColorIter = DefaultColorGen();  // Do once
 *    nextColor = defaultColorIter.next().value;   // Repeat
 *
 * DEPRECATED - but might be useful if we need an iterator for the colorPalette
 * (see ColorPaletteDefault in addOns.ts)
 */
export default function* defaultColorGen() {
  let myDefaults = Array.from(defaults);

  while (true) {
    let nextColor = myDefaults.shift() as string;
    myDefaults.push(nextColor);
    yield nextColor;
  }
}
