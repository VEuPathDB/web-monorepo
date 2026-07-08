import React, { ReactElement } from 'react';

import { AddRowButton, InputBlock } from '../../../index';
import { Consumer, JsonPathBuilder } from '../../../../../../Utils';
import { DatasetContact, PartialDatasetDetails } from '../../../../../../Service';
import { ContactBlock } from './ContactBlock';
import { isEmpty } from 'lodash';

export interface CollaboratorsSectionProps {
  readonly datasetMeta: PartialDatasetDetails;
  readonly setDatasetMeta: Consumer<PartialDatasetDetails>;
  readonly pathBuilder: JsonPathBuilder;
}

export function CollaboratorsSection(
  props: CollaboratorsSectionProps
): ReactElement {
  const safeContacts = isEmpty(props.datasetMeta.contacts)
    ? [ {} ]
    : props.datasetMeta.contacts!;

  const hasPrimary = safeContacts.some(it => it.isPrimary);

  const setContacts = (contacts: Array<DatasetContact>) =>
    props.setDatasetMeta({ ...props.datasetMeta, contacts });

  const onUpdateContact = (contact: DatasetContact, index: number) => {
    if (
      Array.isArray(props.datasetMeta.contacts) &&
      props.datasetMeta.contacts.length > 0
    ) {
      const newContacts = scrubContactPrimaries(props.datasetMeta.contacts, contact.isPrimary === true);
      newContacts[index] = scrubContactPrimary(contact);
      setContacts(newContacts);
    } else {
      setContacts([scrubContactPrimary(contact)]);
    }
  };

  const isPublic = props.datasetMeta.visibility === 'public';

  const contactBlocks = safeContacts.map((contact, index) => {
    const path = props.pathBuilder.append(index);

    return (
      <ContactBlock
        key={path.toString()}
        path={path}
        index={index}
        contact={contact}
        updateContact={onUpdateContact}
        isPublic={isPublic}
        primaryExists={hasPrimary}
      />
    );
  });

  return (
    <InputBlock header="Principal Investigators and Collaborators">
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

function scrubContactPrimaries(contacts: readonly DatasetContact[], unsetAll: boolean = false): DatasetContact[] {
  return unsetAll
    ? contacts.map(({ isPrimary: _, ...contact }) => contact)
    : contacts.map(scrubContactPrimary);
}

function scrubContactPrimary(contact: DatasetContact): DatasetContact {
  if (contact.isPrimary === true)
    return contact;

  const { isPrimary: _, ...prunedContact } = contact;

  return prunedContact;
}