// FIXME Replace w/ stable random color assignment
export function getBodyClassByType (type = '') {
  return /participant/i.test(type) ? 'red-fade-bg'
       : /household/i.test(type)   ? 'yellow-fade-bg'
       : /observation/i.test(type) ? 'blue-fade-bg'
       : /vector/i.test(type)      ? 'green-fade-bg'
       : /* default */               'grey-fade-bg';
}
