import WdkService from '@veupathdb/wdk-client/lib/Service/WdkService';
import {
  SearchConfig,
  AnswerSpec,
} from '@veupathdb/wdk-client/lib/Utils/WdkModel';

export const TABLE_STATE_UPDATED = 'eupathdb-record-view/table-state-updated';
export const PATHWAY_DYN_COLS_LOADED =
  'pathway-record/dynamic-gene-cols-loaded';

export const updateTableState = (tableName: string, tableState: any) => ({
  type: TABLE_STATE_UPDATED,
  payload: { tableName, tableState },
});

export const loadPathwayGeneDynamicCols =
  (
    geneStepId: number,
    pathwaySource: string,
    pathwayId: string,
    exactMatchOnly: boolean,
    excludeIncompleteEc: boolean
  ) =>
  ({ wdkService }: { wdkService: WdkService }) => {
    if (geneStepId == null) {
      // no gene step ID provided; must still dispatch action to clear any existing data
      return {
        type: PATHWAY_DYN_COLS_LOADED,
        payload: [],
      };
    }
    // otherwise must load dynamic columns
    let baseAnswerSpec: AnswerSpec;
    return wdkService
      .findStep(geneStepId)
      .then((geneStep) => {
        baseAnswerSpec = { ...geneStep };
        return wdkService.findQuestion(geneStep.searchName);
      })
      .then((question) => {
        let dynamicAttrNames = question.dynamicAttributes.map(
          (attr) => attr.name
        );
        let existingFilters = baseAnswerSpec.searchConfig.filters || [];
        let filteredSearchConfig: SearchConfig = Object.assign(
          {},
          baseAnswerSpec.searchConfig,
          {
            filters: [
              {
                name: 'genesByPathway',
                value: {
                  pathway_source: pathwaySource,
                  pathway_source_id: pathwayId,
                  exclude_incomplete_ec: excludeIncompleteEc,
                  exact_match_only: exactMatchOnly,
                },
              },
            ].concat(existingFilters),
          }
        );

        return wdkService.getAnswerJson(
          {
            searchName: baseAnswerSpec.searchName,
            searchConfig: filteredSearchConfig,
          },
          {
            attributes: [
              'primary_key',
              'ec_numbers_derived',
              'ec_numbers',
            ].concat(dynamicAttrNames),
          }
        );
      })
      .then((answer) => {
        // return an action with the dynamic attribute 'table' as payload
        return {
          type: PATHWAY_DYN_COLS_LOADED,
          payload: answer.records.map((record) =>
            Object.assign(
              {},
              record.attributes,
              record.id.reduce((pk, pkCol) => {
                pk[pkCol.name] = pkCol.value;
                return pk;
              }, {} as Record<string, string>)
            )
          ),
        };
      })
      .catch((error) => {
        console.error(error);
        // could not load dynamic columns; coloring will have to go without
        return {
          type: PATHWAY_DYN_COLS_LOADED,
          payload: [],
        };
      });
  };
