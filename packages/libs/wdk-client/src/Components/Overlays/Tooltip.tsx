/**
 * Wrapper for the jquery plugin q-tip (http://qtip2.com/).
 *
 * This will eventually be replaced by a pure React component, as a part of an
 * initiative to remove our jQuery dependency.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import { lazy, wrappable } from 'wdk-client/Utils/ComponentUtils';

let defaultOptions = {
  position: {
    my: "top left",
    at: "bottom left"
  },
  hide: {
    fixed: true,
    delay: 250
  },
  show: {
    solo: true,
    delay: 1000
  }
};

export interface TooltipPosition {
  my?: string;
  at?: string;
};

// FIXME Add `renderContent` props that is a function that returns `typeof content`
type Props = {
  content: React.ReactNode;
  open?: boolean;
  classes?: string;
  showTip?: boolean;
  showEvent?: string;
  showDelay?: number;
  hideEvent?: string;
  hideDelay?: number;
  position?: TooltipPosition;
  solo?: boolean;
  children: React.ReactChild;
  onShow?: (e: Event) => void;
  onHide?: (e: Event) => void;
}

class Tooltip extends React.PureComponent<Props> {

  api?: QTip2.Api;

  contentContainer = document.createElement('div');

  componentDidMount() {
    this._setupTooltip(this.props);
  }

  componentWillReceiveProps(nextProps: Props) {
    if (this.api == null) {
      this._setupTooltip(nextProps);
      return;
    }

    if (nextProps.open != null) {
      this.api.toggle(nextProps.open);
    }

    if (nextProps.classes != null) {
      this.api.set('style.classes', nextProps.classes);
    }

    if (nextProps.showEvent != null) {
      this.api.set('show.event', nextProps.open == null ? nextProps.showEvent : false);
    }

    if (nextProps.hideEvent != null) {
      this.api.set('hide.event', nextProps.open == null ? nextProps.hideEvent : false);
    }

    if (nextProps.position != null) {
      this.api.set('position.at', nextProps.position.at);
      this.api.set('position.my', nextProps.position.my);
    }

    this.api.reposition();
  }

  componentWillUnmount() {
    this._destroyTooltip();
  }

  _setupTooltip(props: Props) {
    let {
      content,
      open,
      showEvent,
      showDelay = defaultOptions.show.delay,
      hideEvent,
      hideDelay = defaultOptions.hide.delay,
      classes = 'qtip-wdk',
      position = defaultOptions.position,
      solo = true,
      showTip = true
    } = props;

    if (content == null) { return; }

    if (open != null && (showEvent != null || hideEvent != null)) {
      console.warn('Tooltip was passed props `open` and either `showEvent` or `hideEvent`. ' +
        'Since `open` was provided, `showEvent` and `hideEvent` will be ignored.');
    }

    this.api = $(ReactDOM.findDOMNode(this) as HTMLElement).qtip({
      content: { text: $(this.contentContainer) },
      style: { classes, tip: { corner: showTip } },
      show: { ...defaultOptions.show, solo, event: open == null ? showEvent : false, delay: showDelay },
      hide: { ...defaultOptions.hide, event: open == null ? hideEvent : false, delay: hideDelay },
      position,
      events: {
        show: event => {
          if (props.onShow) props.onShow(event);
        },
        hide: event => {
          if (props.onHide) props.onHide(event);
        }
      }
    }).qtip('api');

    if (open != null) this.api.toggle(open);
  }

  _destroyTooltip() {
    $(ReactDOM.findDOMNode(this) as HTMLElement).qtip('destroy');
  }

  render() {
    return (
      <React.Fragment>
        {React.Children.only(this.props.children)}
        {ReactDOM.createPortal(this.props.content, this.contentContainer)}
      </React.Fragment>
    )
  }

}

export const EagerlyLoadedTooltip = wrappable(Tooltip);

const withJquery = lazy<Props>(async () => {
  // @ts-ignore
  await import('!!script-loader!../../../vendored/jquery.qtip.min.js');
});

export default wrappable(withJquery(Tooltip));
