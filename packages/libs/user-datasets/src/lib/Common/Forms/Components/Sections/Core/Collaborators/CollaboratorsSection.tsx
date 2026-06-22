import React, { ReactElement, useEffect, useMemo, useState } from 'react';

import { AddRowButton, InputBlock } from '../../../index';
import { Consumer, JsonPathBuilder } from '../../../../../../Utils';
import { DatasetContact, DatasetPostDetails } from '../../../../../../Service';
import { ContactBlock } from './ContactBlock';
import { isEmpty } from 'lodash';

export interface CollaboratorsSectionProps {
  readonly datasetMeta: DatasetPostDetails;
  readonly setDatasetMeta: Consumer<DatasetPostDetails>;
  readonly pathBuilder: JsonPathBuilder;
}

export function CollaboratorsSection(
  props: CollaboratorsSectionProps
): ReactElement {
  const safeContacts = useMemo(
    () => isEmpty(props.datasetMeta.contacts)
      ? [ {} ]
      : props.datasetMeta.contacts!,
    [ props.datasetMeta.contacts ]
  );

  const hasPrimary = useMemo(
    () => safeContacts.some(it => it.isPrimary),
    [ safeContacts ]
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
        selection={selection}
        setSelection={setSelection}
        isPublic={isPublic}
        primaryExists={hasPrimary}
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
