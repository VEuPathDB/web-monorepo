import { isEmpty } from 'lodash';
import React, { useCallback, useEffect, useRef } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Tooltip } from '@veupathdb/wdk-client/lib/Components';
import { useSessionBackedState } from '@veupathdb/wdk-client/lib/Hooks/SessionBackedState';
import {
  makeClassNameHelper,
  wrappable,
} from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import {
  SITE_SEARCH_ROUTE,
  SEARCH_TERM_PARAM,
  DOCUMENT_TYPE_PARAM,
  ORGANISM_PARAM,
  FILTERS_PARAM,
} from './SiteSearchConstants';

import './SiteSearch.scss';
import { TypeAheadInput } from './TypeAheadInput';

const cx = makeClassNameHelper('SiteSearch');

const preventEventWith = (callback: () => void) => (event: React.FormEvent) => {
  event.preventDefault();
  callback();
};

export interface Props {
  placeholderText?: string;
  siteSearchURL: string;
}

export const SiteSearchInput = wrappable(function ({
  placeholderText,
  siteSearchURL,
}: Props) {
  const location = useLocation();
  const history = useHistory();
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const searchParams = new URLSearchParams(location.search);
  const searchString =
    (location.pathname === SITE_SEARCH_ROUTE &&
      searchParams.get(SEARCH_TERM_PARAM)) ||
    '';
  const docType =
    (location.pathname === SITE_SEARCH_ROUTE &&
      searchParams.get(DOCUMENT_TYPE_PARAM)) ||
    '';
  const organisms =
    (location.pathname === SITE_SEARCH_ROUTE &&
      searchParams.getAll(ORGANISM_PARAM)) ||
    [];
  const fields =
    (location.pathname === SITE_SEARCH_ROUTE &&
      searchParams.getAll(FILTERS_PARAM)) ||
    [];
  const hasFilters =
    !isEmpty(docType) || !isEmpty(organisms) || !isEmpty(fields);

  const onSearch = useCallback(
    (queryString: string) => {
      history.push(`${SITE_SEARCH_ROUTE}?${queryString}`);
    },
    [history]
  );

  const handleSubmitWithFilters = useCallback(() => {
    const { current } = formRef;
    if (current == null) return;
    const formData = new FormData(current);
    const queryString = new URLSearchParams(formData as any).toString();
    onSearch(queryString);
  }, [onSearch]);

  const handleSubmitWithoutFilters = useCallback(() => {
    const queryString = `q=${encodeURIComponent(
      inputRef.current?.value || ''
    )}`;
    onSearch(queryString);
  }, [onSearch]);

  const [lastSearchQueryString, setLastSearchQueryString] =
    useSessionBackedState<string>(
      '',
      'ebrc/site-search/last-query-string',
      (value: string) => value,
      (value: string) => value
    );

  useEffect(() => {
    if (location.pathname === SITE_SEARCH_ROUTE) {
      setLastSearchQueryString(location.search.slice(1));
    }
  }, [location]);

  return (
    <form
      ref={formRef}
      action={SITE_SEARCH_ROUTE}
      className={cx('--SearchBox', hasFilters && 'with-filters')}
      onSubmit={preventEventWith(handleSubmitWithFilters)}
      autoComplete="off"
    >
      {hasFilters ? (
        <Tooltip content="Run a new search, without your existing filters">
          <button
            className="reset"
            type="button"
            onClick={handleSubmitWithoutFilters}
          >
            Clear filters
          </button>
        </Tooltip>
      ) : null}
      {docType && (
        <input type="hidden" name={DOCUMENT_TYPE_PARAM} value={docType} />
      )}
      {organisms.map((organism) => (
        <input
          key={organism}
          type="hidden"
          name={ORGANISM_PARAM}
          value={organism}
        />
      ))}
      {fields.map((field) => (
        <input key={field} type="hidden" name={FILTERS_PARAM} value={field} />
      ))}
      <TypeAheadInput
        siteSearchURL={siteSearchURL}
        inputReference={inputRef}
        searchString={searchString}
        placeHolderText={placeholderText}
      />
      {location.pathname !== SITE_SEARCH_ROUTE && lastSearchQueryString && (
        <Tooltip content="Go back to your last search result">
          <button
            className="back"
            type="button"
            onClick={() => onSearch(lastSearchQueryString)}
          >
            <i className="fa fa-long-arrow-left" />
          </button>
        </Tooltip>
      )}
      <Tooltip
        content={
          hasFilters
            ? 'Update your search, keeping existing filters'
            : 'Run a new search'
        }
      >
        <button type="submit">
          <i className="fa fa-search" />
        </button>
      </Tooltip>
    </form>
  );
});
