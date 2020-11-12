import React, { useContext, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { memoize } from 'lodash';

import { IconAlt } from '@veupathdb/wdk-client/lib/Components';
import {
  DEFAULT_PAGINATION,
  DEFAULT_SORTING,
  Props as AnswerControllerProps
} from '@veupathdb/wdk-client/lib/Controllers/AnswerController';
import { WdkService } from '@veupathdb/wdk-client/lib/Core';
import { WdkDepdendenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';
import {
  AttributeValue,
  ParameterValues,
  RecordInstance
} from '@veupathdb/wdk-client/lib/Utils/WdkModel';

import { MONTHS } from 'ebrc-client/util/formatters';

import './AnswerController.scss';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { preorderSeq } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import { isQualifying, getId } from '@veupathdb/wdk-client/lib/Utils/CategoryUtils';
import { RootState } from '@veupathdb/wdk-client/lib/Core/State/Types';

const DOWNLOAD_REPORTER_NAME = 'attributesTabular';
const DOWNLOAD_FORMAT = 'csv';

export function AnswerController(DefaultComponent: React.ComponentType<AnswerControllerProps>) {
  return (props: AnswerControllerProps) => {
    const additionalActions = useAdditionalActions(props);

    return (
      <DefaultComponent
        {...props}
        customSortBys={ebrcCustomSortBys}
        additionalActions={additionalActions}
      />
    );
  };
}

const ebrcCustomSortBys = {
  eupath_release: [
    (record: RecordInstance) => eupathReleaseToSortKey(record.attributes.eupath_release)[0],
    (record: RecordInstance) => eupathReleaseToSortKey(record.attributes.eupath_release)[1],
    (record: RecordInstance) => eupathReleaseToSortKey(record.attributes.eupath_release)[2],
    (record: RecordInstance) => eupathReleaseToSortKey(record.attributes.eupath_release)[3],
    (record: RecordInstance) => eupathReleaseToSortKey(record.attributes.eupath_release)[4]
  ]
};

const EUPATH_RELEASE_REGEX = new RegExp(/(\w+)\s(\d+\.?\d*)\s\/\s(\d\d)-(\w\w\w)-(\d\d)/);

const MONTH_VALUES = MONTHS.reduce(
  (memo, month, i) => ({
    ...memo,
    [month.toUpperCase().slice(0, 3)]: i
  }), 
  {} as Record<string, number>
);

const eupathReleaseToSortKey = memoize((eupathRelease: AttributeValue) => {
  if (typeof eupathRelease !== 'string') {
    return [ null, null, null, null, null ];
  }

  const [ , projectName, versionStr, releaseDayStr, releaseMonthStr, releaseYearStr ] = 
    eupathRelease.match(EUPATH_RELEASE_REGEX) || [];

  return [
    Number(releaseYearStr),
    MONTH_VALUES[releaseMonthStr],
    Number(releaseDayStr),
    projectName,
    Number(versionStr)
  ];
});

function useAdditionalActions(props: AnswerControllerProps) {
  const downloadAttributes = useDownloadAttributeNames(props);
  const onDownloadButtonClick = useOnDownloadButtonClick(props, downloadAttributes);

  return useMemo(
    () => onDownloadButtonClick == null
      ? []
      : [
          {
            key: 'download',
            display: (
              <button className="btn" onClick={onDownloadButtonClick}>
                <IconAlt fa="download" />
                Download
              </button>
            )
          }
        ],
    [ onDownloadButtonClick ]
  )
}

function useOnDownloadButtonClick(props: AnswerControllerProps, downloadAttributes?: string[]) {
  const wdkDependencies = useContext(WdkDepdendenciesContext);
  const wdkService = wdkDependencies?.wdkService;

  const { parameters } = props.ownProps;

  const {
    question,
    recordClass
  } = props.stateProps;

  return useMemo(
    () => {
      if (
        wdkService == null ||
        recordClass == null ||
        question == null ||
        downloadAttributes == null
      ) {
        return undefined;
      }

      // We only offer a download button for answers whose
      // record class offers the nececessary reporter
      // FIXME: Should probably also check whether the reporter
      // is offered in "download" scope
      const reporterAvailable = recordClass.formats.some(
        ({ name }) => name === DOWNLOAD_REPORTER_NAME
      );

      if (!reporterAvailable) {
        return undefined;
      }

      return () => {
        downloadAnswer(
          wdkService,
          question.urlSegment,
          parameters ?? {},
          downloadAttributes
        );
      }
    },
    [ wdkService, question?.urlSegment, parameters, downloadAttributes ]
  )
}

function useDownloadAttributeNames(props: AnswerControllerProps) {
  const ontology = useSelector((state: RootState) => state.globalData.ontology);
  const { recordClass } = props.stateProps;
  if (ontology == null || recordClass == null) return;
  return preorderSeq(ontology.tree)
    .filter(isQualifying({ recordClassName: recordClass.fullName, targetType: 'attribute', scope: 'download' }))
    .map(getId)
    .toArray();
}

export function downloadAnswer(
  wdkService: WdkService,
  searchName: string,
  parameters: ParameterValues,
  attributes: string[]
) {
  return wdkService.downloadAnswer({
    answerSpec: {
      searchName,
      searchConfig: {
        parameters
      }
    },
    formatting: {
      format: DOWNLOAD_REPORTER_NAME,
      formatConfig: {
        attachmentType: DOWNLOAD_FORMAT,
        attributes,
        pagination: DEFAULT_PAGINATION,
        sorting: DEFAULT_SORTING
      }
    }
  });
}
