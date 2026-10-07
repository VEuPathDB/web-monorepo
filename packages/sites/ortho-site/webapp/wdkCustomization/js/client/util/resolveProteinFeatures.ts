import { AttributeValue } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { Feature } from '@veupathdb/compute-platform-job/src/lib/Service/ServiceTypes';

type RowType = Record<string, AttributeValue>;

/**
 * Maps selected protein full_ids to whole-sequence Feature[], using the
 * length already present on each row (mesaRows) — no server round-trip.
 * OrthoMCL has only protein sequences, so a Feature is always the full
 * length of the protein starting at 0.
 */
export function resolveProteinFeatures(
  selectedIds: string[],
  rows: RowType[]
): Feature[] {
  const lengthByFullId = new Map(
    rows.map((row) => [String(row['full_id']), Number(row['length'])])
  );

  return selectedIds.map((fullId) => ({
    contig: fullId,
    query: fullId,
    start: 0,
    end: lengthByFullId.get(fullId) ?? 0,
  }));
}
