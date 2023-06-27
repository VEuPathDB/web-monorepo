import { DefaultOverlayConfigProps } from './defaultOverlayConfig';

type CategoricalValuesProps = Omit<
  DefaultOverlayConfigProps,
  'dataClient' | 'binningMethod'
>;

export async function getCategoricalValues({
  overlayEntity,
  subsettingClient,
  studyId,
  overlayVariable,
  filters,
}: CategoricalValuesProps) {
  if (overlayEntity && overlayVariable) {
    /**
     * The goal of this function is to return all possible values and a count for each value when a categorical variable is selected. This is acheived by:
     *  1. Get all the values and counts by applying no filters to the distribution request
     *  2. If no filters are applied, we can just return unfilteredValues (the processed response) from this function
     *  3. If filters are applied, we send a new request to get the filtered counts a convert it into filteredValues. Then, we
     *      1. map over unfilteredValues while checking against the filteredValues data
     *      2. if the data exists on filteredValues, we'll use its count; otherwise, we assign it a count of 0
     *      3. return the mapped unfilteredValues, which should include a count for all values now (even if 0)
     */
    const unfilteredDistributionResponse =
      await subsettingClient.getDistribution(
        studyId,
        overlayEntity.id,
        overlayVariable.id,
        {
          valueSpec: 'count',
          filters: [],
        }
      );
    const unfilteredValues = unfilteredDistributionResponse.histogram.map(
      (bin) => ({ label: bin.binLabel, count: bin.value })
    );

    if (filters) {
      const filteredDistributionResponse =
        await subsettingClient.getDistribution(
          studyId,
          overlayEntity.id,
          overlayVariable.id,
          {
            valueSpec: 'count',
            filters,
          }
        );
      const filteredValues = filteredDistributionResponse.histogram.map(
        (bin) => ({ label: bin.binLabel, count: bin.value })
      );
      const filteredSet = new Set(filteredValues.map((v) => v.label));
      return unfilteredValues.map((uv) => {
        if (filteredSet.has(uv.label)) {
          // NOTE: to please TS, this falls back to an empty count although .find() should
          // always return a match in this condition
          return (
            filteredValues.find((fv) => fv.label === uv.label) ?? {
              ...uv,
              count: 0,
            }
          );
        } else {
          return { ...uv, count: 0 };
        }
      });
    } else {
      return unfilteredValues;
    }
  }
}
