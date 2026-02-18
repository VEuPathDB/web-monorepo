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
  let token =
    getAuthorizationToken() ||
    'Your authorization token is not currently available.';
  let appPath = document.location.pathname.substring(
    0,
    document.location.pathname.indexOf('/app') + 4
  );
  let serviceHelpUrl =
    appPath + '/static-content/content/VEuPathDB/webServices.html';
  return (
    <div>
      <h2>VEuPathDB Web Services Access</h2>
      <p style={{ maxWidth: '60%' }}>
        VEuPathDB provides a REST API enabling users to programmatically query
        and analyize data, download results, even create multi-step search
        strategies. These HTTP resources require registration and a valid API
        Key. Your key is provided below. <a href={serviceHelpUrl}>Click here</a>{' '}
        to learn how to use it to access web services.
      </p>
      <h3>Your Personal API Key</h3>
      <a onClick={() => navigator.clipboard.writeText(token)}>
        Copy key to clipboard
      </a>
      <blockquote
        style={{
          backgroundColor: 'lightgrey',
          overflowWrap: 'break-word',
          maxWidth: '40%',
        }}
      >
        {token}
      </blockquote>
    </div>
  );
};

export default wrappable(ServiceAccessPanel);
