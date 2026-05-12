import { ReactElement } from 'react';
import { partialRight } from 'lodash';

import { InputBlock, InputPair } from '../../Components';
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
  const safeContacts = props.datasetMeta.contacts ?? [{}];

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

  const contactBlocks = safeContacts.map((contact, index) => {
    const path = props.pathBuilder.append(index);

    return (
      <ContactBlock
        key={path.toString()}
        path={path}
        index={index}
        contact={contact}
        updateContact={onUpdateContact}
      />
    );
  });

  return (
    <InputBlock header="Principal Investigators and Collaborators">
      <div className="field-grid">
        <span className="multi-input-label">Contacts</span>

        <ol className="multi-input contact-block">{contactBlocks}</ol>

        <button
          className="input-appender"
          type="button"
          title="Adds an additional contact entry."
          onClick={(_) => setContacts([...safeContacts, {}])}
        >
          + Additional contact
        </button>
      </div>
    </InputBlock>
  );
}

interface ContactBlockProps {
  readonly index: number;
  readonly path: JsonPathBuilder;
  readonly contact: DatasetContact;
  readonly updateContact: (contact: DatasetContact, index: number) => void;
}

function ContactBlock({ path, ...props }: ContactBlockProps): ReactElement {
  const isPrimary = path.appendToString<DatasetContact>('isPrimary');

  const onChangePart = partialRight(
    changeHandler<DatasetContact>,
    props.contact,
    partialRight(props.updateContact, props.index)
  );

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
        />

        <TextField
          label="Middle Name"
          field="middleName"
          pathBuilder={path}
          value={props.contact.middleName}
          onChange={onChangePart('middleName')}
        />

        <TextField
          label="Last Name"
          field="lastName"
          pathBuilder={path}
          value={props.contact.lastName}
          onChange={onChangePart('lastName')}
        />

        <TextField
          label="Email"
          field="email"
          pathBuilder={path}
          value={props.contact.email}
          onChange={onChangePart('email')}
        />

        <TextField
          label="Organization Name"
          field="affiliation"
          pathBuilder={path}
          value={props.contact.affiliation}
          onChange={onChangePart('affiliation')}
        />

        <TextField
          label="Country"
          field="country"
          pathBuilder={path}
          value={props.contact.country}
          onChange={onChangePart('country')}
        />

        <InputPair
          label="Primary Contact"
          type="radio"
          fieldName={isPrimary}
          nameOverride="isPrimaryContact"
          value={isPrimary}
          onChange={(value: string) =>
            onChangePart('isPrimary')(value === isPrimary)
          }
        />
      </div>
    </li>
  );
}

interface LabeledInputProps {
  readonly label: string;
  readonly field: keyof DatasetContact;
  readonly pathBuilder: JsonPathBuilder;
  readonly value: string | undefined;
  readonly onChange: (value: string) => void;
}

function TextField({
  label,
  value,
  field,
  pathBuilder,
  onChange,
}: LabeledInputProps): ReactElement {
  return (
    <InputPair
      label={label}
      fieldName={pathBuilder.appendToString(field)}
      value={value}
      onChange={onChange}
    />
  );
}
