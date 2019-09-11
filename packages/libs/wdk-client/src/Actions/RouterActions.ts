/**
 * Action creators related to routing.
 *
 * Note: These actions do not currently alter the URL. They mainly
 * propagate router state to stores.
 */
import { Location } from 'history';
import {InferAction, makeActionCreator} from 'wdk-client/Utils/ActionCreatorUtils';

export type Action = InferAction<
  | typeof updateLocation
  | typeof transitionToInternalPage
  | typeof transitionToExternalPage
  >


export const updateLocation = makeActionCreator(
  'router-update-loading',
  (location: Location) => ({ location })
);

export const transitionToInternalPage = makeActionCreator(
  'router-transition-internal',
  (path: string) => ({ path })
);

export const transitionToExternalPage = makeActionCreator(
  'router-transition-external',
  (path: string) => ({ path })
);
