import { invoke } from 'lodash';
import React, { Component, createRef } from 'react';

interface ValidatedInputFieldProps extends React.HTMLAttributes<HTMLElement> {
  validity?: string;
}

export const validatedInputFieldFactory = <P extends ValidatedInputFieldProps>(
  Field: keyof JSX.IntrinsicElements
) =>
  class ValidatedInputField extends Component<P> {
    fieldRef: React.RefObject<any>;

    constructor(props: P) {
      super(props);
      this.fieldRef = createRef();
    }

    updateValidity() {
      invoke(
        this.fieldRef,
        'current.setCustomValidity',
        this.props.validity || ''
      );
    }

    componentDidMount() {
      this.updateValidity();
    }

    componentDidUpdate(prevProps: P) {
      if (prevProps.validity !== this.props.validity) {
        this.updateValidity();
      }
    }

    render() {
      const { validity, ...fieldProps } = this.props;

      return React.createElement(Field, {
        ...fieldProps,
        ref: this.fieldRef,
      } as any);
    }
  };
