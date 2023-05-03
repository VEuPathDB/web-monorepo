import { useCallback, useMemo, useEffect, ReactNode } from 'react';
import { getOrElse } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import * as t from 'io-ts';
import { VariableDescriptor } from '../types/variable';
import useSnackbar from '@veupathdb/coreui/dist/components/notifications/useSnackbar';
import { StudyEntity } from '../types/study';
import {
  DataElementConstraintRecord,
  disabledVariablesForInput,
  filterConstraints,
  VariablesByInputName,
} from '../utils/data-element-constraints';
import { isEqual } from 'lodash';
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
 * To be used in conjunction with InputVariables.providedOptionalVariable
 *
 * Sets up a "listener" to monitor changes in providedVariableDescriptor
 * and if the existing vizConfig[inputName] variable is not null
 * (when the user has "None" selected in the radio buttons),
 * and if the new variable is compatible with the constraints, then
 * update the vizConfig[inputName] to the provided variable.
 *
 * If vizConfig[inputName] is not null and the variable does not meet the
 * constraints, then set vizConfig[inputName] to undefined (which has
 * the effect of moving the radio button to "None".
 *
 * Also enqueues a snackbar. Make sure you are in a child of a SnackbarProvider.
 *
 * Doesn't return anything!
 */
export function useProvidedOptionalVariable<ConfigType>(
  optionGetter:
    | ((config: unknown) => VariableDescriptor | undefined)
    | undefined,
  inputName: keyof ConfigType,
  providedVariableDescriptor: VariableDescriptor | undefined,
  /* storedVariableDescriptor is basically vizConfig.overlayVariable */
  storedVariableDescriptor: VariableDescriptor | undefined,
  entities: StudyEntity[],
  filters: Filter[] | undefined,
  constraints: DataElementConstraintRecord[] | undefined,
  dataElementDependencyOrder: string[][] | undefined,
  selectedVariables: VariablesByInputName,
  updateVizConfig: (newConfig: VariablesByInputName) => void,
  /* optional message to display in snackbar: ReactNode | string */
  snackbarMessage?: ReactNode | string // can't import SnackbarMessage type from notistack
): void {
  const { enqueueSnackbar } = useSnackbar();

  // watch the providedOverlayVariable and update vizConfig.overlayVariable
  // only if there is currently an overlay variable selected by the user and
  // if the new variable is compatible with variable constraints
  useEffect(() => {
    if (
      optionGetter == null ||
      storedVariableDescriptor == null ||
      isEqual(providedVariableDescriptor, storedVariableDescriptor)
    )
      return;

    if (
      disabledVariablesForInput(
        inputName as string,
        entities,
        constraints,
        dataElementDependencyOrder,
        selectedVariables
      ).find((variable) => isEqual(variable, providedVariableDescriptor))
    ) {
      if (snackbarMessage)
        enqueueSnackbar(snackbarMessage, { preventDuplicate: true });
      updateVizConfig({ [inputName]: undefined });
    } else {
      updateVizConfig({
        [inputName]: providedVariableDescriptor,
      });
    }
  }, [
    providedVariableDescriptor,
    storedVariableDescriptor,
    entities,
    constraints,
    dataElementDependencyOrder,
    selectedVariables,
    enqueueSnackbar,
    updateVizConfig,
    optionGetter,
    inputName,
    filters,
    snackbarMessage,
  ]);
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
