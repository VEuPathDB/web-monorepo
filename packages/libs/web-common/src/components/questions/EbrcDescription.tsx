import React, { useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { Link, Loading } from '@veupathdb/wdk-client/lib/Components';
import { RootState } from '@veupathdb/wdk-client/lib/Core/State/Types';
import { useWdkEffect } from '@veupathdb/wdk-client/lib/Service/WdkService';
import { Question, RecordInstance, AttributeValue } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { makeClassNameHelper, safeHtml } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

import './EbrcDescription.scss';

const cx = makeClassNameHelper('ebrc-Description');
const defaultFormCx = makeClassNameHelper('wdk-QuestionForm');

const DATASETS_BY_QUESTION_NAME = 'DatasetsByQuestionName';

type DatasetRecords =
  | {
    status: 'absent'
  }
  | {
    status: 'loading'
  }
  | {
    status: 'present',
    records: RecordInstance[]
  };

export const useEbrcDescription = (question: Question) => {
  const [datasetRecords, setDatasetRecords] = useState({ status: 'absent' } as DatasetRecords);
  const shouldLoadDatasetRecords = useSelector(
    (state: RootState) => state.globalData.questions?.find(
      q => q.urlSegment === DATASETS_BY_QUESTION_NAME
    ) != null
  );

  useWdkEffect(wdkService => {
    if (shouldLoadDatasetRecords) {
      setDatasetRecords({ status: 'loading' });

      let active = true;
      (async () => {
        const answerJson = await wdkService.getAnswerJson(
          deriveAnswerSpec(question.fullName),
          REPORT_CONFIG
        );

        if (active) setDatasetRecords({ status: 'present', records: answerJson.records });

        return () => {
          active = false;
        };
      })();
    }
  }, [question.fullName, shouldLoadDatasetRecords]);

  const DescriptionComponent = useCallback(
    (props: { description?: string }) =>
      <div className={cx()}>
        {
          props.description !== undefined && (
            <div className={defaultFormCx('DescriptionSection')}>
              <h2 className={cx('SearchDescriptionHeader')}>
                Description
              </h2>
              {safeHtml(props.description)}
            </div>
          )
        }
      </div>,
    []
  );

  const DatasetsComponent = useCallback(
    () =>
      <div className={cx()}>
        {
          datasetRecords.status === 'loading' &&
          <Loading />
        }
        {
          datasetRecords.status === 'present' && (
            <div className={defaultFormCx('DescriptionSection')}>
              <h2 className={cx('SearchDatasetsHeader')}>Data Sets used by this search</h2>
              {
                datasetRecords.records.length > 0 ? (
                  <ul className={cx('DatasetsList')}>
                    {datasetRecords.records.map(recordToAttribution)}
                  </ul>
                ) : <em>No results found</em>
              }
            </div>
          )
        }
      </div>,
    [datasetRecords]
  );

  return ({ DescriptionComponent, DatasetsComponent, shouldLoadDatasetRecords });
};

const deriveAnswerSpec = (questionFullName: string) => (
  {
    searchName: DATASETS_BY_QUESTION_NAME,
    searchConfig: {
      parameters: {
        question_name: questionFullName
      }
    }
  }
);

const REPORT_CONFIG = {
  attributes: ['summary'],
  tables: ['Publications']
};

const recordToAttribution = (record: RecordInstance) => {
  const datasetId = record.id[0].value;
  const summaryText = typeof record.attributes.summary !== 'string' ? null : record.attributes.summary;
  const publications = record.tableErrors.includes('Publications') ? null : record.tables.Publications;

  return (
    <li key={datasetId} className={cx('DatasetItem')}>
      <Link to={`/record/dataset/${datasetId}`}>{safeHtml(record.displayName)}</Link>
      <div className={cx('Details')}>
        <div className={cx('Summary')}>
          {
            summaryText === null
              ? (
                <RecordError
                  message={`summary attribute '${record.attributes.summary}' for data set ${datasetId} is invalid`}
                />
              )
              : safeHtml(summaryText)
          }
        </div>
        {
          publications === null && (
            <RecordError
              message={`table 'Publications' is missing for data set ${datasetId}`}
            />
          )
        }
        {
          publications !== null && publications.length > 0 && (
            <ul className={cx('PublicationsList')}>
              {publications.map(publicationToLink)}
            </ul>
          )
        }
      </div>
    </li>
  );
};

const publicationToLink = ({ pubmed_link, dataset_id }: Record<string, AttributeValue>, i: number) => {
  const publicationLink = pubmed_link == null || typeof pubmed_link === 'string' ? null : pubmed_link;

  return (
    <li className={cx('PublicationItem')} key={publicationLink === null ? i : publicationLink.url}>
      {
        publicationLink === null
          ? <RecordError
            message={`pubmed_link attribute '${pubmed_link}' for data set ${dataset_id} is invalid.`}
          />
          : <a href={publicationLink.url} target="_blank">{safeHtml(publicationLink.displayText || publicationLink.url)}</a>
      }
    </li>
  );
};

const RecordError = (props: { message: string }) =>
  <span className={cx('RecordError')}>
    ERROR: {props.message}
    Please <Link to="/contact-us" target="_blank" >contact us</Link> to report.
  </span>;
