import React from 'react';

import 'wdk-client/Components/InputControls/wdk-SaveableTextEditor.scss';
import Icon from 'wdk-client/Components/Icon/IconAlt';
import TextBox from 'wdk-client/Components/InputControls/TextBox';
import TextArea from 'wdk-client/Components/InputControls/TextArea';

function sanitaryTextReformat (text: string) {
  return text
    .split('<').join('&lt;')
    .split('>') .join('&gt;')
    .split('\n').join('<br/>');
}

type InputProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & React.InputHTMLAttributes<HTMLInputElement>;
type InputPropsWithoutOnChange = Omit<InputProps, 'onChange'>;

interface Props extends InputPropsWithoutOnChange {
  value: string;
  onSave: (value: string) => void;
  multiLine?: boolean;
  className?: string;
  displayValue?: (value: string, handleEdit: () => void) => React.ReactNode
  emptyText?: string;
}

interface State {
  editing: boolean;
  editingValue: string;
}

class SaveableTextEditor extends React.Component<Props, State> {
  constructor (props: Props) {
    super(props);
    this.state = {
      editing: false,
      editingValue: props.value
    };
    this.handleEdit = this.handleEdit.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleEdit () {
    if (this.state.editing) return;
    const { value } = this.props;
    this.setState({
      editing: true,
      editingValue: value
    });
  }

  handleSave () {
    if (!this.state.editing) return;
    const { onSave } = this.props;
    const { editingValue } = this.state;
    onSave(editingValue);
    this.handleCancel();
  }

  handleCancel () {
    if (!this.state.editing) return;
    this.setState({
      editing: false,
      editingValue: this.props.value
    });
  }

  handleChange (editingValue: string) {
    if (!this.state.editing) return;
    this.setState({ editingValue });
  }

  handleSubmit (event: React.FormEvent) {
    event.preventDefault();
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
      autoFocus: true,
      onFocus,
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
          {editing && <Input {...inputProps}/> }
          <div className={'wdk-SaveableTextEditor-ValueContainer' + (editing ? ' wdk-SaveableTextEditor-ValueContainer--Editing' : '')}>
            {typeof displayValue === 'function'
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
          </div>
        </fieldset>


        {readOnly ? null : (
          <fieldset className="wdk-SaveableTextEditor-Buttons">
            {editing
              ? (
                <React.Fragment>
                  <button type="button" title="Save Changes" onClick={handleSave}>
                    <Icon fa="check save"/>
                  </button>
                  <button type="button" title="Cancel Changes" onClick={handleCancel}>
                    <Icon fa="times cancel"/>
                  </button>
                </React.Fragment>
              ) : (
                <button type="button" title="Edit This Value" onClick={handleEdit}>
                  <Icon fa="pencil edit"/>
                </button>
              )
            }
          </fieldset>
        )}
      </form>
    );
  }
}

export default SaveableTextEditor;

function onFocus(event: React.FocusEvent<HTMLInputElement|HTMLTextAreaElement>) {
  event.target.select();
}
