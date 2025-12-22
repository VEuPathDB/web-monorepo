import { cx, newListPropUpdater, } from "../component-utils";
import { DatasetContact } from "../../../Service/Types";
import React, { ReactElement } from "react";
import { FieldLabel } from "../FieldLabel";
import { FloatingButton, Trash } from "@veupathdb/coreui";
import { FloatingButtonWDKStyle } from "@veupathdb/coreui/lib/components/buttons/FloatingButton";
import { TextBox } from "@veupathdb/wdk-client/lib/Components";
import { DisplayText } from "@veupathdb/web-common/src/user-dataset-upload-config";
import { Consumer } from "../../../Utils/utils";
import { FieldSetter } from "../../../Utils/util-types";

interface Props {
  readonly index: number;
  readonly contact: DatasetContact,
  readonly updater: FieldSetter<DatasetContact[]>;
  readonly displayText: DisplayText["formDisplay"]["additionalInfo"]["fundamentals"]["contacts"];
}

// FIXME: debounce email/retype email to live verify!
export function ContactInfo({
  index,
  contact,
  updater,
  displayText,
}: Props): ReactElement {
  const updateContact = newListPropUpdater(index, updater);

  const onRemove = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    updater((prev) => prev!.filter((_, i) => i !== index));
  };

  return (
    <div className={cx("--NestedInputContainer")}>

      <div className={cx("--NestedInputTitle")}>
        <FieldLabel style={{ fontSize: "1.2em" }}>{
          index === 0
            ? displayText.primaryContactHeader
            : displayText.additionalContactHeader + " " + index.toString()
        }</FieldLabel>
        <FloatingButton
          text="Remove"
          onPress={onRemove}
          icon={Trash}
          styleOverrides={FloatingButtonWDKStyle}
        />
      </div>

      <div className={cx("--NestedInputFields")}>

        <FieldLabel required>{displayText.firstNameLabel}</FieldLabel>
        <TextBox
          required
          type="input"
          id={`dataset-contacts-firstname-${index}`}
          value={contact.firstName}
          onChange={value => updateContact("firstName", value)}
        />

        <FieldLabel required>{displayText.middleNameLabel}</FieldLabel>
        <TextBox
          required
          type="input"
          id={`dataset-contacts-middlename-${index}`}
          value={contact.middleName}
          onChange={value => updateContact("middleName", value)}
        />

        <FieldLabel required>{displayText.lastNameLabel}</FieldLabel>
        <TextBox
          required
          type="input"
          id={`dataset-contacts-lastname-${index}`}
          value={contact.lastName}
          onChange={value => updateContact("lastName", value)}
        />

        <FieldLabel required>{displayText.emailLabel}</FieldLabel>
        <TextBox
          required
          type="input"
          id={`dataset-contacts-email-${index}`}
          value={contact.email}
          onChange={value => {
            if (checkEmail())
            updateContact("email", value);
          }}
        />

        <FieldLabel required>{displayText.retypeEmailLabel}</FieldLabel>
        <TextBox
          required
          type="input"
          id={`dataset-contacts-retype-email-${index}`}
          value={contact.email}
          onChange={value => }
        />

        <FieldLabel required={false}>{displayText.affiliationLabel}</FieldLabel>
        <TextBox
          type="input"
          id={`dataset-contacts-affiliation-${index}`}
          value={contact.affiliation}
          onChange={value => updateContact("affiliation", value)}
        />

        <FieldLabel required={false}>Country</FieldLabel>
        <TextBox
          type="input"
          id={`dataset-contacts-country-${index}`}
          value={contact.country}
          onChange={value => updateContact("country", value)}
        />

      </div>
    </div>
  );
}

function checkEmail(email: string, retype: string, updater: Consumer<string>): boolean {
  if (email === retype) {
    updater(email);
    return true;
  }

  return false;
}
