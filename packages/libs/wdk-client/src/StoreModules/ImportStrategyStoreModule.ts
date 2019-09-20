import {combineEpics, StateObservable} from 'redux-observable';
import {InferAction, mergeMapRequestActionsToEpic as mrate} from 'wdk-client/Utils/ActionCreatorUtils';
import {transitionToInternalPage} from 'wdk-client/Actions/RouterActions';
import {requestImportStrategy} from 'wdk-client/Actions/ImportStrategyActions';
import {EpicDependencies} from 'wdk-client/Core/Store';
import {RootState} from 'wdk-client/Core/State/Types';

export const key = 'importStrategy';

export function reduce() {
  return null;
}

export const observe = combineEpics(
  mrate([requestImportStrategy], getTransitionOnImport)
)

async function getTransitionOnImport(
  [action]: [InferAction<typeof requestImportStrategy>],
  state$: StateObservable<RootState>,
  { wdkService }: EpicDependencies
): Promise<InferAction<typeof transitionToInternalPage>> {
  const { strategySignature, selectedTab } = action.payload;
  const { id } = await wdkService.duplicateStrategy({ sourceStrategySignature: strategySignature });

  const baseRoutePath = `/workspace/strategies/${id}`;
  const transitionOptions = { replace: true };

  if (selectedTab !== 'stepAnalysis:first_analysis') return transitionToInternalPage(baseRoutePath, transitionOptions);

  const newStrategy = await wdkService.getStrategy(id);
  // get the id of the first analysis of the root step of the strategy
  const [firstAnalysis] = await wdkService.getAppliedStepAnalyses(newStrategy.rootStepId);

  if (firstAnalysis == null) return transitionToInternalPage(baseRoutePath, transitionOptions);

  return transitionToInternalPage(`${baseRoutePath}/${newStrategy.rootStepId}?selectedTab=stepAnalysis:${firstAnalysis.analysisId}`, transitionOptions);
}
