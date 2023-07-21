import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';

import {
  GenomeViewSequence,
  GenomeSummaryViewReport,
  GenomeViewFeature,
  GenomeViewRegion,
} from '../types/genomeSummaryViewTypes';

export type GenomeSummaryViewReportModel =
  | TruncatedGenomeSummaryViewReportModel
  | UntruncatedGenomeSummaryViewReportModel;

interface TruncatedGenomeSummaryViewReportModel {
  type: 'truncated';
}

interface UntruncatedGenomeSummaryViewReportModel {
  type: 'untruncated';
  isDetail: boolean;
  maxLength: number;
  sequences: GenomeViewSequenceModel[];
}

export interface GenomeViewSequenceModel {
  sourceId: string;
  regions: GenomeViewRegionModel[];
  features: GenomeViewFeatureModel[];
  featureCount: number;
  length: number;
  percentLength: number;
  chromosome: string;
  organism: string;
  organismAbbrev: string;
}

export interface GenomeViewRegionModel {
  strand: 'forward' | 'reversed';
  start: number;
  end: number;
  startFormatted: string;
  endFormatted: string;
  sourceId: string;
  featureCount: number;
  isForward: boolean;
  percentStart: number;
  percentLength: number;
  stringRep: string;
  features: GenomeViewFeatureModel[];
}

interface RegionLocation {
  start: number;
  end: number;
}

export interface GenomeViewFeatureModel {
  strand: 'forward' | 'reversed';
  startFormatted: string;
  endFormatted: string;
  sourceId: string;
  isForward: boolean;
  sequenceId: string;
  start: number;
  end: number;
  percentStart: number;
  percentLength: number;
  context: string;
  description: string;
}

export const toReportModel = (
  report: GenomeSummaryViewReport
): GenomeSummaryViewReportModel =>
  report.isTruncate
    ? {
        type: 'truncated',
      }
    : {
        type: 'untruncated',
        isDetail: report.isDetail,
        maxLength: report.maxLength,
        sequences: report.sequences.map(toSequenceModel),
      };

const toSequenceModel = (
  sequence: GenomeViewSequence
): GenomeViewSequenceModel => ({
  ...sequence,
  regions: sequence.regions.map(toRegionModel),
  features: sequence.features.map(toFeatureModel),
  featureCount: sequence.features.length,
});

const toRegionModel = (region: GenomeViewRegion): GenomeViewRegionModel => {
  const features = region.features.map(toFeatureModel);
  const strand = region.isForward ? 'forward' : 'reversed';

  const { start, end } = findBoundingLocation(features);
  const startFormatted = start.toLocaleString();
  const endFormatted = end.toLocaleString();

  return {
    ...region,
    featureCount: features.length,
    stringRep: `Region on ${features[0].sequenceId} (${startFormatted} - ${endFormatted}) ${strand} strand`,
    features,
    sourceId: `${features[0].sequenceId}-${start}`,
    strand,
    start,
    end,
    startFormatted,
    endFormatted,
  };
};

const findBoundingLocation = (features: GenomeViewFeature[]): RegionLocation =>
  features.length === 0
    ? { start: 0, end: 0 }
    : features.reduce(
        (result, feature) => ({
          start: Math.min(result.start, feature.start),
          end: Math.max(result.end, feature.end),
        }),
        { start: Infinity, end: -Infinity }
      );

const toFeatureModel = (
  feature: GenomeViewFeature
): GenomeViewFeatureModel => ({
  ...feature,
  context: `${feature.sequenceId}:${feature.context}`,
  strand: feature.isForward ? 'forward' : 'reversed',
  startFormatted: feature.start.toLocaleString(),
  endFormatted: feature.end.toLocaleString(),
});

const PORTAL_SITE_PROJECT_ID = 'EuPathDB';

export function useIsPortalSite() {
  const config = useWdkService((wdkService) => wdkService.getConfig(), []);
  return config?.projectId === PORTAL_SITE_PROJECT_ID;
}
