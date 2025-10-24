import React from "react";
import { InputConstructor, RecordUpdater } from "./component-utils";
import { FieldLabel } from "./FieldLabel";
import { FloatingButton } from "@veupathdb/coreui";
import AddIcon from "@material-ui/icons/Add";
import { FloatingButtonWDKStyle } from "@veupathdb/coreui/lib/components/buttons/FloatingButton";

export type InputConstructorFactory<T> = (updater: RecordUpdater<T>) => InputConstructor<T>;

export interface InputListProps<T> {
  readonly className: string;
  readonly subclass: string;
  readonly header: string;
  readonly addRecordText: string;
  readonly records: T[];
  readonly setRecords: RecordUpdater<T>;
  readonly factory: InputConstructorFactory<T>;
}

export function InputList<T>(props: InputListProps<T>): React.ReactElement {
  return (
    <div className={`${props.className} ${props.className}--${props.subclass}`}>
      <FieldLabel htmlFor={`dataset-${props.subclass}`}>{props.header}</FieldLabel>
      {props.records.map(props.factory(props.setRecords))}
      <FloatingButton
        text={props.addRecordText}
        onPress={event => {
          event.preventDefault();
          props.setRecords(records => [ ...records, {} as T ]);
        }}
        icon={AddIcon}
        styleOverrides={FloatingButtonWDKStyle}
      />
    </div>
  );
}
