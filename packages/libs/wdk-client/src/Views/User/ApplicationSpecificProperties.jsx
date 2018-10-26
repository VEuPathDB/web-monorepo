import PropTypes from 'prop-types';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';

/**
 * This React component is a placeholder for any application specific properties that may have added by the overriding application.
 * @type {*|Function}
 */
function ApplicationSpecificProperties() {
  return null;
}

ApplicationSpecificProperties.propTypes = {

  /** The user object to be modified */
  user:  PropTypes.object.isRequired,

  /** The on change handler for user profile properties inputs */
  onPropertyChange:  PropTypes.func.isRequired,

  /** An array of the user properties configured in WDK model */
  propDefs: PropTypes.array.isRequired,

  /** The on change handler for preference changes */
  onPreferenceChange: PropTypes.func.isRequired
};

export default wrappable(ApplicationSpecificProperties);
