import { castArray, isArray } from 'lodash';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useHistory } from 'react-router';
import SiteSearch from '../components/SiteSearch/SiteSearch';
import {
  getLeaves,
  pruneDescendantNodes,
} from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import { useOrganismTree } from '../hooks/organisms';
import { useQueryParams } from '../hooks/queryParams';
import {
  Loading,
  Error as ErrorPage,
} from '@veupathdb/wdk-client/lib/Components';
import { usePromise } from '@veupathdb/wdk-client/lib/Hooks/PromiseHook';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import {
  SiteSearchResponse,
  SiteSearchRequest,
  siteSearchResponse,
} from '../SiteSearch/Types';
import { siteSearchServiceUrl } from '../config';
import { decode } from '@veupathdb/wdk-client/lib/Utils/Json';
import { useSetDocumentTitle } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { TreeBoxVocabNode } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import {
  SEARCH_TERM_PARAM,
  OFFSET_PARAM,
  DOCUMENT_TYPE_PARAM,
  ORGANISM_PARAM,
  FILTERS_PARAM,
} from '../components/SiteSearch/SiteSearchConstants';

interface Props {
  offerOrganismFilter?: boolean;
  preferredOrganisms?: string[];
  preferredOrganismsEnabled?: boolean;
  referenceStrains?: Set<string>;
  hasUserSetPreferredOrganisms?: boolean;
}

const smartQuoteRegex = /\u{201c}|\u{201d}/gu;

// This is a wrapper for the real SiteSearchController component.
// It will check the search input for smart quotes and replace them
// with ascii quotes.
// XXX Are there legitimate use cases for smart quotes?
export default function SiteSearchControllerWrapper(props: Props) {
  const [params, updateParams] = useQueryParams(SEARCH_TERM_PARAM);
  const searchString = Array.isArray(params.q) ? params.q[0] : params.q || '';
  const shouldRedirect = smartQuoteRegex.test(searchString);
  useEffect(() => {
    if (shouldRedirect) {
      updateParams({
        [SEARCH_TERM_PARAM]: searchString.replace(smartQuoteRegex, '"'),
      });
    }
  }, [updateParams, shouldRedirect]);

  return shouldRedirect ? null : <SiteSearchController {...props} />;
}

