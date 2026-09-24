import { useCallback, useEffect, useMemo } from 'react';
import { getOrElse } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import * as t from 'io-ts';
import { VariableDescriptor } from '../types/variable';
import { StudyEntity } from '../types/study';
import {
  DataElementConstraintRecord,
  filterConstraints,
  VariablesByInputName,
} from '../utils/data-element-constraints';
import { ColorPaletteAddon } from '@veupathdb/components/lib/types/plots';
import { Filter } from '../types/filter';

/**
 * Decodes config from back end or uses default config if there's an error (including no config at all)
 *
 * @param configData - raw JSON response from back end
 * @param configDecoder - io-ts decoder object
 * @param createDefaultConfig - function to create default config js object
 * @param updateConfiguration - callback to set/update entire configuration
 *
 * @return vizConfig - the configuration
 * @return updateVizConfig - partial update function
 */
export function useVizConfig<ConfigType>(
  configData: unknown,
  configDecoder: t.Type<ConfigType, unknown, unknown>,
  createDefaultConfig: () => ConfigType,
  updateConfiguration: (newConfig: ConfigType) => void
): [
  vizConfig: ConfigType,
  updateVizConfig: (newConfig: Partial<ConfigType>) => void
] {
  const vizConfig = useMemo(() => {
    return pipe(
      configDecoder.decode(configData),
      getOrElse((): ConfigType => createDefaultConfig())
    );
  }, [configDecoder, configData, createDefaultConfig]);

  const updateVizConfig = useCallback(
    (newConfig: Partial<ConfigType>) => {
      updateConfiguration({ ...vizConfig, ...newConfig });
    },
    [updateConfiguration, vizConfig]
  );

  return [vizConfig, updateVizConfig];
}

/**
 * Returns a factory for making simple config-change handlers.
 *
 * A handler made by the factory sets `key` in the viz config to the value it
 * receives. Any dependent config that must be cleared at the same time (for
 * example a custom axis range that no longer applies when the plot mode
 * changes) is passed as `resets` and merged into the same config update.
 * `onUpdate` runs after the update, for related side effects such as
 * clearing a truncation warning.
 */
export function useConfigChangeHandlerFactory<ConfigType>(
  updateVizConfig: (newConfig: Partial<ConfigType>) => void
) {
  return useCallback(
    <ValueType,>(
        key: keyof ConfigType,
        resets?: Partial<ConfigType>,
        onUpdate?: () => void
      ) =>
      (newValue?: ValueType) => {
        updateVizConfig({
          [key]: newValue,
          ...resets,
        } as Partial<ConfigType>);
        onUpdate?.();
      },
    [updateVizConfig]
  );
}

export const axisRangeTruncationWarning =
  'Data may have been truncated by range selection, as indicated by the yellow shading';

/**
 * Sets the axis-truncation warning message whenever either truncation flag
 * is set. If `clearWhenNotTruncated` is passed, the warning is also cleared
 * when neither flag is set (e.g. after an input variable change).
 */
export function useAxisTruncationWarningEffect(
  isMinTruncated: boolean | undefined,
  isMaxTruncated: boolean | undefined,
  setWarning: (warning: string) => void,
  clearWhenNotTruncated: boolean = false
) {
  useEffect(() => {
    if (isMinTruncated || isMaxTruncated) {
      setWarning(axisRangeTruncationWarning);
    } else if (clearWhenNotTruncated) {
      setWarning('');
    }
  }, [isMinTruncated, isMaxTruncated, setWarning, clearWhenNotTruncated]);
}

/**
 * simple memo hook for flattenedConstraints, used in several places
 */

export function useFilteredConstraints(
  dataElementConstraints: DataElementConstraintRecord[] | undefined,
  selectedVariables: VariablesByInputName,
  entities: StudyEntity[],
  filters: Filter[] | undefined,
  selectedVarReference: string
) {
  return useMemo(
    () =>
      dataElementConstraints &&
      filterConstraints(
        selectedVariables,
        entities,
        dataElementConstraints,
        selectedVarReference
      ),
    [dataElementConstraints, selectedVariables, entities, selectedVarReference]
  );
}

/**
 * Simple hook to create the appropriate PlotlyPlotProps to make the plot markers grey
 * when there's an externally provided overlay variable that is currently not enabled
 * as an overlay.
 */

export function useNeutralPaletteProps(
  overlayVariableDescriptor: VariableDescriptor | undefined,
  providedOverlayVariableDescriptor: VariableDescriptor | undefined
): ColorPaletteAddon {
  return useMemo(
    () =>
      overlayVariableDescriptor == null &&
      providedOverlayVariableDescriptor != null
        ? { colorPalette: Array(8).fill('#333') }
        : {},
    [overlayVariableDescriptor, providedOverlayVariableDescriptor]
  );
}
