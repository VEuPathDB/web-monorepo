import { CSSProperties, useMemo, useState } from 'react';

// Components
import { H6 } from '../typography';
import { CheckCircle, Loading } from '../icons';

// Definitions
import { gray, green } from '../../definitions/colors';
import typography from '../../styleDefinitions/typography';
import { fadeIn, spin } from '../../definitions/animations';
import { UITheme } from '../theming/types';

// Hooks
import useUITheme from '../theming/useUITheme';

export type FormFieldProps = {
  /** Specifies the underlying input type. */
  type: 'text' | 'password';
  /** Optional. A heading for the component. */
  label?: string;
  /** Optional. Additional instructions to be displayed below the heading. */
  instructions?: string;
  /** Optional. Placeholder text to display in the field if there is no value.*/
  placeholder?: string;
  /** The current value of the form field. */
  value: string;
  /** A callback to invoke when the value of the input field changes. */
  onValueChange: (value: string) => void;
  /** The desired width of the component. */
  width?: string | number;
  /** Optional. Indicates the status of data syncing. */
  status?: 'syncing' | 'synced';
  /** Optional. Additional CSS styles to apply to the outermost div. */
  containerStyles?: CSSProperties;
  /** Optional. Indicates which theme role should be used to augment component styling. */
  themeRole?: keyof UITheme['palette'];
  /** Optional. Indicates that the user should not be allow to change the content of the field. */
  disabled?: boolean;
};

/**
 * A form field component with theming support
 * placeholder, and status indicator.
 * */
export default function FormField({
  type,
  label,
  instructions,
  placeholder,
  width,
  value,
  onValueChange,
  status,
  containerStyles = {},
  themeRole,
  disabled = false,
}: FormFieldProps) {
  const [hasFocus, setHasFocus] = useState(false);

  const theme = useUITheme();
  const themeColor = useMemo(
    () =>
      theme && themeRole
        ? theme.palette[themeRole].hue[theme.palette[themeRole].level]
        : undefined,
    [theme, themeRole]
  );

  return (
    <div css={{ width, height: label ? 80 : 63, ...containerStyles }}>
      {label && (
        <H6
          text={label}
          additionalStyles={{
            margin: 0,
            fontSize: 13,
            marginBottom: 3,
            color: hasFocus ? gray[700] : gray[500],
          }}
        />
      )}
      <div
        css={{
          position: 'relative',
          outlineColor: gray[400],
          outlineWidth: hasFocus ? 2 : 1,
          outlineStyle: 'solid',
          color: gray['500'],
          borderRadius: 5,
        }}
      >
        <input
          type={type}
          disabled={disabled}
          css={[
            typography.p,
            {
              boxSizing: 'border-box',
              borderStyle: 'none !important',
              outlineStyle: 'none !important',
              padding: '10px 40px 10px 10px !important',
              width,
              color: gray['400'],
              ':focus': {
                color: gray['500'],
              },
            },
          ]}
          placeholder={placeholder}
          value={value}
          onChange={(event: any) => {
            onValueChange(event.target.value);
          }}
          onFocus={() => setHasFocus(true)}
          onBlur={() => setHasFocus(false)}
        />
        <div css={{ position: 'absolute', top: 7, right: 10 }}>
          {status === 'syncing' && (
            <Loading
              fontSize={20}
              fill={gray[400]}
              css={{
                animation: `${spin} 2s ease infinite, ${fadeIn} 1s linear`,
              }}
            />
          )}
          {status === 'synced' && (
            <CheckCircle
              fontSize={20}
              fill={themeColor ?? green[600]}
              css={{ animation: `${fadeIn} 1s linear` }}
            />
          )}
        </div>
      </div>
      {instructions && hasFocus && (
        <div css={{ marginTop: 2 }}>
          <label css={[typography.label, { color: gray[300] }]}>
            {instructions}
          </label>
        </div>
      )}
    </div>
  );
}
