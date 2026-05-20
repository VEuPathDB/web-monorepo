import { ReactElement, useEffect, useMemo, useState } from 'react';
import { partialRight } from 'lodash';

import { AddRowButton, InputBlock, InputPair } from '../../Components';
import { Consumer, JsonPathBuilder, changeHandler } from '../../../../../Utils';
import { DatasetContact, DatasetPostDetails } from '../../../../../Service';

export interface CollaboratorsSectionProps {
  readonly datasetMeta: DatasetPostDetails;
  readonly setDatasetMeta: Consumer<DatasetPostDetails>;
  readonly pathBuilder: JsonPathBuilder;
}

export function CollaboratorsSection(
  props: CollaboratorsSectionProps
): ReactElement {
  const safeContacts = useMemo(
    () => props.datasetMeta.contacts ?? [{}],
    [props.datasetMeta.contacts]
  );

  const [selection, setSelection] = useState(-1);

  const setContacts = (contacts: Array<DatasetContact>) =>
    props.setDatasetMeta({ ...props.datasetMeta, contacts: contacts });

  const onUpdateContact = (contact: DatasetContact, index: number) => {
    if (
      Array.isArray(props.datasetMeta.contacts) &&
      props.datasetMeta.contacts.length > 0
    ) {
      const newContacts = [...props.datasetMeta.contacts];
      newContacts[index] = contact;
      setContacts(newContacts);
    } else {
      setContacts([contact]);
    }
  };

  useEffect(() => {
    for (let i = 0; i < safeContacts.length; i++) {
      if (i !== selection && safeContacts[i].isPrimary) {
        safeContacts[i] = { ...safeContacts[i], isPrimary: undefined };
      }
    }
  }, [selection, safeContacts]);

  const contactBlocks = safeContacts.map((contact, index) => {
    const path = props.pathBuilder.append(index);

    return (
      <ContactBlock
        key={path.toString()}
        path={path}
        index={index}
        contact={contact}
        updateContact={onUpdateContact}
        selection={selection}
        setSelection={setSelection}
      />
    );
  });

  return (
    <InputBlock
      header="Principal Investigators and Collaborators"
      isCommunityRelated={true}
    >
      <ol className="multi-input contact-block">{contactBlocks}</ol>

      <div className="field-grid">
        <p className="column-2">
          <AddRowButton
            title="Adds an additional contact entry."
            className="column-2"
            onClick={() => setContacts([...safeContacts, {}])}
          >
            + Additional contact
          </AddRowButton>
        </p>
      </div>
    </InputBlock>
  );
}

interface ContactBlockProps {
  readonly index: number;
  readonly path: JsonPathBuilder;
  readonly contact: DatasetContact;
  readonly updateContact: (contact: DatasetContact, index: number) => void;
  readonly selection: number;
  readonly setSelection: Consumer<number>;
}

function ContactBlock({ path, ...props }: ContactBlockProps): ReactElement {
  const isPrimary = path.appendToString<DatasetContact>('isPrimary');

  const onChangePart = partialRight(
    changeHandler<DatasetContact>,
    props.contact,
    partialRight(props.updateContact, props.index)
  );

  const requireInputs = !isContactEmpty(props.contact);

  return (
    <li className="field-grid non-bold-labels">
      <span className="multi-input-label">Contact {props.index + 1}</span>

      <div className="column-2 field-grid">
        <TextField
          label="First Name"
          field="firstName"
          pathBuilder={path}
          value={props.contact.firstName}
          onChange={onChangePart('firstName')}
          required={requireInputs}
          minLength={2}
          maxLength={300}
        />

        <TextField
          label="Middle Name"
          field="middleName"
          pathBuilder={path}
          value={props.contact.middleName}
          onChange={onChangePart('middleName')}
          minLength={0}
          maxLength={300}
        />

        <TextField
          label="Last Name"
          field="lastName"
          pathBuilder={path}
          value={props.contact.lastName}
          onChange={onChangePart('lastName')}
          required={requireInputs}
          minLength={2}
          maxLength={300}
        />

        <TextField
          label="Email"
          field="email"
          type="email"
          pathBuilder={path}
          value={props.contact.email}
          onChange={onChangePart('email')}
          minLength={5}
          maxLength={1024}
        />

        <TextField
          label="Organization Name"
          field="affiliation"
          pathBuilder={path}
          value={props.contact.affiliation}
          onChange={onChangePart('affiliation')}
          minLength={3}
          maxLength={4000}
        />

        <TextField
          label="Country"
          field="country"
          pathBuilder={path}
          value={props.contact.country}
          onChange={onChangePart('country')}
          minLength={3}
          maxLength={200}
        />

        <InputPair
          label="Primary Contact"
          type="checkbox"
          fieldName={isPrimary}
          nameOverride="isPrimaryContact"
          checked={props.index === props.selection}
          onChange={(v) => {
            onChangePart('isPrimary')(v);
            props.setSelection(v ? props.index : -1);
          }}
        />
      </div>
    </li>
  );
}

interface LabeledInputProps {
  readonly label: string;
  readonly type?: 'text' | 'email';
  readonly field: keyof DatasetContact;
  readonly pathBuilder: JsonPathBuilder;
  readonly value: string | undefined;
  readonly onChange: (value: string) => void;
  readonly required?: boolean;
  readonly minLength?: number;
  readonly maxLength?: number;
}

function TextField({
  label,
  value,
  field,
  pathBuilder,
  onChange,
  required,
  minLength,
  maxLength,
  type,
}: LabeledInputProps): ReactElement {
  return (
    <InputPair
      label={label}
      type={type}
      fieldName={pathBuilder.appendToString(field)}
      value={value}
      onChange={onChange}
      labelClass={required ? 'required' : undefined}
      required={required}
      minLength={minLength}
      maxLength={maxLength}
    />
  );
}

function isContactEmpty(contact: DatasetContact): boolean {
  for (const key of Object.keys(contact) as Array<keyof DatasetContact>) {
    if (key !== 'isPrimary' && contact[key]) return false;
  }

  return !contact.isPrimary;
}
