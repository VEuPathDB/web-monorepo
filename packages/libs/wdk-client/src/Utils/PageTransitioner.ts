import { History } from 'history';

export type TransitionOptions = {
  replace?: boolean; // defaults to false
};
export type TransitionFunction = (
  url: string,
  options?: TransitionOptions
) => void;

export interface PageTransitioner {
  transitionToExternalPage: TransitionFunction;
  transitionToInternalPage: TransitionFunction;
}

/**
 * Creates a page transitioner service that provides convenience methods for
 * navigating seamlessly to an internal page, or to an external page.
 *
 * This provides a centralized location to perform page transition logic
 * from action creators.
 *
 * @param {History} history
 */
export function getTransitioner(history: History) {
  let transitionToInternalPage: TransitionFunction = (path, options = {}) => {
    if (options.replace) history.replace(path);
    else history.push(path);
  };
  let transitionToExternalPage: TransitionFunction = (path, options = {}) => {
    if (options.replace) window.location.replace(path);
    else window.location.assign(path);
  };
  return { transitionToInternalPage, transitionToExternalPage };
}
