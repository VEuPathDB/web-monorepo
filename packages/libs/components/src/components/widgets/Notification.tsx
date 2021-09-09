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
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <span
          style={{
            paddingRight: 20,
            color: 'white',
            fontSize: 13,
            flexGrow: 2,
            lineHeight: '1.1em',
          }}
        >
          {showWarningIcon && (
            <>
              <WarningIcon
                style={{ color: 'yellow', verticalAlign: 'middle' }}
                fontSize="small"
              />
              <span>&nbsp;</span>
            </>
          )}
          {text}
        </span>
        <Button
          text="Ok"
          type="outlined"
          color="#FFFFFF"
          onClick={onAcknowledgement}
          containerStyles={{
            paddingTop: 10,
            alignSelf: 'flex-end',
          }}
        />
      </div>
    </div>
  );
}
