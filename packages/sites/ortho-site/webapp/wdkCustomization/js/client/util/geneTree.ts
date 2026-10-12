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
