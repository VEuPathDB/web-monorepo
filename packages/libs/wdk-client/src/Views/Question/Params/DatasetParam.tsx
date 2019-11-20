import { orderBy, partition } from 'lodash';
import React from 'react';
import { ofType } from 'redux-observable';
import { EMPTY, from, merge } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { DatasetParam, Parameter } from 'wdk-client/Utils/WdkModel';
import { StrategySummary } from 'wdk-client/Utils/WdkUser';
import { datasetItemToString, idListToArray } from 'wdk-client/Views/Question/Params/DatasetParamUtils';
import {
  Props,
  Context,
  createParamModule,
  ParamModule
} from 'wdk-client/Views/Question/Params/Utils';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';

import 'wdk-client/Views/Question/Params/DatasetParam.scss';
import { DatasetConfig } from 'wdk-client/Service/Mixins/DatasetsService';
import { INIT_PARAM, InitParamAction } from 'wdk-client/Actions/QuestionActions';
import {
  SET_BASKET_COUNT,
  SET_FILE,
  SET_FILE_PARSER,
  SET_ID_LIST,
  SET_LOADING_ID_LIST,
  SET_SOURCE_TYPE,
  SET_STRATEGY_ID,
  SET_STRATEGY_LIST,
  setBasketCount,
  setFile,
  setFileParser,
  setIdList,
  setLoadingIdList,
  setSourceType,
  setStrategyId,
  setStrategyList,
} from 'wdk-client/Actions/DatasetParamActions';
import { Action } from 'wdk-client/Actions';

const cx = makeClassNameHelper('wdk-DatasetParam');

// TODO We will have to include an onSubmit hook that will convert the user's
// selection to a Dataset using the DatasetService. We need an API that allows
// awaiting of some sort, using Promises, some state flag, or something else.

type State = {
  sourceType: 'idList' | 'file' | 'basket' | 'strategy';
  idList?: string;
  loadingIdList?: boolean;
  file?: File | null;
  strategyList?: StrategySummary[];
  strategyId?: number;
  basketCount?: number;
  fileParser?: DatasetParam['parsers'][number]['name'];
}


function isType(parameter: Parameter): parameter is DatasetParam {
  return parameter.type === 'input-dataset';
}

function isParamValueValid(ctx: Context<DatasetParam>) {
  // return !isEmpty(ctx.paramValues[ctx.parameter.name]);
  return true;
}

const defaultState: State = {
  sourceType: 'idList'
}

const getInitialParser = (parameter: DatasetParam) =>
  parameter.parsers[0].name

function reduce(state: State = defaultState, action: Action): State {
  switch(action.type) {
    case INIT_PARAM: {
      const { parameter, initialParamData } = action.payload;
      const initialListName = parameter.name + '.idList';
      return {
        ...state,
        sourceType: 'idList',
        idList: initialParamData
          ? initialParamData[initialListName]
          : (parameter as DatasetParam).defaultIdList
      }
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
        strategyId: action.payload.strategyList.length > 0 ? action.payload.strategyList[0].strategyId : undefined
      };
    case SET_STRATEGY_ID:
      return { ...state, strategyId: action.payload.strategyId };
    case SET_BASKET_COUNT:
      return { ...state, basketCount: action.payload.basketCount };
    case SET_FILE_PARSER:
      return { ...state, fileParser: action.payload.fileParser };
    default:
      return state;
  }
}

const getIdList = (uiState: State, parameter: DatasetParam) =>
    uiState.idList

const getParser = (uiState: State, parameter: DatasetParam) =>
  uiState.fileParser == null
    ? getInitialParser(parameter)
    : uiState.fileParser;

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
}

const sections: Section[] = [
  {
    sourceType: 'idList',
    label: 'Enter a list of IDs or text',
    isAvailable: ({ uiState }) => !uiState.loadingIdList,
    render: ({ ctx, dispatch, parameter, uiState }) =>
      <div className={uiState.loadingIdList ? cx('IdList', 'loading') : cx('IdList')}>
        <textarea
          rows={5}
          cols={30}
          value={getIdList(uiState, parameter)}
          onChange={e => dispatch(setIdList({ ...ctx, idList: e.target.value }))}
          required={uiState.sourceType === 'idList' && !parameter.allowEmptyValue}
        />
      </div>
  },
  {
    sourceType: 'file',
    label: 'Upload a text file',
    render: ({ uiState, dispatch, ctx, parameter }) =>
      <>
        <input
          type="file"
          accept="text/*"
          onChange={e => dispatch(setFile({ ...ctx, file: e.target.files && e.target.files[0] }))}
          required={uiState.sourceType === 'file' && !parameter.allowEmptyValue}
        />
        <small>
          <div>Maximum size 10MB. The file should contain the list of IDs.</div>
          {parameter.parsers.length > 1 && (
            <>
              <div>Alternatively, please use other file formats:</div>
              <ul className={cx('FileParserList')}>
                {parameter.parsers.map(parser =>
                  <li key={parser.name} className={cx('FileParser')}>
                    <label
                      style={{marginRight: '1em'}}
                      key={parser.name}
                      title={parser.description}
                    >
                      <input
                        type="radio"
                        value={parser.name}
                        checked={getParser(uiState, parameter) === parser.name}
                        onChange={e => e.target.checked && dispatch(setFileParser({...ctx, fileParser: parser.name}))}
                      /> {parser.displayName}
                    </label>
                  </li>
                )}
              </ul>
            </>
          )}
        </small>
      </>
  },
  {
    sourceType: 'basket',
    label: 'Copy from My Basket',
    isAvailable: ({ uiState }) => typeof uiState.basketCount === 'number',
    render: ({ uiState }) =>
      uiState.basketCount == null
        ? <div>Option is not available</div>
        : <div>{uiState.basketCount} records will be copied from your basket.</div>
  },
  {
    sourceType: 'strategy',
    label: 'Copy from My Strategy',
    isAvailable: ({ uiState }) => uiState.strategyList != null && uiState.strategyList.length > 0,
    render: ({ ctx, uiState, parameter, dispatch }) => {
      const { strategyList } = uiState;
      if (strategyList == null || strategyList.length === 0) return (
        <div>Option is not available</div>
      );

      const [ saved, unsaved ] = partition(strategyList, strategy => strategy.isSaved);
      return (
        <div>
          <select 
            value={getStrategyId(uiState, parameter)} 
            onChange={e => dispatch(setStrategyId({ ...ctx, strategyId: Number(e.target.value) }))}
            required={uiState.sourceType === 'strategy' && !parameter.allowEmptyValue}
          >
            {renderStrategyOptGroup('Saved strategies', saved)}
            {renderStrategyOptGroup('Draft strategies', unsaved)}
          </select>
        </div>
      );
    }
  }
]

