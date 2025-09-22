import { useLocalBackedState } from '@veupathdb/wdk-client/lib/Hooks/LocalBackedState';

export interface BannerDismissal {
  bannerId: string;
  timestamp: Date;
}

export function useAnnouncementsState() {
  return useLocalBackedState(
    [] as BannerDismissal[],
    'eupath-Announcements',
    // Encode: BannerDismissal[] -> string
    (dismissals) =>
      JSON.stringify(
        dismissals.map((d) => ({
          bannerId: d.bannerId,
          timestamp: d.timestamp.toISOString(),
        }))
      ),
    // Decode: string -> BannerDismissal[]
    // Old banner dismissals in Local Storage will not parse so
    // those banners will return.
    (dismissalsString) => {
      try {
        const parsed = JSON.parse(dismissalsString);
        if (!Array.isArray(parsed)) return [];

        return parsed
          .filter(
            (item) =>
              item && typeof item.bannerId === 'string' && item.timestamp
          )
          .map((item) => ({
            bannerId: item.bannerId,
            timestamp: new Date(item.timestamp),
          }))
          .filter((item) => !isNaN(item.timestamp.getTime())); // Filter invalid dates
      } catch {
        return [];
      }
    }
  );
}
