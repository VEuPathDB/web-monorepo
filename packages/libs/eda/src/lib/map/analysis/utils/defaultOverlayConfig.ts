import { ColorPaletteDefault } from '@veupathdb/components/lib/types/plots';
import { UNSELECTED_TOKEN } from '../../constants';
import {
  BinRange,
  BubbleOverlayConfig,
  CategoricalVariableDataShape,
  ContinuousVariableDataShape,
  Filter,
  OverlayConfig,
  StudyEntity,
  Variable,
} from '../../../core';
import { DataClient, SubsettingClient } from '../../../core/api';
import { BinningMethod } from '../appState';
import { BubbleMarkerConfiguration } from '../mapTypes/plugins/bubble/BubbleMarkerConfigurationMenu';

// This async function fetches the default overlay config.
// For continuous variables, this involves calling the filter-aware-metadata/continuous-variable
// endpoint (currently only using the equal-spaced bin response)
//
// For categoricals it calls subsetting's distribution endpoint to get a list of values and their counts
//

export interface DefaultBubbleOverlayConfigProps {
  studyId: string;
  overlayVariable: Variable;
  overlayEntity: StudyEntity;
  aggregator?: BubbleMarkerConfiguration['aggregator'];
  numeratorValues?: BubbleMarkerConfiguration['numeratorValues'];
  denominatorValues?: BubbleMarkerConfiguration['denominatorValues'];
}

export function getDefaultBubbleOverlayConfig(
  props: DefaultBubbleOverlayConfigProps
): {
  overlayConfig: BubbleOverlayConfig & {
    aggregationConfig: { valueType?: 'number' | 'date' };
  };
  isValidProportion?: boolean;
} {
  const {
    overlayVariable,
    overlayEntity,
    aggregator = 'mean',
    numeratorValues = overlayVariable?.vocabulary ?? [],
    denominatorValues = overlayVariable?.vocabulary ?? [],
  } = props;

  const overlayVariableDescriptor = {
    variableId: overlayVariable.id,
    entityId: overlayEntity.id,
  };

  if (CategoricalVariableDataShape.is(overlayVariable.dataShape)) {
    // categorical
    return {
      overlayConfig: {
        overlayVariable: overlayVariableDescriptor,
        aggregationConfig: {
          overlayType: 'categorical',
          numeratorValues,
          denominatorValues,
        },
      },
      isValidProportion: validateProportionValues(
        numeratorValues,
        denominatorValues,
        overlayVariable.vocabulary
      ),
    };
  } else if (ContinuousVariableDataShape.is(overlayVariable.dataShape)) {
    // continuous
    return {
      overlayConfig: {
        overlayVariable: overlayVariableDescriptor,
        aggregationConfig: {
          overlayType: 'continuous',
          valueType: overlayVariable.type === 'date' ? 'date' : 'number',
          aggregator,
        },
      },
    };
  }
  throw new Error('Unknown variable datashape: ' + overlayVariable.dataShape);
}

export interface DefaultOverlayConfigProps {
  studyId: string;
  filters: Filter[] | undefined;
  overlayVariable: Variable | undefined;
  overlayEntity: StudyEntity | undefined;
  dataClient: DataClient;
  subsettingClient: SubsettingClient;
  binningMethod?: BinningMethod;
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

    if (
      CategoricalVariableDataShape.is(overlayVariable.dataShape) &&
      overlayVariable.vocabulary != null
    ) {
      // categorical
      const overlayValues =
        overlayVariable.vocabulary.length > ColorPaletteDefault.length
          ? await getMostFrequentValues({
              // sort by frequency for high-cardinality only
              studyId: studyId,
              ...overlayVariableDescriptor,
              filters: filters ?? [],
              numValues: ColorPaletteDefault.length - 1,
              subsettingClient,
            })
          : overlayVariable.vocabulary;

      return {
        overlayType: 'categorical',
        overlayVariable: overlayVariableDescriptor,
        overlayValues,
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

// We currently call this function twice per value change.
// If the number of values becomes vary large, we may want to optimize this?
// Maybe O(n^2) isn't that bad though.
export const validateProportionValues = (
  numeratorValues: string[] | undefined,
  denominatorValues: string[] | undefined,
  vocabulary?: string[]
) =>
  (numeratorValues == null ||
    numeratorValues.every(
      (value) =>
        denominatorValues == null ||
        (denominatorValues.includes(value) &&
          (vocabulary == null || vocabulary.includes(value)))
    )) &&
  (denominatorValues == null ||
    denominatorValues.every(
      (value) => vocabulary == null || vocabulary.includes(value)
    ));

export const invalidProportionText =
  'To calculate a proportion, all selected numerator values must also be present in the denominator and any values that have been filtered out must not be present in either. You may need to review both numerator and denominator drop-downs to reconfigure a valid proportion.';
