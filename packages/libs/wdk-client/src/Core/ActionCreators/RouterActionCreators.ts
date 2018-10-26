/**
 * Action creators related to routing.
 *
 * Note: These actions do not currently alter the URL. They mainly
 * propagate router state to stores.
 */
import { Location } from 'history';

import { ActionThunk, EmptyAction, emptyAction } from 'wdk-client/Utils/ActionCreatorUtils';


export type LocationAction = {
  type: 'router/location-updated',
  payload: { location: Location }
}

export function updateLocation(location: Location): LocationAction {
  return { type: 'router/location-updated', payload: { location } }
}

export function transitionToInternalPage(path: string): ActionThunk<EmptyAction> {
  return function run({ transitioner }) {
    transitioner.transitionToInternalPage(path);
    return emptyAction;
  };
}

export function transitionToExternalPage(path: string): ActionThunk<EmptyAction> {
  return function run({ transitioner }) {
    transitioner.transitionToExternalPage(path);
    return emptyAction;
  };
}