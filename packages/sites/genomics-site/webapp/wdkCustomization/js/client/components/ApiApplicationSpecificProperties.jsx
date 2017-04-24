import React from 'react';
import { CheckboxList } from 'wdk-client/Components';
import { getValueOrDefault, filterOutProps } from 'wdk-client/ComponentUtils';

/**
 * Provides hardcode relationships between user email preferences and the display labels in the order the data
 * should be displayed.
 * @type {*[]}
 */
const EMAIL_PREFERENCE_DATA = [{value:'preference_global_email_amoebadb', display:'AmoebaDB'},
  {value:'preference_global_email_cryptodb', display:'CryptoDB'},
  {value:'preference_global_email_apidb', display:'EuPathDB'},
  {value:'preference_global_email_fungidb', display:'FungiDB'},
  {value:'preference_global_email_giardiadb', display:'GiardiaDB'},
  {value:'preference_global_email_microsporidiadb', display:'MicrosporidiaDB'},
  {value:'preference_global_email_piroplasmadb', display:'PiroplasmaDB'},
  {value:'preference_global_email_plasmodb', display:'PlasmoDB'},
  {value:'preference_global_email_schistodb', display:'SchistoDB'},
  {value:'preference_global_email_toxodb', display:'ToxoDB'},
  {value:'preference_global_email_trichdb', display:'TrichDB'},
  {value:'preference_global_email_tritrypdb', display:'TriTrypDB'}];

/**
 * This React component displays in a fieldset, the possible email alert preferences in the form of a checkbox list, overlaid
 * with the user's current selections.
 */
class ApiApplicationSpecificProperties extends React.Component {

  constructor(props) {
    super(props);
    this.onEmailPreferenceChange = this.onEmailPreferenceChange.bind(this);
  }

  render() {
    let applicationSpecificProperties = this.props.user[this.props.name];
    let properties = this.toNamedMap(Object.keys(applicationSpecificProperties), applicationSpecificProperties);
    let emailPreferenceSelections = properties.filter(property => property.name.startsWith('preference_global_email_')).map(property => property.name);
    return (
      <fieldset>
        <legend>Preferences</legend>
        <p>Send me email alerts about:</p>
        <CheckboxList name="emailAlerts" items={EMAIL_PREFERENCE_DATA} value={emailPreferenceSelections}
                      onChange={this.onEmailPreferenceChange}/>
      </fieldset>
    );
  }


  /**
   * Separates key = value pairs into object with name and value attributes.
   * @param keys
   * @param object
   * @returns {*}
   */
  toNamedMap(keys, object) {
    return keys.map(key => ({name: key, value: object[key]}));
  }


  /**
   * This is a callback function issued by the checkbox list when a checkbox is altered.  The selected items are munged into
   * a key = value format expected for the user object and the existing application specific properties are replaced with
   * these and delivered to the store.
   * @param newPreferences -  an array of selected items.
   */
  onEmailPreferenceChange(newPreferences) {
    let properties = getValueOrDefault(this.props.user, this.props.name, {});
    Object.keys(properties).forEach(function (key) {
      if (key.startsWith('preference_global_email_')) delete properties[key];
    });
    // Replace with new email preferences
    let newProperties = newPreferences.reduce(
      (currentPreferences, newPreference) => Object.assign(currentPreferences, {[newPreference]: "on"}), properties
    );
    this.props.onFormStateChange(
      Object.assign({}, filterOutProps(this.props.user, [this.props.name]), {[this.props.name]: newProperties})
    );
  }
}

export default ApiApplicationSpecificProperties;
