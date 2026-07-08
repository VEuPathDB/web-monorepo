import React, { ReactElement, useState } from 'react';
import { InputBlock } from '../../InputBlock';
import { PartialDatasetPublication as Publication } from '../../../../../Service/Model';
import { Consumer, JsonPathBuilder, replaceElement } from '../../../../../Utils';
import { YesNoToggle } from '../../YesNoToggle';
import { InputPair } from '../../InputPair';
import { isNonBlankString } from '../../../../../Utils/value-tests';
import { isEmpty } from 'lodash';
import { AddRowButton } from '../../AddRowButton';

export interface PublicationsSectionProps {
  readonly publications: readonly Publication[];
  readonly setPublications: Consumer<readonly Publication[]>;

  readonly isRequired: boolean;

  readonly jsonPath: JsonPathBuilder;
}

export function PublicationsSection(
  props: PublicationsSectionProps,
): ReactElement {
  const [ isEnabled, setEnabled ] = useState<boolean>();

  const publications: readonly Publication[] = isEmpty(props.publications)
    ? [{ isPrimary: true }]
    : props.publications;

  const makePublicationSetter = (index: number) =>
    (publication: Publication) => props.setPublications(replaceElement(
      fixPrimaries(publications, index),
      index,
      publication,
    ));

  const calcRequired = (pub: Publication, i: number) => (isEnabled ?? false)
    && (pub.isPrimary || i === 0);

  return (
    <InputBlock header="Publications">
      <label
        className={'not-disabled' + (props.isRequired) ? ' required' : ''}
      >
        Associated Publication Available?
      </label>
      <YesNoToggle
        value={isEnabled}
        setValue={setEnabled}
        fieldName="enable-publications"
        className="not-disabled"
        required={props.isRequired}
        disableRequiredStyling={true}
        helpText={
          'Whether this dataset is also available from an external source'
          + ' (e.g., a public repository, journal-hosted supplementary'
          + ' materials, project website, or institutional archive) outside of'
          + ' this platform.'
        }
      />

      <ol className="multi-input">
        {publications.map((pub, i) => (
          <PublicationRow
            key={`pub-${i}`}
            index={i}
            publication={pub}
            setPublication={makePublicationSetter(i)}
            isRequired={calcRequired(pub, i)}
            isSingular={publications.length === 1}
            isDisabled={!isEnabled}
            jsonPath={props.jsonPath.append(i)}
          />
        ))}
      </ol>

      <AddRowButton
        disabled={!isEnabled}
        onClick={() => props.setPublications([ ...props.publications, {} ])}
      >
        + Additional publication
      </AddRowButton>
    </InputBlock>
  );
}

interface PublicationRowProps {
  readonly index: number;

  readonly publication: Publication;
  readonly setPublication: Consumer<Publication>;

  readonly isRequired: boolean;
  readonly isDisabled: boolean;
  readonly isSingular: boolean;

  readonly jsonPath: JsonPathBuilder;
}

function PublicationRow(props: PublicationRowProps): ReactElement {
  const type = props.publication.type ?? null;

  return (
    <li className="flex-row">
      <InputPair
        label="PMID"
        fieldName={`pub-${props.index}-pmid`}
        required={props.isRequired && type !== 'doi'}
        onChange={v => props.setPublication({
          ...props.publication,
          identifier: v,
          type: 'pmid'
        })}
        disabled={props.isDisabled || (isNonBlankString(props.publication.identifier) && props.publication.type === 'doi')}
      />
      <span className="join">OR</span>
      <InputPair
        label="DOI"
        fieldName={`pub-${props.index}-doi`}
        required={props.isRequired && type !== 'pmid'}
        onChange={v => props.setPublication({
          ...props.publication,
          identifier: v,
          type: 'doi'
        })}
        disabled={props.isDisabled || (isNonBlankString(props.publication.identifier) && props.publication.type === 'pmid')}
      />
      <InputPair
        label="Primary publication"
        fieldName={props.jsonPath.appendToString<Publication>('isPrimary')}
        type="checkbox"
        disabled={props.isDisabled || props.isSingular}
        onChange={v => props.setPublication({
          ...props.publication,
          isPrimary: v,
        })}
      />
    </li>
  );
}

/**
 * Ensure there is exactly one primary publication in the given array of
 * publications.
 *
 * Uses the `isPrimary` value of the publication at the given `index` to
 * determine which publication in the given array should be made primary.  If
 * the publication at the given index is marked as primary, then all other
 * publications will be set to non-primary.  If the publication at the given
 * index is set to non-primary, then the publication at index `0` will be set
 * to primary.
 *
 * @param pubs Publications
 *
 * @param index Index of the updated publication whose `isPrimary` value should
 * be checked.
 */
function fixPrimaries(
  pubs: readonly Publication[],
  index: number,
): readonly Publication[] {
  if (pubs.length === 1)
    return [ { ...pubs[0], isPrimary: true } ];

  // If the target publication has been set to _not_ primary, then the new
  // primary publication should be whatever is at index 0 (which may be the same
  // publication).
  if (!pubs[index].isPrimary)
    index = 0;

  const out: Publication[] = [];

  for (let i = 0; i < pubs.length; i++) {
    out.push({ ...pubs[i], isPrimary: i === index });
  }

  return out;
}
