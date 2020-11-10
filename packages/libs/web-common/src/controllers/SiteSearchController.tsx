import { castArray, isArray } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router';
import SiteSearch from 'ebrc-client/components/SiteSearch/SiteSearch';
import { getLeaves } from 'wdk-client/Utils/TreeUtils';
import { useOrganismTree } from 'ebrc-client/hooks/organisms';
import { useQueryParams } from 'ebrc-client/hooks/queryParams';
import { Loading, Error as ErrorPage } from 'wdk-client/Components';
import { usePromise } from 'wdk-client/Hooks/PromiseHook';
import { useWdkService } from 'wdk-client/Hooks/WdkServiceHook';
import { SiteSearchResponse, SiteSearchRequest, siteSearchResponse } from 'ebrc-client/SiteSearch/Types';
import { siteSearchServiceUrl } from 'ebrc-client/config';
import { decode } from 'wdk-client/Utils/Json';
import { useSetDocumentTitle } from 'wdk-client/Utils/ComponentUtils';
import { SEARCH_TERM_PARAM, OFFSET_PARAM, DOCUMENT_TYPE_PARAM, ORGANISM_PARAM, FILTERS_PARAM } from 'ebrc-client/components/SiteSearch/SiteSearchConstants';

export default function SiteSearchController() {
  const [ params, updateParams ] = useQueryParams(
    SEARCH_TERM_PARAM,
    OFFSET_PARAM,
    DOCUMENT_TYPE_PARAM,
    ORGANISM_PARAM,
    FILTERS_PARAM
  );
  const searchString = useMemo(() => isArray(params.q) ? params.q[0] : params.q || '', [ params.q ]);
  const offset = useMemo(() => Number(isArray(params.offset) ? params.offset[0] : params.offset) || 0, [ params.offset]);
  const documentType = useMemo(() => isArray(params.documentType) ? params.documentType[0] : params.documentType, [ params.documentType ]);
  const organisms = useMemo(() => castArray(params.organisms || []), [ params.organisms ]);
  const filters = useMemo(() => castArray(params.filters || []), [ params.filters ]);
  const numRecords = 20;

  // Organism Tree, set selectedOrganims
  const organismTree = useOrganismTree();

  const allOrganisms = useMemo(
    () => organismTree && getLeaves(organismTree, node => node.children).map(node => node.data.term),
    [ organismTree ]
  );

  const { value, loading } = useSiteSearchResponse(
    { searchString, allOrganisms, organisms, documentType, filters },
    { offset, numRecords }
  );

  useSetDocumentTitle(`Search${searchString ? (` - ${searchString}`) : ''}`)

  const setSearchString = useCallback((searchString: string) => {
    updateParams({
      [SEARCH_TERM_PARAM]: searchString,
      [DOCUMENT_TYPE_PARAM]: documentType,
      [ORGANISM_PARAM]: organisms
    });
  }, [ updateParams, documentType, organisms ]);

  const setOffset = useCallback((offset: number) => {
    updateParams({
      [SEARCH_TERM_PARAM]: searchString,
      [DOCUMENT_TYPE_PARAM]: documentType,
      [ORGANISM_PARAM]: organisms,
      [FILTERS_PARAM]: filters,
      [OFFSET_PARAM]: String(offset)
    })
  }, [ updateParams, searchString, documentType, organisms, filters ]);

  const setDocumentType = useCallback((newDocumentType?: string) => {
    const nextDocumentType = newDocumentType === documentType ? undefined : newDocumentType;
    updateParams({
      [SEARCH_TERM_PARAM]: searchString,
      [DOCUMENT_TYPE_PARAM]: nextDocumentType,
      [ORGANISM_PARAM]: organisms
    })
  }, [ updateParams, searchString, organisms ]);

  const setOrganisms = useCallback((organisms: string[]) => {
    updateParams({
      [SEARCH_TERM_PARAM]: searchString,
      [DOCUMENT_TYPE_PARAM]: documentType,
      [ORGANISM_PARAM]: organisms,
      [FILTERS_PARAM]: filters
    });
  }, [ updateParams, searchString, documentType, filters ]);

  const clearFilters = useCallback(() => {
    updateParams({
      [SEARCH_TERM_PARAM]: searchString,
      [DOCUMENT_TYPE_PARAM]: undefined,
      [ORGANISM_PARAM]: undefined,
      [FILTERS_PARAM]: undefined
    });
  }, [ updateParams, searchString ]);

  const setFilters = useCallback((filters: string[]) => {
    const effectiveFilter = value && value.type === 'success' ? value.effectiveFilter : undefined;
    if (
      (documentType == null || documentType == '') &&
      effectiveFilter == null
    ) return;
    updateParams({
      [SEARCH_TERM_PARAM]: searchString,
      [DOCUMENT_TYPE_PARAM]: documentType || effectiveFilter,
      [ORGANISM_PARAM]: organisms,
      [FILTERS_PARAM]: filters
    });
  }, [ updateParams, searchString, documentType, organisms, value ]);

  if (!siteSearchServiceUrl) {
    return (
      <div>
        <h1>Oops... Search is unavailable!</h1>
        <div>
          This site is not configured to use search. Please contact an administrator.
        </div>
      </div>
    )
  }

  if (value == null && searchString === '') {
    return (
      <div>
        <h1>No results</h1>
        <div>Type a search expression in the box above to begin searching...</div>
      </div>
    );
  }

  if (value && value.type === 'error') {
    return (
      <ErrorPage message={value.error.message}/>
    )
  }

  if (value == null || organismTree == null) {
    return <Loading/>;
  }

  return (
    <SiteSearch
      loading={loading}
      searchString={value.searchSettings.searchString}
      documentType={value.effectiveFilter || value.searchSettings.documentType}
      hideDocumentTypeClearButton={value.effectiveFilter != null}
      onDocumentTypeChange={setDocumentType}
      filters={value.searchSettings.filters}
      onFiltersChange={setFilters}
      filterOrganisms={value.searchSettings.organisms}
      onOrganismsChange={setOrganisms}
      onClearFilters={clearFilters}
      response={value.response}
      offset={value.resultSettings.offset}
      numRecords={value.resultSettings.numRecords}
      organismTree={organismTree}
      onSearch={setSearchString}
      onPageOffsetChange={setOffset}
    />
  )
}

