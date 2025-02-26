/**
 * Util functions for handling long tick labels
 */

export const truncateWithEllipsis = (label: string, maxLabelLength: number) => {
  return (label || '').length > maxLabelLength
    ? (label || '').substring(0, maxLabelLength - 2) + '...'
    : label;
};

export const axisTickLableEllipsis = (
  categoryOrder: string[],
  maxIndependentTickLabelLength: number
) => {
  // make array for tick label with ellipsis
  const categoryOrderEllipsis = categoryOrder.map((element) => {
    return truncateWithEllipsis(element, maxIndependentTickLabelLength);
  });

  // identify duplicate element and duplicate indices in the array
  const duplicateIndexValue = getDuplicates(categoryOrderEllipsis);

  // looping object to map data's label and label with ellipsis
  Object.entries(duplicateIndexValue).forEach((entry: any) => {
    const [key, value] = entry;
    // starting from i = 1 so that the first item is not changed
    for (let i = 1; i < (value as number[]).length; i++) {
      // add incremental space(s) for duplicates
      categoryOrderEllipsis[value[i]] =
        categoryOrderEllipsis[value[i]] + ' '.repeat(i);
    }
  });

  return categoryOrderEllipsis;
};

/**
 *  Returning an object comprised of of duplicate(s) and corresponding index array
 *    Input: an array that has duplicate elements
 *    Output: an object, e.g.,
 *      { 'duplicate element 1': [0, 1, 3], 'duplicate element 2': [5, 7], ... }
 */
const getDuplicates = (arr: string[]) => {
  const duplicates: Record<string, number[]> = {};
  for (let i = 0; i < arr.length; i++) {
    if (duplicates.hasOwnProperty(arr[i])) {
      duplicates[arr[i]].push(i);
    } else if (arr.lastIndexOf(arr[i]) !== i) {
      duplicates[arr[i]] = [i];
    }
  }
  return duplicates;
};
