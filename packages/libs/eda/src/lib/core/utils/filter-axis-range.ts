import { Filter } from '../types/filter';
import { VariableDescriptor } from '../types/variable';

export function filterMinMax(
  filters: Filter[] | undefined,
  variable: VariableDescriptor | undefined
) {
  const minMaxArray =
    filters != null && variable != null
      ? filters
          ?.map((value) => {
            if (value.type === 'numberRange' || value.type === 'dateRange')
              return value.entityId === variable?.entityId &&
                value.variableId === variable?.variableId
                ? value
                : undefined;
          })
          .filter((data) => data != null)
      : undefined;

  return minMaxArray != null && minMaxArray.length > 0
    ? { min: minMaxArray[0]?.min, max: minMaxArray[0]?.max }
    : undefined;
}
