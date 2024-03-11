import React, { useCallback, useMemo } from 'react';
import QueryString from 'querystring';
import { edaServiceUrl } from '../config';
import { useConfiguredAnalysisClient } from '@veupathdb/eda/lib/core/hooks/client';
import { createComputation } from '@veupathdb/eda/lib/core/components/computations/Utils';
import { makeNewAnalysis } from '@veupathdb/eda/lib/core';
import { RouteComponentProps } from 'react-router';

// Define constants to create new computations and analyses
const MEGA_STUDY_ID = 'DS_480c976ef9';
const MEGA_STUDIES_ENTITY_ID = 'EUPATH_0000605';
const POPBIO_ID_VARIABLE_ID = 'POPBIO_8000215';
const DESCRIPTOR_TYPE = 'stringSet';
const DESCRIPTION_TEXTAREA_CHAR_LIMIT = 255;
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

  const handleLegacyMapRedirect = useCallback(
    async (computation, additionalConfig = {}) => {
      const { analysisId } = await analysisClient.createAnalysis(
        makeNewAnalysis(MEGA_STUDY_ID, computation, additionalConfig)
      );
      history.push(
        `${match.url.replace(
          '/legacy-redirect-handler',
          ''
        )}/${MEGA_STUDY_ID}/${analysisId}`
      );
    },
    [analysisClient, history, match]
  );

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
        handleLegacyMapRedirect(DEFAULT_COMPUTATION, descriptorConfig);
      } else {
        // Here we have a projectID and other param(s), so populate the Notes -> Description info
        // with the additional param(s)
        const description = composeDescriptionString(true, queryParams);
        const additionalConfig = {
          ...descriptorConfig,
          description:
            description.length <= DESCRIPTION_TEXTAREA_CHAR_LIMIT
              ? description
              : description.slice(0, DESCRIPTION_TEXTAREA_CHAR_LIMIT),
        };
        handleLegacyMapRedirect(DEFAULT_COMPUTATION, additionalConfig);
      }
    } else {
      // Here we have query params but no projectID, so populate the description textarea and redirect
      const description = composeDescriptionString(false, queryParams);
      const additionalConfig = {
        description:
          description.length <= DESCRIPTION_TEXTAREA_CHAR_LIMIT
            ? description
            : description.slice(0, DESCRIPTION_TEXTAREA_CHAR_LIMIT),
      };
      handleLegacyMapRedirect(DEFAULT_COMPUTATION, additionalConfig);
    }
  } else {
    // no query params, so create a default map analysis and redirect
    handleLegacyMapRedirect(DEFAULT_COMPUTATION, undefined);
  }
  return null;
}

function composeDescriptionString(
  hasProjectID: boolean,
  queryParams: QueryString.ParsedUrlQuery
) {
  let description =
    'We have created a new map analysis from an old link' +
    (hasProjectID
      ? ' that is filtered by the appropriate PopBio Study ID.'
      : '.') +
    ' However, the following parameters were ignored:\n';

  for (const [key, value] of Object.entries(queryParams)) {
    if (key !== 'projectID') {
      description += `${key}: ${JSON.stringify(value)}\n`;
    }
  }
  return description;
}
