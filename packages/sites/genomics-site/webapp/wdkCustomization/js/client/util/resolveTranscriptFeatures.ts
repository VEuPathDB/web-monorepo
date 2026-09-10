import { WdkService } from '@veupathdb/wdk-client/lib/Core';
// compute-platform-job has no package-root entry point (no `main`/`exports`,
// no built `lib/`) as of this task — deep-import the source file directly,
// the same way web-common deep-imports into eda's and user-datasets' src/lib.
import { Feature } from '@veupathdb/compute-platform-job/src/lib/Service/ServiceTypes';

import { endpoint } from '@veupathdb/web-common/lib/config';

const TRANSCRIPT_ID_LIST_SEARCH = 'GeneByLocusTag';
const TRANSCRIPT_ID_PARAM = 'ds_gene_ids';

interface FlankingOffsets {
  upstream: number;
  downstream: number;
}

/**
 * Resolves a plain list of transcript IDs to Feature[] via the existing
 * GeneByLocusTag search's 'bed' report. Has no notion of where the IDs
 * came from — any transcript-ID-producing UI can call this.
 *
 * bedReportType selects the report's own `type` field (the backend's
 * SequenceType enum — e.g. `genomic`, `protein`, `spliced_genomic`) so the
 * returned Feature[]'s `contig` values come from the right reference index
 * (a protein alignment submitted against genomic contigs fails server-side
 * with "Contig not found in the index"). `spliced_genomic` (CDS) also
 * requires the report's own `splicedGenomic: 'cds'` field; it's sent
 * unconditionally (as it already was before bedReportType existed) rather
 * than only for CDS, since it was never confirmed to matter for the other
 * two types.
 *
 * flankingOffsets carries the old CGI form's upstream/downstream nt inputs
 * (only meaningful for genomic sequence type) straight into the report's
 * own upstreamOffset/downstreamOffset fields, confirmed to exist on this
 * report's reportConfig.
 */
export async function resolveTranscriptFeatures(
  wdkService: WdkService,
  transcriptIds: string[],
  bedReportType: 'genomic' | 'protein' | 'spliced_genomic' = 'genomic',
  flankingOffsets: FlankingOffsets = { upstream: 0, downstream: 0 }
): Promise<Feature[]> {
  // ds_gene_ids is an input-dataset param: the search only accepts a
  // dataset ID, not a raw list of transcript IDs, so the IDs must be
  // uploaded first via the datasets endpoint.
  const datasetId = await wdkService.createDataset({
    sourceType: 'idList',
    sourceContent: { ids: transcriptIds },
  });

  const temporaryResultPath = await wdkService.getTemporaryResultPath(
    {
      searchName: TRANSCRIPT_ID_LIST_SEARCH,
      searchConfig: {
        parameters: {
          [TRANSCRIPT_ID_PARAM]: String(datasetId),
        },
      },
    },
    'bed',
    {
      attachmentType: 'plain',
      deflineType: 'full',
      deflineFields: ['gene_id'],
      sequenceFormat: 'fixed_width',
      basesPerLine: 60,
      type: bedReportType,
      reverseAndComplement: false,
      upstreamAnchor: 'Start',
      upstreamSign: 'plus',
      upstreamOffset: flankingOffsets.upstream,
      downstreamAnchor: 'End',
      downstreamSign: 'plus',
      downstreamOffset: flankingOffsets.downstream,
      dnaComponent: 'exon',
      transcriptComponent: 'five_prime_utr',
      splicedGenomic: 'cds',
      // Protein-flavored equivalent of upstream/downstreamAnchor+Offset —
      // the 'bed' reporter's Java source reads these distinct field names
      // (BEDReporter's ProteinAnchor enum: DownstreamFromStart/
      // UpstreamFromEnd) when type is 'protein', and throws a config error
      // if they're absent. 0/0 with these anchors covers the full protein,
      // mirroring upstream/downstreamOffset: 0 for genomic.
      startAnchor3: 'DownstreamFromStart',
      startOffset3: 0,
      endAnchor3: 'UpstreamFromEnd',
      endOffset3: 0,
    }
  );

  const bedText = await fetchTemporaryResultText(temporaryResultPath);

  return parseBedToFeatures(bedText);
}

// Temporary-result paths are plain GET-able URLs relative to the WDK
// service base (the same base the site's own WDK requests use), exactly as
// gene-list-export-utils.tsx's getGeneListTemporaryResultUrl constructs for
// attributesTabular. That base comes from the site's build-time config
// (window.__SITE_CONFIG__), not from WdkService#getConfig() — the latter's
// ServiceConfig has no service-base-URL field.
async function fetchTemporaryResultText(
  temporaryResultPath: string
): Promise<string> {
  const response = await fetch(`${endpoint}${temporaryResultPath}`);
  return response.text();
}

function parseBedToFeatures(bedText: string): Feature[] {
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
      };
    });
}
