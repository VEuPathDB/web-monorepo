import {
  SEARCHES_LOADED,
  SEARCHES_LOADING,
  SEARCHES_ERROR
} from './SearchCardActionCreators';

export default function reduce(state = { loading: false, error: null, entities: null }, action) {
  switch(action.type) {
    case SEARCHES_LOADING: return {
      loading: true,
      error: null,
      entities: null
    }
    case SEARCHES_LOADED: return {
      loading: false,
      error: null,
      entities: action.payload.searches
    }
    case SEARCHES_ERROR: return {
      loading: false,
      error: action.payload.error,
      entities: null
    }
    default: return state;
  }
}
