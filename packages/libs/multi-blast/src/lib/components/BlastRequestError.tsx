import {
  Error as ErrorPage,
  PermissionDenied,
} from '@veupathdb/wdk-client/lib/Components';
import { NotFoundController } from '@veupathdb/wdk-client/lib/Controllers';
import NotFound from '@veupathdb/wdk-client/lib/Views/NotFound/NotFound';

import { ErrorDetails, permanentlyExpiredError } from '../utils/ServiceTypes';

interface Props {
  errorDetails: ErrorDetails;
}

export function BlastRequestError({ errorDetails }: Props) {
  return errorDetails.status === 'not-found' ? (
    <NotFoundController />
  ) : errorDetails.status === 'unauthorized' ? (
    <PermissionDenied />
  ) : permanentlyExpiredError.is(errorDetails) ? (
    <NotFound>
      <p>{errorDetails.message}</p>
    </NotFound>
  ) : (
    <ErrorPage />
  );
}
