import * as util from "./component-utils";
import * as api from "../../Service/Types";

import React from "react";
import Trash from "@veupathdb/coreui/lib/components/icons/Trash";

import { FieldLabel } from "./FieldLabel";
import { FloatingButton } from "@veupathdb/coreui";
import { FloatingButtonWDKStyle } from "@veupathdb/coreui/lib/components/buttons/FloatingButton";
import { Checkbox, SingleSelect, TextBox } from "@veupathdb/wdk-client/lib/Components";
import { DatasetPublication, PublicationType } from "../../Service/Types";
import { createNestedInputUpdater } from "./component-utils";
import AddIcon from "@material-ui/icons/Add";

interface PublicationSelectItem {
  value: api.PublicationType;
  display: string;
}

const publicationTypes: PublicationSelectItem[] = [
  { value: "pmid", display: "PubMed" },
  { value: "doi", display: "DOI" },
];

type PublicationUpdater = React.Dispatch<React.SetStateAction<DatasetPublication[]>>;

function newInputFactory(setPublications: PublicationUpdater): (publication: DatasetPublication, index: number) => React.ReactElement {
  return function (publication: DatasetPublication, index: number): React.ReactElement {
    const updatePublication = createNestedInputUpdater(index, setPublications);

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
            id={`data-set-publications-publicationId-${index}`}
            placeholder="Publication ID"
            required
            value={publication.identifier}
            onChange={value => updatePublication("identifier", value)}
          />

          <FieldLabel>Citation</FieldLabel>
          <TextBox
            type="input"
            id={`data-set-publications-citation-${index}`}
            placeholder="Citation"
            required={false}
            value={publication.citation}
            onChange={value => updatePublication("citation", value)}
          />

          <FieldLabel required={false}>Primary Publication</FieldLabel>
          <Checkbox
            value={publication.isPrimary ?? false}
            onChange={value => updatePublication("isPrimary", value)}
          />
        </div>
      </div>
    );
  };
}

export function PublicationInputList(props: { oldPublications?: DatasetPublication[] }): React.ReactElement {
  const [ publications, setPublications ] = React.useState<DatasetPublication[]>(props.oldPublications ?? []);

  return (
    <div className="additionalDetailsFormSection additionalDetailsFormSection--data-set-publications">
      <FieldLabel htmlFor="data-set-publications" required={false}>Publications</FieldLabel>
      {publications.map(newInputFactory(setPublications))}
      <FloatingButton
        text="Add Publication"
        onPress={(event: React.MouseEvent<HTMLButtonElement>) => {
          event.preventDefault();
          setPublications(oldPublications => [
            ...oldPublications,
            {} as DatasetPublication,
          ]);
        }}
        icon={AddIcon}
        styleOverrides={FloatingButtonWDKStyle}
      />
    </div>
  );
}
