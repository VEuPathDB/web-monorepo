import React from 'react';

import './StrategyNotifications.css';

interface Props {
  notifications: Record<string, string|undefined>;
}

export default function({ notifications }: Props) {
  return (
    <div className="Strategy-Notifications">
      {Object.entries(notifications)
      .filter(([ , message]) => message != null)
      .map(([id, message]) =>
      <div className="Strategy-Notifications__entry" key={id}>
        <i className="fa fa-info-circle"/> {message}
      </div>
      )}
    </div>
  );
}
