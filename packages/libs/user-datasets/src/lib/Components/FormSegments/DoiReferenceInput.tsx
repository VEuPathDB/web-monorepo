import React, { MouseEvent, ReactElement } from "react";
import { cx, InputConstructor } from "./component-utils";
import { DoiRef } from "../../Service/Types";
import { FieldLabel } from "./FieldLabel";
import { TextArea, TextBox } from "@veupathdb/wdk-client/lib/Components";
import { InputList } from "./InputList";
import { TrashButton } from "./common-components";
import { FieldSetter } from "../FormTypes";
import { ListSectionProps } from "../UploadForm";

function doiReferenceFactory(updater: FieldSetter<DoiRef[]>): InputConstructor<DoiRef> {
  return (record, index) => {
    const replaceFn = function <K extends keyof DoiRef>(key: K, value: DoiRef[K]) {
      updater(dois => dois?.map((d, i) => i === index ? { ...d, [key]: value } : d));
    };

    const onRemove = (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      updater(prev => prev?.filter((_, i) => i !== index))
    };

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
            value={record.doi}
            onChange={value => replaceFn("doi", value)}
          />

          <FieldLabel>Description</FieldLabel>
          <TextArea
            id={`dataset-externals-doi-desc-${index}`}
            value={record.description}
            onChange={value => replaceFn("description", value)}
          />
        </div>
      </div>
    );
  };
}

export function DoiRefInputList(props: ListSectionProps<DoiRef>): ReactElement {
  return InputList<DoiRef>({
    ...props,
    header: "DOI References",
    addRecordText: "Add Reference",
    className: "externalIdentifiersFormSection",
    subclass: "dois",
    factory: doiReferenceFactory,
  });
}