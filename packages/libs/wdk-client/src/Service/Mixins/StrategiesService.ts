import { ServiceBase } from 'wdk-client/Service/ServiceBase';
import { NewStrategySpec, DuplicateStrategySpec, strategySummaryDecoder, DeleteStrategySpec, StrategyDetails, StrategyProperties, StepTree, } from 'wdk-client/Utils/WdkUser';
import * as Decode from 'wdk-client/Utils/Json';
import { Identifier } from 'wdk-client/Utils/WdkModel';

export default (base: ServiceBase) => {

  function getStrategies() {
    return base.sendRequest(Decode.arrayOf(strategySummaryDecoder), {
      method: 'GET',
      path: '/users/current/strategies'
    })
  }

  function createStrategy(newStrategySpec: NewStrategySpec, userId: string = "current") {
    return base._fetchJson<Identifier>('post', `/users/${userId}/strategies`, JSON.stringify(newStrategySpec));
  }

  function duplicateStrategy(copyStepSpec: DuplicateStrategySpec, userId: string = "current") {
    return base._fetchJson<Identifier>('post', `/users/${userId}/strategies`, JSON.stringify(copyStepSpec));
  }

  function deleteStrategies(deleteStrategiesSpecs: DeleteStrategySpec[], userId: string = "current") {
    return base._fetchJson<void>('delete', `/users/${userId}/strategies`, JSON.stringify(deleteStrategiesSpecs));
  }

  // TODO:  use a proper decoder to ensure correct decoding of the StrategyDetails
  function getStrategy(strategyId: number, userId: string = "current") {
    return base._fetchJson<StrategyDetails>('get', `/users/${userId}/strategies/${strategyId}`);
  }
  
  function deleteStrategy(strategyId: number, userId: string = "current") {
    return base._fetchJson<void>('delete', `/users/${userId}/strategies/${strategyId}`);
  }
  
  function patchStrategyProperties(strategyId: number, strategyProperties: Partial<StrategyProperties>, userId: string = "current") {
    return base._fetchJson<Identifier>('patch', `/users/${userId}/strategies/${strategyId}`, JSON.stringify(strategyProperties));
  }

  function putStrategyStepTree(strategyId: number, newStepTree: StepTree, userId: string = "current") {
    return base._fetchJson<void>('put', `/users/${userId}/strategies/${strategyId}/step-tree`, JSON.stringify({ stepTree: newStepTree }));
  }

  function getDuplicatedStrategyStepTree(strategyId: number,  userId: string = "current") {
    return base._fetchJson<StepTree>('post', `/users/${userId}/strategies/${strategyId}/duplicated-step-tree`, JSON.stringify({}));
  }

  return { 
    getStrategies,
    createStrategy,
    duplicateStrategy,
    deleteStrategies,
    getStrategy,
    deleteStrategy,
    patchStrategyProperties,
    putStrategyStepTree,
    getDuplicatedStrategyStepTree,
   };

}
