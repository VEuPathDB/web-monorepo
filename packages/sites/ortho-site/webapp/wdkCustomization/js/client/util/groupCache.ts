const PREFIX = 'ortho/group-cache/';
const VERSION_KEY = `${PREFIX}service-version`;

// sessionStorage allows roughly 5M characters per origin and the rest of the
// site shares it, so stay well under that.
export const MAX_TOTAL_CHARS = 1_000_000;

/** Storage key for one piece of a group's cached page state. */
export const groupCacheKey = (group: string, name: string) =>
  `${PREFIX}${encodeURIComponent(group)}/${name}`;

/**
 * Call before reading a group's cached state. Throws away everything cached
 * for every group if the WDK service has restarted since it was written (the
 * same `startupTime` WDK uses to flag its own caches stale), and, if the cache
 * has outgrown its budget, everything cached for other groups.
 */
export function discardStaleGroupCache(
  serviceVersion: number,
  currentGroup: string,
  storage: Storage = window.sessionStorage
): void {
  try {
    const keys = () =>
      Array.from({ length: storage.length }, (_, i) => storage.key(i)).filter(
        (key): key is string => key != null && key.startsWith(PREFIX)
      );

    if (storage.getItem(VERSION_KEY) !== String(serviceVersion)) {
      keys().forEach((key) => storage.removeItem(key));
      storage.setItem(VERSION_KEY, String(serviceVersion));
    }

    const size = keys().reduce(
      (sum, key) => sum + key.length + (storage.getItem(key) ?? '').length,
      0
    );
    if (size > MAX_TOTAL_CHARS) {
      const own = `${PREFIX}${encodeURIComponent(currentGroup)}/`;
      keys()
        .filter((key) => key !== VERSION_KEY && !key.startsWith(own))
        .forEach((key) => storage.removeItem(key));
    }
  } catch {
    // not caching is acceptable
  }
}
