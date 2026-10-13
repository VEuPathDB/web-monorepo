import { isEmpty, uniq } from 'lodash';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Tooltip } from '@veupathdb/coreui';
import { CommonModal } from '@veupathdb/wdk-client/lib/Components';
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
import { TypeAheadInput } from './TypeAheadInput';
import { siteSearchServiceUrl } from '../../config';
import { useRecentSearches } from './SiteSearchHooks';

import './SiteSearch.scss';

const cx = makeClassNameHelper('SiteSearch');

const preventEventWith = (callback: () => void) => (event: React.FormEvent) => {
  event.preventDefault();
  callback();
};

const MAX_SEARCH_WORDS = 6;

const countWords = (value: string) =>
  value
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;

const hasTooManyWords = (value: string) => countWords(value) > MAX_SEARCH_WORDS;

export interface Props {
  placeholderText?: string;
}

export const SiteSearchInput = wrappable(function ({ placeholderText }: Props) {
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

  const [recentSearches, setRecentSearches] = useRecentSearches();
  const [showTooManyWordsModal, setShowTooManyWordsModal] = useState(false);

  const onSearch = useCallback(
    (queryString: string) => {
      history.push(`${SITE_SEARCH_ROUTE}?${queryString}`);
    },
    [history]
  );

  const saveSearchString = useCallback(() => {
    if (inputRef.current?.value) {
      setRecentSearches(
        uniq([inputRef.current.value].concat(recentSearches)).slice(0, 10)
      );
    }
  }, [setRecentSearches, recentSearches]);

  const handleSubmitWithFilters = useCallback(() => {
    const { current } = formRef;
    if (current == null) return;
    if (hasTooManyWords(inputRef.current?.value || '')) {
      setShowTooManyWordsModal(true);
      return;
    }
    const formData = new FormData(current);
    const queryString = new URLSearchParams(formData as any).toString();
    onSearch(queryString);
    saveSearchString();
  }, [onSearch, saveSearchString]);

  const handleSubmitWithoutFilters = useCallback(() => {
    const value = inputRef.current?.value || '';
    if (hasTooManyWords(value)) {
      setShowTooManyWordsModal(true);
      return;
    }
    const queryString = `q=${encodeURIComponent(value)}`;
    onSearch(queryString);
    saveSearchString();
  }, [onSearch, saveSearchString]);

  const handleSubmitWithRecentSearch = useCallback(
    (searchString: string) => {
      if (hasTooManyWords(searchString)) {
        setShowTooManyWordsModal(true);
        return;
      }
      const queryString = `q=${encodeURIComponent(searchString)}`;
      onSearch(queryString);
    },
    [onSearch]
  );

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
  }, [setRecentSearches]);

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
        <Tooltip title="Run a new search, without your existing filters">
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
        siteSearchURL={siteSearchServiceUrl}
        inputReference={inputRef}
        searchString={searchString}
        placeHolderText={placeholderText}
        recentSearches={recentSearches}
        onRecentSearchSelect={handleSubmitWithRecentSearch}
        onClearRecentSearches={clearRecentSearches}
      />
      {location.pathname !== SITE_SEARCH_ROUTE && lastSearchQueryString && (
        <Tooltip title="Go back to your last search result">
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
        title={
          hasFilters
            ? 'Update your search, keeping existing filters'
            : 'Run a new search'
        }
      >
        <button type="submit">
          <i className="fa fa-search" />
        </button>
      </Tooltip>
      {showTooManyWordsModal && (
        <CommonModal
          title={
            <>
              <i
                style={{
                  margin: 'auto 0',
                  marginRight: '0.25em',
                  color: '#CB0',
                }}
                className="fa fa-warning"
              />
              <span>Too Many Words</span>
            </>
          }
          onClose={() => setShowTooManyWordsModal(false)}
        >
          <div
            style={{
              fontSize: '1.1em',
              minWidth: '425px',
            }}
          >
            <p style={{ margin: 0 }}>
              Too many words. Please reduce your search to six words or less.
              <br />
              <br />
              (If you entered a list of IDs, find an appropriate search in the
              Searches menu instead of using the Site Search bar.)
            </p>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: '1em',
              }}
            >
              <button
                className="btn"
                type="button"
                onClick={() => setShowTooManyWordsModal(false)}
              >
                Ok
              </button>
            </div>
          </div>
        </CommonModal>
      )}
    </form>
  );
});
