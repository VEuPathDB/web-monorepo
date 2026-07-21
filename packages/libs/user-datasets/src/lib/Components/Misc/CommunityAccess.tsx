import React, { ReactElement } from 'react';

/**
 * Quarantine for the ever-changing preferred styling of the words "Community
 * Access" in the user dataset workspace.
 */
export function CommunityAccess(): ReactElement {
  return (
    <em>
      <strong>Public access</strong>
    </em>
  );
}
