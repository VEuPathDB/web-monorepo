import * as Core from '@veupathdb/wdk-client/lib/Core/State/Types';
import * as Actions from './actions';


export type ManagementViewState = {
  readonly datasetFetchState?: Actions.DatasetFetchState;
  readonly datasetSearchesState?: Actions.DatasetSearchesFetchState;
  readonly communityUpdateState?: Actions.CommunityUpdateActionState;
};

export type State = Pick<Core.RootState, 'globalData'>
  & {
    readonly managementView?: ManagementViewState;
  };

export function reduce(state: State, { type, payload }: Actions.Action): State {
  switch (type) {
    case Actions.setCommunityUpdateState.type:
      return patchState(state, { communityUpdateState: payload });

    case Actions.setDatasetFetchState.type:
      return patchState(state, { datasetFetchState: payload });

    case Actions.setSearchFetchState.type:
      return patchState(state, { datasetSearchesState: payload })

    default:
      console.warn(`unrecognized action type: ${type}`);
      return state;
  }
}

const patchState = (state: State, patch: Partial<ManagementViewState>): State => ({
  ...state,
  managementView: {
    ...state.managementView,
    ...patch,
  },
});

export default State;