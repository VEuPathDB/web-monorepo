/**
 * Created by steve on 3/28/2016.
 */

import { escapeRegExp, deburr } from 'lodash';

/**
* Filter a provided list of (generic) items.
* Uses a "multi-term" search approach.  The search expression is parsed into query terms
* (space delimited; quoted strings treated as one term).  Items match if their searchable string contains
* all of the terms.
*
* @param {Array<Object>} items           The list of items to filter
* @param {function}   itemToSearchableString A function from item=>String.  Returns the searchable string, given an item
* @param {string}     searchQueryString      The query, in string form, with which to filter records
* @return {Array<Object>} an Array of items that pass the filter
*/
export function filterItems<T>(items: Array<T>, itemToSearchableString: (item: T) => string, searchQueryString: string) {
  if (!searchQueryString || !items) return items;

  let terms = parseSearchQueryString(searchQueryString);
  let predicate = function (item: T) { return areTermsInString(terms, itemToSearchableString(item)) };
  return items.filter(predicate);
}

/**
 * Split search query string on whitespace, unless wrapped in quotes
 * @param {string} searchQueryString A string representing the search query
 * @returns {Array<String>} A set of query terms parsed from searchQueryString
 */
export function parseSearchQueryString(searchQueryString: string) {
  let match = searchQueryString.match(/\S+|"[^"]*"/g);
  if (match == null) return [];
  return match.map(function (queryTerm) {
    // remove wrapping quotes from phrases
    return queryTerm.replace(/(^")|("$)/g, '');
  });
}

/**
 * Return a boolean indicating if all the queryTerms are found in the searchableString
 * @param queryTerms An array of queryTerms to search with
 * @param searchableString The string to search.
 * @returns boolean
 */
export function areTermsInString(queryTerms: Array<string>, searchableString: string) {
  return queryTerms.every(term => isTermInString(term, searchableString));
}

/**
 * Return a boolean indicating if the query term is found in the searchableString
 * @param {string} queryTerm
 * @param {string} searchableString
 * @returns {boolean} true if a match
 */
export function isTermInString(queryTerm: string, searchableString: string = '') {
  if (!queryTerm) return true;

  const re = new RegExp("\\b" + escapeRegExp(deburr(queryTerm)), "i");
  return re.test(deburr(searchableString));
}