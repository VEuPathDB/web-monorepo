import { ReactFragment } from 'react';

interface Props {
  error?: unknown;
  customCases?: Case[];
  outputSize?: number;
}

type Case = (errorString: string) => string | ReactFragment | undefined;

const defaultCases: Case[] = [
  (errorString) =>
    errorString.match(/did not contain any data/i)
      ? 'The visualization cannot be made because the current subset is empty.'
      : undefined,
];

const emptyCaseMessage =
  'The visualization cannot be made because there is no plottable data for selected variable(s) in the current subset.';

export default function PluginError({ error, customCases, outputSize }: Props) {
  // TO DO: errors from back end should arrive with a separate response code property
  // FOR NOW: flatten entire error to a string
  const errorMessage =
    error == null ? '' : error instanceof Error ? error.message : String(error);

  const emptyCase = () => (outputSize === 0 ? emptyCaseMessage : undefined);

  const errorContent =
    (customCases ?? [])
      .concat([emptyCase, ...defaultCases])
      .reduce<string | ReactFragment | undefined>(
        (prev, caseFunction) => prev ?? caseFunction(errorMessage),
        undefined
      ) ?? errorMessage;

  return errorContent ? (
    <div
      style={{
        fontSize: '1.2em',
        padding: '1em',
        background: 'rgb(255, 233, 233) none repeat scroll 0% 0%',
        borderRadius: '.5em',
        margin: '.5em 0',
        color: '#333',
        border: '1px solid #d9cdcd',
        display: 'flex',
      }}
    >
      <i className="fa fa-warning" style={{ marginRight: '1ex' }}></i>{' '}
      {errorContent}
    </div>
  ) : null;
}
