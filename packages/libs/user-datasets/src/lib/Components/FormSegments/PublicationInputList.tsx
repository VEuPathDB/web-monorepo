import * as util from "./component-utils";
import * as api from "../../Service/Types";

import React from "react";
import Trash from "@veupathdb/coreui/lib/components/icons/Trash";

import { FieldLabel } from "./FieldLabel";
import { FloatingButton } from "@veupathdb/coreui";
import { FloatingButtonWDKStyle } from "@veupathdb/coreui/lib/components/buttons/FloatingButton";
import { Checkbox, SingleSelect, TextBox } from "@veupathdb/wdk-client/lib/Components";
import { DatasetPublication, PublicationType } from "../../Service/Types";
import { InputConstructor, newListPropUpdater } from "./component-utils";
import { InputList } from "./InputList";
import { ListSectionProps } from "../UploadForm";
import { FieldSetter } from "../FormTypes";

interface PublicationSelectItem {
  value: api.PublicationType;
  display: string;
}

const publicationTypes: PublicationSelectItem[] = [
  { value: "pmid", display: "PubMed" },
  { value: "doi", display: "DOI" },
];

function newInputFactory(setPublications: FieldSetter<DatasetPublication[]>): InputConstructor<DatasetPublication> {
  return function (publication: DatasetPublication, index: number): React.ReactElement {
    const updatePublication = newListPropUpdater(index, setPublications);

    const onRemove = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      setPublications((prev) =>
        prev.filter((_, i) => i !== index),
      );
    }

    return (
      <div className={util.cx("--NestedInputContainer")}>
        <div className={util.cx("--NestedInputTitle")}>
          <FieldLabel style={{ fontSize: "1.2em" }}>Publication {index + 1}</FieldLabel>
          <FloatingButton
            text="Remove"
            onPress={onRemove}
            icon={Trash}
            styleOverrides={FloatingButtonWDKStyle}
          />
        </div>
        <div className={util.cx("--NestedInputFields")}>
          <FieldLabel required>Publication Type</FieldLabel>
          <SingleSelect
            required
            items={publicationTypes}
            value={publicationTypes[0].value}
            onChange={value => updatePublication("type", value as PublicationType)}
          />

          <FieldLabel required>Publication ID</FieldLabel>
          <TextBox
            type="input"
            id={`dataset-publications-id-${index}`}
            placeholder="Publication ID"
            required
            value={publication.identifier}
            onChange={value => updatePublication("identifier", value)}
          />

          <FieldLabel>Citation</FieldLabel>
          <TextBox
            type="input"
            id={`dataset-publications-citation-${index}`}
            placeholder="Citation"
            required={false}
            value={publication.citation}
            onChange={value => updatePublication("citation", value)}
          />

          <FieldLabel required={false}>Primary Publication</FieldLabel>
          <Checkbox
            name={`isPrimary-${index}`}
            value={publication.isPrimary ?? false}
            onChange={value => updatePublication("isPrimary", value)}
          />
        </div>
      </div>
    );
  };
}

export function PublicationInputList(props: ListSectionProps<DatasetPublication>): React.ReactElement {
  return InputList<DatasetPublication>({
    ...props,
    header: "PublicationList",
    addRecordText: "Add Publication",
    className: "additionalDetailsFormSection",
    subclass: "dataset-publications",
    factory: newInputFactory,
  });
}
