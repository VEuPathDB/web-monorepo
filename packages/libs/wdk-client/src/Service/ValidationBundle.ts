import * as t from '../Utils/Json';

const errorsList = t.arrayOf(t.string);

export const ValidationBundle = t.record({
  level: t.oneOf(
    t.constant('NONE'),
    t.constant('UNSPECIFIED'),
    t.constant('SYNTACTIC'),
    t.constant('SEMANTIC'),
    t.constant('RUNNABLE')
  ),
  isValid: t.boolean,
  errors: t.record({
    general: errorsList,
    byKey: t.objectOf(errorsList),
  }),
});

export type ValidationBundle = t.Unpack<typeof ValidationBundle>;

export function makeErrorMessage(validationBundle: ValidationBundle): string {
  const messages = validationBundle.errors.general;
  for (const [key, errors] of Object.entries(validationBundle.errors.byKey)) {
    for (const error of errors) {
      messages.push(`${key}: ${error}`);
    }
  }
  return messages.join('\n');
}
