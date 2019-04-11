import { mapValues, memoize } from 'lodash';
/*
type GetterWithQuestion<T> = (question: Question, settingsProperty: Record<string, string>) => T

// Can either be a function, or a tuple of function and required key name
type SpecEntry<T> = GetterWithQuestion<T> | [ GetterWithQuestion<T>, string ];

type Settings = Record<string, Function>;

type SettingsSpec = Record<string, SpecEntry<any>>;
*/

/**
 * @param {string} settingsPropertyName
 * @param {SettingSpec} spec
 */
export function createSettingsParser(settingsPropertyName, spec) {
  const requiredKeys = Object.values(spec)
    .filter(entry => Array.isArray(entry))
    .map(entry => entry[1]);
  return memoize(function parseSettings(question) {
    if (!(settingsPropertyName in question.properties)) return null;
    try {
      const properties = JSON.parse(question.properties[settingsPropertyName]);
      const missingKeys = requiredKeys.filter(key => !(key in properties));

      if (missingKeys.length > 0) {
        throw new Error("The following keys are missing from the " +
          settingsPropertyName + " object: " + missingKeys.join(', '));
      }

      const settings = Object.entries(spec).reduce((settings, [ key, entry ]) => {
        const getter = Array.isArray(entry) ? entry[0] : entry;
        settings[key] = getter(question, properties, settings);
        return settings;
      }, {});

      return settings;
    }

    catch(error) {
      console.error('Could not use ' + settingsPropertyName + '. Using standard layout', error);
      return null;
    }
  });
}

export function groupGetter(groupNameProperty, isRequired = true) {
  return isRequired ? [ withQuestion, groupNameProperty ] : withQuestion;

  function withQuestion(question, properties) {
    const group = question.groups.find((group) => group.name === properties[groupNameProperty]);
    return function getter() {
      return group;
    }
  }
}

export function parameterGetter(parameterNameProperty, isRequired = true) {
  return isRequired ? [ withQuestion, parameterNameProperty ] : withQuestion;

  function withQuestion(question, properties) {
    const parameter = question.parameters.find(param => param.name === properties[parameterNameProperty]);
    return function getter() {
      return parameter;
    }
  }
}
