// Primitive component for creating a popup window

import $ from 'jquery';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import TabbableContainer from '../../Components/Display/TabbableContainer';

type Props = {
  /** Should the popup be visible or not? */
  open: boolean;

  resizable?: boolean;

  className?: string;

  /**
   * Element which to append the draggable container. Defaults to
   * `document.body`.
   */
  parentSelector?: () => Element;

  /**
   * Element to use to constrain dragging. If set, the popup can only be
   * dragged within the returned Element.
   */
  containerSelector?: () => Element;

  /** Should the popup be draggable? */
  draggable?: boolean;

  /**
   * Set the element to use as a drag handle. This should be a descendent of the
   * content root element. Only used if `draggable` is `true`.
   */
  dragHandleSelector?: () => Element;

  /** Content of popup */
  children: React.ReactElement<any>;
};

// TODO Replace jQueryUI plugin with react-dnd
/**
 * Popup window
 *
 * @example
 * ```
 * class App extends React.Component {
 *   render() {
 *     return (
 *       <div>
 *         <button type="button" onClick={() => this.setState({ open: true })>
 *           Open popup
 *         </button>
 *         <Popup
 *           open={this.state.open}
 *           draggable
 *         >
 *           <div>
 *            <h1>
 *              Some title
 *              <div className="buttons">
 *                <button type="button" onClick={() => this.setState({ open: false })}>
 *                  <Icon fa="close"/>
 *                </button>
 *              </div>
 *            </h1>
 *            <div>Some content</div>
 *           </div>
 *         </Popup>
 *       </div>
 *     );
 *   }
 * }
 * ```
 */
class Popup extends React.Component<Props> {
  static defaultProps = {
    draggable: false,
  };

  containerNode?: HTMLElement;

  popupNode: Element | null = null;

  componentDidMount() {
    // Create container node and attatch it to the parent node.
    this.containerNode = document.createElement('div');
    const parent =
      this.props.parentSelector == null
        ? document.body
        : this.props.parentSelector();
    if (parent !== this.containerNode.parentNode) {
      parent.appendChild(this.containerNode);
    }

    // Force this component to update, since the containerNode did not exist on
    // the first render and we want to render the Portal now. This will also
    // cause `componentDidUpdate` to be called.
    this.forceUpdate();
  }

  componentDidUpdate() {
    this._callJqueryWithProps();
  }

  componentWillUnmount() {
    if (this.popupNode) $(this.popupNode).draggable('destroy');
    if (this.containerNode) this.containerNode.remove();
  }

  _callJqueryWithProps() {
    if (this.popupNode == null) return;
    const $node = $(this.popupNode)
      .draggable({
        addClasses: false,
        containment:
          this.props.containerSelector == null
            ? 'document'
            : this.props.containerSelector(),
        handle:
          this.props.dragHandleSelector == null
            ? false
            : this.props.dragHandleSelector(),
      })
      .toggle(this.props.open);

    if (this.props.resizable) {
      $node.resizable({
        handles: 'all',
        minWidth: 100,
        minHeight: 100,
      });
    }
  }

  render() {
    const children = React.cloneElement(this.props.children, {
      ref: (c: React.ReactInstance | null) =>
        (this.popupNode = c && (ReactDOM.findDOMNode(c) as HTMLElement)),
    });
    const content = (
      <TabbableContainer autoFocus className={this.props.className || ''}>
        {children}
      </TabbableContainer>
    );
    return this.containerNode
      ? ReactDOM.createPortal(content, this.containerNode)
      : null;
  }
}

export default Popup;
