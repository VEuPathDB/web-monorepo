import React, { useEffect, useMemo, useState } from 'react';

import { Props as DefaultQuestionFormProps } from 'wdk-client/Views/Question/DefaultQuestionForm';
import { RouteComponentProps, withRouter } from 'react-router';
import { connect } from 'react-redux';
import { RootState } from 'wdk-client/Core/State/Types';
import { CategoryTreeNode } from 'wdk-client/Utils/CategoryUtils';
import { Question, AttributeValue, LinkAttributeValue } from 'wdk-client/Utils/WdkModel';
import { getPropertyValue, getPropertyValues } from 'wdk-client/Utils/OntologyUtils';
import { Loading, Link, Tooltip, HelpIcon, Tabs } from 'wdk-client/Components';
import { emptyAction } from 'wdk-client/Core/WdkMiddleware';
import { StepAnalysisEnrichmentResultTable as InternalGeneDatasetTable } from 'wdk-client/Core/MoveAfterRefactor/Components/StepAnalysis/StepAnalysisEnrichmentResultTable';
import { Plugin } from 'wdk-client/Utils/ClientPlugin';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';

import './InternalGeneDataset.scss';

const cx = makeClassNameHelper('wdk-InternalGeneDatasetForm');

type StateProps = {
  questions?: Question[],
  ontology?: CategoryTreeNode
};
type OwnProps = DefaultQuestionFormProps & RouteComponentProps<{recordClass: string; question: string;}>;

type Props = OwnProps & StateProps;

type InternalQuestionRecord = { 
  target_name: string, 
  dataset_id: string,
  target_type: string,
  dataset_name: string,
  record_type: string
};

type DatasetRecord = {
  dataset_name: string,
  display_name: string,
  organism_prefix: string,
  dataset_id: string,
  summary: string,
  description: string,
  build_number_introduced: string,
  publications: LinkAttributeValue[],
  searches: string
};

type DisplayCategory = { 
  description: string, 
  displayName: string, 
  shortDisplayName: string 
};

