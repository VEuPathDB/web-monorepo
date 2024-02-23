import { orderBy, partition } from 'lodash';
import React from 'react';
import { ofType } from 'redux-observable';
import { EMPTY, from, merge, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { DatasetParam, Parameter } from '../../../Utils/WdkModel';
import { StrategySummary } from '../../../Utils/WdkUser';
import {
  datasetItemToString,
  idListToArray,
} from '../../../Views/Question/Params/DatasetParamUtils';
import {
  Props,
  Context,
  createParamModule,
  ParamModule,
} from '../../../Views/Question/Params/Utils';
import { makeClassNameHelper } from '../../../Utils/ComponentUtils';

import '../../../Views/Question/Params/DatasetParam.scss';
import { DatasetConfig } from '../../../Service/Mixins/DatasetsService';
import { INIT_PARAM, InitParamAction } from '../../../Actions/QuestionActions';
import {
  SET_BASKET_COUNT,
  SET_FILE,
  SET_FILE_PARSER,
  SET_ID_LIST,
  SET_LOADING_ID_LIST,
  SET_SOURCE_TYPE,
  SET_STRATEGY_ID,
  SET_STRATEGY_LIST,
  SET_URL,
  SET_URL_PARSER,
  setBasketCount,
  setFile,
  setFileParser,
  setIdList,
  setLoadingIdList,
  setSourceType,
  setStrategyId,
  setStrategyList,
  setUrl,
  setUrlParser,
} from '../../../Actions/DatasetParamActions';
import { Action } from '../../../Actions';

import { TextBox } from '../../../Components';

const cx = makeClassNameHelper('wdk-DatasetParam');

// TODO We will have to include an onSubmit hook that will convert the user's
// selection to a Dataset using the DatasetService. We need an API that allows
// awaiting of some sort, using Promises, some state flag, or something else.

type State = {
  sourceType: 'idList' | 'file' | 'basket' | 'strategy' | 'url';
  idList?: string;
  loadingIdList?: boolean;
  file?: File | null;
  strategyList?: StrategySummary[];
  strategyId?: number;
  basketCount?: number;
  fileParser?: DatasetParam['parsers'][number]['name'];
  url?: string;
  urlParser?: DatasetParam['parsers'][number]['name'];
};

function isType(parameter: Parameter): parameter is DatasetParam {
  return parameter.type === 'input-dataset';
}

function isParamValueValid(ctx: Context<DatasetParam>) {
  // return !isEmpty(ctx.paramValues[ctx.parameter.name]);
  return true;
}

const defaultState: State = {
  sourceType: 'idList',
};

const getInitialParser = (parameter: DatasetParam) => parameter.parsers[0].name;

function reduce(state: State = defaultState, action: Action): State {
  switch (action.type) {
    case INIT_PARAM: {
      const { parameter, initialParamData } = action.payload;

      const initialListName = `${parameter.name}.idList`;
      const initialList = initialParamData?.[initialListName];

      const initialUrlName = `${parameter.name}.url`;
      const initialUrl = initialParamData?.[initialUrlName];

      return {
        ...state,
        sourceType: initialUrl != null ? 'url' : 'idList',
        idList:
          initialList != null
            ? initialList
            : (parameter as DatasetParam).defaultIdList,
        url: initialUrl,
      };
    }
    case SET_SOURCE_TYPE:
      return { ...state, sourceType: action.payload.sourceType };
    case SET_ID_LIST:
      return { ...state, idList: action.payload.idList };
    case SET_LOADING_ID_LIST: {
      return { ...state, loadingIdList: action.payload.loadingIdList };
    }
    case SET_FILE:
      return { ...state, file: action.payload.file };
    case SET_STRATEGY_LIST:
      return {
        ...state,
        strategyList: action.payload.strategyList,
        strategyId:
          action.payload.strategyList.length > 0
            ? action.payload.strategyList[0].strategyId
            : undefined,
      };
    case SET_STRATEGY_ID:
      return { ...state, strategyId: action.payload.strategyId };
    case SET_BASKET_COUNT:
      return { ...state, basketCount: action.payload.basketCount };
    case SET_FILE_PARSER:
      return { ...state, fileParser: action.payload.fileParser };
    case SET_URL:
      return { ...state, url: action.payload.url };
    case SET_URL_PARSER:
      return { ...state, urlParser: action.payload.urlParser };
    default:
      return state;
  }
}

const getIdList = (uiState: State, parameter: DatasetParam) => uiState.idList;

const getParser = (
  parserStateSelector: (uiState: State) => string | undefined,
  uiState: State,
  parameter: DatasetParam
) => {
  const parserState = parserStateSelector(uiState);

  return parserState == null ? getInitialParser(parameter) : parserState;
};

const getStrategyId = (uiState: State, parameter: DatasetParam) =>
  uiState.strategyId != null
    ? uiState.strategyId
    : uiState.strategyList && uiState.strategyList.length > 0
    ? uiState.strategyList[0].strategyId
    : undefined;

type Section = {
  sourceType: State['sourceType'];
  label: string;
  render: React.StatelessComponent<Props<DatasetParam, State>>;
  isAvailable?: (props: Props<DatasetParam, State>) => boolean;
};

const sections: Section[] = [
  {
    sourceType: 'idList',
    label: 'Enter a list of IDs',
    isAvailable: ({ uiState }) => !uiState.loadingIdList,
    render: ({ ctx, dispatch, parameter, uiState }) => (
      <div
        className={
          uiState.loadingIdList ? cx('IdList', 'loading') : cx('IdList')
        }
      >
        <textarea
          rows={5}
          cols={30}
          value={getIdList(uiState, parameter)}
          onChange={(e) =>
            dispatch(setIdList({ ...ctx, idList: e.target.value }))
          }
          required={
            uiState.sourceType === 'idList' && !parameter.allowEmptyValue
          }
        />
      </div>
    ),
  },
  {
    sourceType: 'file',
    label: 'Upload a text file',
    render: ({ uiState, dispatch, ctx, parameter }) => (
      <>
        <input
          type="file"
          accept="text/*"
          onChange={(e) =>
            dispatch(
              setFile({ ...ctx, file: e.target.files && e.target.files[0] })
            )
          }
          required={uiState.sourceType === 'file' && !parameter.allowEmptyValue}
        />
        <small>
          <div>Maximum size 10MB. The file should contain the list of IDs.</div>
          {parameter.parsers.length > 1 && (
            <>
              <div>Alternatively, please use other file formats:</div>
              <FileParserOptions
                parameter={parameter}
                selectedParser={getParser(
                  (uiState) => uiState.fileParser,
                  uiState,
                  parameter
                )}
                onSelectParser={(selectedParser) => {
                  dispatch(
                    setFileParser({
                      ...ctx,
                      fileParser: selectedParser,
                    })
                  );
                }}
              />
            </>
          )}
        </small>
      </>
    ),
  },
  {
    sourceType: 'url',
    label: 'Upload from a URL',
    render: ({ uiState, dispatch, ctx, parameter }) => (
      <>
        <TextBox
          className={cx('URLField')}
          value={uiState.url}
          onChange={(newUrl) => {
            dispatch(
              setUrl({
                ...ctx,
                url: newUrl,
              })
            );
          }}
          required={uiState.sourceType === 'url' && !parameter.allowEmptyValue}
        />
        <small>
          <div>The URL should resolve to a list of IDs.</div>
          {parameter.parsers.length > 1 && (
            <>
              <div>Alternatively, please use other formats:</div>
              <FileParserOptions
                parameter={parameter}
                selectedParser={getParser(
                  (uiState) => uiState.urlParser,
                  uiState,
                  parameter
                )}
                onSelectParser={(selectedParser) => {
                  dispatch(
                    setUrlParser({
                      ...ctx,
                      urlParser: selectedParser,
                    })
                  );
                }}
              />
            </>
          )}
        </small>
      </>
    ),
  },
  {
    sourceType: 'basket',
    label: 'Copy from My Basket',
    isAvailable: ({ uiState }) => typeof uiState.basketCount === 'number',
    render: ({ uiState }) =>
      uiState.basketCount == null ? (
        <div>Option is not available</div>
      ) : (
        <div>
          {uiState.basketCount} records will be copied from your basket.
        </div>
      ),
  },
  {
    sourceType: 'strategy',
    label: 'Copy from My Strategy',
    isAvailable: ({ uiState }) =>
      uiState.strategyList != null && uiState.strategyList.length > 0,
    render: ({ ctx, uiState, parameter, dispatch }) => {
      const { strategyList } = uiState;
      if (strategyList == null || strategyList.length === 0)
        return <div>Option is not available</div>;

      const [saved, unsaved] = partition(
        strategyList,
        (strategy) => strategy.isSaved
      );
      return (
        <div>
          <select
            value={getStrategyId(uiState, parameter)}
            onChange={(e) =>
              dispatch(
                setStrategyId({ ...ctx, strategyId: Number(e.target.value) })
              )
            }
            required={
              uiState.sourceType === 'strategy' && !parameter.allowEmptyValue
            }
          >
            {renderStrategyOptGroup('Saved strategies', saved)}
            {renderStrategyOptGroup('Draft strategies', unsaved)}
          </select>
        </div>
      );
    },
  },
];

function renderStrategyOptGroup(
  label: string,
  strategyList: StrategySummary[]
) {
  if (strategyList.length === 0) return null;
  return (
    <optgroup label={label}>
      {strategyList.map((strategy) => (
        <option
          key={strategy.strategyId}
          disabled={!strategy.isValid}
          title={strategy.description || strategy.nameOfFirstStep}
          value={strategy.strategyId}
        >
          {strategy.name} {strategy.isSaved ? '' : '*'} (
          {strategy.estimatedSize == null
            ? '?'
            : strategy.estimatedSize.toLocaleString()}{' '}
          records)
        </option>
      ))}
    </optgroup>
  );
}

function DatasetParamComponent(props: Props<DatasetParam, State>) {
  const { dispatch, uiState, ctx } = props;
  return (
    <div className={cx()}>
      <ul className={cx('SectionList')}>
        {sections.map(({ sourceType, label, render, isAvailable }) => {
          const active = uiState.sourceType === sourceType;
          const enabled = isAvailable ? isAvailable(props) : true;
          return (
            <li
              key={sourceType}
              className={cx('Section', enabled || 'disabled')}
            >
              <label className={cx('Label')}>
                <input
                  type="radio"
                  checked={active}
                  onChange={(e) =>
                    e.target.checked &&
                    dispatch(setSourceType({ ...ctx, sourceType }))
                  }
                />{' '}
                {label}:
              </label>
              <div className={cx('Control', active || 'disabled')}>
                {render(props)}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const observeParam: ParamModule['observeParam'] = (action$, state$, services) =>
  action$.pipe(
    ofType<Action, InitParamAction>(INIT_PARAM),
    mergeMap((action) =>
      from(services.wdkService.getCurrentUser()).pipe(
        mergeMap((user) => {
          const { searchName, parameter, paramValues } = action.payload;

          if (!isType(parameter)) return EMPTY;

          const initializeIdList$ = !paramValues[parameter.name]
            ? EMPTY
            : merge(
                of(
                  setLoadingIdList({
                    searchName,
                    parameter,
                    paramValues,
                    loadingIdList: true,
                  })
                ),
                from(
                  services.wdkService.getDataset(+paramValues[parameter.name])
                ).pipe(
                  mergeMap((datasetParamItems) =>
                    from([
                      setIdList({
                        searchName,
                        paramValues,
                        parameter: parameter as DatasetParam,
                        idList: datasetParamItems
                          .map(datasetItemToString)
                          .join(', '),
                      }),
                      setLoadingIdList({
                        searchName,
                        parameter,
                        paramValues,
                        loadingIdList: false,
                      }),
                    ])
                  )
                )
              );

          if (user.isGuest) return initializeIdList$;
          // load basket count and strategy list
          const questionState = state$.value.questions[searchName];
          const recordClassName =
            questionState && questionState.recordClass.urlSegment;

          if (recordClassName == null) return initializeIdList$;

          return merge(
            services.wdkService.getBasketCounts().then((counts) =>
              setBasketCount({
                searchName,
                paramValues,
                parameter: parameter as DatasetParam,
                basketCount: counts[recordClassName],
              })
            ),
            services.wdkService.getStrategies().then((strategies) =>
              setStrategyList({
                searchName,
                paramValues,
                parameter: parameter as DatasetParam,
                strategyList: orderBy(
                  strategies,
                  (strategy) => !strategy.isSaved
                ).filter(
                  (strategy) => strategy.recordClassName === recordClassName
                ),
              })
            ),
            initializeIdList$
          );
        })
      )
    )
  );

// Create dataset from user selection and set id as param value
const getValueFromState: ParamModule<DatasetParam>['getValueFromState'] = (
  context,
  questionState,
  { wdkService }
) => {
  const { parameter } = context;
  const state: State = questionState.paramUIState[parameter.name];
  const { file, sourceType, url }: State =
    questionState.paramUIState[parameter.name];
  const idList = getIdList(state, parameter);
  const strategyId = getStrategyId(state, parameter);
  const fileParser = getParser(
    (uiState) => uiState.fileParser,
    state,
    parameter
  );
  const urlParser = getParser((uiState) => uiState.urlParser, state, parameter);
  const datasetConfigPromise: Promise<DatasetConfig | void> =
    sourceType === 'file' && file
      ? wdkService.createTemporaryFile(file).then((temporaryFileId) => ({
          sourceType,
          sourceContent: {
            temporaryFileId,
            parser: fileParser,
            searchName: questionState.question.urlSegment,
            parameterName: parameter.name,
          },
        }))
      : sourceType === 'basket'
      ? Promise.resolve({
          sourceType,
          sourceContent: {
            basketName: questionState.question.outputRecordClassName,
          },
        })
      : sourceType === 'strategy' && strategyId
      ? Promise.resolve({ sourceType, sourceContent: { strategyId } })
      : sourceType === 'idList'
      ? Promise.resolve({
          sourceType,
          sourceContent: { ids: idListToArray(idList) },
        })
      : sourceType === 'url' && url
      ? Promise.resolve({
          sourceType,
          sourceContent: {
            url,
            parser: urlParser,
            searchName: questionState.question.urlSegment,
            parameterName: parameter.name,
          },
        })
      : Promise.resolve();

  return datasetConfigPromise.then((config) =>
    config == null ? '' : wdkService.createDataset(config).then(String)
  );
};

interface FileParserOptionsProps {
  parameter: DatasetParam;
  selectedParser: string;
  onSelectParser: (selectedParser: string) => void;
}

function FileParserOptions({
  parameter,
  selectedParser,
  onSelectParser,
}: FileParserOptionsProps) {
  return (
    <ul className={cx('FileParserList')}>
      {parameter.parsers.map((parser) => (
        <li key={parser.name} className={cx('FileParser')}>
          <label
            style={{ marginRight: '1em' }}
            key={parser.name}
            title={parser.description}
          >
            <input
              type="radio"
              value={parser.name}
              checked={selectedParser === parser.name}
              onChange={(e) => e.target.checked && onSelectParser(parser.name)}
            />{' '}
            {parser.displayName}
          </label>
        </li>
      ))}
    </ul>
  );
}

export default createParamModule({
  isType,
  isParamValueValid,
  Component: DatasetParamComponent,
  reduce,
  observeParam,
  getValueFromState,
});
