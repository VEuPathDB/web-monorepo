import { Tooltip } from '@veupathdb/components/lib/components/widgets/Tooltip';
import { DataGrid } from '@veupathdb/coreui';
import {
  CheckboxList,
  CollapsibleSection,
  LoadingOverlay,
} from '@veupathdb/wdk-client/lib/Components';
import CheckboxTree, {
  LinksPosition,
} from '@veupathdb/coreui/lib/components/inputs/checkboxes/CheckboxTree/CheckboxTree';
import Icon from '@veupathdb/wdk-client/lib/Components/Icon/IconAlt';
import {
  AnchoredTooltip,
  PaginationMenu,
} from '@veupathdb/wdk-client/lib/Components/Mesa';
import { WdkService } from '@veupathdb/wdk-client/lib/Core';
import { WdkDependenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { DEFAULT_STRATEGY_NAME } from '@veupathdb/wdk-client/lib/StoreModules/QuestionStoreModule';
import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import {
  arrayOf,
  decodeOrElse,
  string,
} from '@veupathdb/wdk-client/lib/Utils/Json';
import {
  areTermsInString,
  makeSearchHelpText,
} from '@veupathdb/wdk-client/lib/Utils/SearchUtils';
import {
  getLeaves,
  pruneDescendantNodes,
} from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import {
  StringParam,
  TreeBoxVocabNode,
} from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import {
  NewStepSpec,
  NewStrategySpec,
} from '@veupathdb/wdk-client/lib/Utils/WdkUser';
import {
  OrganismToProject,
  ProjectUrls,
  useOrganismToProject,
  useProjectUrls,
} from '../../hooks/projectUrls';
import { makeEdaRoute } from '../../routes';
import {
  SiteSearchDocument,
  SiteSearchDocumentType,
  SiteSearchDocumentTypeField,
  SiteSearchResponse,
} from '../../SiteSearch/Types';
import {
  add,
  capitalize,
  chunk,
  intersection,
  isEmpty,
  isEqual,
  keyBy,
  memoize,
  orderBy,
  unzip,
  xor,
} from 'lodash';
import React, {
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Link, useHistory } from 'react-router-dom';
import { CellProps, Column } from 'react-table';
import { CommonModal } from '@veupathdb/wdk-client/lib/Components';
import './SiteSearch.scss';
import { usePermissions } from '@veupathdb/study-data-access/lib/data-restriction/permissionsHooks';

interface Props {
  loading: boolean;
  searchString: string;
  response: SiteSearchResponse;
  offset: number;
  numRecords: number;
  documentType?: string;
  hideDocumentTypeClearButton?: boolean;
  filters?: string[];
  filterOrganisms?: string[];
  offerOrganismFilter: boolean;
  organismTree?: TreeBoxVocabNode;
  preferredOrganismsEnabled?: boolean;
  hasUserSetPreferredOrganisms?: boolean;
  onSearch: (searchString: string) => void;
  onPageOffsetChange: (offset: number) => void;
  onDocumentTypeChange: (documentType?: string) => void;
  onFiltersChange: (filters: string[]) => void;
  onOrganismsChange: (organisms: string[]) => void;
  onClearFilters: () => void;
  referenceStrains?: Set<string>;
}

const LARGE_EXPORT_WARNING_THRESHOLD = 50000;

const cx = makeClassNameHelper('SiteSearch');

const cancelIcon = <i className="fa fa-times" />;

function FilterTitleSegment(props: Props) {
  const filters = [
    !isEmpty(props.filters) && 'fields',
    !isEmpty(props.filterOrganisms) && 'organisms',
  ]
    .filter(Boolean)
    .join(' and ');
  return filters.length > 0 ? <em>(filtered by {filters})</em> : null;
}

export default function SiteSearch(props: Props) {
  return (
    <div className={cx()}>
      {props.loading && <LoadingOverlay>Loading results...</LoadingOverlay>}
      <Results {...props} />
    </div>
  );
}

function Results(props: Props) {
  const {
    response,
    documentType,
    filters = [],
    filterOrganisms = [],
    onClearFilters,
  } = props;

  const pStyle = {
    margin: '.5em 0',
  };

  if (
    response.searchResults.totalCount === 0 &&
    documentType == null &&
    filters.length === 0 &&
    filterOrganisms.length === 0
  ) {
    return (
      <>
        <h1>
          <Title {...props} />
        </h1>
        <div style={{ fontSize: '1.2em' }}>
          <p style={pStyle}>Your search returned 0 results.</p>
          <p style={pStyle}>
            Consider using a wildcard to broaden your search. For example,{' '}
            <strong>phospho*</strong> instead of <strong>phospho</strong>.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className={cx('--TitleLine')}>
        <h1>{Title(props)}</h1>
        {response.searchResults.totalCount > 0 &&
          response.documentTypes.some((docType) => docType.isWdkRecordType) && (
            <StrategyLinkout {...props} />
          )}
      </div>
      <div className={cx('--Results')}>
        <Pagination {...props} />
        <div className={cx('--CountsContainer')}>
          <SearchCounts {...props} />
        </div>
        <div className={cx('--ResultContainer')}>
          {response.searchResults.totalCount === 0 ? (
            <div style={{ textAlign: 'center', fontSize: '1.2em' }}>
              <p style={{ fontSize: '1.2em' }}>
                Your <strong>search term</strong> and <strong>filters</strong>{' '}
                did not yield results.
              </p>
              <p>
                Try a different search term, or{' '}
                <button className="link" type="button" onClick={onClearFilters}>
                  clearing your filters
                </button>{' '}
                in the panel on the left.
              </p>
            </div>
          ) : (
            <SearchResult {...props} />
          )}
        </div>
        <Pagination {...props} />
      </div>
    </>
  );
}

function Title(props: Props) {
  const { response, documentType, searchString } = props;

  if (!searchString) {
    return <React.Fragment>No results</React.Fragment>;
  }

  if (response.searchResults.totalCount === 0) {
    return (
      <>
        No results for <strong>{searchString}</strong>
      </>
    );
  }

  if (!documentType) {
    return (
      <React.Fragment>
        All results matching <strong>{searchString}</strong>{' '}
        <FilterTitleSegment {...props} />
      </React.Fragment>
    );
  }

  if (response == null) return null;

  const docType = response.documentTypes.find((d) => d.id === documentType);
  const display = docType?.displayNamePlural ?? capitalize(documentType);

  return (
    <React.Fragment>
      {display} matching <strong>{searchString}</strong>{' '}
      <FilterTitleSegment {...props} />
    </React.Fragment>
  );
}

function ResultInfo(props: Props) {
  const { numRecords, offset, response } = props;
  const { searchResults: result } = response;
  const firstRec = offset + 1;
  const lastRec = Math.min(result.totalCount, offset + numRecords);
  const info =
    result.totalCount === 0
      ? null
      : `${firstRec} - ${lastRec} of ${result.totalCount.toLocaleString()}`;
  return <div className={cx('--ResultInfo')}>{info}</div>;
}

function SearchCounts(props: Props) {
  const {
    searchString,
    response,
    documentType,
    hideDocumentTypeClearButton,
    offerOrganismFilter,
    organismTree,
    filterOrganisms,
    preferredOrganismsEnabled = false,
    onOrganismsChange,
    onDocumentTypeChange,
    referenceStrains,
  } = props;
  const { categories, documentTypes, organismCounts } = response || {};
  const [onlyShowMatches, setOnlyShowMatches] = useState(true);
  const docTypesById = useMemo(
    () => keyBy(documentTypes, 'id'),
    [documentTypes]
  );
  const finalOrganismTree = useMemo(
    () =>
      !offerOrganismFilter || organismTree == null
        ? undefined
        : onlyShowMatches
        ? pruneDescendantNodes(
            (node) =>
              node.children.length > 0 ||
              organismCounts[node.data.term] > 0 ||
              Boolean(
                filterOrganisms && filterOrganisms.includes(node.data.term)
              ),
            organismTree
          )
        : organismTree,
    [offerOrganismFilter, organismTree, organismCounts, onlyShowMatches]
  );
  const showOrganismFilter = !offerOrganismFilter
    ? false
    : documentType == null
    ? documentTypes.some((d) => d.hasOrganismField)
    : docTypesById[documentType]?.hasOrganismField;

  return (
    <div className={cx('--Counts')}>
      <div className={cx('--CountsTitle')}>
        <label className={cx('--OnlyMatchesToggle')}>
          <input
            type="checkbox"
            checked={onlyShowMatches}
            onChange={() => setOnlyShowMatches(!onlyShowMatches)}
          />{' '}
          Hide zero counts
        </label>
      </div>
      <div className={cx('--FilterTitleContainer', 'categories')}>
        <h3>Filter results</h3>
      </div>
      <table className={cx('--SearchCounts')}>
        <tbody>
          {categories.map((category) =>
            onlyShowMatches &&
            category.documentTypes.every(
              (docType) =>
                docTypesById[docType]?.count === 0 && docType !== documentType
            ) ? null : (
              <React.Fragment key={category.name}>
                <tr>
                  <th>{category.name}</th>
                  <th>
                    {documentType &&
                      category.documentTypes.includes(documentType) &&
                      !hideDocumentTypeClearButton && (
                        <div
                          className={cx(
                            '--FilterButtons',
                            documentType == null ? 'hidden' : 'visible'
                          )}
                        >
                          <div>
                            <button
                              type="button"
                              className="link"
                              onClick={() => onDocumentTypeChange()}
                            >
                              Clear filter
                            </button>
                          </div>
                        </div>
                      )}
                  </th>
                </tr>
                {category.documentTypes.map((id) => {
                  const docType = docTypesById[id];
                  if (docType == null) return null;
                  if (
                    onlyShowMatches &&
                    id !== documentType &&
                    docType.count === 0
                  )
                    return null;
                  return (
                    <tr key={docType.id}>
                      <td>
                        {docType.id === documentType ? (
                          docType.displayNamePlural
                        ) : (
                          <button
                            disabled={docType.count === 0}
                            className="link"
                            type="button"
                            onClick={() => onDocumentTypeChange(id)}
                          >
                            {docType.displayNamePlural}
                          </button>
                        )}
                      </td>
                      <td className={docType.count === 0 ? 'muted' : ''}>
                        {docType.count.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </React.Fragment>
            )
          )}
        </tbody>
      </table>
      <WdkRecordFields {...props} onlyShowMatches={onlyShowMatches} />
      {showOrganismFilter && finalOrganismTree && filterOrganisms && (
        <OrganismFilter
          organismTree={finalOrganismTree}
          filterOrganisms={filterOrganisms}
          preferredOrganismsEnabled={preferredOrganismsEnabled}
          response={response}
          onOrganismsChange={onOrganismsChange}
          searchString={searchString}
          onlyShowMatches={onlyShowMatches}
          referenceStrains={referenceStrains}
        />
      )}
    </div>
  );
}

function OrganismFilter(
  props: Required<
    Pick<
      Props,
      | 'organismTree'
      | 'filterOrganisms'
      | 'preferredOrganismsEnabled'
      | 'onOrganismsChange'
      | 'response'
      | 'searchString'
    >
  > &
    Pick<Props, 'referenceStrains'> & { onlyShowMatches: boolean }
) {
  const {
    organismTree,
    filterOrganisms,
    preferredOrganismsEnabled,
    onOrganismsChange,
    response,
    searchString,
    onlyShowMatches,
    referenceStrains,
  } = props;
  const initialExpandedNodes = useMemo(
    () =>
      organismTree.children.length === 1
        ? organismTree.children.map((node) => node.data.term)
        : [],
    [organismTree]
  );
  const [expansion, setExpansion] = useState<string[]>(initialExpandedNodes);
  const [selection, setSelection] = useState<string[]>(filterOrganisms);
  const [filterTerm, setFilterTerm] = useState<string>('');
  const [showOnlyReferenceOrganisms, setShowOnlyReferenceOrganisms] =
    useState<boolean>(false);

  const pendingFilter = !isEqual(selection, filterOrganisms);
  const renderNode = useCallback(
    (node: TreeBoxVocabNode) => {
      const organismName = getNodeId(node);
      const count =
        node.children.length === 0
          ? response.organismCounts[node.data.term] ?? 0
          : getLeaves(node, (node) => node.children)
              .map((node) => response.organismCounts[node.data.term] ?? 0)
              .reduce(add, 0);
      return (
        <div className={cx('--OrganismFilterNode')}>
          <div>
            {node.data.display}{' '}
            {referenceStrains?.has(organismName) && (
              <span style={{ fontSize: '0.9em' }}>
                <strong>[Ref]</strong>
              </span>
            )}
          </div>
          <div>{count.toLocaleString()}</div>
        </div>
      );
    },
    [response]
  );
  const getNodeId = useCallback((node: TreeBoxVocabNode) => node.data.term, []);
  const getNodeChildren = useCallback(
    (node: TreeBoxVocabNode) => node.children,
    []
  );
  const searchPredicate = useCallback(
    (node: TreeBoxVocabNode, searchTerms: string[]) => {
      const organismName = getNodeId(node);
      const display = referenceStrains?.has(organismName)
        ? node.data.display + ' [Ref]'
        : node.data.display;
      return areTermsInString(searchTerms, display);
    },
    []
  );
  const showResetButton = filterOrganisms.length > 0;
  const showApplyCancelButtons = pendingFilter;
  const showButtons = showResetButton || showApplyCancelButtons;

  useEffect(() => {
    setExpansion(initialExpandedNodes);
  }, [initialExpandedNodes]);

  useEffect(() => {
    setSelection(filterOrganisms);
  }, [filterOrganisms, preferredOrganismsEnabled]);

  useEffect(() => {
    setFilterTerm('');
  }, [searchString]);

  const totalOrgsCount = Object.values(response.organismCounts).reduce(add, 0);

  if (onlyShowMatches && filterOrganisms.length === 0 && totalOrgsCount === 0) {
    return (
      <>
        <div className={cx('--FilterTitleContainer', 'organism')}>
          <h3>Filter organisms</h3>
        </div>
        <div>
          <em style={{ color: '#666666' }}>None available</em>
        </div>
      </>
    );
  }

  return (
    <React.Fragment>
      <div className={cx('--FilterTitleContainer', 'organism')}>
        <h3>Filter organisms</h3>
        <div
          className={cx('--FilterButtons', showButtons ? 'visible' : 'hidden')}
        >
          {showApplyCancelButtons ? (
            <React.Fragment>
              <button
                type="button"
                className={cx('--GreenButton') + ' btn'}
                onClick={() => onOrganismsChange(selection)}
              >
                Apply
              </button>
              &nbsp;&nbsp;&nbsp;&nbsp;
              <button
                type="button"
                className={cx('--RedButton') + ' btn'}
                onClick={() => setSelection(filterOrganisms)}
              >
                {cancelIcon}
              </button>
            </React.Fragment>
          ) : showResetButton ? (
            <React.Fragment>
              &nbsp;&nbsp;&nbsp;&nbsp;
              <button
                type="button"
                className="link"
                onClick={() => onOrganismsChange([])}
              >
                Clear filter
              </button>
            </React.Fragment>
          ) : null}
        </div>
      </div>
      <CheckboxTree<TreeBoxVocabNode>
        tree={organismTree}
        getNodeId={getNodeId}
        getNodeChildren={getNodeChildren}
        isSearchable
        searchTerm={filterTerm}
        onSearchTermChange={setFilterTerm}
        searchPredicate={searchPredicate}
        searchBoxHelp={makeSearchHelpText('the list below')}
        searchBoxPlaceholder="Type a taxonomic name"
        renderNode={renderNode}
        expandedList={expansion}
        onExpansionChange={setExpansion}
        shouldExpandDescendantsWithOneChild
        isSelectable
        selectedList={selection}
        filteredList={
          showOnlyReferenceOrganisms && referenceStrains
            ? Array.from(referenceStrains)
            : undefined
        }
        isAdditionalFilterApplied={showOnlyReferenceOrganisms}
        onSelectionChange={setSelection}
        linksPosition={LinksPosition.Top}
        additionalFilters={[
          <Tooltip
            title={
              <span style={{ fontWeight: 'normal' }}>
                Show only reference organisms{' '}
                <span style={{ fontWeight: 'bolder' }}>[Ref]</span>
              </span>
            }
          >
            <label className={cx('--OnlyMatchesToggle')}>
              <input
                style={{ marginRight: '0.25em' }}
                type="checkbox"
                checked={showOnlyReferenceOrganisms}
                onChange={() =>
                  setShowOnlyReferenceOrganisms((value) => !value)
                }
              />
              <span style={{ fontSize: '0.95em' }}>Reference only</span>
            </label>
          </Tooltip>,
        ]}
        styleOverrides={{
          treeSection: {
            ul: {
              padding: 0,
            },
          },
          additionalFilters: {
            container: {
              width: '125px',
              marginLeft: '0.5em',
            },
          },
        }}
      />
    </React.Fragment>
  );
}

function SearchResult(props: Props) {
  const { response } = props;

  const documentTypesById = useMemo(
    () => keyBy(response?.documentTypes, 'id'),
    [response]
  );
  if (response.searchResults.totalCount == 0) {
    return <div>Nothing matched your search. Try something else.</div>;
  }

  const { searchResults: result } = response;
  return (
    <React.Fragment>
      <DirectHit {...props} />
      <div className={cx('--ResultList')}>
        {result.documents.map((document) => (
          <Hit
            key={document.wdkPrimaryKeyString}
            document={document}
            documentType={documentTypesById[document.documentType]}
          />
        ))}
      </div>
    </React.Fragment>
  );
}

interface HitProps {
  document: SiteSearchDocument;
  documentType: SiteSearchDocumentType;
  classNameModifier?: string;
}

function Hit(props: HitProps) {
  const { classNameModifier, document, documentType } = props;
  const { display, summary } = resultDetails(document, documentType);
  const subTitleField = documentType.summaryFields.find((f) => f.isSubtitle);
  const subTitle =
    subTitleField && document.summaryFieldData[subTitleField.name];
  return (
    <div className={cx('--Result', classNameModifier)}>
      <div className={cx('--ResultLink', classNameModifier)}>
        {display.route ? (
          <Link to={display.route} target={display.target}>
            {documentType.displayName} - {display.text}
          </Link>
        ) : display.url ? (
          <a href={display.url} target={display.target}>
            {documentType.displayName} - {display.text}
          </a>
        ) : (
          <span>
            {documentType.displayName} - <strong>{display.text}</strong>
          </span>
        )}
        {subTitle && (
          <div className={cx('--ResultSubTitle')}>
            {formatSummaryFieldValue(subTitle)}
          </div>
        )}
      </div>
      {summary && (
        <div className={cx('--ResultSummary', classNameModifier)}>
          {summary}
        </div>
      )}
      <FieldsHit {...props} />
    </div>
  );
}

function DirectHit(props: Props) {
  const { response, searchString } = props;
  // quote chars to "remove" when comparing
  const quotes = [``, `'`, `"`];
  const docTypeIdsToSkip = ['variableValue'];
  const firstHit = response?.searchResults?.documents[0];
  const firstHitDocType = response?.documentTypes.find(
    (d) => d.id === firstHit?.documentType
  );
  const firstHitIsExact =
    firstHit != null &&
    quotes.some(
      (q) =>
        searchString.toLowerCase() ===
        (q + firstHit.wdkPrimaryKeyString + q).toLowerCase()
    );

  if (
    !response ||
    !firstHit ||
    !firstHitDocType ||
    !firstHitIsExact ||
    docTypeIdsToSkip.includes(firstHitDocType.id)
  )
    return null;

  return (
    <Hit
      classNameModifier="exact"
      document={firstHit}
      documentType={firstHitDocType}
    />
  );
}

function FieldsHit(props: HitProps) {
  const { document, documentType } = props;
  const [expandHighlights, updateExpandHightlights] = useState(false);
  useEffect(() => {
    updateExpandHightlights(false);
  }, [document]);
  const foundInFields = documentType.searchFields.filter(
    (field) => field.name in document.foundInFields
  );
  if (!foundInFields || foundInFields.length === 0) return null;
  const headerContent = expandHighlights ? (
    <strong>Fields matched</strong>
  ) : (
    <div>
      <strong>Fields matched:</strong>&nbsp;
      <em>{foundInFields.map((f) => f.displayName).join('; ')}</em>
    </div>
  );
  return (
    <CollapsibleSection
      className={cx('--FieldsHit')}
      isCollapsed={!expandHighlights}
      onCollapsedChange={(isCollapsed) => updateExpandHightlights(!isCollapsed)}
      headerContent={headerContent}
    >
      <ul>
        {foundInFields.map((f) => (
          <li key={f.name} className={cx('--FieldHighlight')}>
            <strong>{f.displayName}: </strong>
            {document.foundInFields[f.name].flatMap((value, index, array) => (
              <React.Fragment key={value}>
                <HtmlString value={value} />
                {index < array.length - 1 && '...'}
              </React.Fragment>
            ))}
          </li>
        ))}
      </ul>
    </CollapsibleSection>
  );
}

function StrategyLinkout(props: Props) {
  const {
    response,
    documentType,
    filters = [],
    filterOrganisms = [],
    searchString,
    organismTree,
    hasUserSetPreferredOrganisms,
    offerOrganismFilter,
  } = props;
  const docType = response.documentTypes.find((d) => d.id === documentType);
  const question = useWdkService(
    async (wdkService) =>
      docType == null || !docType.isWdkRecordType
        ? undefined
        : wdkService.getQuestionAndParameters(docType.wdkSearchName),
    [docType]
  );
  const [loading, setLoading] = useState(false);

  const isLargeSearchResult =
    response.searchResults.totalCount > LARGE_EXPORT_WARNING_THRESHOLD;
  const [showLargeExportModal, setShowLargeExportModal] = useState(false);

  const history = useHistory();
  const wdkDependencies = useContext(WdkDependenciesContext);
  const onClick = useCallback(
    async (shouldContinueToExport: boolean) => {
      const wdkService = wdkDependencies?.wdkService;

      if (wdkService == null || question == null || docType == null) return;
      if (isLargeSearchResult && !shouldContinueToExport) {
        setShowLargeExportModal(true);
        return;
      }
      setLoading(true);
      const parameters = question.parameters.reduce((parameters, parameter) => {
        let value: string;
        switch (parameter.name) {
          case 'document_type':
            value = docType.id;
            break;
          case 'text_fields':
            value = JSON.stringify(
              docType.searchFields.flatMap((f) =>
                filters.length === 0 || filters.includes(f.name) ? [f.term] : []
              )
            );
            break;
          case 'genes_text_search_organism':
          case 'text_search_organism': {
            if (parameter.type !== 'multi-pick-vocabulary') {
              value = parameter.initialDisplayValue || '';
              break;
            } else {
              // take the intersection of the organism filter selection and the questions's organism param vocabulary
              const organismFilterSelection =
                filterOrganisms.length > 0
                  ? filterOrganisms
                  : makeFullOrganismFilterSelection(
                      response.organismCounts,
                      props.organismTree
                    );

              const searchOrganismList =
                parameter.displayType === 'treeBox'
                  ? getLeaves(
                      parameter.vocabulary,
                      (node) => node.children
                    ).map((n) => n.data.term)
                  : parameter.vocabulary.map(([term]) => term);
              value = JSON.stringify(
                intersection(organismFilterSelection, searchOrganismList)
              );
              break;
            }
          }
          case 'text_expression':
            value = searchString;
            break;
          case 'timestamp':
            value = Date.now().toString();
            break;
          default:
            value = parameter.initialDisplayValue || '';
            break;
        }
        parameters[parameter.name] = value;
        return parameters;
      }, {} as Record<string, string>);

      const stepSpec: NewStepSpec = {
        customName: question.shortDisplayName,
        searchName: question.urlSegment,
        searchConfig: { parameters },
      };
      const stepResp = await wdkService.createStep(stepSpec);
      const strategySpec: NewStrategySpec = {
        stepTree: { stepId: stepResp.id },
        name: DEFAULT_STRATEGY_NAME,
        isSaved: false,
        isPublic: false,
      };
      const strategyResp = await wdkService.createStrategy(strategySpec);
      history.push(`/workspace/strategies/${strategyResp.id}`);
    },
    [
      question,
      docType,
      filters,
      filterOrganisms,
      searchString,
      organismTree,
      response.organismCounts,
    ]
  );

  const moreFilteringModalContent = useMemo(() => {
    if (!showLargeExportModal) return;
    return (
      <CommonModal
        title={
          <>
            <i
              style={{ margin: 'auto 0', marginRight: '0.25em', color: '#CB0' }}
              className="fa fa-warning"
            />
            <span>Large Result</span>
          </>
        }
        onClose={() => setShowLargeExportModal(false)}
      >
        <div
          style={{
            fontSize: '1.1em',
            minWidth: '425px',
          }}
        >
          <p
            style={{
              margin: 0,
            }}
          >
            Your result ({response.searchResults.totalCount.toLocaleString()})
            is large and may result in a timeout or slow response.
          </p>
          <br />
          <p
            style={{
              margin: 0,
            }}
          >
            Consider reducing the size of your result by:
            <ul
              style={{
                marginTop: '0.25em',
              }}
            >
              <li>filtering the result</li>
              <li>adjusting your search term</li>
            </ul>
          </p>
          <br />
          {offerOrganismFilter && !hasUserSetPreferredOrganisms && (
            <p style={{ margin: 0, marginBottom: '1em' }}>
              Large results can also be avoided by setting{' '}
              <Link to="/preferred-organisms">My Organism Preferences</Link> to
              the subset of organisms most relevant to your work.
            </p>
          )}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              columnGap: '1em',
            }}
          >
            <button
              className="btn"
              type="button"
              onClick={() => setShowLargeExportModal(false)}
            >
              Cancel
            </button>
            <button
              className="btn"
              type="button"
              onClick={() => {
                setShowLargeExportModal(false);
                onClick(true);
              }}
            >
              Continue to export
            </button>
          </div>
        </div>
      </CommonModal>
    );
  }, [
    showLargeExportModal,
    hasUserSetPreferredOrganisms,
    response.searchResults.totalCount,
  ]);

  const stringParam = question?.parameters.find(
    (p) => p.name === 'text_expression'
  ) as StringParam | undefined;

  if (docType == null)
    return (
      <StrategyLinkoutLink tooltipContent="To export, select a result type (like Genes) on the left." />
    );
  if (!docType.isWdkRecordType || question == null)
    return (
      <StrategyLinkoutLink
        tooltipContent={`This feature is not available for ${docType.displayNamePlural}`}
      />
    );
  if (stringParam && searchString.length > stringParam.length)
    return (
      <StrategyLinkoutLink tooltipContent="Your search string is too large to export to a strategy. Try a smaller search string." />
    );
  return (
    <StrategyLinkoutLink
      onClick={onClick}
      tooltipContent="Download or data mine using the search strategy system."
      showLargeExportModal={showLargeExportModal}
      loading={loading}
      modalContent={moreFilteringModalContent}
      isLargeSearchResult={isLargeSearchResult}
    />
  );
}
type StrategyLinkoutLinkProps = {
  onClick?: (shouldContinueToExport: boolean) => void;
  tooltipContent: string;
  showLargeExportModal?: boolean;
  loading?: boolean;
  modalContent?: ReactNode;
  isLargeSearchResult?: boolean;
};

function StrategyLinkoutLink(props: StrategyLinkoutLinkProps) {
  const {
    onClick,
    tooltipContent,
    showLargeExportModal = false,
    isLargeSearchResult = false,
    loading,
    modalContent,
  } = props;
  const disabled = loading || onClick == null;

  return (
    <div className={cx('--LinkOut')}>
      {showLargeExportModal && modalContent && modalContent}
      <AnchoredTooltip content={tooltipContent}>
        <button
          disabled={disabled}
          className="btn"
          type="button"
          onClick={() =>
            onClick && (isLargeSearchResult ? onClick(false) : onClick(true))
          }
        >
          <div className={cx('--LinkOutText')}>
            <div>Export as a Search Strategy</div>
            <div>
              <small>to download or mine your results</small>
            </div>
          </div>
          <div className={cx('--LinkOutArrow')}>
            <i className="fa fa-caret-right" />
          </div>
        </button>
      </AnchoredTooltip>
    </div>
  );
}

function WdkRecordFields(props: Props & { onlyShowMatches: boolean }) {
  const {
    response,
    documentType,
    onFiltersChange,
    onlyShowMatches,
    filters = [],
  } = props;
  const docType = response.documentTypes.find((d) => d.id === documentType);
  const allFields = useMemo(
    () =>
      docType?.isWdkRecordType ? docType.searchFields.map((f) => f.name) : [],
    [docType]
  );
  const [selection, setSelection] = useState(filters);
  const fieldCountTotal = response.fieldCounts
    ? Object.values(response.fieldCounts).reduce(add, 0)
    : 0;

  useEffect(() => {
    setSelection(filters);
  }, [filters]);

  if (
    docType == null ||
    docType.searchFields.length === 0 ||
    (filters.length === 0 && onlyShowMatches && fieldCountTotal === 0)
  )
    return (
      <React.Fragment>
        <div className={cx('--FilterTitleContainer', 'widget')}>
          <h3>Filter fields</h3>
        </div>
        <div>
          <em style={{ color: '#666666' }}>
            {docType == null
              ? 'Select a result filter above'
              : 'None available'}
          </em>
        </div>
      </React.Fragment>
    );

  const showApplyCancel = xor(filters, selection).length > 0;
  const showClear = selection.length > 0 && xor(filters, allFields).length > 0;

  return (
    <React.Fragment>
      <div className={cx('--FilterTitleContainer', 'widget')}>
        <h3>Filter {docType.displayName} fields</h3>
        <div className={cx('--FilterButtons')}>
          {showApplyCancel ? (
            <React.Fragment>
              <button
                type="button"
                className={cx('--GreenButton') + ' btn'}
                onClick={() => onFiltersChange(selection)}
              >
                Apply
              </button>
              &nbsp;&nbsp;&nbsp;&nbsp;
              <button
                type="button"
                className={cx('--RedButton') + ' btn'}
                onClick={() => setSelection(filters)}
              >
                {cancelIcon}
              </button>
            </React.Fragment>
          ) : showClear ? (
            <button
              type="button"
              className="link"
              onClick={() => onFiltersChange([])}
            >
              Clear filter
            </button>
          ) : null}
        </div>
      </div>
      <CheckboxList
        items={docType.searchFields
          .filter(
            (field) =>
              filters.includes(field.name) ||
              (onlyShowMatches
                ? response.fieldCounts && response.fieldCounts[field.name] > 0
                : true)
          )
          .map((field) => {
            const display = (
              <div className={cx('--ResultTypeWidgetItem')}>
                <div>{field.displayName}</div>
                {response.fieldCounts && (
                  <div>{response.fieldCounts[field.name].toLocaleString()}</div>
                )}
              </div>
            );
            return {
              display:
                documentType === 'variable' &&
                field.name === 'MULTITEXT__variable_StudyInfo' ? (
                  <Tooltip
                    title="Searches the study name, entity, original variable name, and definition of the variable."
                    interactive
                  >
                    {display}
                  </Tooltip>
                ) : (
                  display
                ),
              value: field.name,
            };
          })}
        value={selection}
        onChange={setSelection}
        linksPosition={CheckboxList.LinksPosition.Top}
      />
    </React.Fragment>
  );
}

function Pagination(props: Props) {
  const { numRecords, offset, response, onPageOffsetChange } = props;
  const { searchResults } = response;
  const totalPages = Math.ceil(searchResults.totalCount / numRecords);
  const currentPage = Math.ceil((offset + 1) / numRecords);
  return (
    <div className={`MesaComponent ${cx('--Pagination')}`}>
      <ResultInfo {...(props as Props)} />
      <PaginationMenu
        totalRows={searchResults.totalCount}
        totalPages={totalPages}
        currentPage={currentPage}
        rowsPerPage={numRecords}
        onPageChange={(newPage: number) => {
          onPageOffsetChange((newPage - 1) * numRecords);
        }}
      />
    </div>
  );
}

interface ResultEntryDetails {
  display: {
    // `route` will take precedence over `url`
    route?: string;
    url?: string;
    text: React.ReactNode;
    target?: string;
  };
  summary: React.ReactNode;
}

// For now, all entries will have a display and a summary
function resultDetails(
  document: SiteSearchDocument,
  documentType: SiteSearchDocumentType
): ResultEntryDetails {
  const projectUrls = useProjectUrls();
  const organismToProject = useOrganismToProject();
  const projectId = useWdkService(
    async (wdkService) => (await wdkService.getConfig()).projectId,
    []
  );

  // wdk records
  if (documentType.isWdkRecordType) {
    return {
      display: makeRecordLink(
        document,
        projectUrls,
        organismToProject,
        projectId
      ),
      summary: makeGenericSummary(document, documentType),
    };
  }

  // eda study
  if (documentType.id === 'dataset') {
    const [datasetId] = document.primaryKey;
    return {
      display: {
        route: `${makeEdaRoute(datasetId)}/new`,
        text: (
          <HtmlString
            value={document.hyperlinkName || document.primaryKey.join(' - ')}
          />
        ),
      },
      summary: makeGenericSummary(document, documentType),
    };
  }

  // eda variable
  if (documentType.id === 'variable') {
    const studyInfoField = 'MULTITEXT__variable_StudyInfo';
    const summaryField = findSummaryField(studyInfoField, documentType);
    return {
      display: {
        text: (
          <HtmlString
            value={document.hyperlinkName || document.primaryKey.join(' - ')}
          />
        ),
      },
      summary: (
        <>
          {makeGenericSummary(document, documentType, {
            [studyInfoField]: () => null,
          })}
          <VariableStudyTable document={document} summaryField={summaryField} />
        </>
      ),
    };
  }

  // eda variable value
  if (documentType.id === 'variableValue') {
    const studyInfoField = 'MULTITEXT__variableValue_All';
    const summaryField = findSummaryField(studyInfoField, documentType);
    return {
      display: {
        text: (
          <HtmlString
            value={document.hyperlinkName || document.primaryKey.join(' - ')}
          />
        ),
      },
      summary: (
        <>
          {makeGenericSummary(document, documentType, {
            MULTITEXT__variableValue_All: () => null,
          })}
          <VariableValueStudyTable
            document={document}
            summaryField={summaryField}
          />
        </>
      ),
    };
  }

  // searches
  if (documentType.id === 'search') {
    const [searchName, recordName] = document.primaryKey;
    return {
      display: {
        route: `/search/${recordName}/${searchName}`,
        text: (
          <HtmlString
            value={document.hyperlinkName || document.primaryKey.join(' - ')}
          />
        ),
      },
      summary: makeGenericSummary(document, documentType),
    };
  }

  // mapveu
  if (documentType.id === 'popbio-sample') {
    return {
      display: {
        url: `/popbio-map/web/?sampleID=${document.primaryKey[0]}`,
        text: (
          <HtmlString
            value={document.hyperlinkName || document.primaryKey.join(' - ')}
          />
        ),
        target: '_blank',
      },
      summary: makeGenericSummary(document, documentType),
    };
  }

  // static content
  if (
    documentType.id === 'news' ||
    documentType.id === 'general' ||
    documentType.id === 'tutorial' ||
    documentType.id === 'workshop-exercise'
  ) {
    // Handle the special case of tutorials that are offered as home page cards
    const route =
      documentType.id === 'tutorial' &&
      document.primaryKey.length === 1 &&
      document.primaryKey[0].startsWith('#')
        ? `/${document.primaryKey[0]}`
        : `/static-content/${document.primaryKey.join('/')}.html`;

    return {
      display: {
        route,
        text: (
          <HtmlString
            value={document.hyperlinkName || document.primaryKey.join(' - ')}
          />
        ),
      },
      summary: makeGenericSummary(document, documentType),
    };
  }

  return {
    display: {
      route: '',
      text: (
        <HtmlString
          value={document.hyperlinkName || document.primaryKey.join(' - ')}
        />
      ),
    },
    summary: makeGenericSummary(document, documentType),
  };
}

function VariableStudyTable(props: {
  document: SiteSearchDocument;
  summaryField: SiteSearchDocumentTypeField;
}) {
  const { document, summaryField } = props;
  return (
    <SummaryTable
      document={document}
      summaryField={summaryField}
      sorting={[{ accessor: 'studyName' }, { accessor: 'entityName' }]}
      columnDefs={[
        {
          accessor: '_',
          header: (
            <div>
              <Icon fa="external-link" /> View
            </div>
          ),
          render: ({ row }) => (
            <Tooltip title="View variable in a new analysis">
              <Link
                to={`${makeEdaRoute(useDatasetId(row.studyId))}/new/variables/${
                  row.entityId
                }/${document.wdkPrimaryKeyString}`}
              >
                <Icon fa="external-link" /> View
              </Link>
            </Tooltip>
          ),
        },
        { accessor: 'studyId' },
        {
          accessor: 'studyName',
          header: 'Study name',
          render: HtmlString,
        },
        { accessor: 'entityId' },
        {
          accessor: 'entityName',
          header: 'Entity',
          render: HtmlString,
        },
        {
          accessor: 'providerLabel',
          header: 'Original variable name',
          render: ({ value }) =>
            decodeOrElse(arrayOf(string), [], value).join(' | '),
        },
        {
          accessor: 'definition',
          header: 'Definition',
          render: HtmlString,
        },
      ]}
    />
  );
}

function VariableValueStudyTable(props: {
  document: SiteSearchDocument;
  summaryField: SiteSearchDocumentTypeField;
}) {
  const { document, summaryField } = props;
  const permissionsResult = usePermissions();
  function makeLink(studyId: string, entityId?: string, variableId?: string) {
    if (permissionsResult.loading) return '';
    const datasetId =
      Object.entries(permissionsResult.permissions.perDataset).find(
        ([_datasetId, entry]) => entry?.studyId === studyId
      )?.[0] ?? studyId;
    const base = makeEdaRoute(datasetId) + '/new';
    if (entityId == null) return base;
    if (variableId == null) return base + `/variables/${entityId}`;
    return base + `/variables/${entityId}/${variableId}`;
  }
  return (
    <SummaryTable
      document={document}
      summaryField={summaryField}
      sorting={[
        { accessor: 'studyName' },
        { accessor: 'entityName' },
        { accessor: 'variableName' },
      ]}
      columnDefs={[
        {
          accessor: '_',
          header: (
            <div>
              <Icon fa="external-link" /> View
            </div>
          ),
          render: ({ row }) => (
            <Tooltip title="View variable in a new analysis">
              <Link to={makeLink(row.studyId, row.entityId, row.variableId)}>
                <Icon fa="external-link" /> View
              </Link>
            </Tooltip>
          ),
        },
        { accessor: 'variableId' },
        { accessor: 'studyId' },
        { accessor: 'entityId' },
        {
          accessor: 'studyName',
          header: 'Study name',
          render: HtmlString,
        },
        {
          accessor: 'entityName',
          header: 'Entity',
          render: HtmlString,
        },
        {
          accessor: 'variableName',
          header: 'Variable name',
          render: HtmlString,
        },
      ]}
    />
  );
}

function makeRecordLink(
  document: SiteSearchDocument,
  projectUrls?: ProjectUrls,
  organismToProject?: OrganismToProject,
  projectId?: string
): ResultEntryDetails['display'] {
  const text = (
    <HtmlString
      value={document.hyperlinkName || document.primaryKey.join(' - ')}
    />
  );
  const route = `/record/${document.documentType}/${document.primaryKey.join(
    '/'
  )}`;

  // use standard link if not in portal, or if no organism present
  if (projectId !== 'EuPathDB' || document.organism == null) {
    return {
      route,
      text,
    };
  }

  // stub url. these are nullish while loading
  if (projectId == null || projectUrls == null || organismToProject == null) {
    return {
      url: '',
      text,
    };
  }

  const documentProject = findDocumentProject(
    organismToProject,
    document.organism
  );
  const baseUrl = documentProject && projectUrls[documentProject];

  // if baseUrl is not found, return standard link. we _could_ throw instead...
  return {
    [baseUrl ? 'url' : 'route']: baseUrl
      ? new URL('app' + route, baseUrl).toString()
      : route,
    text: document.hyperlinkName || document.primaryKey.join(' - '),
  };
}

interface SummaryFieldFormatter {
  (value?: string | string[]): ReactNode;
}

function makeGenericSummary(
  document: SiteSearchDocument,
  documentType: SiteSearchDocumentType,
  customFormmaters: Record<string, SummaryFieldFormatter> = {}
) {
  const summaryFields = documentType.summaryFields.flatMap((summaryField) => {
    if (summaryField.isSubtitle) return [];
    const summaryFieldDataEntry = document.summaryFieldData[summaryField.name];
    const value =
      summaryField.name in customFormmaters
        ? customFormmaters[summaryField.name](summaryFieldDataEntry)
        : formatSummaryFieldValue(summaryFieldDataEntry);
    return value == null ? [] : [{ ...summaryField, value }];
  });

  if (summaryFields.length === 0) return null;

  return (
    <React.Fragment>
      {summaryFields.map(({ name, displayName, value }) => (
        <div key={name} className={cx('--SummaryField')}>
          <strong>{displayName}:</strong>
          {typeof value === 'string' ? <HtmlString value={value} /> : value}
        </div>
      ))}
    </React.Fragment>
  );
}

function HtmlString(props: { value: string }) {
  const { value } = props;
  const formattedValue = useMemo(() => {
    const div = document.createElement('div');
    div.innerHTML = value;
    div
      .querySelectorAll('img, object, iframe')
      .forEach((el) => el.parentElement?.removeChild(el));
    return div.innerHTML;
  }, [value]);
  return <span dangerouslySetInnerHTML={{ __html: formattedValue }} />;
}

function formatSummaryFieldValue(value?: string | string[]) {
  return Array.isArray(value) ? value.join('; ') : value;
}

function findDocumentProject(
  organismToProject: OrganismToProject,
  organismStr: string
): string | undefined {
  // FIXME: Consider updating the service so that the organism field is a string[]
  const organisms = decodeOrElse(arrayOf(string), [], organismStr);

  const representativeOrganism = organisms[0];

  return organismToProject[representativeOrganism];
}

function makeFullOrganismFilterSelection(
  organismCounts: SiteSearchResponse['organismCounts'],
  organismTree: TreeBoxVocabNode | undefined
) {
  // A list of all organisms recognized by the site search service
  const allSiteSearchOrganisms = Object.keys(organismCounts);

  if (organismTree == null) {
    // We could probably throw an error in this case, as we're in a
    // circumstance where:
    // 1. The site search org filter isn't actually offered, yet
    // 2. We're trying to export a strategy with step that has an org param
    return allSiteSearchOrganisms;
  }

  // Otherwise, "allSiteSearchOrganisms" needs to be restricted to organisms offered by the org filter
  const organismFilterLeaves = getLeaves(
    organismTree,
    (node) => node.children
  ).map((node) => node.data.term);

  return intersection(allSiteSearchOrganisms, organismFilterLeaves);
}

const getDatasetsOnce = memoize((wdkService: WdkService) =>
  wdkService.getAnswerJson(
    {
      searchName: 'AllDatasets',
      searchConfig: {
        parameters: {},
      },
    },
    {}
  )
);

function useDatasets() {
  return useWdkService(getDatasetsOnce);
}

function useDatasetId(edaStudyId: string) {
  const permissionsResult = usePermissions();
  if (permissionsResult.loading) return;
  const datasetId = Object.entries(
    permissionsResult.permissions.perDataset
  ).find(([_datasetId, entry]) => entry?.studyId === edaStudyId)?.[0];
  return datasetId ?? edaStudyId;
}

interface ColumnDef<T extends string> {
  accessor: T;
  header?: ReactNode;
  render?(data: { value: string; row: Record<T, string> }): ReactNode;
}

interface SortSpec<T extends string> {
  accessor: T;
  direction?: 'asc' | 'desc';
}

interface SummaryTableProps<T extends string> {
  document: SiteSearchDocument;
  summaryField: SiteSearchDocumentTypeField;
  columnDefs: ColumnDef<T>[];
  sorting: SortSpec<T>[];
}

function SummaryTable<T extends string>(props: SummaryTableProps<T>) {
  const { document, summaryField, columnDefs, sorting } = props;
  const [collapsed, setCollapsed] = useState(true);
  const data = makeStructuredTableData(
    document.summaryFieldData[summaryField.name] as string,
    columnDefs.filter((d) => d.accessor !== '_').map((d) => d.accessor),
    sorting
  );

  const columns = columnDefs
    .filter((d) => d.header)
    .map(
      (d) =>
        ({
          accessor: d.accessor,
          Header: d.header,
          Cell: ({ value, row }: CellProps<Record<T, string>, string>) =>
            d.render ? d.render({ value, row: row.original }) : value,
        } as Column<Record<T, string>>)
    );
  return (
    <CollapsibleSection
      headerContent={
        <strong>
          {summaryField.displayName} ({data.length})
        </strong>
      }
      isCollapsed={collapsed}
      onCollapsedChange={setCollapsed}
    >
      <DataGrid
        columns={columns as Column[]}
        data={data}
        stylePreset="mesa"
        styleOverrides={{
          headerCells: {
            fontSize: '1em',
            padding: '.5em',
            lineBreak: 'normal',
            whiteSpace: 'nowrap',
          },
          dataCells: {
            fontSize: '1em',
            padding: '.5em',
            borderWidth: 1,
            lineBreak: 'normal',
          },
        }}
      />
    </CollapsibleSection>
  );
}

/**
 * Take a JSON string representing a string[], and return an array of objects.
 * The properties of the objects are determined by the accessors array.
 */
function makeStructuredTableData<T extends string>(
  jsonString: string,
  accessors: T[],
  sorting: SortSpec<T>[]
): Record<T, string>[] {
  try {
    const flatData = decodeOrElse(arrayOf(string), [], jsonString);
    const data = chunk(flatData, accessors.length).map((values) => {
      const row = {} as Record<T, string>;
      for (const index in accessors) {
        row[accessors[index]] = values[index];
      }
      return row;
    });
    if (sorting) {
      const [orderKeys, orderDirs] = unzip(
        sorting.map((spec) => [spec.accessor, spec.direction ?? 'asc'])
      );
      return orderBy(
        data,
        orderKeys,
        orderDirs as ('asc' | 'desc')[]
      ) as Record<T, string>[];
    }
    return data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

function findSummaryField(
  summaryFieldName: string,
  documentType: SiteSearchDocumentType
): SiteSearchDocumentTypeField {
  const field = documentType.summaryFields.find(
    (f) => f.name === summaryFieldName
  );
  if (field == null)
    throw new Error(
      `Could not find the summary field "${summaryFieldName} in document type "${documentType.displayName}".`
    );
  return field;
}
