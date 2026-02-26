import React from 'react';
import { wrappable } from '../../Utils/ComponentUtils';

const getAuthorizationToken = (): string | undefined => {
  const cookies = Object.fromEntries(
    document.cookie.split('; ').map((entry) => entry.split(/=(.*)/).slice(0, 2))
  );

  if ('Authorization' in cookies) {
    return cookies.Authorization;
  }
};

interface Props {}

const ServiceAccessPanel: React.FC<Props> = () => {
  const token = getAuthorizationToken();
  const appPath = document.location.pathname.substring(
    0,
    document.location.pathname.indexOf('/app') + 4
  );
  const serviceHelpUrl =
    appPath + '/static-content/content/VEuPathDB/webServices.html';
  return (
    <div>
      <h2>VEuPathDB Web Services Access</h2>
      <p style={{ fontSize: '1.2em', maxWidth: '100%' }}>
        VEuPathDB provides a REST API enabling users to programmatically query
        and analyize data, download results, even create multi-step search
        strategies. These HTTP resources require registration and a valid API
        Key. Your personal key is provided below. Please do not share it with
        others.
      </p>
      <p>
        <a style={{ cursor: 'pointer' }} href={serviceHelpUrl}>
          Click here
        </a>{' '}
        to learn more about accessing web services.
      </p>
      <h3>Your Personal API Key</h3>
      {token && (
        <a
          style={{ cursor: 'pointer' }}
          onClick={() => navigator.clipboard.writeText(token)}
        >
          Copy key to clipboard
        </a>
      )}
      <blockquote
        style={{
          padding: '10px',
          backgroundColor: '#E8E8E8',
          overflowWrap: 'break-word',
          maxWidth: '60%',
          fontFamily: 'monospace',
        }}
      >
        {token || 'Your API Key is not currently available.'}
      </blockquote>
    </div>
  );
};

export default wrappable(ServiceAccessPanel);
