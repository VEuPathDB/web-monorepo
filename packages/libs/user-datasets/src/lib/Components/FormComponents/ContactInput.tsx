import * as util from "./component-utils";

import React from "react";
import Trash from "@veupathdb/coreui/lib/components/icons/Trash";

import { FieldLabel } from "./FieldLabel";
import { FloatingButton } from "@veupathdb/coreui";
import { FloatingButtonWDKStyle } from "@veupathdb/coreui/lib/components/buttons/FloatingButton";
import { RadioList, TextBox } from "@veupathdb/wdk-client/lib/Components";
import { DatasetContact } from "../../Service/Types";

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

export interface ContactInputProps {
  index: number;

  contact: DatasetContact;

  onSetAffiliation: (value: string) => void;
  onSetCountry: (value: string) => void;
  onSetEmail: (value: string) => void;
  onSetIsPrimary: (value: boolean) => void;
  onSetName: (value: SplitName) => void;

  onRemoveContact: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export function ContactInput(props: ContactInputProps): React.ReactElement {
  return (
    <div className={util.cx("--NestedInputContainer")}>
      <div className={util.cx("--NestedInputTitle")}>
        <FieldLabel required={false} style={{ fontSize: "1.2em" }}>
          Contact {props.index + 1}
        </FieldLabel>
        <FloatingButton
          text="Remove"
          onPress={props.onRemoveContact}
          icon={Trash}
          styleOverrides={FloatingButtonWDKStyle}
        />
      </div>
      <div className={util.cx("--NestedInputFields")}>
        <FieldLabel required>Name</FieldLabel>
        <TextBox
          type="input"
          id={`data-set-contacts-name-${props.index}`}
          placeholder="Name"
          required
          value={joinName(props.contact)}
          onChange={name => props.onSetName(splitName(name))}
        />
        <FieldLabel required={false}>Email</FieldLabel>
        <TextBox
          type="input"
          id={`data-set-contacts-email-${props.index}`}
          placeholder="Email"
          required={false}
          value={props.contact.email}
          onChange={props.onSetEmail}
        />
        <FieldLabel required={false}>Affiliation</FieldLabel>
        <TextBox
          type="input"
          id={`data-set-contacts-affiliation-${props.index}`}
          placeholder="Affiliation"
          required={false}
          value={props.contact.affiliation}
          onChange={props.onSetAffiliation}
        />
        <FieldLabel required={false}>Country</FieldLabel>
        <TextBox
          type="input"
          id={`data-set-contacts-country-${props.index}`}
          placeholder="Country"
          required={false}
          value={props.contact.country}
          onChange={props.onSetCountry}
        />
        <FieldLabel required={false}>Is primary?</FieldLabel>
        <RadioList
          name={`isPrimary-${props.index}`}
          className="horizontal"
          value={props.contact.isPrimary ? "true" : "false"}
          onChange={value => props.onSetIsPrimary(value === "true")}
          items={[
            { value: "true", display: "Yes" },
            { value: "false", display: "No" },
          ]}
        />
      </div>
    </div>
  );
}
