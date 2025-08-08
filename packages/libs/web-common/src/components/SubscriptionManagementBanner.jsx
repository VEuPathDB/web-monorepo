import React from 'react';
import { Link } from 'react-router-dom';
import FilledButton from '@veupathdb/coreui/dist/components/buttons/FilledButton';

export function SubscriptionManagementBanner() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px',
        backgroundColor: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderRadius: '4px',
      }}
    >
      <div
        style={{
          textAlign: 'left',
          display: 'flex',
          flexDirection: 'column',
          rowGap: '8px',
        }}
      >
        <div>Urgent call: First sentence goes here.</div>
        <div>
          Second sentence goes here. It will be longer and will have a{' '}
          <Link to="/static-content/subscriptions.html">
            regular link to the subscription invoicing form
          </Link>
          .
        </div>
      </div>
      <Link to="/user/profile/#subscription">
        <FilledButton text="Manage Subscription" />
      </Link>
    </div>
  );
}
