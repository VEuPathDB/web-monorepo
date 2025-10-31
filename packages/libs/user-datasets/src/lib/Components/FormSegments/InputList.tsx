import { ReactElement } from "react";
import { InputConstructor } from "./component-utils";
import { FieldLabel } from "./FieldLabel";
import { FloatingButton } from "@veupathdb/coreui";
import { FloatingButtonWDKStyle } from "@veupathdb/coreui/lib/components/buttons/FloatingButton";
import AddIcon from "@material-ui/icons/Add";
import { FieldSetter } from "../../Utils/util-types";

export type InputConstructorFactory<T> = (updater: FieldSetter<T[]>) => InputConstructor<T>;

export interface InputListProps<T> {
  readonly className: string;
  readonly subclass: string;
  readonly header: string;
  readonly addRecordText: string;
  readonly records?: T[];
  readonly setRecords: FieldSetter<T[]>;
  readonly factory: InputConstructorFactory<T>;
}

export function InputList<T>(props: InputListProps<T>): ReactElement {
  return (
    <div className={`${props.className} ${props.className}--${props.subclass}`}>
      <FieldLabel htmlFor={`dataset-${props.subclass}`}>{props.header}</FieldLabel>
      {(props.records ?? []).map(props.factory(props.setRecords))}
      <FloatingButton
        text={props.addRecordText}
        onPress={event => {
          event.preventDefault();
          props.setRecords([ ...(props.records ?? []), {} as T ])
        }}
        icon={AddIcon}
        styleOverrides={FloatingButtonWDKStyle}
      />
    </div>
  );
}
