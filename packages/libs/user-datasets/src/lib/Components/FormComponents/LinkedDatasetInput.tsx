import { FloatingButton } from "@veupathdb/coreui";
import { FloatingButtonWDKStyle } from "@veupathdb/coreui/lib/components/buttons/FloatingButton";
import { TextBox, Checkbox } from "@veupathdb/wdk-client/lib/Components";
import { FieldLabel } from "./FieldLabel";
import { LinkedDataset } from "../../Service/Types";
import { newArrayInputUpdater, cx, InputConstructor, RecordListProps, RecordUpdater } from "./component-utils";

import Trash from "@veupathdb/coreui/lib/components/icons/Trash";
import React from "react";
import { InputList } from "./InputList";

function linkInputFactory(updater: RecordUpdater<LinkedDataset>): InputConstructor<LinkedDataset> {
  return (link, index) => {
    const updateFn = createNestedInputUpdater(index, updater);

    const deleteFn = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      updater(prev => prev.filter((_, i) => i !== index));
    };

    return (
      <div className={cx("--NestedInputContainer")}>
        <div className={cx("--NestedInputTitle")}>
          <FieldLabel required={false} style={{ fontSize: "1.2em" }}>Linked Dataset {index + 1}</FieldLabel>
          <FloatingButton
            text="Remove"
            onPress={deleteFn}
            icon={Trash}
            styleOverrides={FloatingButtonWDKStyle}
          />
        </div>
        <div className={cx("--NestedInputFields")}>
          <FieldLabel required>Target Dataset URL</FieldLabel>
          <TextBox
            type="input"
            id={`dataset-link-url-${index}`}
            placeholder="URL"
            required
            value={link.datasetUri}
            onChange={value => updateFn("datasetUri", value)}
          />
          <FieldLabel required={false}>Shares Records</FieldLabel>
          <Checkbox
            id={`dataset-link-shares-records-${index}`}
            value={link.sharesRecords}
            onChange={value => updateFn("sharesRecords", value)}
          />
        </div>
      </div>
    );
  };
}

export function LinkedDatasetInputList(props: RecordListProps<LinkedDataset>): React.ReactElement {
  return InputList<LinkedDataset>({
    header: "Linked Datasets",
    addRecordText: "Add Datasets Link",
    className: "additionalDetailsFormSection",
    subclass: "dataset-links",
    factory: linkInputFactory,
    ...props,
  });
}