import React, { useCallback, useMemo, useState } from 'react';
import QueryString from 'querystring';
import { edaServiceUrl } from '../config';
import { useConfiguredAnalysisClient } from '@veupathdb/eda/lib/core/hooks/client';
import { createComputation } from '@veupathdb/eda/lib/core/components/computations/Utils';
import {
  AdditionalAnalysisConfig,
  makeNewAnalysis,
} from '@veupathdb/eda/lib/core';
import { RouteComponentProps } from 'react-router';
import { LegacyRedirectState } from '@veupathdb/eda/lib/map/analysis/appState';
import { Computation } from '@veupathdb/eda/lib/core/types/visualization';

// Define constants to create new computations and analyses
const MEGA_STUDY_ID = 'DS_480c976ef9';
const MEGA_STUDIES_ENTITY_ID = 'EUPATH_0000605';
const POPBIO_ID_VARIABLE_ID = 'POPBIO_8000215';
const DESCRIPTOR_TYPE = 'stringSet';
const REDIRECT_ANALYSIS_DESCRIPTION =
  'This map was created from a legacy PopBio map link.';
const DEFAULT_COMPUTATION = createComputation(
  'pass',
  undefined,
  [],
  [],
  undefined,
  'Unnamed computation'
);

export function LegacyMapRedirectHandler({
  history,
  match,
  location,
}: RouteComponentProps) {
  const analysisClient = useConfiguredAnalysisClient(edaServiceUrl);
  const queryParams = useMemo(
    () => QueryString.parse(location.search.slice(1)),
    [location.search]
  );
  const [hasCreatedAnalysis, setHasCreatedAnalysis] = useState(false);

  const handleLegacyMapRedirect = useCallback(
    async (
      computation: Computation,
      additionalConfig: AdditionalAnalysisConfig,
      legacyMapRedirectState: LegacyRedirectState | undefined
    ) => {
      if (hasCreatedAnalysis) return;
      setHasCreatedAnalysis(true);
      const { analysisId } = await analysisClient.createAnalysis(
        makeNewAnalysis(MEGA_STUDY_ID, computation, additionalConfig)
      );
      history.push({
        pathname: `${match.url.replace(
          '/legacy-redirect-handler',
          ''
        )}/${MEGA_STUDY_ID}/${analysisId}`,
        state: legacyMapRedirectState,
      });
    },
    [analysisClient, history, match, hasCreatedAnalysis, setHasCreatedAnalysis]
  );

  const baseAdditionalAnalysisConfig = {
    description: REDIRECT_ANALYSIS_DESCRIPTION,
  };

  const paramKeys = Object.keys(queryParams);

  if (paramKeys.length) {
    if ('projectID' in queryParams) {
      const descriptorConfig = {
        descriptor: {
          subset: {
            descriptor: [
              {
                entityId: MEGA_STUDIES_ENTITY_ID,
                variableId: POPBIO_ID_VARIABLE_ID,
                type: DESCRIPTOR_TYPE,
                [DESCRIPTOR_TYPE]: [queryParams['projectID']],
              },
            ],
          },
        },
      };

      if (paramKeys.length === 1) {
        // We know we have only the projectID param, so make new analysis and redirect
        const additionalAnalysisConfig = {
          ...baseAdditionalAnalysisConfig,
          ...descriptorConfig,
        } as AdditionalAnalysisConfig;
        handleLegacyMapRedirect(
          DEFAULT_COMPUTATION,
          additionalAnalysisConfig,
          undefined
        );
      } else {
        // Here we have a projectID and other param(s), so populate the Notes -> Analysis Details info
        // with the additional param(s) and pass along the legacyMapRedirectState object
        const notes = composeParamListForNotesString(queryParams);
        const additionalAnalysisConfig = {
          ...descriptorConfig,
          ...baseAdditionalAnalysisConfig,
          notes,
        } as AdditionalAnalysisConfig;
        const legacyMapRedirectState = {
          showLegacyMapRedirectModal: true,
          projectId: queryParams['projectID'],
        } as LegacyRedirectState;
        handleLegacyMapRedirect(
          DEFAULT_COMPUTATION,
          additionalAnalysisConfig,
          legacyMapRedirectState
        );
      }
    } else {
      // Here we have query params but no projectID, so populate the Notes -> Analysis Description info
      // with the additional param(s) and pass along the legacyMapRedirectState object
      const notes = composeParamListForNotesString(queryParams);
      const additionalAnalysisConfig = {
        ...baseAdditionalAnalysisConfig,
        notes,
      };
      const legacyMapRedirectState = {
        showLegacyMapRedirectModal: true,
        projectId: undefined,
      };
      handleLegacyMapRedirect(
        DEFAULT_COMPUTATION,
        additionalAnalysisConfig,
        legacyMapRedirectState
      );
    }
  } else {
    // no query params, so create a default map analysis with only the baseAdditionalAnalysisConfig and redirect
    handleLegacyMapRedirect(
      DEFAULT_COMPUTATION,
      baseAdditionalAnalysisConfig,
      undefined
    );
  }
  return null;
}

function composeParamListForNotesString(
  queryParams: QueryString.ParsedUrlQuery
) {
  let description =
    'The following parameters from the old link were present but ignored:\n';
  for (const [key, value] of Object.entries(queryParams)) {
    if (key !== 'projectID') {
      description += `${key}: ${JSON.stringify(value)}\n`;
    }
  }
  return description;
}
