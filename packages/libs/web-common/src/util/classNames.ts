/**
 * Create a classes string generator that follows a BEM convention.
 *
 * @example
 * ```
 * const makeClassName = classNameHelper('Ebrc')
 * makeClassName() //=> 'Ebrc'
 * makeClassName('Hello') //=> 'EbrcHello'
 * makeClassName('Hello', 'green') //=> 'EbrcHello EbrcHello__green'
 * makeClassName('Hello', 'red', 'muted') //=> 'EbrcHello EbrcHello__red EbrcHello__muted'
 * ```
 */
export const classNameHelper =
  (baseClassName: string) =>
  (element: string = '', ...modifiers: string[]): string => {
    const className = baseClassName + element;
    const modifiedClassNames = modifiers
      .filter((modifier) => modifier)
      .map(function (modifier) {
        return ' ' + className + '__' + modifier;
      })
      .join('');

    return className + modifiedClassNames;
  };

export const makeQuestionWizardClassName = classNameHelper(
  'ebrc-QuestionWizard'
);
