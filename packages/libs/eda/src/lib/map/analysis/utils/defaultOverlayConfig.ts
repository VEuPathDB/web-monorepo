import { ColorPaletteDefault } from '@veupathdb/components/lib/types/plots';
import { UNSELECTED_TOKEN } from '../..';
import {
  BinRange,
  BubbleOverlayConfig,
  CategoricalVariableDataShape,
  ContinuousVariableDataShape,
  Filter,
  OverlayConfig,
  StudyEntity,
  Variable,
  VariableType,
} from '../../../core';
import { DataClient, SubsettingClient } from '../../../core/api';
import { BinningMethod, MarkerConfiguration } from '../appState';
import { BubbleMarkerConfiguration } from '../MarkerConfiguration/BubbleMarkerConfigurationMenu';

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
  markerType?: MarkerConfiguration['type'];
  binningMethod?: BinningMethod;
  aggregator?: BubbleMarkerConfiguration['aggregator'];
  numeratorValues?: BubbleMarkerConfiguration['numeratorValues'];
  denominatorValues?: BubbleMarkerConfiguration['denominatorValues'];
}

export async function getDefaultOverlayConfig(
  props: DefaultOverlayConfigProps
): Promise<OverlayConfig | BubbleOverlayConfig | undefined> {
  const {
    studyId,
    filters,
    overlayVariable,
    overlayEntity,
    dataClient,
    subsettingClient,
    markerType,
    binningMethod = 'equalInterval',
    aggregator = 'mean',
    numeratorValues,
    denominatorValues,
  } = props;

  if (overlayVariable != null && overlayEntity != null) {
    const overlayVariableDescriptor = {
      variableId: overlayVariable.id,
      entityId: overlayEntity.id,
    };

    if (CategoricalVariableDataShape.is(overlayVariable.dataShape)) {
      // categorical
      if (markerType === 'bubble') {
        return {
          overlayVariable: overlayVariableDescriptor,
          aggregationConfig: {
            overlayType: 'categorical',
            numeratorValues:
              numeratorValues ?? overlayVariable.vocabulary ?? [],
            denominatorValues:
              denominatorValues ?? overlayVariable.vocabulary ?? [],
          },
        };
      } else {
        const overlayValues = await getMostFrequentValues({
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
      }
    } else if (ContinuousVariableDataShape.is(overlayVariable.dataShape)) {
      // continuous
      if (markerType === 'bubble') {
        return {
          overlayVariable: overlayVariableDescriptor,
          aggregationConfig: {
            overlayType: 'continuous', // TO DO for dates: might do `overlayVariable.type === 'date' ? 'date' : 'number'`
            aggregator,
          },
        };
      } else {
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
      }
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

// get the most frequent values for the entire dataset
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

export type GetBinRangesProps = {
  studyId: string;
  variableId: string;
  entityId: string;
  dataClient: DataClient;
  filters: Filter[];
  binningMethod: BinningMethod;
};

// get the equal spaced bin definitions (for now at least)
export async function getBinRanges({
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
