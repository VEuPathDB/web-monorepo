import { ok } from 'wdk-client/Json';

const NEWS_LOADING = 'news/loading';
const NEWS_RECEIVED = 'news/received';
const NEWS_ERROR = 'news/error';

export function requestNews() {
  return function run({ wdkService }) {
    return [
      { type: NEWS_LOADING },
      wdkService.sendRequest(ok, {
        method: 'GET',
        path: '/xml-answer/XmlQuestions.News'
      }).then(
        news => ({ type: NEWS_RECEIVED, payload: { news } }),
        error => ({ type: NEWS_ERROR, payload: { error: error.message } })
      )
    ];
  }
}

const defaultState = {
  status: 'idle',
  news: null,
  error: null,
}

export function newsReducer (state = defaultState, action) {
  switch(action.type) {
    case NEWS_LOADING: return ({ ...state, status: 'loading' });
    case NEWS_RECEIVED: return ({ status: 'idle', error: null, news: action.payload.news });
    case NEWS_ERROR: return ({ status: 'idle', error: action.payload.error, news: state.news });
    default: return state;
  }
}
