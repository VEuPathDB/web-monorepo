import { useCallback, useMemo } from 'react';
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
