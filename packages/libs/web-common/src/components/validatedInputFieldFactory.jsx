import { invoke } from 'lodash';
import React, { Component, createRef } from 'react';

export const validatedInputFieldFactory = (Field) =>
  class ValidatedInputField extends Component {
    constructor(...args) {
      super(...args);
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

    componentDidUpdate(prevProps) {
      if (prevProps.validity !== this.props.validity) {
        this.updateValidity();
      }
    }

    render() {
      const { validity, ...fieldProps } = this.props;

      return <Field {...fieldProps} ref={this.fieldRef} />;
    }
  };
