import AbstractViewController from '../../Core/Controllers/AbstractViewController';
import WdkStore, { BaseState } from '../../Core/State/Stores/WdkStore';
import { Action, ActionCreatorRecord } from '../../Utils/ActionCreatorUtils';
import { StoreConstructor } from '../CommonTypes';

/**
 * Simple implementation of 'AbstractViewController' that uses 'WdkStore' and
 * its state. This is useful for ViewControllers that do not need anything in
 * addition to 'BaseState'.
 *
 * This is here mostly because it is not possible to provide this default
 * functionality in AbstractViewController. The type system is unable to ensure
 * that BaseState is compatible with the AbstractViewController's generic State
 * type parameter. This could potentially be avoided by removing the
 * 'getStateFromStore' method hook, but the easy-to-add performance gains we
 * get from 'getStateFromStore' might outweigh the extra layer here.
 */
export default class WdkViewController<
  State extends {} = BaseState,
  Store extends WdkStore = WdkStore,
  ActionCreators extends ActionCreatorRecord<Action> = {},
  Props = {}
> extends AbstractViewController<BaseState, WdkStore, ActionCreators, Props> {

  getStateFromStore() {
    return this.store.getState();
  }

  getStoreClass(): StoreConstructor<WdkStore> {
    return WdkStore;
  }

}
