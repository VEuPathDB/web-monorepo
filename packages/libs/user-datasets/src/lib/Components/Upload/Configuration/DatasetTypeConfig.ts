import { ReactNode } from 'react';
import { PluginDataType, VdiPluginConfig } from '../../../Service';
import { stringifyDataType } from './data-types';

export interface ClientDatasetTypeConfig {
  /**
   * Data type display name override.  If unset, the `category` value from the
   * VDI service's configuration will be used.
   */
  displayName?: string;

  /**
   * Internal data type name.
   *
   * Used to match the client data type to a data type configured with the VDI
   * service.
   */
  name: string;

  /**
   * Data type version.
   *
   * Used to match the client data type to a data type configured with the VDI
   * service.
   *
   * Data types with matching identifiers, but differing versions are considered
   * distinct data types.
   */
  version: string;

  /**
   * Description of the data type that will be used in datatype selection menus.
   */
  description: ReactNode;
}

export interface DatasetTypeConfig extends ClientDatasetTypeConfig {
  /**
   * VDI service's configuration for the data type.
   */
  vdiConfig: PluginDataType;

  /**
   * Configuration of the VDI service plugin that handles this data type.
   */
  vdiPlugin: VdiPluginConfig;
}

export function promoteTypeConfig(
  clientDataType: ClientDatasetTypeConfig,
  plugins: readonly VdiPluginConfig[]
): DatasetTypeConfig | undefined {
  const { name: clientTypeName, version: clientTypeVersion } = clientDataType;

  for (const plugin of plugins) {
    for (const vdiDataType of plugin.dataTypes) {
      if (
        clientTypeName === vdiDataType.name &&
        clientTypeVersion === vdiDataType.version
      ) {
        return { ...clientDataType, vdiConfig: vdiDataType, vdiPlugin: plugin };
      }
    }
  }

  // no matching data type found!
  return undefined;
}

export function filterAvailableDataTypes(
  clientTypes: readonly ClientDatasetTypeConfig[],
  plugins: readonly VdiPluginConfig[]
): ClientDatasetTypeConfig[] {
  const serviceTypes = new Set<string>();

  for (const plugin of plugins) {
    for (const dt of plugin.dataTypes) {
      serviceTypes.add(stringifyDataType(dt));
    }
  }

  return clientTypes.filter((cdt) => serviceTypes.has(stringifyDataType(cdt)));
}
