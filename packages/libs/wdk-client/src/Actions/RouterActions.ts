/**
 * Action creators related to routing.
 *
 * Note: These actions do not currently alter the URL. They mainly
 * propagate router state to stores.
 */
import { Location } from 'history';
import {InferAction, makeActionCreator} from 'wdk-client/Utils/ActionCreatorUtils';
import {TransitionOptions} from 'wdk-client/Utils/PageTransitioner';

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
  (path: string, options?: TransitionOptions) => ({ path, options })
);

export const transitionToExternalPage = makeActionCreator(
  'router-transition-external',
  (path: string, options?: TransitionOptions) => ({ path, options })
);
