import React from 'react';
import { CheckboxList } from 'wdk-client/Components';
import { getValueOrDefault, filterOutProps } from 'wdk-client/ComponentUtils';

const APPLICATION_SPECIFIC_PROPERTIES = "applicationSpecificProperties";

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

const ApiApplicationSpecificProperties = React.createClass({

  render() {
    let properties = this.toNamedMap(Object.keys(this.props.user.applicationSpecificProperties), this.props.user.applicationSpecificProperties);
    let emailPreferenceSelections = properties.filter(property => property.name.startsWith('preference_global_email_')).map(property => property.name);
    return (
      <fieldset>
        <legend>Preferences</legend>
        <p>Send me email alerts about:</p>
        <CheckboxList name="emailAlerts" items={EMAIL_PREFERENCE_DATA} value={emailPreferenceSelections}
                      onChange={this.onEmailPreferenceChange}/>
      </fieldset>
    );
  },

  toNamedMap(keys, object) {
    return keys.map(key => ({name: key, value: object[key]}));
  },

  onEmailPreferenceChange(newPreferences) {
    let properties = getValueOrDefault(this.props.user, APPLICATION_SPECIFIC_PROPERTIES, {});
    Object.keys(properties).forEach(function (key) {
      if (key.startsWith('preference_global_email_')) delete properties[key];
    });
    // Replace with new email preferences
    let newProperties = newPreferences.reduce((currentPreferences, newPreference) => Object.assign(currentPreferences, {[newPreference]: "on"}), properties);
    this.props.onFormStateChange(Object.assign({}, filterOutProps(this.props.user, [APPLICATION_SPECIFIC_PROPERTIES]), {[APPLICATION_SPECIFIC_PROPERTIES]: newProperties}));
  }

});

export default ApiApplicationSpecificProperties;