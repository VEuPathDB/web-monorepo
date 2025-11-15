/**
 * Created by dfalke on 8/19/16.
 */
import React from 'react';
import { identity } from 'lodash';
import { wrapActions } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

/**
 * A function that takes a React Component (class or function) and
 * returns a new React Component. ComponentDecorators are used to
 * enhance the behavior of another Component.
 *
 * Because all ComponentDecorators take a Component and return a
 * new Component, they can be composed using standard function
 * composition. This makes it possible to combine several specialized
 * ComponentDecorators into a single, unique ComponentDecorator.
 */
export type ComponentDecorator<P = any, R = P> = (
  component: React.ComponentType<P>
) => React.ComponentType<R>;

interface ViewStore<State = any> {
  getState: () => State;
  addListener: (listener: () => void) => { remove: () => void };
}

interface StoreContext<State = any> {
  viewStore: ViewStore<State>;
}

interface ActionContext {
  dispatchAction: (action: any) => void;
}

/**
 * Creates a React Component decorator that handles subscribing to the store
 * available on the current React context, and passes the store's state to the
 * decorated Component as props. The optional function `getStateFromStore` is
 * used to map the store's state before passing it to the decorated Component.
 *
 * Example:
 * ```
 * // A Header component that requires a user object
 * function Header(props) {
 *   return (
 *     <div>
 *       {...}
 *       <a href="profile">{props.user.fullName}</a>
 *     </div>
 *   );
 * }
 *
 * // Function that gets the user from the store's state.
 * function getUser(state) {
 *   return {
 *     user: state.globalData.user
 *   };
 * }
 *
 * // Decorate the Header component to get the up-to-date user from the store.
 * let HeaderWithStore = withStore(getUser)(Header);
 * ```
 *
 * @param getStateFromStore Mapping function applied to the store's state. Note:
 *   the store's state should not be modified. Treat the state as immutable.
 * @return ComponentDecorator
 */
export function withStore<State = any, MappedState = State, Props = {}>(
  getStateFromStore: (
    state: State,
    props?: Props
  ) => MappedState = identity as any
) {
  return function <P extends MappedState>(
    TargetComponent: React.ComponentType<P>
  ): React.ComponentType<Omit<P, keyof MappedState> & Props> {
    type StoreProviderProps = Omit<P, keyof MappedState> & Props;
    type StoreProviderState = MappedState;

    class StoreProvider extends React.PureComponent<
      StoreProviderProps,
      StoreProviderState
    > {
      static displayName = `withStore(${
        TargetComponent.displayName || TargetComponent.name
      })`;

      declare context: StoreContext<State>;
      private subscription?: { remove: () => void };

      constructor(props: StoreProviderProps, context: StoreContext<State>) {
        super(props, context);
        this.state = this.getStateFromStore(this.props);
      }

      getStateFromStore(
        props: Readonly<StoreProviderProps>
      ): StoreProviderState {
        return getStateFromStore(
          this.context.viewStore.getState(),
          props as Props
        );
      }

      componentDidMount() {
        this.subscription = this.context.viewStore.addListener(() => {
          this.setState(this.getStateFromStore(this.props));
        });
      }

      UNSAFE_componentWillReceiveProps(
        nextProps: Readonly<StoreProviderProps>
      ) {
        // only update store's state if `getStateFromStore` is using props
        if (getStateFromStore.length === 2) {
          this.setState(this.getStateFromStore(nextProps));
        }
      }

      componentWillUnmount() {
        this.subscription?.remove();
      }

      render() {
        return <TargetComponent {...(this.props as any)} {...this.state} />;
      }
    }

    return StoreProvider as any;
  };
}

/**
 * Creates a Component decorator that passes a set of wrapped action creators
 * to the decorated Component as props of the same name. The action creators are
 * wrapped such that they use the `dispatchAction` function available on the
 * current React context.
 *
 * Example:
 * ```
 * function Header(props) {
 *   return (
 *     //...
 *     <a href="login" onClick={props.onLogin}>Login</a>
 *     //...
 *   );
 * }
 * ```
 *
 * @param actionCreators An object-map of action creator functions
 * @return ComponentDecorator
 */
export function withActions<
  Actions extends Record<string, (...args: any[]) => any> = {}
>(actionCreators: Actions = {} as Actions) {
  return function <P extends Actions>(
    TargetComponent: React.ComponentType<P>
  ): React.ComponentType<Omit<P, keyof Actions>> {
    type WrappedActionCreatorsProviderProps = Omit<P, keyof Actions>;

    class WrappedActionCreatorsProvider extends React.PureComponent<WrappedActionCreatorsProviderProps> {
      static displayName = `withActions(${
        TargetComponent.displayName || TargetComponent.name
      })`;

      declare context: ActionContext;
      private wrappedActionCreators: Actions;

      constructor(
        props: WrappedActionCreatorsProviderProps,
        context: ActionContext
      ) {
        super(props, context);
        this.wrappedActionCreators = wrapActions(
          context.dispatchAction,
          actionCreators
        );
      }

      render() {
        return (
          <TargetComponent
            {...(this.props as any)}
            {...this.wrappedActionCreators}
          />
        );
      }
    }

    return WrappedActionCreatorsProvider as any;
  };
}

/**
 * Decorates a component so that when any of part of it is copied, all rich
 * formatting is removed.
 */
export function withPlainTextCopy<P extends {}>(
  TargetComponent: React.ComponentType<P>
): React.ComponentType<P> {
  return function PlainTextCopyWrapper(props: P) {
    return (
      <div onCopy={handleCopy}>
        <TargetComponent {...props} />
      </div>
    );
  };
}

function handleCopy(event: React.ClipboardEvent) {
  event.clipboardData.setData(
    'text/plain',
    window.getSelection()?.toString() || ''
  );
  event.preventDefault();
}
