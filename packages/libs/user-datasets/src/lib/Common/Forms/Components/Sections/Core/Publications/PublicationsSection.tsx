import React, { ReactElement } from 'react';
import * as util from '../../../../../../Utils';

import { InputBlock } from '../../../InputBlock';
import { PartialDatasetDetails, PartialDatasetPublication as Publication } from '../../../../../../Service/Model';
import { AddRowButton } from '../../../AddRowButton';
import { OptionalSection } from '../../../OptionalSection';
import { fixPrimaries, PublicationList } from './utils';
import { PublicationRow } from './PublicationRow';

import { useContentFlags, useDatasetVisibility, usePublications } from '../../../../Hooks/dataset-metadata-hooks';
import { useDispatch } from 'react-redux';
import { updateContentFlags, updatePublications } from '../../../../../../Actions/DatasetMetadataFormActions';

import './PublicationsSection.scss';

export interface PublicationsSectionProps {
  readonly jsonPath: util.JsonPathBuilder;
}

export function PublicationsSection(
  props: PublicationsSectionProps
): ReactElement {
  const jsonPath = props.jsonPath.append<PartialDatasetDetails>('publications');

  const dispatch = useDispatch();

  const publications = usePublications();
  const setPublication = React.useCallback(
    (publication: Publication, index: number) =>
      dispatch(updatePublications(fixPrimaries(util.replaceElement(publications, index, publication), index))),
    [dispatch, publications],
  );

  const havePubs = util.isNonEmpty(publications);

  const contentFlags = useContentFlags();
  const isEnabled = contentFlags?.hasPublications;
  const setEnabled = React.useCallback(
    (enabled: boolean) => dispatch(updateContentFlags({
      ...contentFlags,
      hasPublications: enabled,
    })),
    [dispatch, contentFlags],
  );

  if (isEnabled === undefined && havePubs) {
    setEnabled(true);
  }

  const safePubs: PublicationList = havePubs
    ? publications
    : [{ isPrimary: true }];

  const calcRequired = (pub: Publication, i: number) =>
    (isEnabled ?? false) &&
    (pub.isPrimary || (i === 0 && safePubs.length === 1));

  const isPublic = useDatasetVisibility() === 'public';

  const seenIdentifiers = new Set<string>();

  return (
    <InputBlock header="Publications">
      <OptionalSection
        toggle={{
          label: 'Associated Publication Available?',
          enabled: isEnabled ?? null,
          setEnabled: setEnabled,
          fieldName: 'enable-publications',
          required: isPublic,
          helpText: 'Whether the data underlying this dataset have been'
            + ' described in a published manuscript, journal article, or'
            + ' preprint.',
        }}
        className="field-grid"
      >
        <ol className="span-2 multi-input">
          {safePubs.map((pub, index) => {
            let isDuplicate = false;

            if (util.isNonBlank(pub.identifier)) {
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
                setPublication={setPublication}
                isRequired={calcRequired(pub, index)}
                isSingular={safePubs.length === 1}
                isDisabled={!isEnabled}
                jsonPath={jsonPath.append(index)}
                isDuplicate={isDuplicate}
              />
            );
          })}
        </ol>

        <AddRowButton
          disabled={!isEnabled}
          onClick={() => setPublication({}, Infinity)}
          className="column-2 publication-appender"
        >
          + Additional publication
        </AddRowButton>
      </OptionalSection>
    </InputBlock>
  );
}
