import React from 'react';
import Banner from '@veupathdb/coreui/lib/components/banners/Banner';
import { Link, useHistory } from 'react-router-dom';

export function SubscriptionManagementBanner({ address }) {
  const history = useHistory();

  const message = (
    <div style={{ fontSize: '1.2em' }}>
      <strong>{address} are not associated with a subscription.</strong> Please
      join your group's subscription, or if you are a PI or group manager{' '}
      <Link to="/static-content/subscriptions.html">create a subscription</Link>
      .
    </div>
  );

  const bannerProps = {
    type: 'warning',
    message: message,
    pinned: false,
    primaryActionButtonProps: {
      text: 'Join a subscribed group',
      onPress: () => {
        history.push('/user/profile#subscription');
      },
    },
  };

  return (
    <Banner
      banner={bannerProps}
      onClose={() => {
        console.log('closed');
      }}
    />
  );
}
