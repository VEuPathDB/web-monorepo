import {
  Error as ErrorPage,
  PermissionDenied,
} from '@veupathdb/wdk-client/lib/Components';
import { NotFoundController } from '@veupathdb/wdk-client/lib/Controllers';
import { ErrorDetails, permanentlyExpiredError } from '../utils/ServiceTypes';
import ExpiredDiamondJob from './ExpiredDiamondJob';

interface Props {
  errorDetails: ErrorDetails;
  workspaceShortName?: string;
}

export function BlastRequestError({ errorDetails, workspaceShortName }: Props) {
  return errorDetails.status === 'not-found' ? (
    <NotFoundController />
  ) : errorDetails.status === 'unauthorized' ? (
    <PermissionDenied />
  ) : permanentlyExpiredError.is(errorDetails) ? (
    <ExpiredDiamondJob workspaceShortName={workspaceShortName}>
      <p>{errorDetails.message}</p>
    </ExpiredDiamondJob>
  ) : (
    <ErrorPage />
  );
}
