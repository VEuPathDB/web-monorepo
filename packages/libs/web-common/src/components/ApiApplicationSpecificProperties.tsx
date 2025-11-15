import React from 'react';
import { CheckboxList } from '@veupathdb/wdk-client/lib/Components';
import { LinksPosition } from '@veupathdb/coreui/lib/components/inputs/checkboxes/CheckboxTree/CheckboxTree';
import { useSelector } from 'react-redux';

interface EmailPreference {
  value: string;
  display: string;
}

interface UserPreferences {
  global: Record<string, string | null>;
  project: Record<string, string | null>;
}

interface User {
  preferences: UserPreferences;
}

interface ApiApplicationSpecificPropertiesProps {
  user: User;
  onPreferenceChange: (preferences: UserPreferences) => void;
  contentClassName?: string;
}

/**
 * Provides hardcode relationships between user email preferences and the display labels in the order the data
 * should be displayed.
 * @type {*[]}
 */
const EMAIL_PREFERENCE_DATA_CLINEPI: EmailPreference[] = [
  { value: 'preference_global_email_clinepidb', display: 'ClinEpiDB' },
  { value: 'preference_global_email_microbiomedb', display: 'MicrobiomeDB' },
  { value: 'preference_global_email_apidb', display: 'VEuPathDB' },
];
const EMAIL_PREFERENCE_DATA_MICROBIOME: EmailPreference[] = [
  { value: 'preference_global_email_microbiomedb', display: 'MicrobiomeDB' },
  { value: 'preference_global_email_clinepidb', display: 'ClinEpiDB' },
  { value: 'preference_global_email_apidb', display: 'VEuPathDB' },
];
const EMAIL_PREFERENCE_DATA_GENOMICS: EmailPreference[] = [
  { value: 'preference_global_email_amoebadb', display: 'AmoebaDB' },
  { value: 'preference_global_email_cryptodb', display: 'CryptoDB' },
  { value: 'preference_global_email_fungidb', display: 'FungiDB' },
  { value: 'preference_global_email_giardiadb', display: 'GiardiaDB' },
  { value: 'preference_global_email_hostdb', display: 'HostDB' },
  {
    value: 'preference_global_email_microsporidiadb',
    display: 'MicrosporidiaDB',
  },
  { value: 'preference_global_email_piroplasmadb', display: 'PiroplasmaDB' },
  { value: 'preference_global_email_plasmodb', display: 'PlasmoDB' },
  { value: 'preference_global_email_toxodb', display: 'ToxoDB' },
  { value: 'preference_global_email_trichdb', display: 'TrichDB' },
  { value: 'preference_global_email_tritrypdb', display: 'TriTrypDB' },
  { value: 'preference_global_email_vectorbase', display: 'VectorBase' },
  { value: 'preference_global_email_apidb', display: 'VEuPathDB' },
];

/**
 * This React component displays in a fieldset, the possible email alert preferences in the form of a checkbox list, overlaid
 * with the user's current selections.
 */
function ApiApplicationSpecificProperties(
  props: ApiApplicationSpecificPropertiesProps
) {
  const projectId = useSelector(
    (state: any) => state.globalData.siteConfig.projectId
  );
  if (projectId == 'AllClinEpiDB') return null;

  /**
   * This is a callback function issued by the checkbox list when a checkbox is
   * altered.  The selected items are munged into a key = value format expected
   * for the user object and the existing application specific properties are
   * replaced with these and delivered to the store.
   * @param newPreferences - an array of selected items
   */
  function onEmailPreferenceChange(newEmailPrefArray: string[]) {
    // make a deep copy of existing prefs
    let newPrefs: UserPreferences = {
      global: Object.assign({}, props.user.preferences.global),
      project: Object.assign({}, props.user.preferences.project),
    };
    // set all existing email prefs to null
    Object.keys(newPrefs.global).forEach(function (key) {
      if (key.startsWith('preference_global_email_'))
        newPrefs.global[key] = null;
    });
    // add back any remaining email prefs in new value
    newEmailPrefArray.forEach(function (key) {
      newPrefs.global[key] = 'on';
    });
    props.onPreferenceChange(newPrefs);
  }

  let emailPrefValue = toNamedArray(props.user.preferences.global)
    .filter(
      (property) =>
        property.name.startsWith('preference_global_email_') &&
        property.value === 'on'
    )
    .map((property) => property.name);

  let emailPrefData =
    projectId == 'ClinEpiDB'
      ? EMAIL_PREFERENCE_DATA_CLINEPI
      : projectId == 'MicrobiomeDB'
      ? EMAIL_PREFERENCE_DATA_MICROBIOME
      : EMAIL_PREFERENCE_DATA_GENOMICS;

  return (
    <>
      <h2>Preferences</h2>
      <h3 style={{ paddingTop: 0 }}>Email notifications</h3>
      <div className={props.contentClassName ?? ''}>
        <p>Send me email alerts about new updates and features:</p>
        <div style={{ width: '400px', margin: '2em 1em' }}>
          <CheckboxList
            name="emailAlerts"
            items={emailPrefData}
            value={emailPrefValue}
            onChange={onEmailPreferenceChange}
            linksPosition={LinksPosition.Top}
          />
        </div>
      </div>
    </>
  );
}

/**
 * Separates key = value pairs into object with name and value attributes
 * @param object
 * @returns {*}
 */
function toNamedArray(object: Record<string, string | null>) {
  return Object.keys(object).map((key) => ({ name: key, value: object[key] }));
}

export default ApiApplicationSpecificProperties;