function SiteSearchController({
  offerOrganismFilter = true,
  preferredOrganisms,
  preferredOrganismsEnabled,
  referenceStrains,
  hasUserSetPreferredOrganisms,
}: Props) {
  const [params, updateParams] = useQueryParams(
    SEARCH_TERM_PARAM,
    OFFSET_PARAM,
    DOCUMENT_TYPE_PARAM,
    ORGANISM_PARAM,
    FILTERS_PARAM
  );
  const searchString = useMemo(
    () => (isArray(params.q) ? params.q[0] : params.q || ''),
    [params.q]
  );
  const offset = useMemo(
    () =>
      Number(isArray(params.offset) ? params.offset[0] : params.offset) || 0,
    [params.offset]
  );
  const documentType = useMemo(
    () =>
      isArray(params.documentType)
        ? params.documentType[0]
        : params.documentType,
    [params.documentType]
  );
  const organisms = useMemo(
    () => castArray(params.organisms || []),
    [params.organisms]
  );
  const filters = useMemo(
    () => castArray(params.filters || []),
    [params.filters]
  );
  const numRecords = 20;

  // Organism Tree, set selectedOrganims
  const fullOrganismTree = useOrganismTree(offerOrganismFilter);

  const organismTree = useMemo(() => {
    if (
      fullOrganismTree == null ||
      preferredOrganisms == null ||
      preferredOrganismsEnabled !== true
    ) {
      return fullOrganismTree;
    }

    const preferredOrganismsSet = new Set(preferredOrganisms);
    const selectedOrganismsSet = new Set(organisms);

    return pruneDescendantNodes(
      (node) =>
        node.children.length > 0 ||
        preferredOrganismsSet.has(node.data.term) ||
        selectedOrganismsSet.has(node.data.term),
      fullOrganismTree
    );
  }, [
    fullOrganismTree,
    preferredOrganisms,
    preferredOrganismsEnabled,
    organisms,
  ]);

  const allOrganisms = useMemo(
    () =>
      organismTree &&
      getLeaves(organismTree, (node) => node.children).map(
        (node) => node.data.term
      ),
    [organismTree]
  );

  const { value, loading } = useSiteSearchResponse(
    {
      searchString,
      offerOrganismFilter,
      allOrganisms,
      organisms,
      documentType,
      filters,
    },
    { offset, numRecords }
  );

  useSetDocumentTitle(`Search${searchString ? ` - ${searchString}` : ''}`);

  const setSearchString = useCallback(
    (searchString: string) => {
      updateParams({
        [SEARCH_TERM_PARAM]: searchString,
        [DOCUMENT_TYPE_PARAM]: documentType,
        [ORGANISM_PARAM]: organisms,
      });
    },
    [updateParams, documentType, organisms]
  );

  const setOffset = useCallback(
    (offset: number) => {
      updateParams({
        [SEARCH_TERM_PARAM]: searchString,
        [DOCUMENT_TYPE_PARAM]: documentType,
        [ORGANISM_PARAM]: organisms,
        [FILTERS_PARAM]: filters,
        [OFFSET_PARAM]: String(offset),
      });
    },
    [updateParams, searchString, documentType, organisms, filters]
  );

  const setDocumentType = useCallback(
    (newDocumentType?: string) => {
      const nextDocumentType =
        newDocumentType === documentType ? undefined : newDocumentType;
      updateParams({
        [SEARCH_TERM_PARAM]: searchString,
        [DOCUMENT_TYPE_PARAM]: nextDocumentType,
        [ORGANISM_PARAM]: organisms,
      });
    },
    [updateParams, searchString, organisms, documentType]
  );

  const setOrganisms = useCallback(
    (organisms: string[]) => {
      updateParams({
        [SEARCH_TERM_PARAM]: searchString,
        [DOCUMENT_TYPE_PARAM]: documentType,
        [ORGANISM_PARAM]: organisms,
        [FILTERS_PARAM]: filters,
      });
    },
    [updateParams, searchString, documentType, filters]
  );

  const clearFilters = useCallback(() => {
    updateParams({
      [SEARCH_TERM_PARAM]: searchString,
      [DOCUMENT_TYPE_PARAM]: undefined,
      [ORGANISM_PARAM]: undefined,
      [FILTERS_PARAM]: undefined,
    });
  }, [updateParams, searchString]);

  const setFilters = useCallback(
    (filters: string[]) => {
      const effectiveFilter =
        value && value.type === 'success' ? value.effectiveFilter : undefined;
      if (
        (documentType == null || documentType == '') &&
        effectiveFilter == null
      )
        return;
      updateParams({
        [SEARCH_TERM_PARAM]: searchString,
        [DOCUMENT_TYPE_PARAM]: documentType || effectiveFilter,
        [ORGANISM_PARAM]: organisms,
        [FILTERS_PARAM]: filters,
      });
    },
    [updateParams, searchString, documentType, organisms, value]
  );

  useResetOffsetWhenOrgTreeChanges(organismTree, setOffset);

  if (!siteSearchServiceUrl) {
    return (
      <div>
        <h1>Oops... Search is unavailable!</h1>
        <div>
          This site is not configured to use search. Please contact an
          administrator.
        </div>
      </div>
    );
  }

  if (value == null && searchString === '') {
    return (
      <div>
        <h1>No results</h1>
        <div>
          Type a search expression in the box above to begin searching...
        </div>
      </div>
    );
  }

  if (value && value.type === 'error') {
    return <ErrorPage message={value.error.message} />;
  }

  if (value == null || (offerOrganismFilter && organismTree == null)) {
    return <Loading />;
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
      preferredOrganismsEnabled={preferredOrganismsEnabled}
      hasUserSetPreferredOrganisms={hasUserSetPreferredOrganisms}
      onOrganismsChange={setOrganisms}
      onClearFilters={clearFilters}
      response={value.response}
      offset={value.resultSettings.offset}
      numRecords={value.resultSettings.numRecords}
      organismTree={organismTree}
      offerOrganismFilter={offerOrganismFilter}
      onSearch={setSearchString}
      onPageOffsetChange={setOffset}
      referenceStrains={referenceStrains}
    />
  );
}

type Value =
  | { type: 'error'; error: Error }
  | {
      type: 'success';
      response: SiteSearchResponse;
      searchSettings: SearchSettings;
      resultSettings: ResultSettings;
      effectiveFilter?: string;
    };

type SearchSettings = {
  searchString: string;
  offerOrganismFilter: boolean;
  organisms?: string[];
  allOrganisms?: string[];
  documentType?: string;
  filters?: string[];
};

type ResultSettings = {
  offset: number;
  numRecords: number;
};

