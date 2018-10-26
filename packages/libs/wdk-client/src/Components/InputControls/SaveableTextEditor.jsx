import React from 'react';
import PropTypes from 'prop-types';

import 'wdk-client/Components/InputControls/wdk-SaveableTextEditor.scss';
import Icon from 'wdk-client/Components/Icon/IconAlt';
import TextBox from 'wdk-client/Components/InputControls/TextBox';
import TextArea from 'wdk-client/Components/InputControls/TextArea';

function sanitaryTextReformat (text) {
  if (typeof text !== 'string') return text;
  return text
    .split('<').join('&lt;')
    .split('>') .join('&gt;')
    .split('\n').join('<br/>');
}

class SaveableTextEditor extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      editing: false,
      editingValue: null
    };
    this.handleEdit = this.handleEdit.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleEdit (event) {
    if (this.state.editing) return;
    const { value } = this.props;
    this.setState({
      editing: true,
      editingValue: value
    });
  }

  handleSave (event) {
    if (!this.state.editing) return;
    const { onSave } = this.props;
    const { editingValue } = this.state;
    onSave(editingValue);
    this.handleCancel();
  }

  handleCancel (event) {
    if (!this.state.editing) return;
    this.setState({
      editing: false,
      editingValue: null
    });
  }

  handleChange (editingValue) {
    if (!this.state.editing) return;
    this.setState({ editingValue });
  }

  handleSubmit (event) {
    if (!this.state.editing) return;
    this.handleSave();
  }

  render () {
    const {
      multiLine,
      className,
      value,
      onSave,
      emptyText,
      children,
      displayValue,
      readOnly,
      ...others
    } = this.props;
    const { handleEdit, handleSave, handleCancel, handleChange, handleSubmit } = this;
    const { editing, editingValue } = this.state;

    const Input = multiLine ? TextArea : TextBox;
    const inputProps = {
      value: editingValue,
      onChange: handleChange,
      rows: 3,
      ...others
    };

    return (
      <form
        onSubmit={handleSubmit}
        className={'wdk-SaveableTextEditor' + (className ? ' ' + className : '')}>

        {!children ? null : (
          <fieldset className="wdk-SaveableTextEditor-Children">
            {children}
          </fieldset>
        )}

        <fieldset className={'wdk-SaveableTextEditor-Field' + (editing ? ' wdk-SaveableTextEditor-Field--Editing' : '')}>
          {editing
            ? <Input {...inputProps}/>
            : typeof displayValue === 'function'
              ? displayValue(value, handleEdit)
              : !value.length && emptyText
                ? <i onClick={handleEdit}>{emptyText}</i>
                : (
                  <div
                    onClick={readOnly ? () => null : handleEdit}
                    dangerouslySetInnerHTML={{ __html: sanitaryTextReformat(value) }}
                  />
                )
          }
        </fieldset>


        {readOnly ? null : (
          <fieldset className="wdk-SaveableTextEditor-Buttons">
            {editing
              ? (
                <React.Fragment>
                  <a title="Save Changes" onClick={handleSave}>
                    <Icon fa="check save"/>
                  </a>
                  <a title="Cancel Changes" onClick={handleCancel}>
                    <Icon fa="times cancel"/>
                  </a>
                </React.Fragment>
              ) : (
                <a title="Edit This Value" onClick={handleEdit}>
                  <Icon fa="pencil edit"/>
                </a>
              )
            }
          </fieldset>
        )}
      </form>
    );
  }
};

SaveableTextEditor.propTypes = {
  multiLine: PropTypes.bool,
  className: PropTypes.string,
  readOnly: PropTypes.bool,
  value: PropTypes.string.isRequired,
  onSave: PropTypes.func.isRequired
};

export default SaveableTextEditor;
