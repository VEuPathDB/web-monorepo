export interface GeneDisplaySpec {
  ids: string[];
  variableId: string;
  entityId: string;
  traceName?: string;
  mode: 'highlight' | 'subset';
}

export function filtersFromGeneDisplaySpec(geneDisplaySpec?: GeneDisplaySpec) {
  if (geneDisplaySpec?.mode === 'subset' && geneDisplaySpec.ids.length > 0) {
    return [
      {
        type: 'stringSet' as const,
        entityId: geneDisplaySpec.entityId,
        variableId: geneDisplaySpec.variableId,
        stringSet: geneDisplaySpec.ids,
      },
    ];
  }
  return [];
}
