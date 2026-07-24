import { ReactElement, ReactNode } from 'react';
import { Consumer } from '../../../Utils';
import { YesNoToggle } from './YesNoToggle';

export interface OptionalSectionToggleProps {
  readonly label: string;
  readonly required: boolean;
  readonly fieldName: string;
  readonly helpText: string | null;

  readonly enabled: boolean | null;
  readonly setEnabled: Consumer<boolean>;
}

export interface OptionalSectionProps {
  readonly toggle: OptionalSectionToggleProps;

  readonly className?: string;
  readonly children: ReactNode;
}

export function OptionalSection({
  toggle,
  children,
  ...props
}: OptionalSectionProps): ReactElement {
  const className = (
    (props.className ?? '') +
    (toggle.enabled !== true ? ' disabled-fields' : '')
  ).trim();

  return (
    <div className={className}>
      <label className={'not-disabled' + (toggle.required ? ' required' : '')}>
        {toggle.label}
      </label>
      <YesNoToggle
        value={toggle.enabled}
        setValue={toggle.setEnabled}
        fieldName={toggle.fieldName}
        className="not-disabled"
        required={toggle.required}
        disableRequiredStyling={true}
        helpText={toggle.helpText}
      />

      {children}
    </div>
  );
}
