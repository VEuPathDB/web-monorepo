import React from 'react';

import { uid, makeClassifier } from '../Utils/Utils';

const modalBoundaryClass = makeClassifier('ModalBoundary');

interface Modal {
  _id?: string;
  render: React.ComponentType<any>;
  [key: string]: any;
}

interface ModalBoundaryProps {
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

interface ModalBoundaryState {
  modals: Modal[];
}

class ModalBoundary extends React.Component<
  ModalBoundaryProps,
  ModalBoundaryState
> {
  constructor(props: ModalBoundaryProps) {
    super(props);

    this.state = { modals: [] };

    this.addModal = this.addModal.bind(this);
    this.removeModal = this.removeModal.bind(this);
    this.getChildContext = this.getChildContext.bind(this);
    this.renderModalWrapper = this.renderModalWrapper.bind(this);
    this.triggerModalRefresh = this.triggerModalRefresh.bind(this);

    console.error(
      `
      <ModalBoundary> is Deprecated!
      Now declaratively render your modals inside a <BodyLayer>.
      Stop using ModalBoundary.
      Props Received:
    `,
      { props }
    );
  }

  addModal(modal: Modal): string {
    let { modals } = this.state;
    modal._id = uid();
    modals.push(modal);
    this.setState({ modals });
    return modal._id;
  }

  triggerModalRefresh(): void {
    this.forceUpdate();
  }

  removeModal(id: string): void {
    let { modals } = this.state;
    let index = modals.findIndex((modal) => modal._id === id);
    if (index < 0) return;
    modals.splice(index, 1);
    this.setState({ modals });
  }

  getChildContext() {
    const { addModal, removeModal, triggerModalRefresh } = this;
    return { addModal, removeModal, triggerModalRefresh };
  }

  renderModalWrapper() {
    const { modals } = this.state;
    const style: React.CSSProperties = {
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      position: 'fixed',
      pointerEvents: 'none',
    };
    return !modals.length ? null : (
      <div style={style} className={modalBoundaryClass('Wrapper')}>
        {modals.map((modal, index) => {
          const Element = modal.render;
          return <Element key={index} {...modal} />;
        })}
      </div>
    );
  }

  render() {
    const { children, style } = this.props;
    const ModalWrapper = this.renderModalWrapper;
    const fullStyle: React.CSSProperties = Object.assign(
      {},
      style ? style : {},
      {
        position: 'relative',
      }
    );
    const zIndex = (z: number): React.CSSProperties => ({
      position: 'relative',
      zIndex: z,
    });

    return (
      <div
        className={modalBoundaryClass() + ' MesaComponent'}
        style={fullStyle}
      >
        <div style={zIndex(1)}>{children}</div>
        <div style={zIndex(2)}>
          <ModalWrapper />
        </div>
      </div>
    );
  }
}

export default ModalBoundary;
