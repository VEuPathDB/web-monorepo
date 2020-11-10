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
 * @param {string} baseClassName The root string to prepend to all variants.
 * @param {string} element Suffix to append to baseClassName.
 * @param {string[]} ...modifiers Variants to append to classNames
 */
export const classNameHelper = baseClassName => (element = '', ...modifiers) => {
  const className = baseClassName + element;
  const modifiedClassNames = modifiers.filter(modifier => modifier).map(function(modifier) {
    return ' ' + className + '__' + modifier;
  }).join('');

  return className + modifiedClassNames;
}

export const makeQuestionWizardClassName = classNameHelper('ebrc-QuestionWizard');
