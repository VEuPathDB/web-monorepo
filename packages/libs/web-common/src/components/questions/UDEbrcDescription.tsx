import React, { useCallback, useMemo } from 'react';
import { diyUserDatasetIdToWdkRecordId } from '@veupathdb/user-datasets/lib/Utils/diyDatasets';
import { Link } from '@veupathdb/wdk-client/lib/Components';
import { RecordInstance } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { QuestionWithMappedParameters } from '@veupathdb/wdk-client/lib/StoreModules/QuestionStoreModule';
import {
  makeClassNameHelper,
  safeHtml,
} from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { useWdkEffect } from '@veupathdb/wdk-client/lib/Service/WdkService';
import './EbrcDescription.scss';

const cx = makeClassNameHelper('ebrc-Description');
const defaultFormCx = makeClassNameHelper('wdk-QuestionForm');

// here we deal with the userdataset (UD) record
// we use the question dataset_id parameter default value to access the user dataset record
// (for dataset records we use a question 'DatasetsByQuestionName' to access the datasets)

export const useUDEbrcDescription = (
  question: QuestionWithMappedParameters
) => {
  // Always have one user dataset for a user dataset question
  const shouldLoadDatasetRecords = true;

  // Get the dataset ID from the first parameter's initialDisplayValue
  const datasetId = question.parameters[0].initialDisplayValue;

  const [datasetRecord, setDatasetRecord] = React.useState<
    RecordInstance | undefined
  >(undefined);

  // Fetch the dataset record if we have a dataset ID
  useWdkEffect(
    (wdkService) => {
      if (datasetId !== undefined) {
        let active = true;
        (async () => {
          try {
            const record = await wdkService.getRecord(
              'userdataset',
              [{ name: 'dataset_id', value: datasetId }],
              {
                attributes: ['summary'],
             //   tables: ['Publications'],  ADD WHEN WE ENABLE THE TABLE IN THE UD RECORD
              }
            );
            if (active) {
              setDatasetRecord(record);
            }
          } catch (error) {
            console.error('Failed to load dataset record:', error);
            if (active) {
              setDatasetRecord(undefined);
            }
          }
        })();
        return () => {
          active = false;
        };
      }
    },
    [datasetId]
  );

  const DescriptionComponent = useCallback(
    (props: { description?: string }) => (
      <div className={cx()}>
        {props.description !== undefined && (
          <div className={defaultFormCx('DescriptionSection')}>
            <h2 className={cx('SearchDescriptionHeader')}>Description</h2>
            {safeHtml(props.description)}
          </div>
        )}
      </div>
    ),
    []
  );

  const DatasetsComponent = useCallback(
    () => (
      <div className={cx()}>
        {datasetId && (
          <div className={defaultFormCx('DescriptionSection')}>
            <h2 className={cx('SearchDatasetsHeader')}>
              Dataset used by this search
            </h2>
            {datasetRecord ? (
              <ul className={cx('DatasetsList')}>
                <li key={datasetId} className={cx('DatasetItem')}>
                  <Link to={`/record/userdataset/${datasetId}`}>
                    {safeHtml(datasetRecord.displayName)}
                  </Link>
                  <div className={cx('Details')}>
                    {typeof datasetRecord.attributes.summary === 'string' && (
                      <div className={cx('Summary')}>
                        {safeHtml(datasetRecord.attributes.summary)}
                      </div>
                    )}
                    {!datasetRecord.tableErrors.includes('Publications') &&
                      datasetRecord.tables.Publications &&
                      datasetRecord.tables.Publications.length > 0 && (
                        <ul className={cx('PublicationsList')}>
                          {datasetRecord.tables.Publications.map(
                            (pub, index) => {
                              const pubmedLink =
                                pub.pubmed_link == null ||
                                typeof pub.pubmed_link === 'string'
                                  ? null
                                  : pub.pubmed_link;

                              return (
                                <li
                                  className={cx('PublicationItem')}
                                  key={pubmedLink?.url || index}
                                >
                                  {pubmedLink ? (
                                    <a href={pubmedLink.url} target="_blank">
                                      {safeHtml(
                                        pubmedLink.displayText || pubmedLink.url
                                      )}
                                    </a>
                                  ) : (
                                    <span>Invalid publication link</span>
                                  )}
                                </li>
                              );
                            }
                          )}
                        </ul>
                      )}
                  </div>
                </li>
              </ul>
            ) : (
              <em>Loading dataset information...</em>
            )}
          </div>
        )}
      </div>
    ),
    [datasetId, datasetRecord]
  );

  return { DescriptionComponent, DatasetsComponent, shouldLoadDatasetRecords };
};
