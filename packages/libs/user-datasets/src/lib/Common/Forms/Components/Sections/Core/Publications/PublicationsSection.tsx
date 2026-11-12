import React from 'react';
import * as util from '../../../../../../Utils';
import { InputBlock } from '../../../InputBlock';
import {
  PartialDatasetPublication as Publication
} from '../../../../../../Service';
import { isEmpty } from 'lodash';
import { AddRowButton } from '../../../AddRowButton';
import { OptionalSection, OptionalSectionToggleProps } from '../../../OptionalSection';
import { PublicationList } from './utils';
import { PublicationRow } from './PublicationRow';

import {
  useDatasetContentFlags,
  useDatasetPublications
} from '../../../../../../StoreModules/UserDatasetUploadStoreModule';
import { useDispatch } from 'react-redux';
import {
  updateDatasetContentFlags,
  updateDatasetPublications,
} from '../../../../../../Actions/UserDatasetUploadActions';

import './PublicationsSection.scss';

export interface PublicationsSectionProps {
  readonly jsonPath: util.JsonPathBuilder;
}

export function PublicationsSection({ jsonPath }: PublicationsSectionProps): React.ReactElement {
  const publications = useDatasetPublications();
  const metadataContentFlags = useDatasetContentFlags();

  const dispatch = useDispatch();

  const havePubs = !isEmpty(publications);

  let isEnabled = metadataContentFlags?.hasPublications;

  const setEnabled = React.useCallback(
    (v: util.Optional<boolean>) => dispatch(updateDatasetContentFlags({
      ...metadataContentFlags,
      hasPublications: v,
    })),
    [metadataContentFlags, dispatch],
  );

  const setPublications = React.useCallback(
    (v: ReadonlyArray<Publication>) => dispatch(updateDatasetPublications(v)),
    [dispatch],
  );

  if (isEnabled === undefined && havePubs) {
    setEnabled(true);
  }

  const safePublications: PublicationList = React.useMemo(
    () => havePubs
      ? publications!
      : [{ isPrimary: true }],
    [publications, havePubs],
  );

  const calcRequired = (pub: Publication, i: number) =>
    (isEnabled ?? false) &&
    (pub.isPrimary || (i === 0 && safePublications.length === 1));

  const seenIdentifiers = new Set<string>();

  const toggleProps = React.useMemo<OptionalSectionToggleProps>(
    () => ({
      label: 'Associated Publication Available?',
      enabled: isEnabled ?? null,
      setEnabled: setEnabled,
      fieldName: 'enable-publications',
      required: false,
      helpText: 'Whether the data underlying this dataset have been'
        + ' described in a published manuscript, journal article, or'
        + ' preprint.',
    }),
    [isEnabled, setEnabled],
  );

  const addPublication = React.useCallback(
    () => setPublications([...safePublications, {}]),
    [setPublications, safePublications],
  );

  return (
    <InputBlock header="Publications">
      <OptionalSection toggle={toggleProps} className="field-grid">
        <ol className="span-2 multi-input">
          {safePublications.map((pub, index) => {
            let isDuplicate = false;

            if (util.isNonBlankString(pub.identifier)) {
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
                publications={safePublications}
                setPublications={setPublications}
                isRequired={calcRequired(pub, index)}
                isSingular={safePublications.length === 1}
                isDisabled={!isEnabled}
                jsonPath={jsonPath.append(index)}
                isDuplicate={isDuplicate}
              />
            );
          })}
        </ol>

        <AddRowButton
          disabled={!isEnabled}
          onClick={addPublication}
          className="column-2 publication-appender"
        >
          + Additional publication
        </AddRowButton>
      </OptionalSection>
    </InputBlock>
  );
}
