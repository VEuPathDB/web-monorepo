import { ColorPaletteDefault } from '@veupathdb/components/lib/types/plots';
import { useCallback } from 'react';
import {
  BinRange,
  Filter,
  OverlayConfig,
  PromiseHookState,
  StudyEntity,
  useDataClient,
  usePromise,
  useSubsettingClient,
  Variable,
} from '../../../core';
import { DataClient, SubsettingClient } from '../../../core/api';
import { UNSELECTED_TOKEN } from './standaloneMapMarkers';

// This async function fetches the default overlay config.
// For continuous variables, this involves calling the filter-aware-metadata/continuous-variable
// endpoint (currently only using the equal-spaced bin response)
//
// For categoricals it calls subsetting's distribution endpoint to get a list of values and their counts
//

export interface DefaultOverlayConfigProps {
  studyId: string;
  filters: Filter[] | undefined;
  overlayVariable: Variable | undefined;
  overlayEntity: StudyEntity | undefined;
  dataClient: DataClient;
  subsettingClient: SubsettingClient;
}

export async function getDefaultOverlayConfig(
  props: DefaultOverlayConfigProps
): Promise<OverlayConfig | undefined> {
  const {
    studyId,
    filters,
    overlayVariable,
    overlayEntity,
    dataClient,
    subsettingClient,
  } = props;

  if (overlayVariable != null && overlayEntity != null) {
    const overlayVariableDescriptor = {
      variableId: overlayVariable.id,
      entityId: overlayEntity.id,
    };

    if (overlayVariable.vocabulary) {
      // categorical
      // If the variable has "too many" values, get the top 7 from the distribution service
      const overlayValues =
        overlayVariable.vocabulary.length <= ColorPaletteDefault.length
          ? overlayVariable.vocabulary
          : await getMostFrequentValues({
              studyId: studyId,
              ...overlayVariableDescriptor,
              filters: filters ?? [],
              numValues: ColorPaletteDefault.length - 1,
              subsettingClient,
            });

      return {
        overlayType: 'categorical',
        overlayVariable: overlayVariableDescriptor,
        overlayValues,
      };
    } else if (overlayVariable.dataShape === 'continuous') {
      // continuous
      const overlayBins = await getBinRanges({
        studyId,
        ...overlayVariableDescriptor,
        filters: filters ?? [],
        dataClient,
      });

      return {
        overlayType: 'continuous',
        overlayValues: overlayBins,
        overlayVariable: overlayVariableDescriptor,
      };
    } else {
      return;
    }
  }
}

type GetMostFrequentValuesProps = {
  studyId: string;
  variableId: string;
  entityId: string;
  filters: Filter[];
  numValues: number; // the N of the top N most frequent values
  subsettingClient: SubsettingClient;
};

// get the most frequent values for the entire dataset, no filters at all
// (for now at least)
async function getMostFrequentValues({
  studyId,
  variableId,
  entityId,
  filters,
  numValues,
  subsettingClient,
}: GetMostFrequentValuesProps): Promise<string[]> {
  const distributionResponse = await subsettingClient.getDistribution(
    studyId,
    entityId,
    variableId,
    {
      valueSpec: 'count',
      filters,
    }
  );

  const sortedValues = distributionResponse.histogram
    .sort((bin1, bin2) => bin2.value - bin1.value)
    .map((bin) => bin.binLabel);
  return sortedValues.length <= numValues
    ? sortedValues
    : [...sortedValues.slice(0, numValues), UNSELECTED_TOKEN];
}

type GetBinRangesProps = {
  studyId: string;
  variableId: string;
  entityId: string;
  dataClient: DataClient;
  filters: Filter[];
};

// get the equal spaced bin definitions (for now at least)
async function getBinRanges({
  studyId,
  variableId,
  entityId,
  dataClient,
  filters,
}: GetBinRangesProps): Promise<BinRange[]> {
  const response = await dataClient.getContinousVariableMetadata({
    studyId,
    filters,
    config: {
      variable: {
        entityId,
        variableId,
      },
      metadata: ['binRanges'],
    },
  });

  const binRanges = response.binRanges?.equalInterval!; // if asking for binRanges, the response WILL contain binRanges
  return binRanges;
}