import { changeHandler, Consumer, JsonPathBuilder } from '../../../../../../Utils';
import { DatasetContact } from '../../../../../../Service';
import { partialRight } from 'lodash';
import React, { ReactElement } from 'react';
import { InputPair } from '../../../InputPair';

export interface ContactBlockProps {
  readonly index: number;
  readonly path: JsonPathBuilder;
  readonly contact: DatasetContact;
  readonly updateContact: (contact: DatasetContact, index: number) => void;

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

export function ContactBlock(props: ContactBlockProps): ReactElement {
  const makePath = (key: keyof DatasetContact) =>
    props.path.appendToString(key);

  const onChangePart = partialRight(
    changeHandler<DatasetContact>,
    props.contact,
    partialRight(props.updateContact, props.index)
  );

  const validationThreshold = determineStrictness(props, props.contact);

  return (
    <li className="field-grid non-bold-labels">
      <span className="multi-input-label">Contact {props.index + 1}</span>

      <div className="column-2 field-grid">
        <InputPair
          label="First Name"
          type="text"
          fieldName={makePath('firstName')}
          value={props.contact.firstName}
          onChange={onChangePart('firstName')}
          required={validationThreshold >= Strictness.Minimum}
          minLength={2}
          maxLength={300}
        />

        <InputPair
          label="Middle Name (optional)"
          type="text"
          fieldName={makePath('middleName')}
          value={props.contact.middleName}
          onChange={onChangePart('middleName')}
          required={false} // middle name is never required.
          minLength={0}
          maxLength={300}
        />

        <InputPair
          label="Last Name"
          type="text"
          fieldName={makePath('lastName')}
          value={props.contact.lastName}
          onChange={onChangePart('lastName')}
          required={validationThreshold >= Strictness.Minimum}
          minLength={2}
          maxLength={300}
        />

        <InputPair
          label="Email"
          fieldName={makePath('email')}
          type="email"
          value={props.contact.email}
          onChange={onChangePart('email')}
          required={validationThreshold >= Strictness.Primary}
          minLength={5}
          maxLength={1024}
        />

        <InputPair
          label="Organization Name"
          type="text"
          fieldName={makePath('affiliation')}
          value={props.contact.affiliation}
          onChange={onChangePart('affiliation')}
          required={validationThreshold >= Strictness.Secondary}
          minLength={3}
          maxLength={4000}
        />

        <InputPair
          label="Country"
          type="text"
          fieldName={makePath('country')}
          value={props.contact.country}
          onChange={onChangePart('country')}
          required={validationThreshold >= Strictness.Secondary}
          minLength={3}
          maxLength={200}
        />

        <InputPair
          label="Primary Contact"
          type="checkbox"
          fieldName={makePath('isPrimary')}
          nameOverride="isPrimaryContact"
          checked={props.contact.isPrimary}
          onChange={(v) => onChangePart('isPrimary')(v)}
        />
      </div>
    </li>
  );
}

function determineStrictness(
  props: ContactBlockProps,
  contact: DatasetContact,
): Strictness {
  if (!props.isPublic)
    return isContactEmpty(contact) ? Strictness.Disabled : Strictness.Minimum;

  // The primary contact on public datasets requires extra fields, if no primary
  // has been selected, the first contact defaults to being the primary.
  return props.contact.isPrimary || (!props.primaryExists && props.index === 0)
    ? Strictness.Primary
    : Strictness.Secondary;
}

function isContactEmpty(contact: DatasetContact): boolean {
  for (const key of Object.keys(contact) as Array<keyof DatasetContact>) {
    if (key !== 'isPrimary' && contact[key]) return false;
  }

  return !contact.isPrimary;
}