function useSiteSearchResponse(
  searchSettings: SearchSettings,
  resultSettings: ResultSettings
) {
  const {
    searchString,
    offerOrganismFilter,
    allOrganisms,
    organisms,
    documentType,
    filters,
  } = searchSettings;
  const { numRecords, offset } = resultSettings;

  const [lastSearchSubmissionTime, setLastSearchSubmissionTime] = useState(
    Date.now()
  );

  const history = useHistory();

  useEffect(() => {
    const stopListening = history.listen(() => {
      setLastSearchSubmissionTime(Date.now());
    });

    return stopListening;
  }, []);

  const projectId = useWdkService(async (wdkService) => {
    const { projectId } = await wdkService.getConfig();
    return projectId;
  }, []);

  return usePromise(async (): Promise<Value | undefined> => {
    if (!siteSearchServiceUrl || searchString === '' || projectId == null)
      return undefined;

    if (offerOrganismFilter && (organisms == null || allOrganisms == null)) {
      return undefined;
    }

    try {
      const requestBody: SiteSearchRequest = {
        searchText: searchString,
        pagination: {
          offset,
          numRecords,
        },
        restrictToProject: projectId === 'EuPathDB' ? 'VEuPathDB' : projectId,
        restrictMetadataToOrganisms: !offerOrganismFilter
          ? undefined
          : allOrganisms,
        restrictSearchToOrganisms: !offerOrganismFilter
          ? undefined
          : organisms?.length === 0
          ? allOrganisms
          : organisms,
        documentTypeFilter:
          documentType == null
            ? undefined
            : {
                documentType,
                foundOnlyInFields: filters,
              },
      };
      const responseText = await runRequest(requestBody);
      const validatedResponse = decode(siteSearchResponse, responseText);

      // The following logic...
      //   1.  adds a docType filter if the following conditions are met:
      //     i. `documentType` is not specified
      //     ii. Exactly 1 document type has results
      //
      //     (We will also mark the result as having an effective filter set.)
      //
      //   2.  resets the offset to 0 if the current offset is greater than or equal to the number of search results

      const docTypesWithCounts = validatedResponse.documentTypes.filter(
        (d) => d.count > 0
      );

      const needToApplyEffectiveFilter =
        documentType == null && docTypesWithCounts.length === 1;

      const needToAdjustOffset =
        resultSettings.offset >= validatedResponse.searchResults.totalCount;

      if (!needToApplyEffectiveFilter && !needToAdjustOffset) {
        return {
          type: 'success',
          response: validatedResponse,
          searchSettings,
          resultSettings,
        };
      }

      const effectiveFilter = !needToApplyEffectiveFilter
        ? undefined
        : docTypesWithCounts[0].id;

      const documentTypeFilter =
        effectiveFilter == null
          ? requestBody.documentTypeFilter
          : {
              documentType: effectiveFilter,
              foundOnlyInFields: [],
            };

      const adjustedResultSettings = !needToAdjustOffset
        ? resultSettings
        : {
            ...resultSettings,
            offset: 0,
          };

      // If an effective filter is to be applied...
      //   Get results with effective filter.
      //   This request will give us counts for fields hit.
      //   Unfiltered requests do not include such counts.
      const requestBody2 = {
        ...requestBody,
        documentTypeFilter,
        pagination: adjustedResultSettings,
      };
      const responseText2 = await runRequest(requestBody2);
      const validatedResponse2 = decode(siteSearchResponse, responseText2);
      return {
        type: 'success',
        response: validatedResponse2,
        searchSettings,
        resultSettings: adjustedResultSettings,
        effectiveFilter,
      };
    } catch (error) {
      return { type: 'error', error };
    }
  }, [
    searchString,
    offset,
    numRecords,
    offerOrganismFilter,
    organisms,
    allOrganisms,
    documentType,
    filters,
    projectId,
    lastSearchSubmissionTime,
  ]);
}

async function runRequest(requestBody: SiteSearchRequest): Promise<string> {
  const response = await fetch(`${siteSearchServiceUrl}`, {
    method: 'POST',
    body: JSON.stringify(requestBody),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    mode: 'cors',
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return await response.text();
}

function useResetOffsetWhenOrgTreeChanges(
  organismTree: TreeBoxVocabNode | undefined,
  setOffset: (newOffset: number) => void
) {
  const previousOrgTree = useRef<TreeBoxVocabNode | undefined>(undefined);

  useEffect(() => {
    // If...
    //   1. The "organismTree" has changed between invocations of this effect
    //     AND
    //   2. Both the previous and current org tree are non-nil (that is, loaded trees)
    //
    // Then...
    //   reset the offset to 0.
    if (
      previousOrgTree.current !== organismTree &&
      previousOrgTree.current != null &&
      organismTree != null
    ) {
      setOffset(0);
    }

    previousOrgTree.current = organismTree;
  }, [organismTree, setOffset]);
}
