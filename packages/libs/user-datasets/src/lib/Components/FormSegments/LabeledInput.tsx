import React from "react";
import { FieldLabel } from "./FieldLabel";
import { TextBox } from "@veupathdb/wdk-client/lib/Components";
import { FloatingButton } from "@veupathdb/coreui";
import { FloatingButtonWDKStyle } from "@veupathdb/coreui/lib/components/buttons/FloatingButton";
import { newArrayInputUpdater, InputConstructor, RecordUpdater } from "./component-utils";
import { InputList, InputListProps } from "./InputList";
import Trash from "@veupathdb/coreui/lib/components/icons/Trash";

interface LabeledInputProps<T> {
  readonly label: string;
  readonly value: T;
  readonly onChange: (value: T) => void;
  readonly id?: string;
  readonly className?: string;
  readonly placeholder?: string;
  readonly disabled?: boolean;
  readonly required?: boolean;
}

export function LabeledTextInput(props: LabeledInputProps<string | undefined>): React.ReactElement {
  return (
    <>
      <FieldLabel htmlFor={props.id} className={props.className}>{props.label}</FieldLabel>
      <TextBox
        id={props.id}
        required={props.required}
        disabled={props.disabled}
        placeholder={props.placeholder === undefined ? props.label : (!props.placeholder ? "" : props.placeholder)}
        value={props.value}
        onChange={props.onChange}
      />
    </>
  );
}
interface LabeledListInputProps extends Omit<InputListProps<string>, "factory"> {
  readonly idPrefix: string;
  readonly placeholder?: string;
}

export function LabeledTextListInput(props: LabeledListInputProps): React.ReactElement {
  const factory = (updater: RecordUpdater<string>): InputConstructor<string> =>
    (record, index) => {
      const updateFn = newArrayInputUpdater(index, updater);

      const deleteFn = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        updater(a => a.filter((_, i) => i !== index));
      };

      return (
        <>
          <TextBox
            id={`${props.idPrefix}-${index}`}
            placeholder={props.placeholder}
            value={record}
            onChange={updateFn}
          />
          <FloatingButton
            text="Remove"
            onPress={deleteFn}
            icon={Trash}
            styleOverrides={FloatingButtonWDKStyle}
          />
        </>
      );
    };

  return InputList({ factory, ...props });
}