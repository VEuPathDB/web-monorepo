import { ReactElement } from 'react';
import { partialRight } from 'lodash';

import { InputPair } from "../../Components";
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

  const contactBlocks = (props.datasetMeta.contacts ?? [{}]).map(
    (contact, index) => (
      <ContactBlock
        index={index}
        pathBuilder={props.pathBuilder}
        contact={contact}
        updateContact={onUpdateContact}
      />
    )
  );

  return (
    <div className="input-block">
      <h4>Principal Investigators and Collaborators</h4>

      <div className="field-grid">
        <span className="multi-input-label">Contacts</span>

        <ol className="multi-input contact-block">{contactBlocks}</ol>

        <button
          className="input-appender"
          title="Adds an additional contact entry."
          onClick={(_) => setContacts([{}])}
        >
          + Additional contact
        </button>
      </div>
    </div>
  );
}

interface ContactBlockProps {
  readonly index: number;
  readonly pathBuilder: JsonPathBuilder;
  readonly contact: DatasetContact;
  readonly updateContact: (contact: DatasetContact, index: number) => void;
}

function ContactBlock(props: ContactBlockProps): ReactElement {
  const path = props.pathBuilder.append(props.index);

  const isPrimary = path.appendToString<DatasetContact>('isPrimary');

  const onChangePart = partialRight(
    changeHandler<DatasetContact>,
    props.contact,
    partialRight(props.updateContact, props.index)
  );

  return (
    <li className="field-grid non-bold-labels">
      <span className="multi-input-label">Contact {props.index + 1}</span>
      <button className="inline">Copy from My Profile</button>

      <div className="col-2 field-grid">
        <TextField
          label="First Name"
          field="firstName"
          pathBuilder={path}
          onChange={onChangePart('firstName')}
        />

        <TextField
          label="Middle Name"
          field="middleName"
          pathBuilder={path}
          onChange={onChangePart('middleName')}
        />

        <TextField
          label="Last Name"
          field="lastName"
          pathBuilder={path}
          onChange={onChangePart('lastName')}
        />

        <TextField
          label="Email"
          field="email"
          pathBuilder={path}
          onChange={onChangePart('email')}
        />

        <TextField
          label="Organization Name"
          field="affiliation"
          pathBuilder={path}
          onChange={onChangePart('affiliation')}
        />

        <TextField
          label="Country"
          field="country"
          pathBuilder={path}
          onChange={onChangePart('country')}
        />

        <>
          <label htmlFor={isPrimary}>Primary Contact</label>
          <input
            type="radio"
            name="primaryContact"
            id={isPrimary}
            value={isPrimary}
            onChange={(e) =>
              onChangePart('isPrimary')(e.currentTarget.value === isPrimary)
            }
          />
        </>
      </div>
    </li>
  );
}

interface LabeledInputProps {
  readonly label: string;
  readonly field: keyof DatasetContact;
  readonly pathBuilder: JsonPathBuilder;
  readonly onChange: (value: string) => void;
}

function TextField(props: LabeledInputProps): ReactElement {
  return InputPair({
    label:     props.label,
    fieldName: props.pathBuilder.appendToString(props.field),
    onChange:  props.onChange,
  });
}
