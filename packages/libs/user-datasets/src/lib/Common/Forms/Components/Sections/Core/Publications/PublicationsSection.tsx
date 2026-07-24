import React, { ReactElement } from 'react';
import { InputBlock } from '../../../InputBlock';
import { PartialDatasetPublication as Publication } from '../../../../../../Service/Model';
import {
  Consumer,
  JsonPathBuilder,
  replaceElement,
} from '../../../../../../Utils';
import { isEmpty } from 'lodash';
import { AddRowButton } from '../../../AddRowButton';
import { OptionalSection } from '../../../OptionalSection';
import { fixPrimaries, PublicationList, PublicationSetter } from './utils';
import { PublicationRow } from './PublicationRow';

import './PublicationsSection.scss';
import { UnaryFunction } from '../../../../../../Utils/types';
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

  const isEnabled = havePubs || props.clientState.hasPublications;

  const publications: PublicationList = havePubs
    ? props.publications
    : [{ isPrimary: true }];

  const calcRequired = (pub: Publication, i: number) =>
    (isEnabled ?? false) &&
    (pub.isPrimary || (i === 0 && publications.length === 1));

  return (
    <InputBlock header="Publications">
      <OptionalSection
        toggle={{
          label: 'Associated Publication Available?',
          enabled: isEnabled ?? null,
          setEnabled: (v) =>
            props.setClientState({
              ...props.clientState,
              hasPublications: v,
            }),
          fieldName: 'enable-publications',
          required: props.isRequired,
          helpText:
            'Whether this dataset is also available from an external' +
            ' source (e.g., a public repository, journal-hosted supplementary' +
            ' materials, project website, or institutional archive) outside' +
            ' of this platform.',
        }}
        className="field-grid"
      >
        <ol className="span-2 multi-input">
          {publications.map((pub, index) => (
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
            />
          ))}
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
): PublicationSetter {
  return (fn: UnaryFunction<Publication>) =>
    setter(
      fixPrimaries(replaceElement(pubList, index, fn(pubList[index])), index)
    );
}
