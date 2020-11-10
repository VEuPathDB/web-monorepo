import { useSessionBackedState } from 'wdk-client/Hooks/SessionBackedState';

export function useAnnouncementsState() {
  return useSessionBackedState(
    [] as string[],
    'eupath-Announcements',
    closedBanners => closedBanners.join(','),
    closedBannersString => closedBannersString.split(/\s*,\s*/g)
  );
}
