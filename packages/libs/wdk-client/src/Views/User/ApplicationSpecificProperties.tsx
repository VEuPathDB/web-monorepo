import React, { FC } from 'react';
import { wrappable } from '../../Utils/ComponentUtils';
import { User, UserPreferences } from '../../Utils/WdkUser';
import { ServiceConfig } from '../../Service/ServiceBase';

/**
 * Type for user profile property definitions, extending the service configuration
 * with optional custom properties
 */
type UserProfileProperty = ServiceConfig['userProfileProperties'][number] & {
  suggestText?: string;
  isMultiLine?: boolean;
};

/**
 * Props for the ApplicationSpecificProperties component
 */
interface ApplicationSpecificPropertiesProps {
  /** The user object to be modified */
  user: User;

  /** The on change handler for user profile properties inputs */
  onPropertyChange: (
    field: string,
    submitAfterChange?: boolean
  ) => (value: any) => void;

  /** An array of the user properties configured in WDK model */
  propDefs: UserProfileProperty[];

  /** The on change handler for preference changes */
  onPreferenceChange: (prefs: UserPreferences) => void;
}

/**
 * This React component is a placeholder for any application specific properties that may have added by the overriding application.
 */
const ApplicationSpecificProperties: FC<ApplicationSpecificPropertiesProps> = () => {
  return null;
};

export default wrappable(ApplicationSpecificProperties);
