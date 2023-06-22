import { ColorPaletteDefault } from '@veupathdb/components/lib/types/plots';
import { UNSELECTED_TOKEN } from '../..';
import {
  BinRange,
  CategoricalVariableDataShape,
  ContinuousVariableDataShape,
  Filter,
  OverlayConfig,
  StudyEntity,
  Variable,
} from '../../../core';
import { DataClient, SubsettingClient } from '../../../core/api';
import { MarkerConfiguration } from '../appState';

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
  binningMethod?: MarkerConfiguration['binningMethod'];
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
    binningMethod = 'equalInterval',
  } = props;

  if (overlayVariable != null && overlayEntity != null) {
    const overlayVariableDescriptor = {
      variableId: overlayVariable.id,
      entityId: overlayEntity.id,
    };

    if (CategoricalVariableDataShape.is(overlayVariable.dataShape)) {
      // categorical
      const { mostFrequentValues, allValues } = await getValues({
        studyId: studyId,
        ...overlayVariableDescriptor,
        filters: filters ?? [],
        numValues: ColorPaletteDefault.length - 1,
        subsettingClient,
      });

      return {
        overlayType: 'categorical',
        overlayVariable: overlayVariableDescriptor,
        overlayValues: mostFrequentValues,
        allValues,
      };
    } else if (ContinuousVariableDataShape.is(overlayVariable.dataShape)) {
      // continuous
      const overlayBins = await getBinRanges({
        studyId,
        ...overlayVariableDescriptor,
        filters: filters ?? [],
        dataClient,
        binningMethod,
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

type GetValuesProps = {
  studyId: string;
  variableId: string;
  entityId: string;
  filters: Filter[];
  numValues: number; // the N of the top N most frequent values
  subsettingClient: SubsettingClient;
};

type OverlayValue = {
  label: string;
  count: number;
};

type OverlayValues = {
  mostFrequentValues: string[];
  allValues: OverlayValue[];
};

// get the most frequent values for the entire dataset, no filters at all
// (for now at least)
async function getValues({
  studyId,
  variableId,
  entityId,
  filters,
  numValues,
  subsettingClient,
}: GetValuesProps): Promise<OverlayValues> {
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
    .map((bin) => ({
      label: bin.binLabel,
      count: bin.value,
    }));

  return {
    mostFrequentValues:
      sortedValues.length <= numValues
        ? sortedValues.map((bin) => bin.label)
        : [
            ...sortedValues.map((bin) => bin.label).slice(0, numValues),
            UNSELECTED_TOKEN,
          ],
    allValues: sortedValues,
  };
}

type GetBinRangesProps = {
  studyId: string;
  variableId: string;
  entityId: string;
  dataClient: DataClient;
  filters: Filter[];
  binningMethod: MarkerConfiguration['binningMethod'];
};

// get the equal spaced bin definitions (for now at least)
async function getBinRanges({
  studyId,
  variableId,
  entityId,
  dataClient,
  filters,
  binningMethod = 'equalInterval',
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

  const binRanges = response.binRanges?.[binningMethod]!; // if asking for binRanges, the response WILL contain binRanges
  return binRanges;
}
