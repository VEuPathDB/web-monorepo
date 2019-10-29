export const combineClassNames = (...classNames: (string | undefined )[]) =>
  classNames.filter(className => className).join(' ');