const InternalGeneDatasetView: React.FunctionComponent<Props> = ({
  history,
  location,
  match,
  staticContext,
  questions,
  ontology,
  ...formProps
}) => {
  if (!questions || !ontology) {
    return <Loading />;
  }

  const searchNameHash = history.location.hash.slice(1);

  const [ internalSearchName, searchName, showingRecordToggle ] = searchNameHash
    ? [ match.params.question, searchNameHash, true ]
    : [ match.params.question, match.params.question, false ];

  const [ datasetCategory, datasetSubtype ] = useMemo(() => {
    const question = questions.find(question => question.urlSegment === internalSearchName);

    if (!question || !question.properties) {
      return [ '', '' ];
    }

    const {
      datasetCategory = [],
      datasetSubtype = []
    } = question.properties;

    return [
      datasetCategory.join(''),
      datasetSubtype.join('')
    ];
  }, [ internalSearchName, searchName ]);

  const [ questionNamesByDatasetAndCategory, updateQuestionNamesByDatasetAndCategory ] = useState<Record<string, Record<string, string>> | null>(null);
  const [ displayCategoriesByName, updateDisplayCategoriesByName ] = useState<Record<string, DisplayCategory> | null>(null);
  const [ displayCategoryOrder, updateDisplayCategoryOrder ] = useState<string[] | null>(null);
  const [ datasetRecords, updateDatasetRecords ] = useState<DatasetRecord[] | null>(null);
  const [ showingOneRecord, updateShowingOneRecord ] = useState(showingRecordToggle);

  const selectedDataSetRecord = useMemo(
    () => !datasetRecords || !questionNamesByDatasetAndCategory
      ? null
      : datasetRecords.find(
        ({ dataset_name }) =>
          Object.values(questionNamesByDatasetAndCategory[dataset_name]).includes(searchName)
      ), 
    [ datasetRecords, questionNamesByDatasetAndCategory, searchName ]
  );

  const filteredDatasetRecords = useMemo(
    () => !datasetRecords || !questionNamesByDatasetAndCategory
      ? null
      : !showingOneRecord
      ? datasetRecords
      : datasetRecords.filter(record => record === selectedDataSetRecord), 
    [ datasetRecords, showingOneRecord, selectedDataSetRecord ]
  );
  
  useEffect(() => {
    formProps.dispatchAction(({ wdkService }) => {
      wdkService.getAnswerJson(
        {
          searchName: 'DatasetsByCategoryAndSubtype',
          searchConfig: {
            parameters: {
              dataset_category: datasetCategory,
              dataset_subtype: datasetSubtype
            }
          }
        }, 
        {
          attributes: [
            "dataset_name",
            "display_name",
            "organism_prefix",
            "short_attribution",
            "dataset_id", 
            "summary",
            "description",
            "build_number_introduced"
          ],
          tables: [
            "References",
            "Publications"
          ],
          pagination: {
            "offset": 0,
            "numRecords": -1
          }
        }
      ).then(answer => {
        const internalQuestions = answer.records
          .flatMap(
            ({ tables: { References } }) => References
          )
          .filter(
            (reference): reference is Record<string, AttributeValue> => 
              reference !== null && 
              reference.target_type === 'question' && 
              reference.record_type === formProps.state.recordClass.fullName
          ).map(
            ({ target_name, dataset_id, target_type, dataset_name, record_type }) =>
              ({ 
                target_name: `${target_name}`, 
                dataset_id: `${dataset_id}`, 
                target_type: `${target_type}`, 
                dataset_name: `${dataset_name}`, 
                record_type: `${record_type}`
              })
          );

        const { 
          questionNamesByDatasetAndCategory, 
          displayCategoriesByName, 
          displayCategoryOrder 
        } = getDisplayCategoryMetadata(ontology, internalQuestions);

        const datasetRecords = answer.records
          .filter(
            ({ attributes: { dataset_name } }) => 
              Object.keys(questionNamesByDatasetAndCategory[`${dataset_name}`] || {}).length > 0
            )
          .map(
            (
              { 
                attributes: {
                  dataset_name,
                  display_name,
                  organism_prefix,
                  short_attribution,
                  dataset_id, 
                  summary,
                  description,
                  build_number_introduced
                },
                tables: {
                  Publications
                }
              }
            ) => ({
              dataset_name: `${dataset_name}`,
              display_name: `${display_name} (${short_attribution})`,
              organism_prefix: `${organism_prefix}`,
              dataset_id: `${dataset_id}`,
              summary: `${summary}`,
              description: `${description}`,
              build_number_introduced: `${build_number_introduced}`,
              publications: Publications.map(
                ({ pubmed_link }) => pubmed_link === null || typeof pubmed_link === 'string'
                  ? {
                    url: '',
                    displayText: ''
                  }
                  : pubmed_link
              ),
              searches: displayCategoryOrder
                .filter(categoryName => questionNamesByDatasetAndCategory[`${dataset_name}`][categoryName])
                .map(categoryName => displayCategoriesByName[categoryName].shortDisplayName)
                .join(' ')
            }),
          );

        updateQuestionNamesByDatasetAndCategory(questionNamesByDatasetAndCategory);
        updateDisplayCategoriesByName(displayCategoriesByName);
        updateDisplayCategoryOrder(displayCategoryOrder);
        updateDatasetRecords(datasetRecords);
      });

      return emptyAction;
    });
  }, [ datasetCategory, datasetSubtype ]);

  return (
    !questionNamesByDatasetAndCategory ||
    !displayCategoriesByName ||
    !displayCategoryOrder ||
    !datasetRecords ||
    !filteredDatasetRecords
  )
    ? <Loading />
    : (
      <div className={cx()}>
        <div className={cx('Legend')}>
          <span>
            Legend:
          </span>
          {
            displayCategoryOrder.map(
              categoryName =>
                  <Tooltip
                    key={categoryName}
                    content={
                      <div>
                        <h4>
                          {displayCategoriesByName[categoryName].displayName}
                        </h4>
                        {displayCategoriesByName[categoryName].description}
                      </div>
                    }
                  >
                    <span key={categoryName}>
                      <span className="bttn bttn-cyan bttn-active">
                        {displayCategoriesByName[categoryName].shortDisplayName}
                      </span>
                      <span>
                        {displayCategoriesByName[categoryName].displayName}
                      </span>
                    </span>
                  </Tooltip>
            )
          }
        </div>
        <InternalGeneDatasetTable
          emptyResultMessage=""
          rows={
            showingOneRecord
              ? filteredDatasetRecords
              : datasetRecords
          }
          columns={
            [
              {
                key: 'organism_prefix',
                name: 'Organism',
                type: 'html',
                sortable: true,
                sortType: 'htmlText',
                // width: '20%',
                helpText: 'Organism data is aligned to'
              },
              {
                key: 'display_name',
                name: 'Data Set',
                type: 'html',
                sortable: true,
                sortType: 'htmlText',
                // width: '60%',
                renderCell: (cellProps: any) => {
                  const { display_name, summary, publications }: { display_name: string, summary: string, publications: LinkAttributeValue[] } 
                    = cellProps.row;

                  return (
                    <div>
                      <HelpIcon>
                        <div>
                          <h4>Summary</h4>
                          <div dangerouslySetInnerHTML={{ __html: summary}} />
                          {
                            publications.length > 0 && (
                              <>
                                <h4>Publications</h4>
                                <ul>
                                  {
                                    publications.map(
                                      ({ url, displayText }) =>
                                        <li key={url}>
                                          <a href={url} target="_blank">{displayText || url}</a>
                                        </li>
                                    )
                                  }
                                </ul>
                              </>
                            )
                          }
                        </div>
                      </HelpIcon>
                      {' '}
                      {display_name}
                    </div>
                  );
                }
              },
              {
                key: 'Searches',
                name: 'Choose a Search',
                sortable: false,
                // width: '20%',
                renderCell: (cellProps: any) =>
                  <div>
                    {
                      displayCategoryOrder.map(
                        categoryName => {
                          const datasetName = cellProps.row.dataset_name;
                          const categorySearchName = questionNamesByDatasetAndCategory[datasetName][categoryName];

                          return (
                              <span key={categoryName}>
                                {
                                  categorySearchName && (
                                    <Link 
                                      className={
                                        categorySearchName === searchName
                                          ? "bttn bttn-cyan bttn-active"
                                          : "bttn bttn-cyan"
                                      } 
                                      key={categoryName} 
                                      to={`${internalSearchName}#${categorySearchName}`}
                                    >
                                      {displayCategoriesByName[categoryName].shortDisplayName}
                                    </Link>
                                  )
                                }
                              </span>
                            );
                        }
                      )
                    }
                  </div>
              }
            ]
          }
          initialSortColumnKey="organism_prefix"
          fixedTableHeader
        />
        {
          showingRecordToggle && (
            <div 
              className={cx('RecordToggle')}
              onClick={() => updateShowingOneRecord(!showingOneRecord)}
            >
              {
                showingOneRecord
                  ? (
                    <>
                      <i className="fa fa-arrow-down" />
                      {' '}
                      Show All Data Sets
                      {' '}
                      <i className="fa fa-arrow-down" />
                    </>
                  )
                  : (
                    <>
                      <i className="fa fa-arrow-up" />
                      {' '}
                      Hide All Data Sets
                      {' '}
                      <i className="fa fa-arrow-up" />
                    </>
                  )
              }
            </div>            
          )
        }
        {
          selectedDataSetRecord && (
            <Tabs
              tabs={
                displayCategoryOrder
                  .filter(
                    categoryName => questionNamesByDatasetAndCategory[selectedDataSetRecord.dataset_name][categoryName]
                  )
                  .map(
                    categoryName => ({
                      key: questionNamesByDatasetAndCategory[selectedDataSetRecord.dataset_name][categoryName],
                      display: (
                        <Link to={`${internalSearchName}#${questionNamesByDatasetAndCategory[selectedDataSetRecord.dataset_name][categoryName]}`}>
                          {displayCategoriesByName[categoryName].displayName}
                        </Link>
                      ),
                      content: (
                        <Plugin
                          context={{
                            type: 'questionForm',
                            name: searchName,
                            searchName,
                            recordClassName: formProps.state.recordClass.urlSegment
                          }}
                          pluginProps={formProps}
                        />
                      )
                    })
                  )
              }
              activeTab={searchName}
              onTabSelected={() => {}}
            />
          )
        }
      </div>
    );
};

