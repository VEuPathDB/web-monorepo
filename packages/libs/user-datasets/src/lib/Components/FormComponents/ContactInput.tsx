import React from "react";
import Trash from "@veupathdb/coreui/lib/components/icons/Trash";

import { FieldLabel } from "./FieldLabel";
import { FloatingButton } from "@veupathdb/coreui";
import { FloatingButtonWDKStyle } from "@veupathdb/coreui/lib/components/buttons/FloatingButton";
import { Checkbox, TextBox } from "@veupathdb/wdk-client/lib/Components";
import { DatasetContact } from "../../Service/Types";
import { newArrayInputUpdater, cx, InputConstructor, RecordListProps, RecordUpdater } from "./component-utils";
import { InputList } from "./InputList";

interface SplitName {
  firstName?: string;
  middleName?: string;
  lastName?: string;
}

function splitName(name: string): SplitName {
  if (name.length === 0)
    return {};

  const d1 = name.indexOf(" ");
  const d2 = name.lastIndexOf(" ");

  switch (d1) {
    // No space found in string: only set first name
    case -1:
      return { firstName: name };
    // One space found in string: set first and last
    case d2:
      return { firstName: name.substring(0, d1), lastName: name.substring(d1 + 1) };
    // More than one space found ins tring:
    // - set firstName to first word
    // - set lastName to last word
    // - set middleName to everything in between
    default:
      return {
        firstName: name.substring(0, d1),
        middleName: name.substring(d1 + 1, d2),
        lastName: name.substring(d2 + 1),
      };
  }
}

function joinName(contact: DatasetContact): string {
  return contact.firstName +
    (contact.middleName ? " " + contact.middleName : "") +
    (contact.lastName ? " " + contact.lastName : "");
}

function contactInputFactory(updater: RecordUpdater<DatasetContact>): InputConstructor<DatasetContact> {
  return function (contact: DatasetContact, index: number): React.ReactElement {
    const updateContact = createNestedInputUpdater(index, updater);

    const onRemove = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      updater((prev) => prev.filter((_, i) => i !== index));
    };

    return (
      <div className={cx("--NestedInputContainer")}>
        <div className={cx("--NestedInputTitle")}>
          <FieldLabel style={{ fontSize: "1.2em" }}>Contact {index + 1}</FieldLabel>
          <FloatingButton
            text="Remove"
            onPress={onRemove}
            icon={Trash}
            styleOverrides={FloatingButtonWDKStyle}
          />
        </div>
        <div className={cx("--NestedInputFields")}>
          <FieldLabel required>Name</FieldLabel>
          <TextBox
            type="input"
            id={`dataset-contacts-name-${index}`}
            placeholder="Name"
            required
            value={joinName(contact)}
            onChange={value => {
              const split = splitName(value);
              updateContact("firstName", split.firstName);
              updateContact("middleName", split.middleName);
              updateContact("lastName", split.lastName);
            }}
          />
          <FieldLabel required={false}>Email</FieldLabel>
          <TextBox
            type="input"
            id={`dataset-contacts-email-${index}`}
            placeholder="Email"
            value={contact.email}
            onChange={value => updateContact("email", value)}
          />
          <FieldLabel required={false}>Affiliation</FieldLabel>
          <TextBox
            type="input"
            id={`dataset-contacts-affiliation-${index}`}
            placeholder="Affiliation"
            value={contact.affiliation}
            onChange={value => updateContact("affiliation", value)}
          />
          <FieldLabel required={false}>Country</FieldLabel>
          <TextBox
            type="input"
            id={`dataset-contacts-country-${index}`}
            placeholder="Country"
            value={contact.country}
            onChange={value => updateContact("country", value)}
          />
          <FieldLabel required={false}>Is primary?</FieldLabel>
          <Checkbox
            name={`isPrimary-${index}`}
            value={contact.isPrimary ?? false}
            onChange={value => updateContact("isPrimary", value)}
          />
        </div>
      </div>
    );
  };
}

export function ContactInputList(props: RecordListProps<DatasetContact>): React.ReactElement {
  return InputList<DatasetContact>({
    header: "Contacts",
    addRecordText: "Add Contact",
    className: "additionalDetailsFormSection",
    subclass: "dataset-contacts",
    factory: contactInputFactory,
    ...props,
  });
}
