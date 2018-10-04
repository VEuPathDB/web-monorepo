import React from 'react';
import { EMPTY, from, merge } from 'rxjs';
import { filter, mergeMap } from 'rxjs/operators';
import { DatasetParam, Parameter } from '../../../Utils/WdkModel';
import { Strategy } from '../../../Utils/WdkUser';
import { Props, Context, createParamModule, ParamModule } from './Utils';
import { makeActionCreator } from '../../../Utils/ActionCreatorUtils';
import { makeClassNameHelper } from '../../../Utils/ComponentUtils';
import { matchAction } from '../../../Utils/ReducerUtils';
import { ParamInitAction, ParamValueUpdatedAction, QuestionSubmitRequested } from '../QuestionActionCreators';

import './DatasetParam.scss';
import { valueToArray } from './EnumParamUtils';
import { DatasetConfig } from '../../../Utils/WdkService';

const cx = makeClassNameHelper('wdk-DatasetParam');

// TODO We will have to include an onSubmit hook that will convert the user's
// selection to a Dataset using the DatasetService. We need an API that allows
// awaiting of some sort, using Promises, some state flag, or something else.

type State = {
  sourceType: 'idList' | 'file' | 'basket' | 'strategy';
  idList?: string;
  file?: File | null;
  strategyList?: Strategy[];
  strategyId?: number;
  basketCount?: number;
  fileParser?: DatasetParam['parsers'][number]['name'];
}

type Payload<T extends keyof State> = Context<DatasetParam> & Pick<State, T>;

export const SetSourceType = makeActionCreator<Payload<'sourceType'>, 'dataset-param/source-type-set'>('dataset-param/source-type-set');
export const SetIdList = makeActionCreator<Payload<'idList'>, 'dataset-param/id-list-set'>('dataset-param/id-list-set');
export const SetFile = makeActionCreator<Payload<'file'>, 'dataset-param/file-id-list-set'>('dataset-param/file-id-list-set');
export const SetStrategyList = makeActionCreator<Payload<'strategyList'>, 'dataset-param/strategy-list-set'>('dataset-param/strategy-list-set');
export const SetStrategyId = makeActionCreator<Payload<'strategyId'>, 'dataset-param/strategy-id-set'>('dataset-param/strategy-id-set');
export const SetBasketCount = makeActionCreator<Payload<'basketCount'>, 'dataset-param/basket-count-set'>('dataset-param/basket-count-set');
export const SetFileParser = makeActionCreator<Payload<'fileParser'>, 'dataset-param/file-parser-set'>('dataset-param/file-parser-set');

function isType(parameter: Parameter): parameter is DatasetParam {
  return parameter.type === 'DatasetParam';
}

function isParamValueValid(ctx: Context<DatasetParam>) {
  // return !isEmpty(ctx.paramValues[ctx.parameter.name]);
  return true;
}

const defaultState: State = {
  sourceType: 'idList'
}

const getInitialParser = (parameter: DatasetParam) =>
  parameter.parsers.length > 0 ? parameter.parsers[0].name : undefined

