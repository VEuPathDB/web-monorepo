import { merge } from 'lodash';
import { useMemo, useEffect, useState } from 'react';
import CheckIcon from '@material-ui/icons/Check';

import useUITheme from '../../theming/useUITheme';
import { blue, gray, green } from '../../../definitions/colors';
import SwissArmyButton from '../SwissArmyButton';
import LoadingIcon from '../../icons/Loading';
import {
  ButtonStyleSpec,
  PartialButtonStyleSpec,
  SwissArmyButtonVariantProps,
} from '../';

export type FormStatus = 'new' | 'modified' | 'pending' | 'success' | 'error';

export interface SaveButtonProps
  extends Omit<SwissArmyButtonVariantProps, 'text' | 'icon' | 'disabled'> {
  /** Current form status that determines button appearance and behavior */
  formStatus: FormStatus;
  /** Optional custom text for each state */
  customText?: {
    save?: string;
    saving?: string;
    saved?: string;
  };
  /** Duration in milliseconds to show the 'saved' state before reverting to normal */
  savedStateDuration?: number;
}

/** Smart save button that changes appearance based on form status */
export default function SaveButton({
  formStatus,
  customText = {},
  savedStateDuration = 3000,
  onPress,
  size = 'medium',
  themeRole,
  styleOverrides = {},
  iconPosition = 'left',
  additionalAriaProperties = {},
  ...otherProps
}: SaveButtonProps) {
  const theme = useUITheme();

  // Internal state to track whether success state should be reverted to disabled
  const [hasSuccessReverted, setHasSuccessReverted] = useState(false);

  // Auto-revert from 'success' state after timeout
  useEffect(() => {
    if (formStatus === 'success' && !hasSuccessReverted) {
      const timeoutId = setTimeout(() => {
        setHasSuccessReverted(true);
      }, savedStateDuration);

      return () => clearTimeout(timeoutId);
    }

    // Reset revert state when form status changes away from success
    if (formStatus !== 'success') {
      setHasSuccessReverted(false);
    }
  }, [formStatus, savedStateDuration, hasSuccessReverted]);

  // Determine button state based on form status and internal revert state
  const { text, icon, disabled } = useMemo(() => {
    // Otherwise use actual form status
    switch (formStatus) {
      case 'new':
        return {
          text: customText.save || 'Save',
          icon: undefined,
        };
      case 'modified':
      case 'error':
        return {
          text: customText.save || 'Save',
          icon: undefined,
          disabled: false,
        };
      case 'pending':
        return {
          text: customText.saving || 'Saving...',
          icon: () => (
            <span
              css={{
                display: 'inline-block',
                animation: 'spin 1s linear infinite',
                transformOrigin: 'center 40%',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(-360deg)' },
                },
                marginRight: '0.5em',
                marginTop: '2px',
              }}
            >
              <LoadingIcon style={{ fontSize: '1em', fill: 'white' }} />
            </span>
          ),
        };
      case 'success':
        return {
          text: customText.saved || 'Saved',
          icon: CheckIcon,
          disabled: false,
        };
      default:
        return {
          text: customText.save || 'Save',
          icon: undefined,
        };
    }
  }, [formStatus, customText]);

  const themeStyle = useMemo<PartialButtonStyleSpec>(
    () =>
      theme && themeRole
        ? {
            default: {
              textColor:
                theme.palette[themeRole].level > 200 ? 'white' : gray[800],
              color:
                theme.palette[themeRole].hue[theme.palette[themeRole].level],
            },
            hover: {
              textColor:
                theme.palette[themeRole].level > 200 ? 'white' : gray[800],
              border: {
                color:
                  theme.palette[themeRole].hue[
                    theme.palette[themeRole].level + 100
                  ],
                width: 2,
                style: 'solid',
              },
              color:
                theme.palette[themeRole].hue[theme.palette[themeRole].level],
            },
            pressed: {
              textColor:
                theme.palette[themeRole].level > 200 ? 'white' : gray[800],
              color:
                theme.palette[themeRole].hue[
                  theme.palette[themeRole].level + 100
                ],
            },
          }
        : {},
    [theme, themeRole]
  );

  const finalStyle = useMemo(() => {
    // Create style specs for different states
    const defaultStyle: ButtonStyleSpec = {
      default: {
        color: blue[500],
        border: {
          radius: 5,
        },
        fontWeight: 600,
        textColor: 'white',
      },
      hover: {
        color: blue[500],
        fontWeight: 600,
        textColor: 'white',
        border: {
          color: blue[600],
          radius: 5,
          width: 2,
          style: 'solid',
        },
      },
      pressed: {
        color: blue[600],
        fontWeight: 600,
        textColor: 'white',
        border: {
          radius: 5,
        },
      },
      disabled: {
        color: gray[500],
        textColor: 'white',
        fontWeight: 600,
      },
    };

    return merge({}, defaultStyle, themeStyle, styleOverrides);
  }, [themeStyle, styleOverrides]);

  return (
    <SwissArmyButton
      styleSpec={finalStyle}
      text={text}
      onPress={onPress}
      disabled={disabled}
      size={size}
      icon={icon}
      iconPosition={iconPosition}
      additionalAriaProperties={additionalAriaProperties}
      {...otherProps}
    />
  );
}
