import Banner from '@veupathdb/coreui/lib/components/banners/Banner';
import { parseQueryString } from '@veupathdb/wdk-client/lib/Core/RouteEntry';
import { RootState } from '@veupathdb/wdk-client/lib/Core/State/Types';
import { useWdkDependenciesEffect } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';
import { updateLastParamValues } from '@veupathdb/wdk-client/lib/StoreModules/QuestionStoreModule';
import { SearchConfig } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { isParamValueValid } from '@veupathdb/wdk-client/lib/Views/Question/Params';
import { isEqual } from 'lodash';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useHistory, useLocation, useRouteMatch } from 'react-router';
import { DownloadsFilter } from './DownloadsFilter';
import { DownloadsTable } from './DownloadsTable';
import './Downloads.scss';

const RECORD_NAME = 'dfile';
const TABLE_QUESTION_NAME = 'GetAllFileRecords';
const BULK_QUESTION_NAME = 'GetFileRecordsByID';

export function Downloads() {
  const location = useLocation();
  const history = useHistory();
  const match = useRouteMatch();
  const initialParamData = useMemo(
    () => parseQueryString({ location, history, match }),
    [history, location, match]
  );

  const { searchConfig, isValid } = useSelector(
    (state: RootState) => {
      const questionState = state.question.questions[TABLE_QUESTION_NAME];
      const searchConfig: SearchConfig | undefined =
        questionState?.paramValues && {
          parameters: questionState.paramValues,
        };
      const isValid = questionState?.paramValues
        ? questionState.question.parameters.every((parameter) =>
            isParamValueValid(
              {
                searchName: TABLE_QUESTION_NAME,
                paramValues: questionState?.paramValues,
                parameter,
              },
              questionState.paramUIState[parameter.name]
            )
          )
        : true;
      return { searchConfig, isValid };
    },
    (left, right) => isEqual(left, right)
  );

  useWdkDependenciesEffect(
    ({ paramValueStore }) => {
      if (searchConfig == null || !isValid) return;
      updateLastParamValues(
        paramValueStore,
        TABLE_QUESTION_NAME,
        searchConfig?.parameters,
        undefined
      );
    },
    [searchConfig, isValid]
  );

  return (
    <div className="Downloads">
      <h1>Download Data Files</h1>
      <p className="Downloads-Instructions">
        Use the filters to reduce the table below. Use the table to select the
        files to download.
      </p>
      <div className="Downloads-Filter-Container">
        <DownloadsFilter
          recordName={RECORD_NAME}
          questionName={TABLE_QUESTION_NAME}
          initialParamData={initialParamData}
        />
      </div>
      {!isValid ? (
        <Banner
          banner={{
            type: 'error',
            message:
              'One or more parameter selections above is invalid. Fix them to see results.',
          }}
        />
      ) : searchConfig ? (
        <DownloadsTable
          tableSearchName={TABLE_QUESTION_NAME}
          bulkSearchName={BULK_QUESTION_NAME}
          searchConfig={searchConfig}
        />
      ) : null}
    </div>
  );
}
