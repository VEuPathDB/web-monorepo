import React, { ComponentType } from 'react';

import { PreferredOrganismsToggle } from '@veupathdb/preferred-organisms/lib/components/PreferredOrganismsToggle';
import {
  usePreferredOrganismsEnabledState,
  useTogglePreferredOrganisms
} from '@veupathdb/preferred-organisms/lib/hooks/preferredOrganisms';


export function ReviseStepModal(DefaultComponent: ComponentType<any>): ComponentType<any> {
  return function(props: any) {
    return (
      <DefaultComponent {...props} leftButtons={[<ReviseFormToggle />]} />
    );
  };
}

function ReviseFormToggle() {
  const [ preferredOrganismsEnabled ] = usePreferredOrganismsEnabledState();
  const togglePreferredOrganisms = useTogglePreferredOrganisms();

  return (
    <PreferredOrganismsToggle
      enabled={preferredOrganismsEnabled}
      onClick={togglePreferredOrganisms}
      label={
        <span>My Preferred Organisms {preferredOrganismsEnabled ? 'enabled' : 'disabled'}</span>
      }
    />
  )
}
