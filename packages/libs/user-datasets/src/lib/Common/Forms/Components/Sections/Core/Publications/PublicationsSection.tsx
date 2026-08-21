import React, { ReactElement } from 'react';
import { InputBlock } from '../../../InputBlock';
import { PartialDatasetPublication as Publication } from '../../../../../../Service/Model';
import {
  Consumer, isNonBlankString,
  JsonPathBuilder,
  replaceElement
} from '../../../../../../Utils';
import { isEmpty } from 'lodash';
import { AddRowButton } from '../../../AddRowButton';
import { OptionalSection } from '../../../OptionalSection';
import { fixPrimaries, PublicationList } from './utils';
import { PublicationRow } from './PublicationRow';

import './PublicationsSection.scss';
import { ClientSideUploadFormState } from '../../../../../../StoreModules';

export interface PublicationsSectionProps {
  readonly publications: PublicationList;
  readonly setPublications: Consumer<PublicationList>;

  readonly clientState: ClientSideUploadFormState;
  readonly setClientState: Consumer<ClientSideUploadFormState>;

  readonly isRequired: boolean;

  readonly jsonPath: JsonPathBuilder;
}

export function PublicationsSection(
  props: PublicationsSectionProps
): ReactElement {
  const havePubs = !isEmpty(props.publications);

  let isEnabled = props.clientState.hasPublications;

  const setEnabled = (v: boolean) =>
    props.setClientState({
      ...props.clientState,
      hasPublications: v
    });

  if (isEnabled === undefined && havePubs) {
    setEnabled(true)
  }

  const publications: PublicationList = havePubs
    ? props.publications
    : [{ isPrimary: true }];

  const calcRequired = (pub: Publication, i: number) =>
    (isEnabled ?? false) &&
    (pub.isPrimary || (i === 0 && publications.length === 1));

  const seenIdentifiers = new Set<string>();

  return (
    <InputBlock header="Publications">
      <OptionalSection
        toggle={{
          label: 'Associated Publication Available?',
          enabled: isEnabled ?? null,
          setEnabled: setEnabled,
          fieldName: 'enable-publications',
          required: props.isRequired,
          helpText:
            'Whether the data underlying this dataset have been described in a published manuscript, journal article, or preprint.',
        }}
        className="field-grid"
      >
        <ol className="span-2 multi-input">
          {publications.map((pub, index) => {
            let isDuplicate = false;

            if (isNonBlankString(pub.identifier)) {
              if (seenIdentifiers.has(pub.identifier)) {
                isDuplicate = true;
              } else {
                seenIdentifiers.add(pub.identifier);
              }
            }

            return (
              <PublicationRow
                key={`pub-${index}`}
                index={index}
                publication={pub}
                setPublication={makePublicationSetter(
                  index,
                  publications,
                  props.setPublications
                )}
                isRequired={calcRequired(pub, index)}
                isSingular={publications.length === 1}
                isDisabled={!isEnabled}
                jsonPath={props.jsonPath.append(index)}
                isDuplicate={isDuplicate}
              />
            );
          })}
        </ol>

        <AddRowButton
          disabled={!isEnabled}
          onClick={() => props.setPublications([...publications, {}])}
          className="column-2 publication-appender"
        >
          + Additional publication
        </AddRowButton>
      </OptionalSection>
    </InputBlock>
  );
}

function makePublicationSetter(
  index: number,
  pubList: PublicationList,
  setter: Consumer<PublicationList>
): Consumer<Publication> {
  return (pub: Publication) => {
    setter(fixPrimaries(replaceElement(pubList, index, pub), index));
  }
}
