import { useState, useEffect } from 'react';
import { LegendItemsProps } from '@veupathdb/components/lib/components/plotControls/PlotLegend';
import { PromiseHookState } from './promise';

/**
 * A custom hook to preserve the status of the checked legend items
 */

export function useCheckedLegendItemsStatus<T>(
  data: PromiseHookState<T>,
  legendItems: LegendItemsProps[],
  onCheckedLegendItemsChange: (checkedLegendItems: string[]) => void,
  vizConfigCheckedLegendItems: string[] | undefined
): void {
  // set this useState to determine whether a new checkedLegendItems should be made
  const [newLegendList, setNewLegendList] = useState<boolean>(false);

  // run once when rendering and check if vizConfig.checkedLegendItmes is defined
  // this will handle the case of pre-existing plot
  useEffect(() => {
    if (vizConfigCheckedLegendItems == null) {
      // vizConfig.checkedLegendItems is undefined thus a new legend list needs to be made in the below useEffect()
      setNewLegendList(true);
    }
  }, []);

  // check whether new legend list is required. this will handle the cases of new Viz and changing variables within the Viz
  useEffect(() => {
    // separate data.value and newLegendList conditions so that newLegendList is not updated before executing onCheckedLegendItemsChange
    if (data.value != null) {
      if (newLegendList)
        // set checked legend items with new legend list
        onCheckedLegendItemsChange(legendItems.map((item) => item.label));
      // this handles the case after re-entering the plot from thumbnail, subsetting, etc.
      else setNewLegendList(true);
    }
  }, [data, legendItems]);
}
