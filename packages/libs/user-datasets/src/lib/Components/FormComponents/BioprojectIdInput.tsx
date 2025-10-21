import React from "react";

import { newArrayInputUpdater, cx, InputConstructor, RecordListProps, RecordUpdater } from "./component-utils";
import { BioprojectIDRef, DoiRef } from "../../Service/Types";
import { FieldLabel } from "./FieldLabel";
import { TextArea, TextBox } from "@veupathdb/wdk-client/lib/Components";
import { InputList } from "./InputList";
import { TrashButton } from "./common-components";


function inputFactory(updater: RecordUpdater<BioprojectIDRef>): InputConstructor<BioprojectIDRef> {
  return (record, index) => {
    const updateRef = createNestedInputUpdater(index, updater);
    const onRemove = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      updater((prev) => prev.filter((_, i) => i !== index));
    }

    return (
      <div className={cx("--NestedInputContainer")}>
        <div className={cx("--NestedInputTitle")}>
          <FieldLabel style={{ fontSize: "1.2em" }}>DOI Reference {index + 1}</FieldLabel>
          <TrashButton onRemove={onRemove}/>
        </div>

        <div className={cx("--NestedInputFields")}>
          <FieldLabel required>DOI</FieldLabel>
          <TextBox
            type="input"
            id={`dataset-externals-doi-id-${index}`}
            placeholder="DOI"
            required
            value={record.id}
            onChange={value => updateRef("id", value)}
          />

          <FieldLabel>Description</FieldLabel>
          <TextArea
            id={`dataset-externals-doi-desc-${index}`}
            value={record.description}
            onChange={value => updateRef("description", value)}
          />
        </div>
      </div>
    );
  };
}

export function BioprojectIdRefInputList(props: RecordListProps<BioprojectIDRef>): React.ReactElement {
  return InputList({
    header: "Bioproject References",
    addRecordText: "Add Reference",
    className: "externalIdentifiersFormSection",
    subclass: "bioprojects",
    factory: inputFactory,
    ...props
  });
}