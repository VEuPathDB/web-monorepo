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

import { Loading, Link, HelpIcon } from '@veupathdb/wdk-client/lib/Components';
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

const cx = makeClassNameHelper('wdk-InternalGeneDatasetForm');

type InternalQuestionRecord = {
  target_name: string;
  dataset_id: string;
  target_type: string;
  dataset_name: string;
  record_type: string;
};

type DatasetRecord = {
  dataset_name: string;
  display_name: string;
  organism_prefix: string;
  dataset_id: string;
  summary: string;
  build_number_introduced: string;
  publications: LinkAttributeValue[];
  searches: string;
  isPreferred: boolean;
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

  const [selectedSearch, setSelectedSearch] =
    useState<string | undefined>(searchNameAnchorTag);

  useEffect(() => {
    setSelectedSearch(searchNameAnchorTag);
  }, [searchNameAnchorTag]);

  const [searchName, showingRecordToggle] = selectedSearch
    ? [selectedSearch, true]
    : [internalSearchName, false];

  const [internalQuestion, outputRecordClass, datasetCategory, datasetSubtype] =
    useMemo(
      () =>
        getTableQuestionMetadata(questions, recordClasses, internalSearchName),
      [questions, recordClasses, internalSearchName]
    );

  const serviceResult = useWdkService(
    async (wdkService) => {
      if (
        !questions ||
        !ontology ||
        !outputRecordClass ||
        !datasetCategory ||
        !datasetSubtype
      ) {
        return undefined;
      }

      const answer = await wdkService.getAnswerJson(
        getAnswerSpec(datasetCategory, datasetSubtype),
        REPORT_CONFIG
      );

      const internalQuestions = getInternalQuestions(
        answer,
        outputRecordClass.fullName
      );
      const displayCategoryMetadata = getDisplayCategoryMetadata(
        ontology,
        internalQuestions
      );
      const datasetRecords = getDatasetRecords(
        answer,
        displayCategoryMetadata,
        preferredOrganisms
      );

      return {
        questionNamesByDatasetAndCategory:
          displayCategoryMetadata.questionNamesByDatasetAndCategory,
        displayCategoriesByName:
          displayCategoryMetadata.displayCategoriesByName,
        displayCategoryOrder: displayCategoryMetadata.displayCategoryOrder,
        datasetRecords,
      };
    },
    [
      questions,
      ontology,
      internalSearchName,
      outputRecordClass,
      datasetCategory,
      datasetSubtype,
      preferredOrganisms,
    ]
  );

  const {
    questionNamesByDatasetAndCategory,
    displayCategoriesByName,
    displayCategoryOrder,
    datasetRecords,
  } = serviceResult || {};

  const [showingOneRecord, updateShowingOneRecord] =
    useState(showingRecordToggle);

  const selectedDataSetRecord = useMemo(
    () =>
      getSelectedDataSetRecord(
        datasetRecords,
        questionNamesByDatasetAndCategory,
        searchName
      ),
    [datasetRecords, questionNamesByDatasetAndCategory, searchName]
  );

  const filteredDatasetRecords = useMemo(
    () =>
      getFilteredDatasetRecords(
        datasetRecords,
        displayCategoriesByName,
        showingOneRecord,
        selectedDataSetRecord,
        preferredOrganismsEnabled
      ),
    [
      datasetRecords,
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
    !datasetRecords ||
    !filteredDatasetRecords ? (
    <Loading />
  ) : !internalQuestion ||
    !outputRecordClass ||
    !datasetCategory ||
    !datasetSubtype ? (
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
        <div style={{ display: 'flex', flexWrap: 'wrap', rowGap: '0.25rem' }}>
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
              <span key={categoryName}>
                <span className="bttn bttn-cyan bttn-legend">
                  {displayCategoriesByName[categoryName].shortDisplayName}
                </span>
                <span>{displayCategoriesByName[categoryName].displayName}</span>
              </span>
            </Tooltip>
          ))}
        </div>
      </div>
      <InternalGeneDatasetTable
        searchBoxHeader="Filter Data Sets:"
        emptyResultMessage={
          (
            <OrganismPreferencesWarning
              action="use this page"
              explanation="Your current preferences exclude all organisms used in this page's searches."
            />
          ) as any
        }
        showCount={true}
        rows={
          showingOneRecord || preferredOrganismsEnabled
            ? filteredDatasetRecords
            : datasetRecords
        }
        columns={[
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
            name: 'Data Set',
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
              }: DatasetRecord = cellProps.row;

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
                  <Link to={`/record/dataset/${dataset_id}`}>
                    {safeHtml(display_name)}
                  </Link>
                  {build_number_introduced === buildNumber && (
                    <span className={cx('NewDataset')}></span>
                  )}
                </div>
              );
            },
          },
          {
            key: 'searches',
            name: 'Choose a Search',
            sortable: false,
            renderCell: (cellProps: any) => (
              <>
                {displayCategoryOrder.map((categoryName) => {
                  const datasetName = cellProps.row.dataset_name;
                  const categorySearchName = getCategorySearchName(
                    questionNamesByDatasetAndCategory,
                    datasetName,
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
                          key={categoryName}
                          to={`${internalSearchName}#${categorySearchName}`}
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
              <i className="fa fa-arrow-down" /> Show All Data Sets{' '}
              <i className="fa fa-arrow-down" />
            </>
          ) : (
            <>
              <i className="fa fa-arrow-up" /> Hide All Data Sets{' '}
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
): [
  Question | undefined,
  RecordClass | undefined,
  string | undefined,
  string | undefined
] {
  if (!questions || !recordClasses) {
    return [undefined, undefined, undefined, undefined];
  }

  const internalQuestion = questions.find(
    (question) => question.urlSegment === internalSearchName
  );

  if (!internalQuestion || !internalQuestion.properties) {
    return [undefined, undefined, undefined, undefined];
  }

  const { datasetCategory = [], datasetSubtype = [] } =
    internalQuestion.properties;

  const outputRecordClass = recordClasses.find(
    ({ urlSegment }) => urlSegment === internalQuestion.outputRecordClassName
  );

  return [
    internalQuestion,
    outputRecordClass,
    datasetCategory.join(''),
    datasetSubtype.join(''),
  ];
}

function getSelectedDataSetRecord(
  datasetRecords: DatasetRecord[] | undefined,
  questionNamesByDatasetAndCategory:
    | ReturnType<
        typeof getDisplayCategoryMetadata
      >['questionNamesByDatasetAndCategory']
    | undefined,
  searchName: string
) {
  return !datasetRecords || !questionNamesByDatasetAndCategory
    ? undefined
    : datasetRecords.find(({ dataset_name }) =>
        Object.values(questionNamesByDatasetAndCategory[dataset_name]).includes(
          searchName
        )
      );
}

function getFilteredDatasetRecords(
  datasetRecords: DatasetRecord[] | undefined,
  questionNamesByDatasetAndCategory:
    | ReturnType<
        typeof getDisplayCategoryMetadata
      >['questionNamesByDatasetAndCategory']
    | undefined,
  showingOneRecord: boolean,
  selectedDataSetRecord: DatasetRecord | undefined,
  preferredOrganismsEnabled: boolean
) {
  return !datasetRecords || !questionNamesByDatasetAndCategory
    ? undefined
    : !showingOneRecord
    ? datasetRecords.filter(
        ({ isPreferred }) => !preferredOrganismsEnabled || isPreferred
      )
    : datasetRecords.filter((record) => record === selectedDataSetRecord);
}

function getAnswerSpec(datasetCategory: string, datasetSubtype: string) {
  return {
    searchName: 'DatasetsByCategoryAndSubtype',
    searchConfig: {
      parameters: {
        dataset_category: datasetCategory,
        dataset_subtype: datasetSubtype,
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

function getDatasetRecords(
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
      };
    });
}

function getDisplayCategoryMetadata(
  root: CategoryTreeNode,
  internalQuestions: InternalQuestionRecord[]
) {
  const datasetNamesByQuestion = internalQuestions.reduce(
    (memo, { target_name, dataset_name }) => {
      memo[target_name] = dataset_name;
      return memo;
    },
    {} as Record<string, string>
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
      datasetNamesByQuestion[questionName] &&
      searchCategoryNode
    ) {
      const datasetName = datasetNamesByQuestion[questionName];
      const categoryName = getPropertyValue('name', searchCategoryNode) || '';

      questionNamesByDatasetAndCategory[datasetName] = {
        ...questionNamesByDatasetAndCategory[datasetName],
        [categoryName]: questionName.replace(/[^.]*\./, ''),
      };

      displayCategoriesByName[categoryName] = displayCategoriesByName[
        categoryName
      ] || {
        description: getPropertyValue('description', searchCategoryNode) || '',
        displayName:
          getPropertyValue('EuPathDB alternative term', searchCategoryNode) ||
          '',
        shortDisplayName:
          getPropertyValue('shortDisplayName', searchCategoryNode) || '',
      };
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