const reduce = matchAction(defaultState,
  [ParamInitAction, (state, { parameter: parameter}) => ({
    ...state,
    idList: (parameter as DatasetParam).defaultIdList,
    fileParser: getInitialParser(parameter as DatasetParam)
  })],
  [SetSourceType, (state, { sourceType }) => ({ ...state, sourceType })],
  [SetIdList, (state, { idList }) => ({ ...state, idList })],
  [SetFile, (state, { file }) => ({ ...state, file })],
  [SetStrategyList, (state, { strategyList }) => ({ ...state, strategyList })],
  [SetStrategyId, (state, { strategyId }) => ({ ...state, strategyId })],
  [SetBasketCount, (state, { basketCount }) => ({ ...state, basketCount })],
  [SetFileParser, (state, { fileParser }) => (console.log(fileParser), ({ ...state, fileParser }))],
)


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
    render: ({ uiState, dispatch, ctx }) =>
      <textarea
        rows={5}
        cols={30}
        value={uiState.idList}
        onChange={e => dispatch(SetIdList.create({ ...ctx, idList: e.target.value }))}
      />
  },
  {
    sourceType: 'file',
    label: 'Upload a text file',
    render: ({ uiState, dispatch, ctx }) =>
      <>
        <input
          type="file"
          accept="text/*"
          onChange={e => dispatch(SetFile.create({ ...ctx, file: e.target.files && e.target.files[0] }))}
        />
        <small>
          <div>Maximum size 10MB. The file should contain the list of IDs.</div>
          {ctx.parameter.parsers.length > 1 && (
            <>
              <div>Alternatively, please use other file formats:</div>
              <ul className={cx('FileParserList')}>
                {ctx.parameter.parsers.map(parser =>
                  <li key={parser.name} className={cx('FileParser')}>
                    <label
                      style={{marginRight: '1em'}}
                      key={parser.name}
                      title={parser.description}
                    >
                      <input
                        type="radio"
                        value={parser.name}
                        checked={uiState.fileParser === parser.name}
                        onChange={e => e.target.checked && dispatch(SetFileParser.create({...ctx, fileParser: parser.name}))}
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
        ? <div>Options is not available</div>
        : <div>{uiState.basketCount} records will be copied from your basket.</div>
  },
  {
    sourceType: 'strategy',
    label: 'Copy from My Strategy',
    isAvailable: ({ uiState }) => uiState.strategyList != null && uiState.strategyList.length > 0,
    render: ({ ctx, uiState }) =>
      <div>
        {uiState.strategyList
          ? <select value={uiState.strategyId} onChange={e => SetStrategyId.create({ ...ctx, strategyId: Number(e.target.value) })}>
              {uiState.strategyList.map(strategy =>
                <option key={strategy.strategyId} title="Can you see me?" value={strategy.strategyId}>{strategy.name}</option>
              )}
            </select>
          : 'Option is not available' }
      </div>
  }
]

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
                  onChange={e => e.target.checked && dispatch(SetSourceType.create({ ...ctx, sourceType }))}
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
  filter(ParamInitAction.test),
  mergeMap(action =>
    from(services.wdkService.getCurrentUser()).pipe(
      mergeMap(user => {
        if (user.isGuest) return EMPTY;
        // load basket count and strategy list
        const { questionName, parameter, paramValues } = action.payload;
        const questionState = state$.value.questions[questionName]
        const recordClassName = questionState && questionState.recordClass.name;

        if (recordClassName == null) return EMPTY;

        return merge(
          services.wdkService.getBasketCounts().then(
            counts => SetBasketCount.create({
              questionName,
              paramValues,
              parameter: (parameter as DatasetParam),
              basketCount: counts[recordClassName]
            })
          ),
          services.wdkService.getStrategies().then(
            strategies => SetStrategyList.create({
              questionName,
              paramValues,
              parameter: (parameter as DatasetParam),
              strategyList: strategies.filter(strategy => strategy.recordClassName === recordClassName)
            })
          )
        );
      })
    )
  ),
);

// Create dataset from user selection and set id as param value
const observeSubmit: ParamModule['observeSubmit'] = (action$, state$, { wdkService }) => action$.pipe(
  filter(QuestionSubmitRequested.test),
  mergeMap(action => {
    const { questionName } = action.payload;
    const questionState = state$.value.questions[action.payload.questionName];
    if (questionState == null) return EMPTY;
    return merge(...questionState.question.parameters
      .filter(isType)
      .map(parameter => {
        const { idList, file, strategyId, sourceType } : State = questionState.paramUIState[parameter.name];
        const datasetConfigPromise: Promise<DatasetConfig | void> =
          sourceType === 'file' && file
            ? wdkService.createTemporaryFile(file).then(temporaryFileId => ({ sourceType, sourceContent: { temporaryFileId }}))
          : sourceType === 'basket' ? Promise.resolve({ sourceType, sourceContent: { basketName: questionState.question.recordClassName } })
          : sourceType === 'strategy' && strategyId ? Promise.resolve({ sourceType, sourceContent: { strategyId } })
          : sourceType === 'idList' ? Promise.resolve({ sourceType, sourceContent: { ids: valueToArray(idList) } })
          : Promise.resolve();

        return datasetConfigPromise.then(config => {
          if (config == null) throw new Error('Dataset param is not properly defined.')
          return wdkService.createDataset(config);
        }).then(
          datasetId => ParamValueUpdatedAction.create({
            questionName,
            parameter,
            paramValues: questionState.paramValues,
            paramValue: datasetId
          })
        );
      })
    )
  })
)

export default createParamModule({
  isType,
  isParamValueValid,
  Component: DatasetParamComponent,
  reduce,
  observeParam
})

function readFileAsText(input: HTMLInputElement): Promise<string> {
  const file = input.files && input.files[0];
  if (file == null) return Promise.resolve('');
  const reader = new FileReader();
  reader.readAsText(file, 'utf-8');
  return new Promise(function(resolve, reject) {
    reader.addEventListener('loadend', function(event: any) {
      const { result, error } = event.target;
      if (error) reject(error);
      else resolve(result);
    });
  })
}