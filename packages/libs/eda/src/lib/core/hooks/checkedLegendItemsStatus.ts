import { useCallback, useEffect, useMemo } from 'react';
import { LegendItemsProps } from '@veupathdb/components/lib/components/plotControls/PlotListLegend';

/**
 * A custom hook to preserve the status of checked legend items
 */
export function useCheckedLegendItems(
  legendItems: LegendItemsProps[],
  vizConfigCheckedLegendItems: string[] | undefined,
  updateVizConfig: ({
    checkedLegendItems,
  }: {
    checkedLegendItems: string[] | undefined;
  }) => void,
  vocabulary?: string[] | undefined
) {
  /**
   * Reset checkedLegendItems to all-checked (actually none checked)
   * if ANY of the checked items are NOT in the vocabulary
   * OR if ALL of the checked items ARE in the vocabulary. Mainly useful
   * for the map visualizations where, for high-cardinality variables,
   * the vocabulary changes, depending on the current viewport.
   * (The vocabulary is the 7 most common categories + 1 "other".)
   * For other visualizations, when the vocabulary is constant/unchanging
   * the useEffect won't do anything other than waste a few CPU cycles.
   */
  useEffect(() => {
    if (vizConfigCheckedLegendItems == null || vocabulary == null) return;

    if (
      vizConfigCheckedLegendItems.some(
        (label) => vocabulary.findIndex((vocab) => vocab === label) === -1
      ) ||
      vizConfigCheckedLegendItems.length === vocabulary.length
    )
      updateVizConfig({ checkedLegendItems: undefined });
  }, [vocabulary, vizConfigCheckedLegendItems, updateVizConfig]);

  const setCheckedLegendItems = useCallback(
    (newCheckedItems: string[]) => {
      if (newCheckedItems != null)
        updateVizConfig({ checkedLegendItems: newCheckedItems });
    },
    [updateVizConfig]
  );

  /**
   * If no items are checked or unchecked, return
   */
  const checkedLegendItems = useMemo(() => {
    return vizConfigCheckedLegendItems ?? legendItems.map((item) => item.label);
  }, [vizConfigCheckedLegendItems, legendItems]);

  return [checkedLegendItems, setCheckedLegendItems] as const;
}