type Value =
  | { type: 'error', error: Error }
  | { type: 'success', response: SiteSearchResponse, searchSettings: SearchSettings, resultSettings: ResultSettings, effectiveFilter?: string };

type SearchSettings = {
  searchString: string;
  organisms?: string[];
  allOrganisms?: string[];
  documentType?: string;
  filters?: string[];
}

type ResultSettings = {
  offset: number;
  numRecords: number;
}

function useSiteSearchResponse(searchSettings: SearchSettings, resultSettings: ResultSettings) {
  const { searchString, allOrganisms, organisms, documentType, filters } = searchSettings;
  const { numRecords, offset } = resultSettings

  const [ lastSearchSubmissionTime, setLastSearchSubmissionTime ] = useState(Date.now());

  const history = useHistory();

  useEffect(() => {
    const stopListening = history.listen(() => {
      setLastSearchSubmissionTime(Date.now());
    });

    return stopListening;
  }, []);

  const projectId = useWdkService(async wdkService => {
    const { projectId } = await wdkService.getConfig();
    return projectId;
  }, []);

  return usePromise(async (): Promise<Value|undefined> => {
    if (!siteSearchServiceUrl || searchString === '' || organisms == null || allOrganisms == null || projectId == null) return undefined;

    try {
      const requestBody: SiteSearchRequest = {
        searchText: searchString,
        pagination: {
          offset,
          numRecords
        },
        restrictToProject: (projectId === 'EuPathDB' ? 'VEuPathDB' : projectId),
        restrictMetadataToOrganisms: allOrganisms,
        restrictSearchToOrganisms: organisms.length === 0 ? allOrganisms : organisms,
        documentTypeFilter: documentType == null ? undefined : {
          documentType,
          foundOnlyInFields: filters
        }
      };
      const responseText = await runRequest(requestBody);
      const validatedResonse = decode(siteSearchResponse, responseText);

      // The following logic adds a docType filter if the following conditions are met:
      //   1. `documentType` is not specified
      //   2. Exactly 1 document type has results
      //
      // We will also mark the result as having an effective filter set.

      const docTypesWithCounts = validatedResonse.documentTypes.filter(d => d.count > 0);

      if (documentType != null || docTypesWithCounts.length !== 1) {
        return {
          type: 'success',
          response: validatedResonse,
          searchSettings,
          resultSettings,
        }
      }

      const effectiveFilter = docTypesWithCounts[0].id;

      // Get results with effective filter
      const requestBody2 = {
        ...requestBody,
        documentTypeFilter: {
          documentType: effectiveFilter,
          foundOnlyInFields: []
        }
      };
      const responseText2 = await runRequest(requestBody2);
      const validatedResonse2 = decode(siteSearchResponse, responseText2);
      return {
        type: 'success',
        response: validatedResonse2,
        searchSettings,
        resultSettings,
        effectiveFilter
      }
    }

    catch(error) {
      return { type: 'error', error };
    }

  }, [ searchString, offset, numRecords, organisms, allOrganisms, documentType, filters, projectId, lastSearchSubmissionTime ]);
}

async function runRequest(requestBody: SiteSearchRequest): Promise<string> {
  const response = await fetch(`${siteSearchServiceUrl}`, {
    method: 'POST',
    body: JSON.stringify(requestBody),
    headers: {
      'Content-Type': 'application/json'
    },
    mode: 'cors'
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return await response.text();
}
