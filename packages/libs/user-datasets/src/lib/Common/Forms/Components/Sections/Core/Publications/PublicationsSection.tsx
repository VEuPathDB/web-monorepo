import React, { ReactElement } from 'react';
import { InputBlock } from '../../../InputBlock';
import { PartialDatasetDetails, PartialDatasetPublication as Publication } from '../../../../../../Service/Model';
import {
  Consumer,
  isNonBlankString,
  JsonPathBuilder,
} from '../../../../../../Utils';
import * as util from '../../../../../../Utils';
import { isEmpty } from 'lodash';
import { AddRowButton } from '../../../AddRowButton';
import { OptionalSection } from '../../../OptionalSection';
import { fixPrimaries, PublicationList } from './utils';
import { PublicationRow } from './PublicationRow';

import './PublicationsSection.scss';
import { useContentFlags, usePublications } from '../../../../Hooks/dataset-metadata-hooks';
import { useDispatch } from 'react-redux';
import { updateContentFlags, updatePublications } from '../../../../../../Actions/DatasetMetadataFormActions';

export interface PublicationsSectionProps {
  readonly datasetMeta: PartialDatasetDetails,
  readonly setDatasetMeta: Consumer<PartialDatasetDetails>,

  readonly publications: PublicationList;
  readonly setPublications: Consumer<PublicationList>;

  readonly isRequired: boolean;

  readonly jsonPath: JsonPathBuilder;
}

export function PublicationsSection(
  props: PublicationsSectionProps
): ReactElement {
  const dispatch = useDispatch();

  const publications = usePublications();
  const setPublication = React.useCallback(
    (publication: Publication, index: number) =>
      dispatch(updatePublications(fixPrimaries(util.replaceElement(publications, index, publication), index))),
    [dispatch, publications],
  );

  const havePubs = !isEmpty(publications);

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
    setEnabled(true)
  }

  const safePubs: PublicationList = havePubs
    ? props.publications
    : [{ isPrimary: true }];

  const calcRequired = (pub: Publication, i: number) =>
    (isEnabled ?? false) &&
    (pub.isPrimary || (i === 0 && safePubs.length === 1));

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
          helpText: 'Whether the data underlying this dataset have been'
            + ' described in a published manuscript, journal article, or'
            + ' preprint.',
        }}
        className="field-grid"
      >
        <ol className="span-2 multi-input">
          {safePubs.map((pub, index) => {
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
                setPublication={setPublication}
                isRequired={calcRequired(pub, index)}
                isSingular={safePubs.length === 1}
                isDisabled={!isEnabled}
                jsonPath={props.jsonPath.append(index)}
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
