export interface GeneDisplaySpec {
  ids: string[];
  variableId: string;
  entityId: string;
  traceName?: string;
  mode: 'highlight' | 'subset';
}

/**
 * Filters restricting the data to the spec's genes, regardless of display mode.
 * Use this for plots that cannot express highlighting within the plot itself.
 */
export function geneSubsetFilters(geneDisplaySpec?: GeneDisplaySpec) {
  if (geneDisplaySpec != null && geneDisplaySpec.ids.length > 0) {
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

export function filtersFromGeneDisplaySpec(geneDisplaySpec?: GeneDisplaySpec) {
  if (geneDisplaySpec?.mode === 'subset') {
    return geneSubsetFilters(geneDisplaySpec);
  }
  return [];
}
