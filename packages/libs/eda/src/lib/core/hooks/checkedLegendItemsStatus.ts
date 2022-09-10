import { useCallback, useEffect, useMemo } from 'react';
import { LegendItemsProps } from '@veupathdb/components/lib/components/plotControls/PlotLegend';

/**
 * A custom hook to preserve the status of the checked legend items
 */

export function useCheckedLegendItemsStatus(
  legendItems: LegendItemsProps[],
  vizConfigCheckedLegendItems: string[] | undefined
): string[] {
  const checkedLegendItems = useMemo(() => {
    return vizConfigCheckedLegendItems ?? legendItems.map((item) => item.label);
  }, [vizConfigCheckedLegendItems, legendItems]);

  return checkedLegendItems;
}

/**
 * WIP custom hook to wrap all necessary checked legend items functionality
 * into one
 */

export function useCheckedLegendItems(
  legendItems: LegendItemsProps[],
  vizConfigCheckedLegendItems: string[] | undefined,
  vocabulary: string[] | undefined,
  updateVizConfig: ({
    checkedLegendItems,
  }: {
    checkedLegendItems: string[] | undefined;
  }) => void
) {
  /**
   * Reset checkedLegendItems to all-checked (actually none checked)
   * if ANY of the checked items are NOT in the vocabulary
   * OR if ALL of the checked items ARE in the vocabulary
   *
   * TO DO: generalise this for use in other visualizations
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

  const checkedLegendItems = useMemo(() => {
    return vizConfigCheckedLegendItems ?? legendItems.map((item) => item.label);
  }, [vizConfigCheckedLegendItems, legendItems]);

  return [checkedLegendItems, setCheckedLegendItems] as const;
}
