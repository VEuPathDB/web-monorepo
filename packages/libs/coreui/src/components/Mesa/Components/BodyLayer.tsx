import React from 'react';
import ReactDOM from 'react-dom';

interface BodyLayerProps {
  [key: string]: any;
}

class BodyLayer extends React.Component<BodyLayerProps> {
  private el: HTMLDivElement;

  constructor(props: BodyLayerProps) {
    super(props);
    // XXX This will have to be guarded if we ever use server side rendering
    this.el = document.createElement('div');
    this.el.className = '_BodyLayer';
    document.body.appendChild(this.el);
  }

  componentWillUnmount() {
    document.body.removeChild(this.el);
  }

  render() {
    return ReactDOM.createPortal(<div {...this.props} />, this.el);
  }
}

export default BodyLayer;
