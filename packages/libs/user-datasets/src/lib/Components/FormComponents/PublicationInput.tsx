import * as util from "./component-utils";
import * as api from "../../Service/Types";

import React from "react";
import Trash from "@veupathdb/coreui/lib/components/icons/Trash";

import { FieldLabel } from "./FieldLabel";
import { FloatingButton } from "@veupathdb/coreui";
import { FloatingButtonWDKStyle } from "@veupathdb/coreui/lib/components/buttons/FloatingButton";
import { Checkbox, SingleSelect, TextBox } from "@veupathdb/wdk-client/lib/Components";
import { DatasetPublication, PublicationType } from "../../Service/Types";

interface PublicationSelectItem {
  value: api.PublicationType;
  display: string;
}

const publicationTypes: PublicationSelectItem[] = [
  { value: "pmid", display: "PubMed" },
  { value: "doi", display: "DOI" },
];

export interface PublicationInputProps {
  index: number;

  publication: DatasetPublication,

  onSetIdentifier: (value: string) => void;
  onSetType: (value: PublicationType) => void;
  onSetCitation: (value: string) => void;
  onSetPrimary: (value: boolean) => void;

  onRemovePublication: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export function PublicationInput(props: PublicationInputProps): React.ReactElement {
  return (
    <div className={util.cx("--NestedInputContainer")}>
      <div className={util.cx("--NestedInputTitle")}>
        <FieldLabel required={false} style={{ fontSize: "1.2em" }}>
          Publication {props.index + 1}
        </FieldLabel>
        <FloatingButton
          text="Remove"
          onPress={props.onRemovePublication}
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
          onChange={v => props.onSetType(v as PublicationType)}
        />

        <FieldLabel required={false}>Publication ID</FieldLabel>
        <TextBox
          type="input"
          id={`data-set-publications-publicationId-${props.index}`}
          placeholder="Publication ID"
          required
          value={props.publication.identifier}
          onChange={props.onSetIdentifier}
        />

        <FieldLabel required={false}>Citation</FieldLabel>
        <TextBox
          type="input"
          id={`data-set-publications-citation-${props.index}`}
          placeholder="Citation"
          required={false}
          value={props.publication.citation}
          onChange={props.onSetCitation}
        />

        <FieldLabel required={false}>Primary Publication</FieldLabel>
        <Checkbox
          value={props.publication.isPrimary ?? false}
          onChange={props.onSetPrimary}
        />
      </div>
    </div>
  );
}
