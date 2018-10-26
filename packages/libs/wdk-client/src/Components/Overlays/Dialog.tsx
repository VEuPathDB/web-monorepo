import Icon from 'wdk-client/Components/Icon/Icon';
import Popup from 'wdk-client/Components/Overlays/Popup';
import React, { Component, ReactNode } from 'react';
import { makeClassNameHelper, wrappable } from 'wdk-client/Utils/ComponentUtils';
import 'wdk-client/Components/Overlays/Dialog.css';



let c = makeClassNameHelper('wdk-Dialog');
let c2 = makeClassNameHelper(' ');

class BodyScrollManager {
  private refs = new Map<object, boolean>();

  blockScroll(instance: object) {
    this.refs.set(instance, true);
    this.updateBodyClass();
  }

  unblockScroll(instance: object) {
    this.refs.set(instance, false);
    this.updateBodyClass();
  }

  private updateBodyClass() {
    const classes = document.body.classList;
    const add = [...this.refs.values()].some(n => n);
    if (add) classes.add('wdk-ModalOpen');
    else classes.remove('wdk-ModalOpen');
  }
}

type Props = {
  open: boolean;
  children: ReactNode;
  modal?: boolean;
  title?: ReactNode;
  buttons?: ReactNode[];
  draggable?: boolean;
  resizable?: boolean;
  className?: string;
  onOpen?: () => void;
  onClose?: () => void;
};

class Dialog extends Component<Props> {

  private static bodyScrollManager = new BodyScrollManager();

  prevFocusNode: Element | null = null;

  headerNode: Element | null = null;

  makeClassName(suffix = '', ...modifiers: any[]) {
    let { className } = this.props;
    return c(suffix, ...modifiers) + (
      className ? c2(className + suffix, ...modifiers) : ''
    );
  }

  setHeaderNodeRef = (node: Element | null) => {
    this.headerNode = node;
  }

  blockScrollingIfModalOpen(prevProps?: Props) {
    if (
      prevProps == null ||
      this.props.modal !== prevProps.modal ||
      this.props.open !== prevProps.open
    ) {
      if (this.props.modal && this.props.open) Dialog.bodyScrollManager.blockScroll(this);
      else Dialog.bodyScrollManager.unblockScroll(this);
    }
  }

  handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if ((event.key === 'Escape' || event.key === 'Esc') && this.props.onClose) {
      this.props.onClose();
    }
  }

  componentDidMount() {
    this.blockScrollingIfModalOpen();
    this.prevFocusNode = document.activeElement;
  }

  componentDidUpdate(prevProps: Props) {
    this.blockScrollingIfModalOpen(prevProps);
    if (prevProps.open !== this.props.open && this.props.open) {
      this.prevFocusNode = document.activeElement;
    }
    if (prevProps.open !== this.props.open && !this.props.open && this.prevFocusNode instanceof HTMLElement) {
      this.prevFocusNode.focus();
    }
  }

  componentWillUnmount() {
    document.body.classList.remove('wdk-ModalOpen');
    if (this.prevFocusNode instanceof HTMLElement) {
      this.prevFocusNode.focus();
    }
  }

  render () {
    if (!this.props.open) return null;

    let {
      onClose = () => {},
      buttons = [(
        <button key="close" type="button" onClick={() => onClose()}>
          <Icon type="close"/>
        </button>
      )]
    } = this.props;

    let content = (
      <div onKeyDown={this.handleKeyDown} className={this.makeClassName('', this.props.modal && 'modal')} >
        <div ref={this.setHeaderNodeRef} className={this.makeClassName('Header')} >
          <div className={this.makeClassName('Title')}>{this.props.title}</div>
          {buttons}
        </div>
        <div className={this.makeClassName('Content')}>
          {this.props.children}
        </div>
      </div>
    );

    return (
      <Popup
        className={this.makeClassName('PopupWrapper')}
        dragHandleSelector={() => this.headerNode as Element}
        open={this.props.open}
        resizable={this.props.resizable}
      >
        {content}
      </Popup>
    );
  }

}

export default wrappable(Dialog);