function renderStrategyOptGroup(label: string, strategyList: StrategySummary[]) {
  if (strategyList.length === 0) return null;
  return (
    <optgroup label={label}>
      {strategyList.map(strategy =>
        <option key={strategy.strategyId} disabled={!strategy.isValid} title={strategy.description || strategy.nameOfFirstStep} value={strategy.strategyId}>
          {strategy.name} {strategy.isSaved ? '' : '*'} ({strategy.estimatedSize == null ? '?' : strategy.estimatedSize.toLocaleString()} records)
        </option>
      )}
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
            <li key={sourceType} className={cx('Section', enabled || 'disabled')} >
              <label className={cx('Label')} >
                <input
                  type="radio"
                  checked={active}
                  onChange={e => e.target.checked && dispatch(setSourceType({ ...ctx, sourceType }))}
                /> {label}:
              </label>
              <div className={cx('Control', active || 'disabled')} >{render(props)}</div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

const observeParam: ParamModule['observeParam'] = (action$, state$, services) => action$.pipe(
  ofType<InitParamAction>(INIT_PARAM),
  mergeMap(action =>
    from(services.wdkService.getCurrentUser()).pipe(
      mergeMap(user => {
        const { searchName, parameter, paramValues } = action.payload;

        if (!isType(parameter)) return EMPTY;

        const initializeIdList$ = !paramValues[parameter.name]
          ? EMPTY
          : [
              setLoadingIdList({ searchName, parameter, paramValues, loadingIdList: true }),
              services.wdkService.getDataset(+paramValues[parameter.name])
                .then(
                  datasetParamItems => 
                    [
                      setIdList({
                        searchName,
                        paramValues,
                        parameter: (parameter as DatasetParam),
                        idList: datasetParamItems.map(datasetItemToString).join(', ')
                      }),
                      setLoadingIdList({ searchName, parameter, paramValues, loadingIdList: false })
                    ]
                )
                .catch(
                    _ => setLoadingIdList({ searchName, parameter, paramValues, loadingIdList: false })
                )
            ];

        if (user.isGuest) return initializeIdList$;
        // load basket count and strategy list
        const questionState = state$.value.questions[searchName]
        const recordClassName = questionState && questionState.recordClass.urlSegment;

        if (recordClassName == null) return initializeIdList$;

        return merge(
          services.wdkService.getBasketCounts().then(
            counts => setBasketCount({
              searchName,
              paramValues,
              parameter: (parameter as DatasetParam),
              basketCount: counts[recordClassName]
            })
          ),
          services.wdkService.getStrategies().then(
            strategies => setStrategyList({
              searchName,
              paramValues,
              parameter: (parameter as DatasetParam),
              strategyList: orderBy(strategies, strategy => !strategy.isSaved)
                .filter(strategy => strategy.recordClassName === recordClassName)
            })
          ),
          initializeIdList$
        );
      })
    )
  ),
);

// Create dataset from user selection and set id as param value
const getValueFromState: ParamModule<DatasetParam>['getValueFromState'] = (context, questionState, { wdkService }) => {
  const { parameter } = context;
  const state : State = questionState.paramUIState[parameter.name];
  const { file, sourceType } : State = questionState.paramUIState[parameter.name];
  const idList = getIdList(state, parameter);
  const strategyId = getStrategyId(state, parameter);
  const parser = getParser(state, parameter);
  const datasetConfigPromise: Promise<DatasetConfig | void> =
    sourceType === 'file' && file
      ? wdkService.createTemporaryFile(file).then(temporaryFileId => ({
        sourceType,
        sourceContent: {
          temporaryFileId,
          parser,
          searchName: questionState.question.urlSegment,
          parameterName: parameter.name
        }
      }))
    : sourceType === 'basket' ? Promise.resolve({ sourceType, sourceContent: { basketName: questionState.question.outputRecordClassName } })
    : sourceType === 'strategy' && strategyId ? Promise.resolve({ sourceType, sourceContent: { strategyId } })
    : sourceType === 'idList' ? Promise.resolve({ sourceType, sourceContent: { ids: idListToArray(idList) } })
    : Promise.resolve();

  return datasetConfigPromise.then(config => config == null ? '' : wdkService.createDataset(config).then(String));
}

export default createParamModule({
  isType,
  isParamValueValid,
  Component: DatasetParamComponent,
  reduce,
  observeParam,
  getValueFromState
});
