import {
  STUDIES_REQUESTED,
  STUDIES_RECEIVED,
  STUDIES_ERROR,
} from './StudyActionCreators';

const initialState = {
  loading: false,
  error: undefined,
  entities: undefined,
};

export default function reduce(state = initialState, action) {
  switch (action.type) {
    case STUDIES_REQUESTED:
      return {
        loading: true,
        error: undefined,
        entities: undefined,
      };
    case STUDIES_RECEIVED:
      return {
        loading: false,
        error: undefined,
        entities: action.payload.studies,
      };
    case STUDIES_ERROR:
      return {
        loading: false,
        error: action.payload.error,
        entities: undefined,
      };
    default:
      return state;
  }
}
