import React from "react";

import {
  cx,
  InputConstructor,
  RecordListProps,
  RecordUpdater,
  newObjectInputUpdater,
} from "./component-utils";
import { DatasetHyperlink } from "../../Service/Types";
import { FieldLabel } from "./FieldLabel";
import { TextArea, TextBox } from "@veupathdb/wdk-client/lib/Components";
import { InputList } from "./InputList";
import { TrashButton } from "./common-components";


function inputFactory(updater: RecordUpdater<DatasetHyperlink>): InputConstructor<DatasetHyperlink> {
  return (record, index) => {
    const updateRef = newObjectInputUpdater(index, updater);
    const onRemove = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      updater((prev) => prev.filter((_, i) => i !== index));
    }

    return (
      <div className={cx("--NestedInputContainer")}>
        <div className={cx("--NestedInputTitle")}>
          <FieldLabel style={{ fontSize: "1.2em" }}>Hyperlink Reference {index + 1}</FieldLabel>
          <TrashButton onRemove={onRemove} />
        </div>

        <div className={cx("--NestedInputFields")}>
          <FieldLabel required>URL</FieldLabel>
          <TextBox
            type="input"
            id={`dataset-externals-hyperlink-url-${index}`}
            placeholder="URL"
            required
            value={record.url}
            onChange={value => updateRef("url", value)}
          />

          <FieldLabel>Description</FieldLabel>
          <TextArea
            id={`dataset-externals-hyperlink-desc-${index}`}
            value={record.description}
            onChange={value => updateRef("description", value)}
          />
        </div>
      </div>
    );
  };
}

export function HyperlinkInputList(props: RecordListProps<DatasetHyperlink>): React.ReactElement {
  return InputList({
    header: "Hyperlink References",
    addRecordText: "Add Hyperlink",
    className: "externalIdentifiersFormSection",
    subclass: "hyperlinks",
    factory: inputFactory,
    ...props
  });
}