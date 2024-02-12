import React from 'react';
import { Typography } from '@material-ui/core';

import { LIGHT_GREEN } from '../../constants/colors';
import Button from './Button';
import WarningIcon from '@material-ui/icons/Warning';

export type NotificationProps = {
  /** The title of the notificatin. */
  title: string;
  /** Text of the notification. */
  text: string;
  /** Function to invoke when notification is acknowledged. */
  onAcknowledgement: () => void;
  /** Number of times this notification has been received.
   * If not provided, no occurrence count is shown.
   * */
  occurences?: number;
  /** Background color for notification. Any acceptable CSS color definition.
   * Defaults to LIGHT_GREEN. */
  color?: string;
  /** Additional styles to apply to the component's outer div.
   * Can also be used to override existing styles on the div. */
  containerStyles?: React.CSSProperties;
  /** add showWarningIcon to show warning icon */
  showWarningIcon?: boolean;
};

/** A notification widget to alert the user to some event. */
export default function Notification({
  title,
  text,
  onAcknowledgement,
  occurences,
  color = LIGHT_GREEN,
  containerStyles = {},
  showWarningIcon = false,
}: NotificationProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: color,
        borderRadius: 10,
        padding: 10,
        ...containerStyles,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="button" style={{ color: 'white' }}>
          {title}
        </Typography>
        {occurences != null ? (
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: 5,
              height: 20,
              width: 20,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                color: color,
                fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
                fontSize: 11,
              }}
            >
              {occurences}
            </span>
          </div>
        ) : null}
      </div>
      <div
        style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
      >
        {showWarningIcon && (
          <>
            <WarningIcon
              style={{ color: 'yellow', width: '1.25em', height: '1.25em' }}
            />
          </>
        )}
        <span
          style={{
            padding: '0px 10px',
            color: 'white',
            fontSize: 13,
            flexGrow: 2,
            lineHeight: '1.1em',
          }}
        >
          {text}
        </span>
        <Button
          text="OK"
          type="outlined"
          color="#FFFFFF"
          onClick={onAcknowledgement}
        />
      </div>
    </div>
  );
}
