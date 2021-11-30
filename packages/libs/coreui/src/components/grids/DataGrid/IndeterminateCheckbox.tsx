import React, {
  ChangeEvent,
  forwardRef,
  useEffect,
  useMemo,
  useRef,
} from 'react';

// Definitions
import { blue, gray } from '../../../definitions/colors';
import { CheckIcon } from '../../icons';
import { UITheme } from '../../theming/types';

// Hooks
import useUITheme from '../../theming/useUITheme';

type IndeterminateCheckboxProps = {
  /** If true, indicates that the value of the checkbox is not reducible to true/false. */
  indeterminate?: boolean;
  checked?: boolean;
  /**
   * Optional. Used to indicate which color properties to calculate based on
   * a UI theme. Not indicating a value here will mean that button should not
   * pick up styling options from the theme. */
  themeRole?: keyof UITheme['palette'];
  /** Supplied by React-Table library. */
  onChange?: (event: ChangeEvent) => void;
};

const IndeterminateCheckbox = forwardRef<
  HTMLInputElement,
  IndeterminateCheckboxProps
>((props: IndeterminateCheckboxProps, ref) => {
  const { indeterminate, checked, themeRole, onChange, ...rest } = props;
  const defaultRef = useRef<HTMLInputElement>(null);
  const resolvedRef = ref || defaultRef;

  const theme = useUITheme();
  const themeColor = useMemo(
    () =>
      theme && themeRole
        ? theme.palette[themeRole].hue[theme.palette[themeRole].level]
        : undefined,
    [theme, themeRole]
  );

  useEffect(() => {
    // @ts-ignore
    resolvedRef.current.indeterminate = indeterminate;
  }, [resolvedRef, indeterminate]);

  useEffect(() => {
    console.log('Theme Color', themeColor);
  }, [themeColor]);

  if (indeterminate) {
    return (
      <div
        ref={resolvedRef}
        // @ts-ignore
        onClick={(event) => onChange && onChange(event)}
        css={{
          width: 12,
          height: 12,
          backgroundColor: themeColor ?? blue[500],
          borderColor: themeColor ?? blue[500],
          borderWidth: 2,
          borderStyle: 'solid',
          borderRadius: 2,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div css={{ height: 2, width: 8, backgroundColor: 'white' }} />
      </div>

      // <input type='checkbox' ref={resolvedRef} checked={checked} {...rest} />
    );
  } else if (checked) {
    return (
      <div
        ref={resolvedRef}
        // @ts-ignore
        onClick={(event) => onChange && onChange(event)}
        css={{
          width: 12,
          height: 12,
          backgroundColor: themeColor ?? blue[500],
          borderColor: themeColor ?? blue[500],
          borderWidth: 2,
          borderStyle: 'solid',
          borderRadius: 2,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <CheckIcon fill='white' fontSize={20} />
      </div>
    );
  } else {
    return (
      <div
        ref={resolvedRef}
        css={{
          width: 12,
          height: 12,
          borderColor: gray[300],
          backgroundColor: 'white',
          borderWidth: 2,
          borderStyle: 'solid',
          borderRadius: 2,
        }}
        // @ts-ignore
        onClick={(event) => onChange && onChange(event)}
      />
    );
  }
});

export default IndeterminateCheckbox;
