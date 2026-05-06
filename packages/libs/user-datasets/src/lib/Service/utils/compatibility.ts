import WdkService from '@veupathdb/wdk-client/lib/Service/WdkService';
import { ActionThunk } from "@veupathdb/wdk-client/lib/Core/WdkMiddleware";
import { EpicDependencies } from "@veupathdb/wdk-client/lib/Core/Store";

import { VdiService } from "../VdiService";

const vdiCompatibilityFlag = '__IS_VDI_COMPATIBLE_SERVICE';

export interface VdiCompatibleWdkService extends WdkService {
  readonly [vdiCompatibilityFlag]: boolean;
  readonly vdi: VdiService;
}

export type ServiceConfig = {
  vdiServiceUrl: string;
};

export function wrapWdkService(
  serviceConfig: ServiceConfig,
  wdkService: WdkService
): VdiCompatibleWdkService {
  const vdiService = new VdiService(
    { baseUrl: serviceConfig.vdiServiceUrl },
    wdkService
  );

  return {
    [vdiCompatibilityFlag]: true,
    ...wdkService,
    vdi: vdiService,
  };
}

export function isVdiCompatibleWdkService(
  wdkService: WdkService
): wdkService is VdiCompatibleWdkService {
  return vdiCompatibilityFlag in wdkService;
}

export function assertIsVdiCompatibleWdkService(
  wdkService: WdkService
): asserts wdkService is VdiCompatibleWdkService {
  if (!isVdiCompatibleWdkService(wdkService)) {
    throw new Error(MISCONFIGURED_VDI_SERVICE_ERROR_MESSAGE);
  }
}

export interface VdiCompatibleEpicDependencies extends EpicDependencies {
  wdkService: VdiCompatibleWdkService;
}

export function validateVdiCompatibleThunk<T>(
  thunk: ActionThunk<T, VdiCompatibleEpicDependencies>
): ActionThunk<T, VdiCompatibleEpicDependencies> {
  return (wdkDependencies) => {
    assertIsVdiCompatibleWdkService(wdkDependencies.wdkService);

    return thunk(wdkDependencies);
  };
}

export const MISCONFIGURED_VDI_SERVICE_ERROR_MESSAGE =
  'In order to use this feature, a VdiCompatibleWdkService must be configured.';
