import { useSessionBackedState } from '@veupathdb/wdk-client/lib/Hooks/SessionBackedState';

export function useAnnouncementsState() {
  return useSessionBackedState(
    [] as string[],
    'eupath-Announcements',
    (closedBanners) => closedBanners.join(','),
    (closedBannersString) => closedBannersString.split(/\s*,\s*/g)
  );
}
