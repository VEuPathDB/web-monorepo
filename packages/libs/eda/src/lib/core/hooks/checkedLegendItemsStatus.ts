import { useMemo } from 'react';
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
