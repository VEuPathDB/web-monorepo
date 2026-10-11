import { AttributeValue } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { SubmitJobRequest } from '@veupathdb/compute-platform-job/src/lib/Service/ServiceTypes';
import { resolveProteinFeatures } from './resolveProteinFeatures';

type RowType = Record<string, AttributeValue>;

/**
 * Newick reserves ':' (it introduces a branch length), and ids such as
 * "transcript:ENSAATROPT000021-p1" contain one. The tree's leaf labels are
 * therefore these encoded ids, and anything comparing a row or a selection
 * to a leaf has to encode the row's full_id the same way.
 *
 * Nothing decodes a label. The mapping is not strictly one-to-one — an id
 * that literally contains "_COLON_" would clash with one containing ':' —
 * but no such ids are expected.
 */
export function encodeTreeLabel(fullId: string): string {
  return fullId.replace(/:/g, '_COLON_');
}

/** The job request for a newick gene tree of all of `rows`. */
export function buildGeneTreeRequest(rows: RowType[]): SubmitJobRequest {
  const features = resolveProteinFeatures(
    rows.map((row) => String(row['full_id'])),
    rows
  ).map((feature) => ({ ...feature, query: encodeTreeLabel(feature.contig) }));

  return {
    features,
    deflineFormat: 'QUERYONLY',
    postProcess: 'GENETREE',
    geneTreeOptions: { format: 'newick' },
  };
}

/**
 * Predicted seconds for the tree job (MAFFT, then FastTree) on `n` sequences
 * whose longest is `maxLength` residues. A power-law fit to logged service
 * runtimes, so only an estimate.
 */
export function estimateTreeSeconds(n: number, maxLength: number): number {
  if (n <= 0 || maxLength <= 0) return 0;
  const fasttree = Math.exp(-8.229) * n ** 1.165 * maxLength ** 0.849;
  const mafft = Math.exp(-12.453) * n ** 0.618 * maxLength ** 1.47;
  return fasttree + mafft;
}

/** Seconds as m:ss. */
export function formatDuration(seconds: number): string {
  const total = Math.round(seconds);
  const ss = String(total % 60).padStart(2, '0');
  return `${Math.floor(total / 60)}:${ss}`;
}
