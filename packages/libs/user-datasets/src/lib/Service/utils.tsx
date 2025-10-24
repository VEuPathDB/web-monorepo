import { VDIServiceClient } from "./api-new";
import { useWdkService } from "@veupathdb/wdk-client/lib/Hooks/WdkServiceHook";
import { toVdiCompatibleWdkService } from "./index";

export function useVDI(): VDIServiceClient {
  return useWdkService(async wdk => toVdiCompatibleWdkService(wdk).vdiService)!!;
}