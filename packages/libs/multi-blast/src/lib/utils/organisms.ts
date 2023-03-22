import { ContextType } from 'react';

import { invert } from 'lodash';

import { TargetMetadataByDataType } from './targetTypes';
import { BlastCompatibleWdkService } from './wdkServiceIntegration';

export async function fetchOrganismToFilenameMaps(
  wdkService: BlastCompatibleWdkService,
  selectedTargetTypeTerm: string,
  targetMetadataByDataType: ContextType<typeof TargetMetadataByDataType>
) {
  const blastParamInternalValues = await wdkService.getBlastParamInternalValues(
    targetMetadataByDataType[selectedTargetTypeTerm].searchUrlSegment
  );

  const blastParamInternalValuesForTargetType =
    blastParamInternalValues[selectedTargetTypeTerm];

  const organismsToFiles = blastParamInternalValuesForTargetType.organismValues;

  return {
    dbTypeInternal: blastParamInternalValuesForTargetType.dbTypeInternal,
    filesToOrganisms: invert(organismsToFiles) as Record<string, string>,
    organismsToFiles,
  };
}
