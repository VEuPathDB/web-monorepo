import React, {
  Suspense,
  useMemo,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useHistory } from 'react-router';

import {
  Loading,
  Link,
  HelpIcon,
  BetaIcon,
} from '@veupathdb/wdk-client/lib/Components';
import { TabbedDisplay, Tooltip } from '@veupathdb/coreui';
import { CommonResultTable as InternalGeneDatasetTable } from '@veupathdb/wdk-client/lib/Components/Shared/CommonResultTable';
import { useIsRefOverflowingVertically } from '@veupathdb/wdk-client/lib/Hooks/Overflow';
import QuestionController, {
  useSetSearchDocumentTitle,
  Props,
} from '@veupathdb/wdk-client/lib/Controllers/QuestionController';
import { RootState } from '@veupathdb/wdk-client/lib/Core/State/Types';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { CategoryTreeNode } from '@veupathdb/wdk-client/lib/Utils/CategoryUtils';
import {
  makeClassNameHelper,
  safeHtml,
} from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import {
  getPropertyValue,
  getPropertyValues,
} from '@veupathdb/wdk-client/lib/Utils/OntologyUtils';
import {
  Question,
  AttributeValue,
  LinkAttributeValue,
  Answer,
  RecordClass,
} from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { Plugin } from '@veupathdb/wdk-client/lib/Utils/ClientPlugin';
import NotFound from '@veupathdb/wdk-client/lib/Views/NotFound/NotFound';
import { QuestionHeader } from '@veupathdb/wdk-client/lib/Views/Question/DefaultQuestionForm';

import { formatLink } from '@veupathdb/web-common/lib/components/records/DatasetRecordClasses.DatasetRecordClass';

import { OrganismPreferencesWarning } from '@veupathdb/preferred-organisms/lib/components/OrganismPreferencesWarning';
import {
  usePreferredOrganismsState,
  usePreferredOrganismsEnabledState,
} from '@veupathdb/preferred-organisms/lib/hooks/preferredOrganisms';

import { isPreferredDataset } from '../../util/preferredOrganisms';

import { PageLoading } from '../common/PageLoading';

import './InternalGeneDataset.scss';
import { CSSProperties } from '@material-ui/core/styles/withStyles';
import LockIcon from '@material-ui/icons/Lock';
import PublicIcon from '@material-ui/icons/Public';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import { projectId, webAppUrl } from '@veupathdb/web-common/lib/config';

const cx = makeClassNameHelper('wdk-InternalGeneDatasetForm');

type InternalQuestionRecord = {
  target_name: string;
  dataset_id: string;
  target_type: string;
  dataset_name: string;
  record_type: string;
};

type UserDatasetQuestionRecord = {
  question_name: string;
  dataset_id_param: string;
  dataset_id: string;
  record_class: string;
  dataset_name: string;
};

type UserDatasetRecord = {
  displayName: string;
  attributes: {
    name: string;
    ref_organism_formatted: string;
    dataset_id: string;
    summary: string;
    is_public: string;
    primary_contact_name: string;
    owner_name: string;
    ref_organism: string;
  };
  tables?: {
    ExploreWebsiteSearches?: Array<{
      question_name: string;
      dataset_id_param: string;
      dataset_id: string;
      record_class: string;
    }>;
  };
};

type DatasourceRecord = {
  dataset_name: string;
  display_name: string;
  organism_prefix: string;
  dataset_id: string;
  summary: string;
  build_number_introduced: string;
  publications: LinkAttributeValue[];
  searches: string;
  isPreferred: boolean;
  source: 'datasource' | 'userdataset';
  is_public?: boolean;
  dataset_id_param?: string;
};

type DisplayCategory = {
  description: string;
  displayName: string;
  shortDisplayName: string;
};

export function InternalGeneDataset(props: Props) {
  return (
    <Suspense fallback={<PageLoading />}>
      <InternalGeneDatasetContent {...props} />
    </Suspense>
  );
}

