/**
 * Created by dfalke on 8/22/16.
 */
import { keyBy } from 'lodash';
import { emptyAction } from '@veupathdb/wdk-client/lib/Core/WdkMiddleware';
import { QuestionWithParameters } from '@veupathdb/wdk-client/lib/Utils/WdkModel';

export const SITE_CONFIG_LOADED = 'eupathdb/site-config-loaded';
export const BASKETS_LOADED = 'eupathdb/basket';
export const QUICK_SEARCH_LOADED = 'eupathdb/quick-search-loaded';

// Type definitions
export interface QuickSearchSpec {
  name: string;
  searchParam: string;
  isDisabled?: boolean;
}

export interface SiteConfig {
  [key: string]: any;
}

// Action type interfaces
export interface SiteConfigLoadedAction {
  type: typeof SITE_CONFIG_LOADED;
  payload: {
    siteConfig: SiteConfig;
  };
}

export interface BasketsLoadedAction {
  type: typeof BASKETS_LOADED;
  payload: {
    basketCounts: { [recordClassName: string]: number };
  };
}

export interface QuickSearchLoadedAction {
  type: typeof QUICK_SEARCH_LOADED;
  payload: {
    questions: { [urlSegment: string]: QuestionWithParameters };
  };
}

export function loadSiteConfig(siteConfig: SiteConfig): SiteConfigLoadedAction {
  return {
    type: SITE_CONFIG_LOADED,
    payload: { siteConfig },
  };
}

export function loadBasketCounts() {
  return function run({ wdkService }: any) {
    return wdkService.getCurrentUser().then((user: any) => {
      return user.isGuest
        ? emptyAction
        : wdkService.getBasketCounts().then((basketCounts: { [recordClassName: string]: number }) => ({
            type: BASKETS_LOADED,
            payload: { basketCounts },
          }));
    });
  };
}

/**
 * Load data for quick search
 * @param quickSearchSpecs An array of quick search spec objects.
 *    A spec object has two properties: `name`: the full name of the questions,
 *    and `searchParam`: the name of the parameter to use for text box.
 */
export function loadQuickSearches(quickSearchSpecs: QuickSearchSpec[]) {
  return function run({ wdkService }: any) {
    const requests = quickSearchSpecs
      .filter((spec) => !spec.isDisabled)
      .map((spec) =>
        wdkService
          .findQuestion(spec.name)
          .then((q: any) => wdkService.getQuestionAndParameters(q.urlSegment))
      );
    return Promise.all(requests)
      .then(
        (questions) => keyBy(questions, 'urlSegment'),
        (error) => error
      )
      .then((questions) => ({
        type: QUICK_SEARCH_LOADED,
        payload: { questions },
      }));
  };
}
