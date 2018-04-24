import {
  STUDIES_REQUESTED,
  STUDIES_RECEIVED,
  STUDIES_ERROR
} from './StudyActionCreators';

export default function reduce(state = { loading: false, error: null, entities: null }, action) {
  switch(action.type) {
    case STUDIES_REQUESTED: return {
      loading: true,
      error: null,
      entities: []
    }
    case STUDIES_RECEIVED: return {
      loading: false,
      error: null,
      entities: action.payload.studies
    }
    case STUDIES_ERROR: return {
      loading: false,
      error: action.payload.error,
      entities: []
    }
    default: return state;
  }
}
