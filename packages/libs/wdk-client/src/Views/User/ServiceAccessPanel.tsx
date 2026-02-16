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

const ServiceAccessPanel: React.FC<void> = () => {
  let token =
    getAuthorizationToken() ||
    'Your authorization token is not currently available.';
  return (
    <div>
      <h3>Your Personal API Key</h3>
      <blockquote style={{ overflowWrap: 'break-word', maxWidth: '40%' }}>
        {token}
      </blockquote>
    </div>
  );
};

export default wrappable(ServiceAccessPanel);
