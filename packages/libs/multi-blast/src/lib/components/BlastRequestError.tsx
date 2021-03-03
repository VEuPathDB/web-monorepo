import {
  Error as ErrorPage,
  PermissionDenied,
} from '@veupathdb/wdk-client/lib/Components';
import { NotFoundController } from '@veupathdb/wdk-client/lib/Controllers';

import { ErrorDetails } from '../utils/ServiceTypes';

interface Props {
  errorDetails: ErrorDetails;
}

export function BlastRequestError({ errorDetails }: Props) {
  return errorDetails.status === 'not-found' ? (
    <NotFoundController />
  ) : errorDetails.status === 'unauthorized' ? (
    <PermissionDenied />
  ) : (
    <ErrorPage />
  );
}
