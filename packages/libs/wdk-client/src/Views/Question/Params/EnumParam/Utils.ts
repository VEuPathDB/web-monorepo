export function countInBounds(count: number, lower: number, upper: number) {
  // Number of selected values should be within range of {min,max}SelectedCount.
  // The value of each is > 0 if configured.
  return lower > 0 && lower > count ? false
       : upper > 0 && upper < count ? false
       : true;
}