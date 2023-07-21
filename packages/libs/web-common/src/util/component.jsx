/**
 * Created by dfalke on 8/19/16.
 */
import React from 'react';
import PropTypes from 'prop-types';
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
 *
 * @typedef {Function} ComponentDecorator
 */

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
 * @param {Function} getStateFromStore Mapping function applied to the store's state. Note:
 *   the store's state should not be modified. Treat the state as immutable.
 * @return {ComponentDecorator}
 */
export let withStore =
  (getStateFromStore = identity) =>
  (TargetComponent) => {
    class StoreProvider extends React.PureComponent {
      static get displayName() {
        return `${this.name}(${
          TargetComponent.displayName || TargetComponent.name
        })`;
      }

      constructor(props, context) {
        super(props, context);
        this.state = this.getStateFromStore(this.props);
      }

      getStateFromStore(props) {
        return getStateFromStore(this.context.viewStore.getState(), props);
      }

      componentDidMount() {
        this.subscription = this.context.viewStore.addListener(() => {
          this.setState(this.getStateFromStore(this.props));
        });
      }

      componentWillReceiveProps(nextProps) {
        // only update store's state if `getStateFromStore` is using props
        if (getStateFromStore.length === 2) {
          this.setState(this.getStateFromStore(nextProps));
        }
      }

      componentWillUnmount() {
        this.subscription.remove();
      }

      render() {
        return <TargetComponent {...this.props} {...this.state} />;
      }
    }

    StoreProvider.contextTypes = {
      viewStore: PropTypes.object.isRequired,
    };

    return StoreProvider;
  };

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
 * @param {Object} actionCreators An object-map of action creator functions
 * @return {ComponentDecorator}
 */
export let withActions =
  (actionCreators = {}) =>
  (TargetComponent) => {
    class WrappActionCreatorsProvider extends React.PureComponent {
      static get displayName() {
        return `${this.name}(${
          TargetComponent.displayName || TargetComponent.name
        })`;
      }

      constructor(props, context) {
        super(props, context);
        this.wrappedActionCreators = wrapActions(
          context.dispatchAction,
          actionCreators
        );
      }

      render() {
        return (
          <TargetComponent {...this.props} {...this.wrappedActionCreators} />
        );
      }
    }

    WrappActionCreatorsProvider.contextTypes = {
      dispatchAction: PropTypes.func.isRequired,
    };

    return WrappActionCreatorsProvider;
  };

/**
 * Decorates a component so that when any of part of it is copied, all rich
 * formatting is removed.
 */
export let withPlainTextCopy = (TargetComponent) =>
  function PlainTextCopyWrapper(props) {
    return (
      <div onCopy={handleCopy}>
        <TargetComponent {...props} />
      </div>
    );
  };

function handleCopy(event) {
  event.clipboardData.setData('text/plain', window.getSelection().toString());
  event.preventDefault();
}
