import React, { ReactElement, useEffect, useRef, useState } from 'react';
import {
  PartialDatasetPublication as Publication,
  DatasetPublicationType as PublicationType,
} from '../../../../../../Service/Model';
import {
  BiConsumer,
  Consumer,
  JsonPathBuilder,
  ifDefined,
  isNonBlankString,
} from '../../../../../../Utils';
import {
  CitationLookupResult,
  lookupCitation,
  resemblesPublicationId,
} from '../../../../../../Service/Publications';
import { CitationLookupStatus, StatusTuple } from './utils';
import { InputPair } from '../../../InputPair';
import { CitationLine } from './CitationLine';

const DEBOUNCE_DELAY_MILLIS = 666;

export interface PublicationRowProps {
  readonly index: number;

  readonly publication: Publication;
  readonly setPublication: Consumer<Publication>;

  readonly isRequired: boolean;
  readonly isDisabled: boolean;
  readonly isSingular: boolean;
  readonly isDuplicate: boolean;

  readonly jsonPath: JsonPathBuilder;
}

export function PublicationRow(props: PublicationRowProps): ReactElement {
  const lookupStatus = useRef<number>(0);
  const [citationStatus, setCitationStatus] = useState<StatusTuple>([null, null]);

  useEffect(() => setCitationStatus([
    ifDefined(props.publication.citation, (citation) => ({
      status: 'success',
      citation,
    })) ?? null,
    null,
  ]), [props.publication.citation]);

  const updatePublication = (pub: Publication, res: CitationLookupStatus) => {
    props.setPublication(
      (() => {
        switch (res?.status) {
          case 'success':
            return applyCitation(pub, res.citation);
          case 'cancelled':
            return applyCitation(pub, props.publication.citation);
          default:
            return applyCitation(pub, undefined);
        }
      })()
    );
  };

  const runLookup = (pub: Publication) => {
    const timestamp = Date.now();
    lookupStatus.current = timestamp;

    lookupCitation(pub.identifier!, pub.type!)
      .then((res) => {
        // disregard slow response, new search has been run
        if (lookupStatus.current > timestamp) {
          return;
        }

        if (res.status === 'cancelled') {
          setCitationStatus((it) => [it[0], null]);
        } else {
          setCitationStatus([res, null]);
        }

        updatePublication(pub, res);
      })
      .catch((err) => {
        // disregard slow response, new search has been run
        if (lookupStatus.current > timestamp) {
          return;
        }

        const res: CitationLookupResult = {
          status: 'error',
          error: err instanceof Error ? err : new Error(String(err)),
        };

        setCitationStatus([res, null]);
        updatePublication(pub, res);
      });
  };

  const onInput = (id: string, type: PublicationType) => {
    const newPub = {
      ...props.publication,
      identifier: id,
      type: id.length > 0 ? type : undefined,
      citation: undefined,
    };

    props.setPublication(newPub);

    if (!isNonBlankString(id)) {
      setCitationStatus([null, null]);
      debounce(() => {});
    }

    if (!resemblesPublicationId(id, type)) {
      return;
    }

    setCitationStatus((it) => [it[0], { status: 'loading' }]);
    debounce(runLookup, newPub);
  };

  return (
    <>
      <li className="publication-row">
        <div className="flex-row">
          <PublicationInput
            {...props}
            fieldType="pmid"
            isInvalid={props.isDuplicate}
            onInput={onInput}
          />

          <span className="join">OR</span>

          <PublicationInput
            {...props}
            fieldType="doi"
            isInvalid={props.isDuplicate}
            onInput={onInput}
          />

          <InputPair
            label="Primary publication"
            fieldName={props.jsonPath.appendToString<Publication>('isPrimary')}
            type="checkbox"
            disabled={props.isDisabled || props.isSingular}
            checked={props.publication.isPrimary}
            onChange={(v) =>
              props.setPublication({ ...props.publication, isPrimary: v })
            }
          />
        </div>

        <CitationLine status={citationStatus} />
      </li>
    </>
  );
}

interface PublicationInputProps {
  readonly index: number;
  readonly publication: Publication;
  readonly fieldType: PublicationType;
  readonly isRequired: boolean;
  readonly isDisabled: boolean;
  readonly isInvalid: boolean;
  readonly onInput: BiConsumer<string, PublicationType>;
}

function PublicationInput(props: PublicationInputProps): ReactElement {
  const hasType = isNonBlankString(props.publication.type);
  const pubTypeIsFieldType = props.publication.type === props.fieldType;

  return <InputPair
    label={props.fieldType.toUpperCase()}
    fieldName={`pub-${props.index}-${props.fieldType}`}
    required={props.isRequired && (!hasType || pubTypeIsFieldType)}
    value={pubTypeIsFieldType ? props.publication.identifier : undefined}
    onChange={(v) => props.onInput(v, props.fieldType)}
    className={props.isInvalid && pubTypeIsFieldType ? 'invalid' : undefined}
    labelClass={hasType && !pubTypeIsFieldType ? 'disabled' : undefined}
    disabled={
      props.isDisabled
      || (isNonBlankString(props.publication.identifier) && !pubTypeIsFieldType)
    }
  />;
}

function applyCitation(
  publication: Publication,
  citation: string | undefined
): Publication {
  return isNonBlankString(publication.identifier)
    ? { ...publication, citation }
    : { isPrimary: publication.isPrimary };
}

let publicationDebounceTimer = -1;
export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  ...args: Parameters<T>
) {
  if (publicationDebounceTimer > 0)
    window.clearTimeout(publicationDebounceTimer);

  publicationDebounceTimer = window.setTimeout(
    fn,
    DEBOUNCE_DELAY_MILLIS,
    ...args
  );
}
