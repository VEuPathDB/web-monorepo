import { Computation, Visualization } from '../types/visualization';
import { DerivedVariableSpec } from '../types/analysis';

function collectVariableRefs(
  value: unknown,
  found: Set<string>,
  seen: Set<object>
): void {
  if (typeof value !== 'object' || value === null) return;
  if (seen.has(value)) return;
  seen.add(value);
  if (Array.isArray(value)) {
    value.forEach((v) => collectVariableRefs(v, found, seen));
    return;
  }
  const record = value as Record<string, unknown>;
  if (
    typeof record.entityId === 'string' &&
    typeof record.variableId === 'string'
  ) {
    found.add(refKey(record.entityId, record.variableId));
  }
  Object.values(record).forEach((v) => collectVariableRefs(v, found, seen));
}

const refKey = (entityId: string, variableId: string) =>
  JSON.stringify([entityId, variableId]);

/**
 * Returns the specs whose { entityId, variableId } appears anywhere within
 * `value` as an object's own entityId and variableId properties.
 */
export function findReferencedSpecs<S extends DerivedVariableSpec>(
  value: unknown,
  specs: S[]
): S[] {
  const found = new Set<string>();
  collectVariableRefs(value, found, new Set());
  return specs.filter((s) => found.has(refKey(s.entityId, s.variableId)));
}

export function findVisualizationsUsing(
  computations: Computation[],
  spec: DerivedVariableSpec
): Visualization[] {
  return computations.flatMap((c) =>
    c.visualizations.filter(
      (viz) => findReferencedSpecs(viz.descriptor, [spec]).length > 0
    )
  );
}