function InternalGeneDatasetContent(props: Props) {
  const location = useLocation();
  const history = useHistory();
  const searchNameAnchorTag = location.hash.slice(1);

  const buildNumber = useSelector(
    (state: RootState) => state.globalData?.config?.buildNumber
  );
  const questions = useSelector(
    (state: RootState) => state.globalData.questions
  );
  const ontology = useSelector(
    (state: RootState) => state.globalData.ontology?.tree
  );
  const recordClasses = useSelector(
    (state: RootState) => state.globalData.recordClasses
  );

  const [preferredOrganisms] = usePreferredOrganismsState();
  const [preferredOrganismsEnabled] = usePreferredOrganismsEnabledState();

  const internalSearchName = props.question;

  const { recordClass, shouldChangeDocumentTitle, submissionMetadata } = props;

  const [selectedSearch, setSelectedSearch] = useState<string | undefined>(
    searchNameAnchorTag
  );

  useEffect(() => {
    setSelectedSearch(searchNameAnchorTag);
  }, [searchNameAnchorTag]);

  const [searchName, showingRecordToggle] = selectedSearch
    ? [selectedSearch, true]
    : [internalSearchName, false];

  const [internalQuestion, outputRecordClass, datasetCategory] = useMemo(
    () =>
      getTableQuestionMetadata(questions, recordClasses, internalSearchName),
    [questions, recordClasses, internalSearchName]
  );

  const serviceResult = useWdkService(
    async (wdkService) => {
      if (!questions || !ontology || !outputRecordClass || !datasetCategory) {
        return undefined;
      }

      // Fetch both DataSources and UserDatasets in parallel
      const [datasourceAnswer, userdatasetAnswer] = await Promise.all([
        wdkService.getAnswerJson(getAnswerSpec(datasetCategory), REPORT_CONFIG),
        wdkService.getAnswerJson(
          getUserDatasetAnswerSpec(datasetCategory),
          USERDATASET_REPORT_CONFIG
        ),
      ]);

      // Process DataSources
      const internalQuestions = getInternalQuestions(
        datasourceAnswer,
        outputRecordClass.fullName
      );

      // Process UserDatasets
      const userdatasetInternalQuestions =
        getUserDatasetInternalQuestions(userdatasetAnswer);

      // Merge questions from both sources
      const allInternalQuestions = [
        ...internalQuestions,
        ...userdatasetInternalQuestions.map((udq) => ({
          target_name: udq.question_name,
          dataset_id: udq.dataset_id,
          target_type: 'question',
          dataset_name: udq.dataset_name,
          record_type: udq.record_class,
        })),
      ];

      const displayCategoryMetadata = getDisplayCategoryMetadata(
        ontology,
        allInternalQuestions
      );

      const datasourceRecords = getDatasourceRecords(
        datasourceAnswer,
        displayCategoryMetadata,
        preferredOrganisms
      );

      const userdatasetRecords = getUserDatasetRecords(
        userdatasetAnswer,
        displayCategoryMetadata,
        preferredOrganisms
      );

      // Merge all records
      const allRecords = [...datasourceRecords, ...userdatasetRecords];

      return {
        questionNamesByDatasetAndCategory:
          displayCategoryMetadata.questionNamesByDatasetAndCategory,
        displayCategoriesByName:
          displayCategoryMetadata.displayCategoriesByName,
        displayCategoryOrder: displayCategoryMetadata.displayCategoryOrder,
        datasourceRecords: allRecords,
      };
    },
    [
      questions,
      ontology,
      internalSearchName,
      outputRecordClass,
      datasetCategory,
      preferredOrganisms,
    ]
  );

  const {
    questionNamesByDatasetAndCategory,
    displayCategoriesByName,
    displayCategoryOrder,
    datasourceRecords,
  } = serviceResult || {};

  const [showingOneRecord, updateShowingOneRecord] =
    useState(showingRecordToggle);

  const [showDataSources, setShowDataSources] = useState(true);
  const [showPublicUserDatasets, setShowPublicUserDatasets] = useState(true);
  const [showPrivateUserDatasets, setShowPrivateUserDatasets] = useState(true);

  const sourceTypeFilterPredicate = useCallback(
    (record: DatasourceRecord) => {
      if (record.source === 'datasource') return showDataSources;
      else if (record.is_public) return showPublicUserDatasets;
      else return showPrivateUserDatasets;
    },
    [showDataSources, showPublicUserDatasets, showPrivateUserDatasets]
  );

  const selectedDataSetRecord = useMemo(
    () =>
      getSelectedDataSetRecord(
        datasourceRecords,
        questionNamesByDatasetAndCategory,
        searchName
      ),
    [datasourceRecords, questionNamesByDatasetAndCategory, searchName]
  );

  const filteredDatasourceRecords = useMemo(
    () =>
      getFilteredDatasourceRecords(
        datasourceRecords,
        displayCategoriesByName,
        showingOneRecord,
        selectedDataSetRecord,
        preferredOrganismsEnabled
      ),
    [
      datasourceRecords,
      displayCategoriesByName,
      showingOneRecord,
      selectedDataSetRecord,
      preferredOrganismsEnabled,
    ]
  );

  useEffect(() => {
    updateShowingOneRecord(searchName !== internalSearchName);
  }, [searchName, internalSearchName]);

  useSetSearchDocumentTitle(
    internalQuestion,
    internalQuestion ? 'complete' : 'loading',
    recordClasses,
    outputRecordClass,
    shouldChangeDocumentTitle
  );

  const changeTabHandler = useCallback(
    (selectedTabKey: string) => {
      if (searchName === selectedTabKey) return;
      setSelectedSearch(selectedTabKey);
      if (submissionMetadata.type === 'create-strategy') {
        history.push(location.pathname + '#' + selectedTabKey);
      }
    },
    [searchName, submissionMetadata]
  );

  return !questions ||
    !ontology ||
    !questionNamesByDatasetAndCategory ||
    !displayCategoriesByName ||
    !displayCategoryOrder ||
    !datasourceRecords ||
    !filteredDatasourceRecords ? (
    <Loading />
  ) : !internalQuestion || !outputRecordClass || !datasetCategory ? (
    <NotFound />
  ) : (
    <div className={cx()}>
      <QuestionHeader
        showHeader={
          submissionMetadata.type === 'create-strategy' ||
          submissionMetadata.type === 'edit-step'
        }
        headerText={`Identify ${outputRecordClass.displayNamePlural} based on ${internalQuestion.displayName}`}
        isBeta={internalQuestion.isBeta}
      />
      <div className={cx('Legend')}>
        <span style={{ fontWeight: 'bold', fontSize: '13px' }}>Legend:</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', rowGap: '1rem' }}>
          {displayCategoryOrder.map((categoryName) => (
            <Tooltip
              key={categoryName}
              title={
                <div>
                  <h4>{displayCategoriesByName[categoryName].displayName}</h4>
                  {displayCategoriesByName[categoryName].description}
                </div>
              }
            >
              <div key={categoryName}>
                <span className="bttn bttn-cyan bttn-legend">
                  {displayCategoriesByName[categoryName].shortDisplayName}
                </span>
                {/** NOTE: Remove the styles related to the hardcoded beta icon */}
                <span
                  style={
                    displayCategoriesByName[categoryName].displayName ===
                    'WGCNA'
                      ? { marginRight: '30px' }
                      : undefined
                  }
                >
                  {displayCategoriesByName[categoryName].displayName}
                </span>
                {displayCategoriesByName[categoryName].displayName ===
                  'WGCNA' && (
                  <div style={{ position: 'relative' }}>
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '0.5em',
                        right: '0.25em',
                      }}
                    >
                      <BetaIcon />
                    </div>
                  </div>
                )}
              </div>
            </Tooltip>
          ))}
        </div>
      </div>
      <div className={cx('SourceFilters')}>
        <label>
          <input
            type="checkbox"
            checked={showDataSources}
            onChange={(e) => setShowDataSources(e.target.checked)}
          />
          <img
            src={`${webAppUrl}/images/${projectId}/favicon.ico`}
            alt="VEuPathDB curated dataset"
            style={{ width: '20px', height: '20px', objectFit: 'contain' }}
          />
          {' VEuPathDB curated datasets'}
        </label>
        <label>
          <input
            type="checkbox"
            checked={showPublicUserDatasets}
            onChange={(e) => setShowPublicUserDatasets(e.target.checked)}
          />
          <PublicIcon style={{ width: '20px', height: '20px' }} />
          {' Public User Datasets'}
        </label>
        <label>
          <input
            type="checkbox"
            checked={showPrivateUserDatasets}
            onChange={(e) => setShowPrivateUserDatasets(e.target.checked)}
          />
          <LockIcon style={{ width: '20px', height: '20px' }} />
          {' Private User Datasets'}
        </label>
      </div>
      <InternalGeneDatasetTable
        searchBoxHeader="Filter Datasets:"
        emptyResultMessage={
          (
            <OrganismPreferencesWarning
              action="use this page"
              explanation="Your current preferences exclude all organisms used in this page's searches."
            />
          ) as any
        }
        showCount={true}
        rows={filteredDatasourceRecords}
        filterPredicate={sourceTypeFilterPredicate}
        columns={[
          {
            key: 'source',
            name: ' ',
            width: '50px',
            sortable: false,
            renderCell: ({ row }: any) => {
              if (row.source === 'datasource') {
                return (
                  <img
                    src={`${webAppUrl}/images/${projectId}/favicon.ico`}
                    alt=""
                    title="VEuPathDB curated dataset"
                    style={{
                      width: '20px',
                      height: '20px',
                      objectFit: 'contain',
                    }}
                  />
                );
              } else if (row.is_public) {
                return (
                  <PublicIcon
                    style={{ width: '20px', height: '20px' }}
                    titleAccess="Public User Dataset"
                  />
                );
              } else {
                return (
                  <LockIcon
                    style={{ width: '20px', height: '20px' }}
                    titleAccess="Private User Dataset"
                  />
                );
              }
            },
          },
          {
            key: 'searches',
            name: 'Choose a Search',
            sortable: false,
            renderCell: (cellProps: any) => (
              <>
                {displayCategoryOrder.map((categoryName) => {
                  const { dataset_name, dataset_id, source, dataset_id_param } =
                    cellProps.row;
                  const categorySearchName = getCategorySearchName(
                    questionNamesByDatasetAndCategory,
                    dataset_name,
                    categoryName
                  );

                  return (
                    <div key={categoryName}>
                      {categorySearchName && (
                        <Link
                          className={
                            categorySearchName === searchName
                              ? 'bttn bttn-cyan bttn-active'
                              : 'bttn bttn-cyan'
                          }
                          to={getCategorySearchUrl(
                            categorySearchName,
                            dataset_id,
                            source,
                            dataset_id_param,
                            internalSearchName
                          )}
                          onClick={makeLinkClickHandler(
                            submissionMetadata,
                            categorySearchName,
                            searchName,
                            setSelectedSearch
                          )}
                        >
                          {
                            displayCategoriesByName[categoryName]
                              .shortDisplayName
                          }
                        </Link>
                      )}
                    </div>
                  );
                })}
              </>
            ),
          },
          {
            key: 'organism_prefix',
            name: 'Organism',
            sortable: true,
            sortType: 'htmlText',
            helpText: 'Organism data is aligned to',
            renderCell: (props: any) => <OrganismCell {...props} />,
          },
          {
            key: 'display_name',
            name: 'Dataset',
            type: 'html',
            sortable: true,
            sortType: 'htmlText',
            renderCell: (cellProps: any) => {
              const {
                dataset_id,
                display_name,
                summary,
                publications,
                build_number_introduced,
                source,
              }: DatasourceRecord = cellProps.row;

              const recordUrl =
                source === 'datasource'
                  ? `/record/dataset/${dataset_id}`
                  : `/record/userdataset/${dataset_id}`;

              return (
                <div>
                  <HelpIcon>
                    <div>
                      <h4>Summary</h4>
                      {safeHtml(summary)}
                      {publications.length > 0 && (
                        <>
                          <h4>Publications</h4>
                          <ul>
                            {publications.map((link) => (
                              <li key={link.url}>
                                {formatLink(link, { newWindow: true })}
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  </HelpIcon>{' '}
                  {safeHtml(display_name)}
                  <Link
                    to={recordUrl}
                    style={{ marginLeft: '0.5em', verticalAlign: 'middle' }}
                  >
                    <OpenInNewIcon style={{ fontSize: '16px' }} />
                  </Link>
                  {build_number_introduced === buildNumber && (
                    <span className={cx('NewDataset')}></span>
                  )}
                </div>
              );
            },
          },
        ]}
        initialSortColumnKey="organism_prefix"
        fixedTableHeader
      ></InternalGeneDatasetTable>
      {showingRecordToggle && (
        <div
          className={cx('RecordToggle')}
          onClick={() => {
            updateShowingOneRecord(!showingOneRecord);
          }}
        >
          {showingOneRecord ? (
            <>
              <i className="fa fa-arrow-down" /> Show All Datasets{' '}
              <i className="fa fa-arrow-down" />
            </>
          ) : (
            <>
              <i className="fa fa-arrow-up" /> Hide All Datasets{' '}
              <i className="fa fa-arrow-up" />
            </>
          )}
        </div>
      )}
      {selectedDataSetRecord && (
        <TabbedDisplay
          styleOverrides={{
            container: {
              margin: '3rem 0 0 0',
            },
            active: {
              indicatorColor: '#2F96B4',
              backgroundColor: '#E8F3F7',
            },
            tabFontSize: '1.5em',
          }}
          tabs={displayCategoryOrder
            .filter((categoryName) =>
              getCategorySearchName(
                questionNamesByDatasetAndCategory,
                selectedDataSetRecord.dataset_name,
                categoryName
              )
            )
            .map((categoryName) => {
              const categorySearchName = getCategorySearchName(
                questionNamesByDatasetAndCategory,
                selectedDataSetRecord.dataset_name,
                categoryName
              );
              return {
                key: categorySearchName,
                displayName: displayCategoriesByName[categoryName].displayName,
                content: (
                  <Plugin
                    context={{
                      type: 'questionController',
                      searchName,
                      recordClassName: recordClass,
                    }}
                    pluginProps={{
                      ...props,
                      question: searchName,
                      shouldChangeDocumentTitle: false,
                    }}
                    defaultComponent={QuestionController}
                    fallback={<Loading />}
                  />
                ),
              };
            })}
          onTabSelected={changeTabHandler}
          activeTab={searchName}
        />
      )}
    </div>
  );
}

function getTableQuestionMetadata(
  questions: Question[] | undefined,
  recordClasses: RecordClass[] | undefined,
  internalSearchName: string
): [Question | undefined, RecordClass | undefined, string | undefined] {
  if (!questions || !recordClasses) {
    return [undefined, undefined, undefined];
  }

  const internalQuestion = questions.find(
    (question) => question.urlSegment === internalSearchName
  );

  if (!internalQuestion || !internalQuestion.properties) {
    return [undefined, undefined, undefined];
  }

  const { datasetCategory = [], datasetSubtype = [] } =
    internalQuestion.properties;

  const outputRecordClass = recordClasses.find(
    ({ urlSegment }) => urlSegment === internalQuestion.outputRecordClassName
  );

  return [internalQuestion, outputRecordClass, datasetCategory.join('')];
}

function getSelectedDataSetRecord(
  datasourceRecords: DatasourceRecord[] | undefined,
  questionNamesByDatasetAndCategory:
    | ReturnType<
        typeof getDisplayCategoryMetadata
      >['questionNamesByDatasetAndCategory']
    | undefined,
  searchName: string
) {
  return !datasourceRecords || !questionNamesByDatasetAndCategory
    ? undefined
    : datasourceRecords.find(({ dataset_name }) =>
        Object.values(questionNamesByDatasetAndCategory[dataset_name]).includes(
          searchName
        )
      );
}

function getFilteredDatasourceRecords(
  datasourceRecords: DatasourceRecord[] | undefined,
  questionNamesByDatasetAndCategory:
    | ReturnType<
        typeof getDisplayCategoryMetadata
      >['questionNamesByDatasetAndCategory']
    | undefined,
  showingOneRecord: boolean,
  selectedDataSetRecord: DatasourceRecord | undefined,
  preferredOrganismsEnabled: boolean
) {
  if (!datasourceRecords || !questionNamesByDatasetAndCategory) {
    return undefined;
  }

  if (showingOneRecord) {
    return datasourceRecords.filter(
      (record) => record === selectedDataSetRecord
    );
  }

  // Apply organism preference filtering if enabled
  if (preferredOrganismsEnabled) {
    return datasourceRecords.filter(({ isPreferred }) => isPreferred);
  }

  return datasourceRecords;
}

function getAnswerSpec(datasetCategory: string) {
  return {
    searchName: 'DatasourcesByCategory',
    searchConfig: {
      parameters: {
        dataset_category: datasetCategory,
      },
    },
  };
}

const REPORT_CONFIG = {
  attributes: [
    'dataset_name',
    'display_name',
    'organism_prefix',
    'short_attribution',
    'dataset_id',
    'summary',
    'description',
    'build_number_introduced',
  ],
  tables: ['References', 'Publications', 'Version'],
  pagination: {
    offset: 0,
    numRecords: -1,
  },
};

const USERDATASET_REPORT_CONFIG = {
  attributes: [
    'name',
    'ref_organism_formatted',
    'dataset_id',
    'summary',
    'is_public',
    'primary_contact_name',
    'owner_name',
    'ref_organism',
  ],
  tables: ['ExploreWebsiteSearches'],
  pagination: {
    offset: 0,
    numRecords: -1,
  },
};

function getUserDatasetAnswerSpec(datasetCategory: string) {
  return {
    searchName: 'UserDatasetsByCategory',
    searchConfig: {
      parameters: {
        dataset_category: datasetCategory,
      },
    },
  };
}

function getInternalQuestions(answer: Answer, outputRecordClassName: string) {
  return answer.records
    .flatMap((record) => {
      if (record.tableErrors.includes('References')) {
        throw new Error(
          `Failed to resolve References table for record ${JSON.stringify(
            record
          )}`
        );
      }

      return record.tables.References;
    })
    .filter(
      (reference): reference is Record<string, AttributeValue> =>
        reference !== null &&
        reference.target_type === 'question' &&
        reference.record_type === outputRecordClassName
    )
    .map((reference) => {
      if (
        typeof reference.target_name !== 'string' ||
        typeof reference.dataset_id !== 'string' ||
        typeof reference.target_type !== 'string' ||
        typeof reference.dataset_name !== 'string' ||
        typeof reference.record_type !== 'string'
      ) {
        throw new Error(
          `Question reference ${JSON.stringify(
            reference
          )} is missing required attribute fields`
        );
      }

      return {
        target_name: reference.target_name,
        dataset_id: reference.dataset_id,
        target_type: reference.target_type,
        dataset_name: reference.dataset_name,
        record_type: reference.record_type,
      };
    });
}

function getUserDatasetInternalQuestions(
  answer: Answer
): UserDatasetQuestionRecord[] {
  return answer.records.flatMap((record: any) => {
    const exploreSearches = record.tables?.ExploreWebsiteSearches;
    if (!Array.isArray(exploreSearches)) {
      throw new Error(
        `ExploreWebsiteSearches table missing for UserDataset ${record.attributes.dataset_id}`
      );
    }
    return exploreSearches.map((search: any) => ({
      question_name: search.question_name,
      dataset_id_param: search.dataset_id_param,
      dataset_id: search.dataset_id,
      record_class: search.record_class,
      dataset_name: record.attributes.dataset_id,
    }));
  });
}

function getDatasourceRecords(
  answer: Answer,
  {
    displayCategoriesByName,
    displayCategoryOrder,
    questionNamesByDatasetAndCategory,
  }: ReturnType<typeof getDisplayCategoryMetadata>,
  preferredOrganisms: string[]
) {
  const preferredOrganismsSet = new Set(preferredOrganisms);

  return answer.records
    .filter(
      ({ attributes: { dataset_name } }) =>
        Object.keys(questionNamesByDatasetAndCategory[`${dataset_name}`] || {})
          .length > 0
    )
    .map((datasetRecord) => {
      if (
        typeof datasetRecord.attributes.dataset_name !== 'string' ||
        typeof datasetRecord.attributes.display_name !== 'string' ||
        typeof datasetRecord.attributes.organism_prefix !== 'string' ||
        typeof datasetRecord.attributes.short_attribution !== 'string' ||
        typeof datasetRecord.attributes.dataset_id !== 'string' ||
        typeof datasetRecord.attributes.summary !== 'string' ||
        typeof datasetRecord.attributes.build_number_introduced !== 'string'
      ) {
        throw new Error(
          `Dataset record ${JSON.stringify(
            datasetRecord
          )} is missing required attribute fields`
        );
      }

      if (datasetRecord.tableErrors.includes('Publications')) {
        throw new Error(
          `Failed to resolve Publications table for record ${JSON.stringify(
            datasetRecord
          )}`
        );
      }

      return {
        dataset_name: datasetRecord.attributes.dataset_name,
        display_name: `${datasetRecord.attributes.display_name} (${datasetRecord.attributes.short_attribution})`,
        organism_prefix: datasetRecord.attributes.organism_prefix,
        dataset_id: datasetRecord.attributes.dataset_id,
        summary: datasetRecord.attributes.summary,
        build_number_introduced:
          datasetRecord.attributes.build_number_introduced,
        publications: datasetRecord.tables.Publications.map(
          ({ pubmed_link }) => {
            if (pubmed_link === null || typeof pubmed_link === 'string') {
              throw new Error(
                `Pubmed link ${JSON.stringify(
                  pubmed_link
                )} is invalid - expected a LinkAttributeValue`
              );
            }

            return pubmed_link;
          }
        ),
        searches: displayCategoryOrder
          .filter((categoryName) =>
            getCategorySearchName(
              questionNamesByDatasetAndCategory,
              `${datasetRecord.attributes.dataset_name}`,
              categoryName
            )
          )
          .map(
            (categoryName) =>
              displayCategoriesByName[categoryName].shortDisplayName
          )
          .join(' '),
        isPreferred: isPreferredDataset(datasetRecord, preferredOrganismsSet),
        source: 'datasource' as const,
      };
    });
}

function getUserDatasetRecords(
  answer: Answer,
  {
    displayCategoriesByName,
    displayCategoryOrder,
    questionNamesByDatasetAndCategory,
  }: ReturnType<typeof getDisplayCategoryMetadata>,
  preferredOrganisms: string[]
): DatasourceRecord[] {
  const preferredOrganismsSet = new Set(preferredOrganisms);

  return answer.records
    .filter(
      ({ attributes: { dataset_id } }: any) =>
        Object.keys(questionNamesByDatasetAndCategory[`${dataset_id}`] || {})
          .length > 0
    )
    .map((userDatasetRecord: any) => {
      const attrs = userDatasetRecord.attributes;

      // Check if organism is preferred (for UserDatasets, check ref_organism attribute)
      const organism = attrs.ref_organism || 'Unspecified';
      const organismFormatted = attrs.ref_organism_formatted || 'Unspecified';
      const isPreferred =
        organism === 'Multiple organisms' ||
        organism === 'Unspecified' ||
        preferredOrganismsSet.has(organism);

      const contactName = attrs.primary_contact_name || attrs.owner_name;

      return {
        dataset_name: attrs.dataset_id,
        display_name: `${userDatasetRecord.displayName}${
          contactName ? ` (${contactName})` : ''
        }`,
        organism_prefix: organismFormatted,
        dataset_id: attrs.dataset_id,
        summary: attrs.summary,
        build_number_introduced: '',
        publications: [],
        searches: displayCategoryOrder
          .filter((categoryName) =>
            getCategorySearchName(
              questionNamesByDatasetAndCategory,
              `${attrs.dataset_id}`,
              categoryName
            )
          )
          .map(
            (categoryName) =>
              displayCategoriesByName[categoryName].shortDisplayName
          )
          .join(' '),
        isPreferred,
        source: 'userdataset' as const,
        is_public: attrs.is_public === 'Public',
        dataset_id_param:
          userDatasetRecord.tables?.ExploreWebsiteSearches?.[0]
            ?.dataset_id_param,
      };
    });
}

function getDisplayCategoryMetadata(
  root: CategoryTreeNode,
  internalQuestions: InternalQuestionRecord[]
) {
  const datasetNamesByQuestion = internalQuestions.reduce(
    (memo, { target_name, dataset_name }) => {
      if (!memo[target_name]) {
        memo[target_name] = [];
      }
      memo[target_name].push(dataset_name);
      return memo;
    },
    {} as Record<string, string[]>
  );

  // Dataset Name => Category Name => Search URL Segment
  const questionNamesByDatasetAndCategory: Record<
    string,
    Record<string, string>
  > = {};

  const displayCategoriesByName: Record<string, DisplayCategory> = {};

  function traverse(
    node: CategoryTreeNode,
    searchCategoryNode?: CategoryTreeNode
  ) {
    const label = getPropertyValue('label', node) || '';
    const scope = getPropertyValues('scope', node) || [];
    const questionName = getPropertyValue('name', node) || '';
    const targetType = getPropertyValue('targetType', node) || '';

    if (
      scope.includes('webservice') &&
      targetType === 'search' &&
      searchCategoryNode
    ) {
      const questionNameWithoutPrefix = questionName.replace(/[^.]*\./, '');
      const datasetNames = datasetNamesByQuestion[questionName] || [];

      if (datasetNames.length > 0) {
        const categoryName = getPropertyValue('name', searchCategoryNode) || '';

        // Add this category to all datasets that use this question
        datasetNames.forEach((datasetName) => {
          questionNamesByDatasetAndCategory[datasetName] = {
            ...questionNamesByDatasetAndCategory[datasetName],
            [categoryName]: questionNameWithoutPrefix,
          };
        });

        displayCategoriesByName[categoryName] = displayCategoriesByName[
          categoryName
        ] || {
          description:
            getPropertyValue('description', searchCategoryNode) || '',
          displayName:
            getPropertyValue('EuPathDB alternative term', searchCategoryNode) ||
            '',
          shortDisplayName:
            getPropertyValue('shortDisplayName', searchCategoryNode) || '',
        };
      }
    }

    const nextSearchCategoryNode = searchCategoryNode
      ? searchCategoryNode
      : label.startsWith('searchCategory')
      ? node
      : undefined;

    node.children.forEach((childNode) =>
      traverse(childNode, nextSearchCategoryNode)
    );
  }

  traverse(root);

  const displayCategoryOrder = Object.keys(displayCategoriesByName).sort();

  return {
    questionNamesByDatasetAndCategory,
    displayCategoriesByName,
    displayCategoryOrder,
  };
}

function getCategorySearchName(
  questionNamesByDatasetAndCategory: ReturnType<
    typeof getDisplayCategoryMetadata
  >['questionNamesByDatasetAndCategory'],
  datasetName: string,
  categoryName: string
) {
  return questionNamesByDatasetAndCategory[datasetName][categoryName];
}

function getCategorySearchUrl(
  questionName: string,
  datasetId: string,
  source: 'datasource' | 'userdataset',
  datasetIdParam: string | undefined,
  internalSearchName: string
): string {
  if (source === 'userdataset' && datasetIdParam) {
    // Strip EDAUD_ prefix for question parameters
    const paramValue = datasetId.replace(/^EDAUD_/, '');
    // For UserDatasets with parameters, format as: catalogPage?params#questionName
    return `${internalSearchName}?param.${datasetIdParam}=${paramValue}#${questionName}`;
  }
  // For DataSources, format as: catalogPage#questionName
  return `${internalSearchName}#${questionName}`;
}

function makeLinkClickHandler(
  submissionMetadata: Props['submissionMetadata'],
  categorySearchName: string,
  selectedSearchName: string,
  setSelectedSearch: (newSearchName: string) => void
) {
  return function (e: React.MouseEvent) {
    if (
      submissionMetadata.type !== 'create-strategy' ||
      categorySearchName === selectedSearchName
    ) {
      e.preventDefault();
    }

    if (categorySearchName !== selectedSearchName) {
      setSelectedSearch(categorySearchName);
    }
  };
}

function OrganismCell(props: { value: string }) {
  const containerRef = useRef<HTMLElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const maxHeight: CSSProperties['maxHeight'] = isExpanded
    ? 'fit-content'
    : '2.5em';
  const isOverflowingV = useIsRefOverflowingVertically(containerRef);
  return (
    <>
      {safeHtml(
        props.value,
        { ref: containerRef, style: { maxHeight, overflow: 'hidden' } },
        'div'
      )}
      {isOverflowingV && (
        <button
          type="button"
          className="link"
          onClick={() => setIsExpanded((v) => !v)}
        >
          {isExpanded ? 'Read less' : 'Read more'}
        </button>
      )}
    </>
  );
}