function getDisplayCategoryMetadata(root: CategoryTreeNode, internalQuestions: InternalQuestionRecord[]) {
  const datasetNamesByQuestion = internalQuestions.reduce(
    (memo, { target_name, dataset_name }) => {
      memo[target_name] = dataset_name;
      return memo;
    },
    {} as Record<string, string>
  );

  // Dataset Name => Category Name => Search URL Segment
  const questionNamesByDatasetAndCategory: Record<string, Record<string, string>> = {};

  const displayCategoriesByName: Record<string, DisplayCategory> = {};

  function traverse(node: CategoryTreeNode, searchCategoryNode?: CategoryTreeNode) {  
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
        [categoryName]: questionName.replace(/[^.]*\./, '')
      };

      displayCategoriesByName[categoryName] = displayCategoriesByName[categoryName] || {
        description: getPropertyValue('description', searchCategoryNode) || '',
        displayName: getPropertyValue('EuPathDB alternative term', searchCategoryNode) || '',
        shortDisplayName: getPropertyValue('shortDisplayName', searchCategoryNode) || ''
      };
    }

    const nextSearchCategoryNode = searchCategoryNode
      ? searchCategoryNode
      : label.startsWith('searchCategory')
      ? node
      : undefined;

    node.children.forEach(
      childNode => traverse(childNode, nextSearchCategoryNode)
    );
  }

  traverse(root);

  const displayCategoryOrder = Object.keys(displayCategoriesByName).sort();

  return {
    questionNamesByDatasetAndCategory, 
    displayCategoriesByName, 
    displayCategoryOrder
  };
}

export const InternalGeneDataset = connect<StateProps, {}, OwnProps, RootState>(
    (state, ownProps) => ({ 
      ...ownProps, 
      questions: state.globalData.questions, 
      ontology: state.globalData.ontology
        ? state.globalData.ontology.tree
        : undefined
    })
  )(
    withRouter(InternalGeneDatasetView)
  );
