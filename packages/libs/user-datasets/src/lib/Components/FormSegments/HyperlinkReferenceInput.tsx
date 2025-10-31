import { MouseEvent, ReactElement } from "react";
import { cx, InputConstructor } from "./component-utils";
import { DatasetHyperlink } from "../../Service/Types";
import { FieldLabel } from "./FieldLabel";
import { TextArea, TextBox } from "@veupathdb/wdk-client/lib/Components";
import { InputList } from "./InputList";
import { TrashButton } from "./common-components";
import { FieldSetter } from "../FormTypes";
import { ListSectionProps } from "../UploadForm";

function inputFactory(updater: FieldSetter<DatasetHyperlink[]>): InputConstructor<DatasetHyperlink> {
  return (record, index) => {
    const replaceFn = function <K extends keyof DatasetHyperlink>(key: K, value: DatasetHyperlink[K]) {
      updater(dois => dois?.map((d, i) => i === index ? { ...d, [key]: value } : d));
    };

    const onRemove = (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      updater(prev => prev?.filter((_, i) => i !== index));
    };

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
            onChange={value => replaceFn("url", value)}
          />

          <FieldLabel>Description</FieldLabel>
          <TextArea
            id={`dataset-externals-hyperlink-desc-${index}`}
            value={record.description}
            onChange={value => replaceFn("description", value)}
          />
        </div>
      </div>
    );
  };
}

export function HyperlinkInputList(props: ListSectionProps<DatasetHyperlink>): ReactElement {
  return InputList({
    ...props,
    header: "Hyperlink References",
    addRecordText: "Add Hyperlink",
    className: "externalIdentifiersFormSection",
    subclass: "hyperlinks",
    factory: inputFactory,
  });
}