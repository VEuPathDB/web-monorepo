import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';

export type ProjectUrls = Record<string, string>;

export function useProjectUrls() {
  return useWdkService(async (wdkService) => {
    const config = await wdkService.getConfig();
    const projectUrls = ((config as any).projectUrls || {}) as ProjectUrls;
    return projectUrls;
  }, []);
}

export type OrganismToProject = Record<string, string>;

export function useOrganismToProject() {
  return useWdkService(async (wdkService) => {
    const config = await wdkService.getConfig();
    const organismToProject = ((config as any).organismToProject ||
      {}) as OrganismToProject;
    return organismToProject;
  }, []);
}
