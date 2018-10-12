export const TABLE_STATE_UPDATED = 'eupathdb-record-view/table-state-updated';
export const PATHWAY_DYN_COLS_LOADED = 'pathway-record/dynamic-gene-cols-loaded';

export const updateTableState = (tableName, tableState) => ({
  type: TABLE_STATE_UPDATED,
  payload: { tableName, tableState }
});

export const loadPathwayGeneDynamicCols = (geneStepId, pathwaySource, pathwayId, exactMatchOnly, excludeIncompleteEc) => ({ wdkService }) => {

  if (geneStepId == null) {
    // no gene step ID provided; must still dispatch action to clear any existing data
    return {
      type: PATHWAY_DYN_COLS_LOADED,
      payload: []
    };
  }
  // otherwise must load dynamic columns
  let baseAnswerSpec;
  return wdkService.findStep(geneStepId)
  .then(geneStep => {
    baseAnswerSpec = geneStep.answerSpec;
    return wdkService.findQuestion(question => question.name === baseAnswerSpec.questionName);
  })
  .then(question => {
    let dynamicAttrNames = question.dynamicAttributes.map(attr => attr.name);
    let filteredAnswerSpec = Object.assign({}, baseAnswerSpec, {
      filters: [{
        name: "genesByPathway",
        value: {
            pathway_source: pathwaySource,
            pathway_source_id: pathwayId,
            exclude_incomplete_ec: excludeIncompleteEc,
            exact_match_only: exactMatchOnly
        }
      }].concat(baseAnswerSpec.filters)
    });

    return wdkService.getAnswerJson(filteredAnswerSpec, {
      attributes: [ 'primary_key', 'ec_numbers_derived', 'ec_numbers' ].concat(dynamicAttrNames)
    });
  })
  .then(answer => {
    // return an action with the dynamic attribute 'table' as payload
    return {
      type: PATHWAY_DYN_COLS_LOADED,
      payload: answer.records.map(record =>
        Object.assign({}, record.attributes,
          record.id.reduce((pk, pkCol) => {
            pk[pkCol.name] = pkCol.value;
            return pk;
          }, {}))
      )
    };
  })
  .catch(error => {
    console.error(error);
    // could not load dynamic columns; coloring will have to go without
    return {
      type: PATHWAY_DYN_COLS_LOADED,
      payload: []
    }
  });
};
