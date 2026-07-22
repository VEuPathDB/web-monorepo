import React, { ReactElement, useCallback, useState } from 'react';
import { InputBlock } from '../../InputBlock';
import { PartialDatasetPublication as Publication } from '../../../../../Service/Model';
import {
  Consumer,
  JsonPathBuilder,
  replaceElement,
} from '../../../../../Utils';
import { InputPair } from '../../InputPair';
import { isNonBlankString } from '../../../../../Utils/value-tests';
import { isEmpty } from 'lodash';
import { AddRowButton } from '../../AddRowButton';
import { OptionalSection } from '../../OptionalSection';
import { useDispatch } from 'react-redux';
import { useDatasetFormSelector } from '../../../../../StoreModules/UserDatasetUploadStoreModule';
import { runIfDefined } from '../../../../../Utils/ergonomics';
import {
  lookupDOICitation,
  resemblesDOI,
} from '../../../../../Service/Publications/doi';
import {
  lookupPubMedCitation,
  resemblesPMID,
} from '../../../../../Service/Publications/pubmed';
import {
  CitationFound,
  CitationLookupFailed,
  CitationNotFound,
  CitationRequested,
} from '../../../../../Actions/UserDatasetUploadActions';

export interface PublicationsSectionProps {
  readonly publications: readonly Publication[];
  readonly setPublications: Consumer<readonly Publication[]>;

  readonly isRequired: boolean;

  readonly jsonPath: JsonPathBuilder;
}

export function PublicationsSection(
  props: PublicationsSectionProps
): ReactElement {
  const [isEnabled, setEnabled] = useState<boolean>();

  const publications: readonly Publication[] = isEmpty(props.publications)
    ? [{ isPrimary: true }]
    : props.publications;

  const makePublicationSetter = (index: number) => (publication: Publication) =>
    props.setPublications(
      fixPrimaries(replaceElement(publications, index, publication), index)
    );

  const calcRequired = (pub: Publication, i: number) =>
    (isEnabled ?? false) && (pub.isPrimary || i === 0);

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
            'Whether this dataset is also available from an external' +
            ' source (e.g., a public repository, journal-hosted supplementary' +
            ' materials, project website, or institutional archive) outside' +
            ' of this platform.',
        }}
        className="field-grid"
      >
        <ol className="span-2 multi-input">
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
          onClick={() => props.setPublications([...publications, {}])}
          className="column-2"
        >
          + Additional publication
        </AddRowButton>
      </OptionalSection>
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
  const hasIdentifier = isNonBlankString(props.publication.identifier);

  const isSearchable = isPublicationSearchable(props.publication);

  const dispatch = useDispatch();
  const lookupState = useDatasetFormSelector((it) =>
    runIfDefined(props.publication.identifier, (id) =>
      isSearchable ? it.formMetaState.publicationLookups[id] : undefined
    )
  );

  const runLookup = useCallback(() => {
    if (!isSearchable || lookupState !== undefined) return;

    const id = props.publication.identifier!;

    dispatch(CitationRequested(id));

    (type === 'pmid' ? lookupPubMedCitation(id) : lookupDOICitation(id))
      .then((it) => {
        switch (it.status) {
          case 'not-found':
            dispatch(CitationNotFound(id));
            break;
          case 'error':
            dispatch(CitationLookupFailed(id, it.error));
            break;
          case 'success':
            dispatch(CitationFound(id, it.citation));
            break;
        }
      })
      .catch((it) =>
        dispatch(
          CitationLookupFailed(
            id,
            it instanceof Error ? it : new Error(String(it))
          )
        )
      );
  }, [isSearchable, lookupState, props.publication.identifier, type, dispatch]);

  return (
    <>
      <li className="flex-row">
        <InputPair
          label="PMID"
          fieldName={`pub-${props.index}-pmid`}
          required={props.isRequired && type !== 'doi'}
          value={type !== 'doi' ? props.publication.identifier : undefined}
          onChange={(v) => {
            props.setPublication({
              ...props.publication,
              identifier: v,
              type: v.length > 0 ? 'pmid' : undefined,
            });
          }}
          labelClass={type === 'doi' ? 'disabled' : undefined}
          disabled={props.isDisabled || (hasIdentifier && type === 'doi')}
        />

        <span className="join">OR</span>

        <InputPair
          label="DOI"
          fieldName={`pub-${props.index}-doi`}
          required={props.isRequired && type !== 'pmid'}
          value={type !== 'pmid' ? props.publication.identifier : undefined}
          onChange={(v) =>
            props.setPublication({
              ...props.publication,
              identifier: v,
              type: v.length > 0 ? 'doi' : undefined,
            })
          }
          labelClass={type === 'pmid' ? 'disabled' : undefined}
          disabled={props.isDisabled || (hasIdentifier && type === 'pmid')}
        />

        <InputPair
          label="Primary publication"
          fieldName={props.jsonPath.appendToString<Publication>('isPrimary')}
          type="checkbox"
          disabled={props.isDisabled || props.isSingular}
          checked={props.publication.isPrimary}
          onChange={(v) =>
            props.setPublication({
              ...props.publication,
              isPrimary: v,
            })
          }
        />
      </li>
    </>
  );
}

function isPublicationSearchable(pub: Publication): boolean {
  if (!pub.type || !pub.identifier) return false;

  return pub.type === 'pmid'
    ? resemblesPMID(pub.identifier)
    : resemblesDOI(pub.identifier);
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
  index: number
): readonly Publication[] {
  if (pubs.length === 1) return [{ ...pubs[0], isPrimary: true }];

  // If the target publication has been set to _not_ primary, then the new
  // primary publication should be whatever is at index 0 (which may be the same
  // publication).
  if (!pubs[index].isPrimary) index = 0;

  const out: Publication[] = [];

  for (let i = 0; i < pubs.length; i++) {
    out.push({ ...pubs[i], isPrimary: i === index });
  }

  return out;
}
