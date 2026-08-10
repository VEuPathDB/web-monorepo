import { ReactElement, ReactNode } from 'react';
import { useUITheme } from '@veupathdb/coreui/lib/components/theming';
import { ColorHue, gray } from '@veupathdb/coreui/lib/definitions/colors';
import { Runnable } from '../../../Utils';

export interface SecondaryButtonProps {
  readonly children: ReactNode;
  readonly disabled: boolean;
  readonly onClick: Runnable;
}

export function SecondaryButton(props: SecondaryButtonProps): ReactElement {
  return props.disabled
    ? <DisabledButton {...props} />
    : <ThemedButton {...props} />
}

function ThemedButton(props: SecondaryButtonProps): ReactElement {
  return makeButton(useUITheme()?.palette?.primary?.hue ?? gray, props);
}

function DisabledButton(props: SecondaryButtonProps): ReactElement {
  return makeButton(gray, props);
}

function makeButton(colors: ColorHue, props: SecondaryButtonProps): ReactElement {
  return <button
    type="button"
    style={{
      backgroundColor: colors['300'],
      boxShadow: '4px 5px ' + colors['400'],
      padding: '0.6em 1.2ch',
      height: 'fit-content',
      borderRadius: '9px',
      fontWeight: 'bold',
      color: props.disabled ? gray['100'] : gray['700'],
      borderWidth: 0,
      borderStyle: 'none',
    }}
    {...props}
  >{props.children}</button>
}