import React, { ReactElement } from 'react';

import { AddRowButton, InputBlock } from '../../../index';
import { JsonPathBuilder, isNonEmpty } from '../../../../../../Utils';
import {
  PartialDatasetContact,
  PartialDatasetDetails,
} from '../../../../../../Service';
import { ContactBlock } from './ContactBlock';
import { useContacts, useDatasetVisibility } from '../../../../Hooks/dataset-metadata-hooks';
import { useDispatch } from 'react-redux';
import { updateContacts } from '../../../../../../Actions/DatasetMetadataFormActions';

export interface CollaboratorsSectionProps {
  readonly pathBuilder: JsonPathBuilder;
}

export function CollaboratorsSection(
  props: CollaboratorsSectionProps
): ReactElement {
  const pathBuilder = props.pathBuilder.append<PartialDatasetDetails>('contacts');

  const contacts = useContacts();
  const dispatch = useDispatch();

  const safeContacts = isNonEmpty(contacts) ? contacts : [{}];

  const hasPrimary = safeContacts.some((it) => it.isPrimary);

  const setContacts = React.useCallback(
    (contacts: Array<PartialDatasetContact>) => dispatch(updateContacts(contacts)),
    [dispatch],
  );

  const onUpdateContact = React.useCallback(
    (contact: PartialDatasetContact, index: number) => {
      if (isNonEmpty(contacts)) {
        const newContacts = scrubContactPrimaries(
          contacts,
          contact.isPrimary === true
        );
        newContacts[index] = scrubContactPrimary(contact);
        setContacts(newContacts);
      } else {
        setContacts([scrubContactPrimary(contact)]);
      }
    },
    [contacts, setContacts],
  );

  const isPublic = useDatasetVisibility() === 'public';

  const contactBlocks = safeContacts.map((contact, index) => {
    const path = pathBuilder.append(index);

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

function scrubContactPrimaries(
  contacts: ReadonlyArray<PartialDatasetContact>,
  unsetAll: boolean = false
): Array<PartialDatasetContact> {
  return unsetAll
    ? contacts.map(({ isPrimary: _, ...contact }) => contact)
    : contacts.map(scrubContactPrimary);
}

function scrubContactPrimary(contact: PartialDatasetContact): PartialDatasetContact {
  if (contact.isPrimary === true) return contact;

  const { isPrimary: _, ...prunedContact } = contact;

  return prunedContact;
}
