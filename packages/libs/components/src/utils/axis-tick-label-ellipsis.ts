/**
 * A util functions for handling long tick labels
 */

export const axisTickLableEllipsis = (
  categoryOrder: string[],
  maxIndependentTickLabelLength: number
) => {
  // make array for tick label with ellipsis
  const categoryOrderEllipsis = categoryOrder.map((element) => {
    return (element || '').length > maxIndependentTickLabelLength
      ? (element || '').substring(0, maxIndependentTickLabelLength) + '...'
      : element;
  });

  // identify duplicate element and duplicate indices in the array
  const duplicateIndexValue = getDuplicates(categoryOrderEllipsis);

  // looping object to map data's label and label with ellipsis
  Object.entries(duplicateIndexValue).forEach((entry: any) => {
    const [key, value] = entry;
    // add space for duplicates
    let addDot = ' ';
    let multiStr = '';
    // starting from i = 1 so that the first item is not changed
    for (let i = 1; i < (value as number[]).length; i++) {
      multiStr += addDot;
      categoryOrderEllipsis[value[i]] =
        categoryOrderEllipsis[value[i]] + multiStr;
    }
  });

  return categoryOrderEllipsis;
};

// A function to return object comprised of duplicates and indices
const getDuplicates = (arr: string[]) => {
  var duplicates: any = {};
  for (var i = 0; i < arr.length; i++) {
    if (duplicates.hasOwnProperty(arr[i])) {
      duplicates[arr[i]].push(i);
    } else if (arr.lastIndexOf(arr[i]) !== i) {
      duplicates[arr[i]] = [i];
    }
  }
  return duplicates;
};
