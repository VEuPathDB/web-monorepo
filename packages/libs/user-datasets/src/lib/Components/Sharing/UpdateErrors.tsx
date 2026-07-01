import React, { ReactElement, ReactNode } from 'react';
import { CommunityAccess } from '../Misc/CommunityAccess';
import { IconAlt as Icon } from '@veupathdb/wdk-client/lib/Components';
import { CommunityPromotionError } from './CommunityPromotionError';
import { Runnable } from '../../Utils';

interface UpdateErrorsProps {
  readonly errors: CommunityPromotionError;
  readonly targetNounLower: string;
  readonly CloseButton: () => ReactElement;
  readonly context: 'datasetDetails' | 'datasetsList';
  readonly onFixErrors: Runnable;
}

export function UpdateErrors({
  errors,
  targetNounLower,
  CloseButton,
  context,
  onFixErrors,
}: UpdateErrorsProps): ReactElement {
  let content: ReactNode;

  const inList = context === 'datasetsList';

  const updateButton = inList || !errors.validationErrors
    ? null
    : (<button type="button" className="btn edit" onClick={onFixErrors}>
      Add missing information
    </button>)

  if (errors.validationErrors) {
    content = (
      <>
        <p>
          {inList ? 'One or more datasets do' : 'Your dataset does'} not contain
          enough information to be discoverable through <CommunityAccess />
          .
        </p>
        <p>
          Re-upload your {targetNounLower} and complete all sections on the
          upload form marked with a globe icon to enable <CommunityAccess />.
        </p>
        {inList
          ? undefined
          : detailedValidationContent(errors)}
      </>
    );
  } else {
    content = (
      <p>
        An error occurred while sharing your {targetNounLower}. Please try
        again.
      </p>
    );
  }

  return (
    <div className="UserDataset-SharingModal-StatusView">
      <Icon fa="times-circle danger" />
      <h2>Unable to Grant Public Access</h2>
      {content}
      <div>
        {updateButton}
        <CloseButton />
      </div>
    </div>
  );
}

function detailedValidationContent(errors: CommunityPromotionError): ReactElement {
  const rows: ReactElement[] = [];

  let hasDatasetCharacteristicsErrors = false;

  for (const errorSet of errors.validationErrors!) {
    for (const message of errorSet.general)
      rows.push(<tr><td colSpan={2}>{message}</td></tr>);

    for (const field of Object.keys(errorSet.byField).sort()) {
      // multi-word fields
      // what was the phrasing

      // Special case, datasetCharacteristics
      if (field.indexOf('datasetCharacteristics') > -1) {

        if (!hasDatasetCharacteristicsErrors) {
          rows.push(
            <tr>
              <th scope="row">Field Study or Clinical Trial Characteristics:</th>
              <td>all fields required</td>
            </tr>
          );

          hasDatasetCharacteristicsErrors = true;
        }

        continue;
      }

      let header: ReactNode = <th rowSpan={errorSet.byField[field].length}>
        {parseKey(field)}:
      </th>;

      for (const message of errorSet.byField[field]) {
        rows.push(
          <tr>
            {header}
            <td>{message}</td>
          </tr>
        );
      }
    }
  }

  return <details>
    <summary>Validation Details</summary>
    <table id="community-error-list">{rows}</table>
  </details>;
}

function parseKey(key: string): string {
  if (key.startsWith("$."))
    key = key.substring(2);

  const split = key.split(/\.|\[|].?/);
  const output = [];

  for (let i = 0; i < split.length; i++) {
    const maybeIndex = parseInt(split[i]);

    if (isNaN(maybeIndex)) {
      if (i > 0)
        break;

      output.push(capFirst(split[i]));
      continue
    }

    if (i > 0) {
      const prev: number = output.length - 1;
      output[prev] = output[prev].substring(0, output[prev].length - 1);
    }

    output[i] = (maybeIndex + 1).toString();
    break;
  }

  return output.join(' ');
}

// using this instead of other 'capitalize' functions because:
// lodash capitalize lowercases the rest of the word ???
// material-ui capitalize is removed in newer versions of mui
// css text-transform will capitalize every word
function capFirst(key: string): string {
  return key.substring(0, 1).toUpperCase() + key.substring(1);
}
