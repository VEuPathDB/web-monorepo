import { Feature } from '@veupathdb/compute-platform-job/src/lib/Service/ServiceTypes';
import { endpoint } from '../config';

/**
 * Parses standard 6-column BED text (chrom, chromStart, chromEnd, name,
 * score, strand) into Feature[]. Shared by any feature that resolves a WDK
 * 'bed' report into sequence-retrieval-service Feature coordinates.
 */
export function parseBedToFeatures(bedText: string): Feature[] {
  return bedText
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .map((line) => {
      const [chrom, chromStart, chromEnd, name, , strandSymbol] =
        line.split('\t');
      return {
        contig: chrom,
        start: Number(chromStart),
        end: Number(chromEnd),
        query: name,
        strand:
          strandSymbol === '+'
            ? 'POSITIVE'
            : strandSymbol === '-'
            ? 'NEGATIVE'
            : 'NONE',
      } as Feature;
    });
}

/**
 * Temporary-result paths are plain GET-able URLs relative to the WDK
 * service base (the same base the site's own WDK requests use). That base
 * comes from the site's build-time config (window.__SITE_CONFIG__), not
 * from WdkService#getConfig() — the latter's ServiceConfig has no
 * service-base-URL field.
 */
export async function fetchTemporaryResultText(
  temporaryResultPath: string
): Promise<string> {
  const response = await fetch(`${endpoint}${temporaryResultPath}`);
  return response.text();
}
