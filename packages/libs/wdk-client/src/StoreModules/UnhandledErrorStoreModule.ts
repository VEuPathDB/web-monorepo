import { Action } from 'wdk-client/Actions';
import { notifyUnhandledError } from 'wdk-client/Actions/UnhandledErrorActions';

export const key = 'unhandledErrors';

export interface State {
  errors: any[]
}

const initialState: State = {
  errors: []
}

export function reduce(state: State = initialState, action: Action): State {
  switch(action.type) {
    case notifyUnhandledError.type:
      return {
        ...state,
        errors: [ ...state.errors, action.payload.error ]
      }
    default:
      return state;
  }
}
