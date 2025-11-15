import { communitySite, projectId } from '../../config';

const NEWS_LOADING = 'news/loading';
const NEWS_RECEIVED = 'news/received';
const NEWS_ERROR = 'news/error';

export interface NewsItem {
  date?: string;
  headline?: string;
  description?: string;
  link?: string;
  [key: string]: any;
}

type NewsLoadingAction = {
  type: typeof NEWS_LOADING;
};

type NewsReceivedAction = {
  type: typeof NEWS_RECEIVED;
  payload: { news: NewsItem[] };
};

type NewsErrorAction = {
  type: typeof NEWS_ERROR;
  payload: { error: string };
};

type NewsAction = NewsLoadingAction | NewsReceivedAction | NewsErrorAction;

export function requestNews() {
  return [
    { type: NEWS_LOADING },
    fetch(`https://${communitySite}/${projectId}/news.json`, { mode: 'cors' })
      .then((res) => res.json())
      .then(
        (news: NewsItem[]): NewsReceivedAction => ({
          type: NEWS_RECEIVED,
          payload: { news },
        }),
        (error): NewsErrorAction => ({
          type: NEWS_ERROR,
          payload: { error: error.message },
        })
      ),
  ];
}

export interface NewsState {
  status: 'idle' | 'loading';
  news: NewsItem[] | null;
  error: string | null;
}

const defaultState: NewsState = {
  status: 'idle',
  news: null,
  error: null,
};

export function newsReducer(
  state: NewsState = defaultState,
  action: NewsAction
): NewsState {
  switch (action.type) {
    case NEWS_LOADING:
      return { ...state, status: 'loading' };
    case NEWS_RECEIVED:
      return { status: 'idle', error: null, news: action.payload.news };
    case NEWS_ERROR:
      return { status: 'idle', error: action.payload.error, news: state.news };
    default:
      return state;
  }
}
