import { ServiceBase } from '../../Service/ServiceBase';
import {
  NewStrategySpec,
  DuplicateStrategySpec,
  strategySummaryDecoder,
  DeleteStrategySpec,
  StrategyDetails,
  StrategyProperties,
  StepTree,
} from '../../Utils/WdkUser';
import * as Decode from '../../Utils/Json';
import { Identifier } from '../../Utils/WdkModel';

export interface PatchOptions extends StrategyProperties {
  overwriteWith: number;
}

export default (base: ServiceBase) => {
  function getStrategies() {
    return base.sendRequest(Decode.arrayOf(strategySummaryDecoder), {
      method: 'GET',
      path: '/users/current/strategies',
    });
  }

  function createStrategy(
    newStrategySpec: NewStrategySpec,
    userId: string = 'current'
  ) {
    return base._fetchJson<Identifier>(
      'post',
      `/users/${userId}/strategies`,
      JSON.stringify(newStrategySpec)
    );
  }

  function duplicateStrategy(
    copyStepSpec: DuplicateStrategySpec,
    userId: string = 'current'
  ) {
    return base._fetchJson<Identifier>(
      'post',
      `/users/${userId}/strategies`,
      JSON.stringify(copyStepSpec)
    );
  }

  function deleteStrategies(
    deleteStrategiesSpecs: DeleteStrategySpec[],
    userId: string = 'current'
  ) {
    return base._fetchJson<void>(
      'patch',
      `/users/${userId}/strategies`,
      JSON.stringify(deleteStrategiesSpecs)
    );
  }

  // TODO:  use a proper decoder to ensure correct decoding of the StrategyDetails
  function getStrategy(strategyId: number, userId: string = 'current') {
    return base._fetchJson<StrategyDetails>(
      'get',
      `/users/${userId}/strategies/${strategyId}`
    );
  }

  function deleteStrategy(strategyId: number, userId: string = 'current') {
    return base._fetchJson<void>(
      'delete',
      `/users/${userId}/strategies/${strategyId}`
    );
  }

  function patchStrategyProperties(
    strategyId: number,
    strategyProperties: Partial<PatchOptions>,
    userId: string = 'current'
  ) {
    return base._fetchJson<Identifier>(
      'patch',
      `/users/${userId}/strategies/${strategyId}`,
      JSON.stringify(strategyProperties)
    );
  }

  function putStrategyStepTree(
    strategyId: number,
    newStepTree: StepTree,
    userId: string = 'current'
  ) {
    return base._fetchJson<void>(
      'put',
      `/users/${userId}/strategies/${strategyId}/step-tree`,
      JSON.stringify({ stepTree: newStepTree })
    );
  }

  function getDuplicatedStrategyStepTree(
    strategyId: number,
    userId: string = 'current'
  ) {
    return base
      ._fetchJson<{ stepTree: StepTree }>(
        'post',
        `/users/${userId}/strategies/${strategyId}/duplicated-step-tree`,
        JSON.stringify({})
      )
      .then(({ stepTree }) => stepTree);
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
};
