import Banner from '@veupathdb/coreui/lib/components/banners/Banner';
import { ReactNode } from 'react';
import { NoDataError } from '../../api/DataClient/NoDataError';

interface Props {
  error?: unknown;
  customCases?: Case[];
  outputSize?: number;
  bannerType?: 'warning' | 'error';
}

type Case = (error: unknown) => string | ReactNode | undefined;

const defaultCases: Case[] = [
  (error) => (error instanceof NoDataError ? error.message : undefined),
];

const emptyCaseMessage =
  'The visualization cannot be made because there is no plottable data for selected variable(s) in the current subset.';

export default function PluginError({
  error,
  customCases,
  outputSize,
  bannerType = 'warning',
}: Props) {
  // TO DO: errors from back end should arrive with a separate response code property
  // FOR NOW: flatten entire error to a string
  const fallbackErrorMessage =
    error == null ? '' : error instanceof Error ? error.message : String(error);

  const emptyCase = () => (outputSize === 0 ? emptyCaseMessage : undefined);

  const errorContent =
    (customCases ?? [])
      .concat([emptyCase, ...defaultCases])
      .reduce<string | ReactNode | undefined>(
        (prev, caseFunction) => prev ?? caseFunction(error),
        undefined
      ) ?? fallbackErrorMessage;

  return errorContent ? (
    <Banner
      banner={{
        type: bannerType,
        message: errorContent,
      }}
    />
  ) : null;
}
