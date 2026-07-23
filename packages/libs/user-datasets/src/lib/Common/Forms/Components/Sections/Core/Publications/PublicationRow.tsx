import React, {
  CSSProperties,
  ReactElement,
  ReactNode,
  useRef,
  useState,
} from 'react';
import {
  PartialDatasetPublication as Publication,
  DatasetPublicationType as PublicationType,
} from '../../../../../../Service/Model';
import { JsonPathBuilder } from '../../../../../../Utils';
import {
  CitationLookupResult,
  lookupCitation,
  resemblesPublicationId,
} from '../../../../../../Service/Publications';
import { isNonBlankString } from '../../../../../../Utils/value-tests';
import { asError, runIfDefined } from '../../../../../../Utils/ergonomics';
import { debounce, PublicationSetter } from './utils';
import { InputPair } from '../../../InputPair';

export interface PublicationRowProps {
  readonly index: number;

  readonly publication: Publication;
  readonly setPublication: PublicationSetter;

  readonly isRequired: boolean;
  readonly isDisabled: boolean;
  readonly isSingular: boolean;

  readonly jsonPath: JsonPathBuilder;
}

type CitationLookupStatus =
  | { readonly status: 'loading' }
  | CitationLookupResult
  | null;

/**
 * Status[0] = Last successfully resolved status.
 * Status[1] = Loading status.
 */
type StatusTuple = [CitationLookupStatus, CitationLookupStatus];

export function PublicationRow(props: PublicationRowProps): ReactElement {
  const lookupStatus = useRef<number>(0);
  const [citationStatus, setCitationStatus] = useState<StatusTuple>([
    runIfDefined(props.publication.citation, (citation) => ({
      status: 'success',
      citation,
    })) ?? null,
    null,
  ]);

  const type = props.publication.type ?? null;
  const hasIdentifier = isNonBlankString(props.publication.identifier);

  const updatePublication = (id: string, res: CitationLookupStatus) => {
    props.setPublication((pub) => {
      switch (res?.status) {
        case 'success':
          return applyCitation(pub, id, res.citation);
        case 'cancelled':
          return { ...pub, identifier: id };
        default:
          return applyCitation(pub, id, undefined);
      }
    });
  };

  const runLookup = (id: string, type: PublicationType) => {
    const timestamp = Date.now();
    lookupStatus.current = timestamp;

    lookupCitation(id, type)
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

        updatePublication(id, res);
      })
      .catch((err) => {
        // disregard slow response, new search has been run
        if (lookupStatus.current > timestamp) {
          return;
        }

        const res: CitationLookupResult = {
          status: 'error',
          error: asError(err),
        };

        setCitationStatus([res, null]);
        updatePublication(id, res);
      });
  };

  const onInput = (id: string, type: PublicationType) => {
    props.setPublication((it) => ({
      ...it,
      identifier: id,
      type: id.length > 0 ? type : undefined,
      citation: undefined,
    }));

    if (!isNonBlankString(id)) {
      setCitationStatus([null, null]);
      debounce(() => {});
    }

    if (!resemblesPublicationId(id, type)) {
      return;
    }

    setCitationStatus((it) => [it[0], { status: 'loading' }]);
    debounce(runLookup, id, type);
  };

  return (
    <>
      <li className="publication-row">
        <div className="flex-row">
          <InputPair
            label="PMID"
            fieldName={`pub-${props.index}-pmid`}
            required={props.isRequired && type !== 'doi'}
            value={type !== 'doi' ? props.publication.identifier : undefined}
            onChange={(v) => onInput(v, 'pmid')}
            labelClass={type === 'doi' ? 'disabled' : undefined}
            disabled={props.isDisabled || (hasIdentifier && type === 'doi')}
          />

          <span className="join">OR</span>

          <InputPair
            label="DOI"
            fieldName={`pub-${props.index}-doi`}
            required={props.isRequired && type !== 'pmid'}
            value={type !== 'pmid' ? props.publication.identifier : undefined}
            onChange={(v) => onInput(v, 'doi')}
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
              props.setPublication((it) => ({ ...it, isPrimary: v }))
            }
          />
        </div>

        <CitationLine status={citationStatus} />
      </li>
    </>
  );
}

function applyCitation(
  publication: Publication,
  identifier: string,
  citation: string | undefined
): Publication {
  return isNonBlankString(publication.identifier)
    ? { ...publication, identifier, citation }
    : { ...publication, identifier, citation: undefined };
}

function CitationLine({ status }: { status: StatusTuple }): ReactElement {
  let style: CSSProperties | undefined;

  if (status[0] == null) {
    style = { visibility: 'hidden' };
  }

  return (
    <div className="field-grid publication-hint" style={style}>
      <span>Citation:</span>
      {formatCitationResult(status[1] ?? status[0])}
    </div>
  );
}

function formatCitationResult(result: CitationLookupStatus): ReactNode {
  switch (result?.status) {
    case 'loading':
      return (
        <span>
          <i className="fa fa-spinner fa-pulse"></i> loading...
        </span>
      );
    case 'not-found':
      return <span className="soft-error">publication not found</span>;
    case 'error':
      return <span className="error">publication lookup failed</span>;
    case 'success':
      return <span>{result.citation}</span>;
    default:
      return <span>unset</span>;
  }
}
