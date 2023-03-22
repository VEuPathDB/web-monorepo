import React from 'react';

import { Link } from '@veupathdb/wdk-client/lib/Components';

import { useTogglePreferredOrganisms } from '../hooks/preferredOrganisms';

import './OrganismPreferencesWarning.scss';

interface Props {
  action: string;
  containerClassName?: string;
  explanation: string;
}

export function OrganismPreferencesWarning({
  action,
  containerClassName,
  explanation,
}: Props) {
  const className =
    'OrganismPreferencesWarning' +
    (containerClassName ? ` ${containerClassName}` : '');
  const togglePreferredOrganisms = useTogglePreferredOrganisms();

  return (
    <div className={className}>
      <div className="Instructions">
        To {action}, please first{' '}
        <button
          type="button"
          className="link"
          onClick={togglePreferredOrganisms}
        >
          disable
        </button>{' '}
        or <Link to="/preferred-organisms">adjust</Link> My Organism
        Preferences.
      </div>
      <div className="Explanation">({explanation})</div>
    </div>
  );
}
