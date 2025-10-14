import * as util from "./component-utils"

import React from "react"
import Trash from '@veupathdb/coreui/lib/components/icons/Trash';

import { FieldLabel } from "./FieldLabel";
import { FloatingButton } from "@veupathdb/coreui";
import { FloatingButtonWDKStyle } from '@veupathdb/coreui/lib/components/buttons/FloatingButton';
import { RadioList, TextBox } from "@veupathdb/wdk-client/lib/Components";

export interface ContactInputProps {
  n: number;
  name: string;
  email?: string;
  affiliation?: string;
  city?: string;
  state?: string;
  country?: string;
  address?: string;
  isPrimary?: boolean;
  onAddName: (value: string) => void;
  onAddEmail: (value: string) => void;
  onAddAffiliation: (value: string) => void;
  onAddCity: (value: string) => void;
  onAddState: (value: string) => void;
  onAddCountry: (value: string) => void;
  onAddAddress: (value: string) => void;
  onAddIsPrimary: (value: boolean) => void;
  onRemoveContact: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export function ContactInput(props: ContactInputProps): React.ReactElement {
  const {
    n,
    name = '',
    email = '',
    affiliation = '',
    city = '',
    state = '',
    country = '',
    address = '',
    isPrimary = false,
    onAddName,
    onAddEmail,
    onAddAffiliation,
    onAddCity,
    onAddState,
    onAddCountry,
    onAddAddress,
    onAddIsPrimary,
    onRemoveContact,
  } = props;

  return (
    <div className={util.cx('--NestedInputContainer')}>
      <div className={util.cx('--NestedInputTitle')}>
        <FieldLabel required={false} style={{ fontSize: '1.2em' }}>
          Contact {n + 1}
        </FieldLabel>
        <FloatingButton
          text="Remove"
          onPress={onRemoveContact}
          icon={Trash}
          styleOverrides={FloatingButtonWDKStyle}
        />
      </div>
      <div className={util.cx('--NestedInputFields')}>
        <FieldLabel required>Name</FieldLabel>
        <TextBox
          type="input"
          id={`data-set-contacts-name-${n}`}
          placeholder="Name"
          required
          value={name}
          onChange={onAddName}
        />
        <FieldLabel required={false}>Email</FieldLabel>
        <TextBox
          type="input"
          id={`data-set-contacts-email-${n}`}
          placeholder="Email"
          required={false}
          value={email}
          onChange={onAddEmail}
        />
        <FieldLabel required={false}>Affiliation</FieldLabel>
        <TextBox
          type="input"
          id={`data-set-contacts-affiliation-${n}`}
          placeholder="Affiliation"
          required={false}
          value={affiliation}
          onChange={onAddAffiliation}
        />
        <FieldLabel required={false}>City</FieldLabel>
        <TextBox
          type="input"
          id={`data-set-contacts-city-${n}`}
          placeholder="City"
          required={false}
          value={city}
          onChange={onAddCity}
        />
        <FieldLabel required={false}>State</FieldLabel>
        <TextBox
          type="input"
          id={`data-set-contacts-state-${n}`}
          placeholder="State"
          required={false}
          value={state}
          onChange={onAddState}
        />
        <FieldLabel required={false}>Country</FieldLabel>
        <TextBox
          type="input"
          id={`data-set-contacts-country-${n}`}
          placeholder="Country"
          required={false}
          value={country}
          onChange={onAddCountry}
        />
        <FieldLabel required={false}>Address</FieldLabel>
        <TextBox
          type="input"
          id={`data-set-contacts-address-${n}`}
          placeholder="Address"
          required={false}
          value={address}
          onChange={onAddAddress}
        />
        <FieldLabel required={false}>Is primary?</FieldLabel>
        <RadioList
          name={`isPrimary-${n}`}
          className="horizontal"
          value={isPrimary ? 'true' : 'false'}
          onChange={(value) => {
            onAddIsPrimary(value === 'true');
          }}
          items={[
            { value: 'true', display: 'Yes' },
            { value: 'false', display: 'No' },
          ]}
        />
      </div>
    </div>
  );
}
