import { ReactFragment } from 'react';

interface Props {
  error?: unknown;
  customCases?: Case[];
}

type Case = {
  pattern: RegExp;
  message: string | ReactFragment;
};

const defaultCases: Case[] = [
  {
    pattern: /did not contain any data/i,
    message: 'The visualisation cannot be made because your subset is empty.',
  },
];

export default function PluginError({ error, customCases }: Props) {
  if (error == null) {
    return null;
  } else {
    // TO DO: errors from back end should arrive with a separate response code property
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log(errorMessage);

    const errorContent =
      (customCases ?? [])
        .concat(defaultCases)
        .reduce<string | ReactFragment | undefined>(
          (prev, curr) =>
            prev ??
            (errorMessage.match(curr.pattern) ? curr.message : undefined),
          undefined
        ) ?? errorMessage;

    return (
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
    );
  }
}
