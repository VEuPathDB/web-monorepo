import React from 'react';
import {
  isBlank,
  isNonBlank,
  JsonPathBuilder,
  newTextLengthTest
} from '../../../../../../Utils';
import { PartialDatasetContact } from '../../../../../../Service/Model';
import { LabelInputPair, TextInputProps } from '../../../LabelInputPair';

export interface ContactBlockProps {
  readonly index: number;
  readonly path: JsonPathBuilder;
  readonly contact: PartialDatasetContact;
  readonly updateContact: (contact: PartialDatasetContact, index: number) => void;

  /**
   * Whether the dataset visibility has been set to public.
   *
   * Affects what fields are required.
   */
  readonly isPublic: boolean;

  /**
   * Whether the user has marked _any_ contacts as being the primary contact.
   *
   * A `true` value here does not imply that the current contact is the primary
   * contact, just that a primary contact exists.
   */
  readonly primaryExists: boolean;
}

type ContactProp = keyof PartialDatasetContact;

/**
 * Validation threshold definitions for the different tiers of validation rules
 * applied to dataset contacts.
 *
 * Each entry is intended to inherit the rules from the lower values.  This
 * means rule tests can be performed as `validationLevel >= minimumLevel`
 */
enum Strictness {
  /**
   * No fields are required.
   */
  Disabled,

  /**
   * Minimum field requirement threshold for any non-empty contact record
   * regardless of dataset visibility.
   */
  Minimum,

  /**
   * Field requirement threshold for secondary contacts on public datasets.
   */
  Secondary,

  /**
   * Field requirement threshold for primary contacts on public datasets.
   */
  Primary,
}

const TEST_CONTACT_NAME = newTextLengthTest(2, 300);
const testEmail = ({ disabled, value, required }: TextInputProps): boolean =>
  disabled === true
    || (!required && isBlank(value))
    || (
      isNonBlank(value)
      && value.length <= 1024
      && /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)
    );
const testAffiliation = newTextLengthTest(3, 4000);
const testCountry = newTextLengthTest(3, 200);

export function ContactBlock(props: ContactBlockProps): React.ReactElement {
  const { index, contact, updateContact } = props;

  const makePath = (key: ContactProp) =>
    props.path.appendToString(key);

  // Disable linting for dep array: Dependencies are known.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onChangePart = React.useCallback(
    (k: ContactProp, v: PartialDatasetContact[typeof k]) =>
      updateContact({ ...contact, [k]: v }, index),
    [contact, updateContact, index]
  );

  const validationThreshold = determineStrictness(props);

  return (
    <li className="field-grid non-bold-labels">
      <span className="multi-input-label">Contact {index + 1}</span>

      <div className="column-2 field-grid">
        <LabelInputPair
          label="First Name"
          type="text"
          fieldName={makePath('firstName')}
          value={contact.firstName}
          onChange={(it) => onChangePart('firstName', it)}
          required={validationThreshold >= Strictness.Minimum}
          validator={TEST_CONTACT_NAME}
        />

        <LabelInputPair
          label="Middle Name (optional)"
          type="text"
          fieldName={makePath('middleName')}
          value={contact.middleName}
          onChange={(it) => onChangePart('middleName', it)}
          required={false} // middle name is never required.
          minLength={0}
          maxLength={300}
        />

        <LabelInputPair
          label="Last Name"
          type="text"
          fieldName={makePath('lastName')}
          value={contact.lastName}
          onChange={(it) => onChangePart('lastName', it)}
          required={validationThreshold >= Strictness.Minimum}
          validator={TEST_CONTACT_NAME}
        />

        <LabelInputPair
          label="Email"
          fieldName={makePath('email')}
          type="email"
          value={contact.email}
          onChange={(it) => onChangePart('email', it)}
          required={validationThreshold >= Strictness.Primary}
          validator={testEmail}
        />

        <LabelInputPair
          label="Affiliation"
          type="text"
          fieldName={makePath('affiliation')}
          value={contact.affiliation}
          onChange={(it) => onChangePart('affiliation', it)}
          required={validationThreshold >= Strictness.Secondary}
          validator={testAffiliation}
        />

        <LabelInputPair
          label="Country"
          type="text"
          fieldName={makePath('country')}
          value={contact.country}
          onChange={(it) => onChangePart('country', it)}
          required={validationThreshold >= Strictness.Secondary}
          validator={testCountry}
        />

        <LabelInputPair
          label="Primary Contact"
          type="checkbox"
          fieldName={makePath('isPrimary')}
          nameOverride="isPrimaryContact"
          checked={contact.isPrimary}
          onChange={(v) => onChangePart('isPrimary', v)}
        />
      </div>
    </li>
  );
}

function determineStrictness(props: ContactBlockProps): Strictness {
  if (!props.isPublic)
    return isContactEmpty(props.contact)
      ? Strictness.Disabled
      : Strictness.Minimum;

  // The primary contact on public datasets requires extra fields, if no primary
  // has been selected, the first contact defaults to being the primary.
  return props.contact.isPrimary || (!props.primaryExists && props.index === 0)
    ? Strictness.Primary
    : Strictness.Secondary;
}

function isContactEmpty(contact: PartialDatasetContact): boolean {
  for (const key of Object.keys(contact) as ReadonlyArray<ContactProp>) {
    if (key !== 'isPrimary' && contact[key]) return false;
  }

  return !contact.isPrimary;
}
