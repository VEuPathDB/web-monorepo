import * as util from "./component-utils";

import React from "react";
import Trash from "@veupathdb/coreui/lib/components/icons/Trash";

import { FieldLabel } from "./FieldLabel";
import { FloatingButton } from "@veupathdb/coreui";
import { FloatingButtonWDKStyle } from "@veupathdb/coreui/lib/components/buttons/FloatingButton";
import { Checkbox, TextBox } from "@veupathdb/wdk-client/lib/Components";
import { DatasetContact } from "../../Service/Types";
import { createNestedInputUpdater } from "./component-utils";
import AddIcon from "@material-ui/icons/Add";

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

type ContactUpdater = React.Dispatch<React.SetStateAction<DatasetContact[]>>;

function contactInputFactory(updater: ContactUpdater): (contact: DatasetContact, index: number) => React.ReactElement {
  return function (contact: DatasetContact, index: number): React.ReactElement{
    const updateContact = createNestedInputUpdater(index, updater);

    const onRemove = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      updater((prev) => prev.filter((_, i) => i !== index));
    }

    return (
      <div className={util.cx("--NestedInputContainer")}>
        <div className={util.cx("--NestedInputTitle")}>
          <FieldLabel style={{ fontSize: "1.2em" }}>Contact {index + 1}</FieldLabel>
          <FloatingButton
            text="Remove"
            onPress={onRemove}
            icon={Trash}
            styleOverrides={FloatingButtonWDKStyle}
          />
        </div>
        <div className={util.cx("--NestedInputFields")}>
          <FieldLabel required>Name</FieldLabel>
          <TextBox
            type="input"
            id={`data-set-contacts-name-${index}`}
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
            id={`data-set-contacts-email-${index}`}
            placeholder="Email"
            value={contact.email}
            onChange={value => updateContact("email", value)}
          />
          <FieldLabel required={false}>Affiliation</FieldLabel>
          <TextBox
            type="input"
            id={`data-set-contacts-affiliation-${index}`}
            placeholder="Affiliation"
            value={contact.affiliation}
            onChange={value => updateContact("affiliation", value)}
          />
          <FieldLabel required={false}>Country</FieldLabel>
          <TextBox
            type="input"
            id={`data-set-contacts-country-${index}`}
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
  }
}

export function ContactInputList(props: { contacts: DatasetContact[], setContacts: ContactUpdater }): React.ReactElement {
  return (
    <div className="additionalDetailsFormSection additionalDetailsFormSection--data-set-contacts">
      <FieldLabel htmlFor="data-set-publications-contacts">Contacts</FieldLabel>
      {props.contacts.map(contactInputFactory(props.setContacts))}
      <FloatingButton
        text="Add Contact"
        onPress={event => {
          event.preventDefault();
          props.setContacts(contacts => [ ...contacts, {} ]);
        }}
        icon={AddIcon}
        styleOverrides={FloatingButtonWDKStyle}
      />
    </div>
  )
}
