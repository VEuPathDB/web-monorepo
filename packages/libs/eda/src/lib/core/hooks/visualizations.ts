import { useCallback, useMemo } from 'react';
import { getOrElse } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import * as t from 'io-ts';

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
