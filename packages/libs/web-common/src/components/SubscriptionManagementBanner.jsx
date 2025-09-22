import React from 'react';
import Banner from '@veupathdb/coreui/lib/components/banners/Banner';
import { Link, useHistory } from 'react-router-dom';

export function SubscriptionManagementBanner({ address, onClose }) {
  const history = useHistory();

  const message = (
    <div style={{ fontSize: '1.2em' }}>
      <strong>{address} are not associated with a subscription.</strong>
      {'  '}If your group has subscribed, please{' '}
      <Link to="/user/profile#subscription">link to your group</Link>.{'  '}If
      not, please ask your{' '}
      <Link to="/static-content/subscriptions.html">
        PI or group manager to subscribe
      </Link>
      {'  '}.
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

  return <Banner banner={bannerProps} onClose={onClose} />;
}
