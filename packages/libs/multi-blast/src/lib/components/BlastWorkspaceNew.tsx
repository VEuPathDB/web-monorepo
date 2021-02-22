import { useCallback, useContext, useMemo } from 'react';
import { RouteComponentProps, StaticContext } from 'react-router';

import {
  NotFoundController,
  QuestionController,
} from '@veupathdb/wdk-client/lib/Controllers';
import { parseQueryString } from '@veupathdb/wdk-client/lib/Core/RouteEntry';
import { Plugin } from '@veupathdb/wdk-client/lib/Utils/ClientPlugin';
import { ParameterValues } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { Props as FormProps } from '@veupathdb/wdk-client/lib/Views/Question/DefaultQuestionForm';

import { TargetMetadataByDataType } from '../utils/targetTypes';

import { BlastForm } from './BlastForm';

type WorkspaceMetadata =
  | { searchName: null }
  | {
      canChangeRecordType: boolean;
      recordClassName: string;
      searchName: string;
    };

export function BlastWorkspaceNew(
  props: RouteComponentProps<{}, StaticContext, ParameterValues | undefined>
) {
  const targetMetadataByDataType = useContext(TargetMetadataByDataType);

  const workspaceMetadata = useMemo((): WorkspaceMetadata => {
    const parsedQueryString = parseQueryString(props);

    const selectedRecordClassUrlSegment = parsedQueryString['recordType'];

    const availableTargetDataTypes = Object.values(targetMetadataByDataType);

    if (selectedRecordClassUrlSegment == null) {
      return availableTargetDataTypes.length === 0
        ? { searchName: null }
        : {
            canChangeRecordType: true,
            recordClassName: availableTargetDataTypes[0].recordClassUrlSegment,
            searchName: availableTargetDataTypes[0].searchUrlSegment,
          };
    }

    const compatibleTargetDataTypeEntry = availableTargetDataTypes.find(
      ({ recordClassUrlSegment }) =>
        recordClassUrlSegment === selectedRecordClassUrlSegment
    );

    return compatibleTargetDataTypeEntry == null
      ? { searchName: null }
      : {
          canChangeRecordType: false,
          recordClassName: selectedRecordClassUrlSegment,
          searchName: compatibleTargetDataTypeEntry.searchUrlSegment,
        };
  }, [props, targetMetadataByDataType]);

  const FormComponent = useCallback(
    (props: FormProps) =>
      workspaceMetadata.searchName == null ? (
        <></>
      ) : (
        <BlastForm
          {...props}
          canChangeRecordType={workspaceMetadata.canChangeRecordType}
        />
      ),
    [workspaceMetadata]
  );

  return workspaceMetadata.searchName == null ? (
    <NotFoundController />
  ) : (
    <Plugin
      context={{
        type: 'questionController',
        recordClassName: workspaceMetadata.recordClassName,
        searchName: workspaceMetadata.searchName,
      }}
      pluginProps={{
        question: workspaceMetadata.searchName,
        recordClass: workspaceMetadata.recordClassName,
        submissionMetadata: {
          type: 'create-strategy',
        } as const,
        shouldChangeDocumentTitle: false,
        autoRun: false,
        prepopulateWithLastParamValues: false,
        submitButtonText: 'BLAST',
        initialParamData: props.location.state ?? undefined,
        FormComponent,
      }}
      defaultComponent={QuestionController}
    />
  );
}
