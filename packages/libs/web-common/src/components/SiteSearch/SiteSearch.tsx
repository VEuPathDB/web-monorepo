import { capitalize, keyBy, add, isEmpty, isEqual, xor, intersection } from 'lodash';
import React, { useMemo, useState, useCallback, useContext, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { CheckboxTree, CheckboxList, CollapsibleSection, LoadingOverlay } from '@veupathdb/wdk-client/lib/Components';
import { PaginationMenu, AnchoredTooltip } from '@veupathdb/wdk-client/lib/Components/Mesa';
import { WdkDepdendenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { makeClassNameHelper, safeHtml } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { arrayOf, decodeOrElse, string } from '@veupathdb/wdk-client/lib/Utils/Json';
import { areTermsInString, makeSearchHelpText } from '@veupathdb/wdk-client/lib/Utils/SearchUtils';
import { getLeaves, pruneDescendantNodes } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import { TreeBoxVocabNode, StringParam } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { useProjectUrls, ProjectUrls, useOrganismToProject, OrganismToProject } from 'ebrc-client/hooks/projectUrls';
import { SiteSearchResponse, SiteSearchDocumentType, SiteSearchDocument } from 'ebrc-client/SiteSearch/Types';
import { NewStrategySpec, NewStepSpec } from '@veupathdb/wdk-client/lib/Utils/WdkUser';
import { DEFAULT_STRATEGY_NAME } from '@veupathdb/wdk-client/lib/StoreModules/QuestionStoreModule';

import './SiteSearch.scss';

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
  onSearch: (searchString: string) => void;
  onPageOffsetChange: (offset: number) => void;
  onDocumentTypeChange: (documentType?: string) => void;
  onFiltersChange: (filters: string[]) => void;
  onOrganismsChange: (organisms: string[]) => void;
  onClearFilters: () => void;
}

const cx = makeClassNameHelper('SiteSearch');

const cancelIcon = <i className="fa fa-times"/>;

function FilterTitleSegment(props: Props) {
  const filters = [ !isEmpty(props.filters) && 'fields', !isEmpty(props.filterOrganisms) && 'organisms' ].filter(Boolean).join(' and ');
  return filters.length > 0 ? <em>(filtered by {filters})</em> : null;
}

export default function SiteSearch(props: Props) {

  return (
    <div className={cx()}>
      {props.loading && <LoadingOverlay>Loading results...</LoadingOverlay>}
      <Results {...props} />
    </div>
  )
}

function Results(props: Props) {
  const { response, documentType, filters = [], filterOrganisms = [] } = props;

  if (response.searchResults.totalCount === 0 && documentType == null && filters.length === 0 && filterOrganisms.length === 0) {
    return (
      <>
        <h1><Title {...props}/></h1>
        <div style={{ fontSize: '1.1em' }}>
          <p style={{ fontSize: '1.1em' }}>Your search returned 0 results. <br/> Consider using a wildcard to broaden your search.  
                                           <br/>Examples:  use A0A509AH24* instead of A0A509AH24   OR   phospho* instead of phospho.</p>
        </div>

      </>
    );
  }

  return (
    <>
      <div className={cx('--TitleLine')}>
        <h1>{Title(props)}</h1>
        {response.searchResults.totalCount > 0 && <StrategyLinkout {...props}/>}
      </div>
      <div className={cx('--Results')}>
        <Pagination {...props} />
        <div className={cx('--CountsContainer')}>
          <SearchCounts {...props}/>
        </div>
        <div className={cx('--ResultContainer')}>
          {response.searchResults.totalCount === 0
            ? (
              <div style={{ textAlign: 'center', fontSize: '1.2em' }}>
                <p style={{ fontSize: '1.2em' }}>Your search term and filters did not yield results.</p>
                <p>Try a different search term, or clearing your filters in the panel on the left.</p>
              </div>
            )
            : <SearchResult {...props} />
          }
        </div>
        <Pagination {...props}/>
      </div>
    </>
  )
}

function Title(props: Props) {
  const { response, documentType, searchString } = props;

  if (!searchString) {
    return <React.Fragment>No results</React.Fragment>
  }

  if (response.searchResults.totalCount === 0) {
    return <>No results for <strong>{searchString}</strong></>
  }

  if (!documentType) {
    return <React.Fragment>All results matching <strong>{searchString}</strong> <FilterTitleSegment {...props} /></React.Fragment>
  }

  if (response == null) return null;

  const docType = response.documentTypes.find(d => d.id === documentType);
  const display = docType?.displayNamePlural ?? capitalize(documentType);

  return <React.Fragment>{display} matching <strong>{searchString}</strong> <FilterTitleSegment {...props} /></React.Fragment>
}

function ResultInfo(props: Props) {
  const { numRecords, offset, response } = props;
  const { searchResults: result } = response;
  const firstRec = offset + 1;
  const lastRec = Math.min(result.totalCount, offset + numRecords);
  const info = result.totalCount === 0 ? null : `${firstRec} - ${lastRec} of ${result.totalCount.toLocaleString()}`;
  return (
    <div className={cx('--ResultInfo')}>
      {info}
    </div>
  )
}

function SearchCounts(props: Props) {
  const { searchString, response, documentType, hideDocumentTypeClearButton, offerOrganismFilter, organismTree, filterOrganisms, preferredOrganismsEnabled = false, onOrganismsChange, onDocumentTypeChange } = props;
  const { categories, documentTypes, organismCounts } = response || {};
  const [ onlyShowMatches, setOnlyShowMatches ] = useState(true);
  const docTypesById = useMemo(() => keyBy(documentTypes, 'id'), [ documentTypes ]);
  const finalOrganismTree = useMemo(() => (
    !offerOrganismFilter || organismTree == null
      ? undefined
      : onlyShowMatches
      ? pruneDescendantNodes(
          node => node.children.length > 0 || organismCounts[node.data.term] > 0 || Boolean(filterOrganisms && filterOrganisms.includes(node.data.term)),
          organismTree
        )
      : organismTree
    ), [ offerOrganismFilter, organismTree, organismCounts, onlyShowMatches ]);
  const showOrganismFilter = !offerOrganismFilter
    ? false
    : documentType == null
    ? documentTypes.some(d => d.hasOrganismField)
    : docTypesById[documentType]?.hasOrganismField;

  return (
    <div className={cx('--Counts')}>
      <div className={(cx('--CountsTitle'))}>
        <label className={cx('--OnlyMatchesToggle')}>
          <input type="checkbox" checked={onlyShowMatches} onChange={() => setOnlyShowMatches(!onlyShowMatches)}/> Hide zero counts
        </label>
      </div>
      <div className={cx('--FilterTitleContainer', 'categories')}>
        <h3>Filter results</h3>
      </div>
      <table className={cx('--SearchCounts')}>
        <tbody>
          {categories.map(category => (
            (onlyShowMatches && category.documentTypes.every(docType => docTypesById[docType]?.count === 0 && docType !== documentType))
          ) ? null : (
            <React.Fragment key={category.name}>
              <tr>
                <th>{category.name}</th>
                <th>
                  {documentType && category.documentTypes.includes(documentType) && !hideDocumentTypeClearButton && (
                    <div className={cx('--FilterButtons', documentType == null ? 'hidden' : 'visible')}>
                      <div><button type="button" className="link" onClick={() => onDocumentTypeChange()}>Clear filter</button></div>
                    </div>
                  )}
                </th>
              </tr>
              {category.documentTypes.map(id => {
                const docType = docTypesById[id];
                if (docType == null) return null;
                if (onlyShowMatches && id !== documentType && docType.count === 0) return null;
                return (
                  <tr key={docType.id}>
                    <td>
                      {docType.id === documentType
                        ? docType.displayNamePlural
                        : <button disabled={docType.count === 0} className="link" type="button" onClick={() => onDocumentTypeChange(id)}>{docType.displayNamePlural}</button>}
                    </td>
                    <td className={docType.count === 0 ? 'muted' : ''}>{docType.count.toLocaleString()}</td>
                  </tr>
                );
              })}
            </React.Fragment>
          ))}
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
        />
      )}
    </div>
  )
}

function OrganismFilter(props: Required<Pick<Props, 'organismTree' | 'filterOrganisms' | 'preferredOrganismsEnabled' | 'onOrganismsChange' | 'response' | 'searchString'>> & { onlyShowMatches: boolean }) {
  const { organismTree, filterOrganisms, preferredOrganismsEnabled, onOrganismsChange, response, searchString, onlyShowMatches } = props;
  const initialExpandedNodes = useMemo(() => organismTree.children.length === 1 ? organismTree.children.map(node => node.data.term) : [], [ organismTree ]);
  const [ expansion, setExpansion ] = useState<string[]>(initialExpandedNodes);
  const [ selection, setSelection ] = useState<string[]>(filterOrganisms);
  const [ filterTerm, setFilterTerm ] = useState<string>('');
  const pendingFilter = !isEqual(selection, filterOrganisms);
  const renderNode = useCallback((node: TreeBoxVocabNode) => {
    const count = node.children.length === 0
      ? response.organismCounts[node.data.term] ?? 0
      : getLeaves(node, node => node.children)
        .map(node => response.organismCounts[node.data.term] ?? 0)
        .reduce(add, 0);
    return (
      <div className={cx('--OrganismFilterNode')}>
        <div>{node.data.display}</div>
        <div>{count.toLocaleString()}</div>
      </div>
    )
  }, [ response ]);
  const getNodeId = useCallback((node: TreeBoxVocabNode) => node.data.term, []);
  const getNodeChildren = useCallback((node: TreeBoxVocabNode) => node.children, []);
  const searchPredicate = useCallback((node: TreeBoxVocabNode, searchTerms: string[]) => {
    return areTermsInString(searchTerms, node.data.display);
  }, []);
  const showResetButton = filterOrganisms.length > 0;
  const showApplyCancelButtons = pendingFilter;
  const showButtons = showResetButton || showApplyCancelButtons;

  useEffect(() => {
    setExpansion(initialExpandedNodes);
  }, [ initialExpandedNodes ]);

  useEffect(() => {
    setSelection(filterOrganisms);
  }, [ filterOrganisms, preferredOrganismsEnabled ]);

  useEffect(() => {
    setFilterTerm('');
  }, [ searchString ]);

  const totalOrgsCount = Object.values(response.organismCounts).reduce(add, 0);

  if (onlyShowMatches && filterOrganisms.length === 0 && totalOrgsCount === 0) {
    return (
      <>
        <div className={cx('--FilterTitleContainer', 'organism')}>
          <h3>Filter organisms</h3>
        </div>
        <div><em style={{ color: '#666666' }}>None available</em></div>
      </>
    );
  }

  return (
    <React.Fragment>
      <div className={cx('--FilterTitleContainer', 'organism')}>
        <h3>Filter organisms</h3>
        <div className={cx('--FilterButtons', showButtons ? 'visible' : 'hidden')}>
          {showApplyCancelButtons ? (
            <React.Fragment>
              <button type="button" className={cx('--GreenButton') + ' btn'} onClick={() => onOrganismsChange(selection)}>Apply</button>
              &nbsp;&nbsp;&nbsp;&nbsp;
              <button type="button" className={cx('--RedButton') + ' btn'} onClick={() => setSelection(filterOrganisms)}>{cancelIcon}</button>
            </React.Fragment>
          ) : showResetButton ? (
            <React.Fragment>
              &nbsp;&nbsp;&nbsp;&nbsp;
              <button type="button" className="link" onClick={() => (onOrganismsChange([]))}>Clear filter</button>
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
        searchBoxHelp={makeSearchHelpText("the list below")}
        searchBoxPlaceholder="Type a taxonomic name"
        renderNode={renderNode}
        expandedList={expansion}
        onExpansionChange={setExpansion}
        shouldExpandDescendantsWithOneChild
        isSelectable
        selectedList={selection}
        onSelectionChange={setSelection}
        linksPosition={CheckboxTree.LinkPlacement.Top}
      />
    </React.Fragment>
  )
}

function SearchResult(props: Props) {
  const { response } = props;

  const documentTypesById = useMemo(() => keyBy(response?.documentTypes, 'id'), [ response]);
  if (response.searchResults.totalCount == 0) {
    return (
      <div>Nothing matched your search. Try something else.</div>
    )
  }

  const { searchResults: result } = response;
  return (
    <React.Fragment>
      <DirectHit {...props}/>
      <div className={cx('--ResultList')}>
        {result.documents.map((document, index) => (
          <Hit
            key={index}
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
  const { link, summary } = resultDetails(document, documentType);
  const subTitleField = documentType.summaryFields.find(f => f.isSubtitle);
  const subTitle = subTitleField && document.summaryFieldData[subTitleField.name];
  return (
    <div className={cx('--Result', classNameModifier)}>
      <div className={cx('--ResultLink', classNameModifier)}>
        {link.isRoute ?
          <Link to={link.url} target={link.target}>{documentType.displayName} - {link.text}</Link> :
          <a href={link.url} target={link.target}>{documentType.displayName} - {link.text}</a>}
        {subTitle && <div className={cx('--ResultSubTitle')}>{formatSummaryFieldValue(subTitle)}</div>}
      </div>
      {summary && <div className={cx('--ResultSummary', classNameModifier)}>{summary}</div>}
      <FieldsHit {...props}/>
    </div>
  )
}

function DirectHit(props: Props) {
  const { response, searchString } = props;
  // quote chars to "remove" when comparing
  const quotes = [``, `'`, `"`];
  const firstHit = response?.searchResults?.documents[0];
  const firstHitDocType = response?.documentTypes.find(d => d.id === firstHit?.documentType);
  const firstHitIsExact = firstHit != null && quotes.some(q => searchString.toLowerCase() === (q + firstHit.wdkPrimaryKeyString + q).toLowerCase());

  if (!response || !firstHit || !firstHitDocType || !firstHitIsExact) return null;

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
  const [ expandHighlights, updateExpandHightlights ] = useState(false);
  useEffect(() => {
    updateExpandHightlights(false);
  }, [ document ])
  const foundInFields = documentType.searchFields
    .filter(field => field.name in document.foundInFields);
  if (!foundInFields || foundInFields.length === 0) return null;
  const headerContent = expandHighlights
    ? <strong>Fields matched</strong>
    : <div>
        <strong>Fields matched:</strong>&nbsp;
        <em>{foundInFields.map(f => f.displayName).join('; ')}</em>
      </div>
  return (
    <CollapsibleSection
      className={cx('--FieldsHit')}
      isCollapsed={!expandHighlights}
      onCollapsedChange={isCollapsed => updateExpandHightlights(!isCollapsed)}
      headerContent={headerContent}
    >
      <ul>
        {foundInFields.map(f => (
          <li key={f.name} className={cx('--FieldHighlight')}>
            <strong>{f.displayName}: </strong>
            {document.foundInFields[f.name].flatMap((value, index, array) =>
              [ safeHtml(value, { key: index }), index < array.length - 1 && '...' ]
              )}
          </li>
        ))}
      </ul>
    </CollapsibleSection>
  )
}

function StrategyLinkout(props: Props) {
  const { response, documentType, filters = [], filterOrganisms = [], searchString, organismTree } = props;
  const docType = response.documentTypes.find(d => d.id === documentType);
  const question = useWdkService(async wdkService =>
    docType == null || !docType.isWdkRecordType ? undefined :
    wdkService.getQuestionAndParameters(docType.wdkSearchName), [ docType ]);

  const history = useHistory();
  const wdkDependencies = useContext(WdkDepdendenciesContext);
  const onClick = useCallback(async () => {
    const wdkService = wdkDependencies?.wdkService;

    if (wdkService == null || question == null || docType == null) return;
    const parameters = question.parameters.reduce((parameters, parameter) => {
      let value: string;
      switch(parameter.name) {
        case 'document_type':
          value = docType.id;
          break;
        case 'text_fields':
          value = JSON.stringify(docType.searchFields.flatMap(f =>
            filters.length === 0 || filters.includes(f.name) ? [ f.term ] : []));
          break;
        case 'genes_text_search_organism':
        case 'text_search_organism': 
        {
          if (parameter.type !== 'multi-pick-vocabulary') {
            value = parameter.initialDisplayValue || '';
            break;
          }
          else {
            // take the intersection of the organism filter selection and the questions's organism param vocabulary
            const organismFilterSelection = filterOrganisms.length > 0
              ? filterOrganisms
              : makeFullOrganismFilterSelection(
                  response.organismCounts,
                  props.organismTree
                );

            const searchOrganismList = parameter.displayType === 'treeBox' ? getLeaves(parameter.vocabulary, node => node.children).map(n => n.data.term)
              : parameter.vocabulary.map(([ term ]) => term);
            value = JSON.stringify(intersection(organismFilterSelection, searchOrganismList));
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
      searchConfig: {parameters }
    };
    const stepResp = await wdkService.createStep(stepSpec);
    const strategySpec: NewStrategySpec = {
      stepTree: { stepId: stepResp.id },
      name: DEFAULT_STRATEGY_NAME,
      isSaved: false,
      isPublic: false
    };
    const strategyResp = await wdkService.createStrategy(strategySpec);
    history.push(`/workspace/strategies/${strategyResp.id}`);
  }, [question, docType, filters, filterOrganisms, searchString, organismTree, response.organismCounts]);

  const stringParam = question?.parameters.find(p => p.name === 'text_expression') as StringParam | undefined;

  if (docType == null) return <StrategyLinkoutLink tooltipContent="To export, select a result type (like Genes) on the left."/>
  if (!docType.isWdkRecordType || question == null) return <StrategyLinkoutLink tooltipContent={`This feature is not available for ${docType.displayNamePlural}`}/>
  if (stringParam && searchString.length > stringParam.length) return <StrategyLinkoutLink tooltipContent="Your search string is too large to export to a strategy. Try a smaller search string."/>
  return <StrategyLinkoutLink onClick={onClick} tooltipContent="Download or data mine using the search strategy system." />;
}

function StrategyLinkoutLink(props: { onClick?: () => void, tooltipContent: string }) {
  const [ loading, setLoading ] = useState(false);
  const handleClick = () => {
    setLoading(true);
    onClick && onClick();
  }
  const { onClick, tooltipContent } = props;
  const disabled = loading || onClick == null;
  return (
    <div className={cx('--LinkOut')}>
      <AnchoredTooltip content={tooltipContent}>
        <button disabled={disabled} className="btn" type="button" onClick={handleClick}>
          <div className={cx('--LinkOutText')}>
            <div>Export as a Search Strategy</div>
            <div><small>to download or mine your results</small></div>
          </div>
          <div className={cx('--LinkOutArrow')}>
            <i className="fa fa-caret-right"/>
          </div>
        </button>
      </AnchoredTooltip>
    </div>
  );

}

function WdkRecordFields(props: Props & { onlyShowMatches: boolean }) {
  const { response, documentType, onFiltersChange, onlyShowMatches, filters = [] } = props;
  const docType = response.documentTypes.find(d => d.id === documentType);
  const allFields = useMemo(() => docType?.isWdkRecordType ? docType.searchFields.map(f => f.name) : [], [ docType ]);
  const [ selection, setSelection ] = useState(filters);
  const fieldCountTotal = response.fieldCounts ? Object.values(response.fieldCounts).reduce(add, 0) : 0;

  useEffect(() => {
    setSelection(filters);
  }, [ filters ])

  if (
    docType == null ||
    docType.searchFields.length === 0 ||
    (filters.length === 0 && onlyShowMatches && fieldCountTotal === 0)
  ) return (
    <React.Fragment>
      <div className={cx('--FilterTitleContainer', 'widget')}>
        <h3>Filter fields</h3>
      </div>
      <div>
        <em style={{ color: '#666666' }}>{docType == null ? 'Select a result filter above' : 'None available'}</em>
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
              <button type="button" className={cx('--GreenButton') + ' btn'} onClick={() => onFiltersChange(selection)}>Apply</button>
              &nbsp;&nbsp;&nbsp;&nbsp;
              <button type="button" className={cx('--RedButton') + ' btn'} onClick={() => setSelection(filters)}>{cancelIcon}</button>
            </React.Fragment>
          ) : showClear ? (
            <button type="button" className="link" onClick={() => onFiltersChange([])}>Clear filter</button>
          ) : null}
        </div>
      </div>
      <CheckboxList
        items={docType.searchFields
          .filter(field => filters.includes(field.name) || ( onlyShowMatches ? response.fieldCounts && response.fieldCounts[field.name] > 0 : true ))
          .map(field => ({
            display: (
              <div className={cx('--ResultTypeWidgetItem')}>
                <div>{field.displayName}</div>
                {response.fieldCounts && <div>{(response.fieldCounts[field.name]).toLocaleString()}</div> }
              </div>
            ),
            value: field.name
          }))
        }
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
  const currentPage = Math.ceil((offset + 1) / numRecords)
  return (
    <div className={`MesaComponent ${cx('--Pagination')}`}>
    <ResultInfo {...props as Props}/>
    <PaginationMenu
      totalRows={searchResults.totalCount}
      totalPages={totalPages}
      currentPage={currentPage}
      rowsPerPage={numRecords}
      onPageChange={(newPage: number) => {
        onPageOffsetChange((newPage -1) * numRecords)
      }}
    />
  </div>
  )
}

interface ResultEntryDetails {
  link: {
    isRoute: boolean;
    url: string;
    text: React.ReactNode;
    target?: string;
  };
  summary: React.ReactNode;
}

// For now, all entries will have a link and a summary
function resultDetails(document: SiteSearchDocument, documentType: SiteSearchDocumentType): ResultEntryDetails {

  const projectUrls = useProjectUrls();
  const organismToProject = useOrganismToProject();
  const projectId = useWdkService(async wdkService => (await wdkService.getConfig()).projectId, []);

  // wdk records
  if (documentType.isWdkRecordType) {
    return {
      link: makeRecordLink(document, projectUrls, organismToProject, projectId),
      summary: makeGenericSummary(document, documentType)
    }
  }

  // searches
  if (documentType.id === 'search') {
    const [ searchName, recordName ] = document.primaryKey;
    return {
      link: {
        isRoute: true,
        url: `/search/${recordName}/${searchName}`,
        text: document.hyperlinkName || document.primaryKey.join(' - ')
      },
      summary: makeGenericSummary(document, documentType)
    }
  }

  // mapveu
  if (documentType.id === 'popbio-sample') {
    return {
      link: {
        isRoute: false,
        url: `/popbio-map/web/?sampleID=${document.primaryKey[0]}`,
        text: document.hyperlinkName || document.primaryKey.join(' - '),
        target: '_blank'
      },
      summary: makeGenericSummary(document, documentType)
    }
  }

  // static content
  if (
    documentType.id === 'news' ||
    documentType.id === 'general' ||
    documentType.id === 'tutorial' ||
    documentType.id === 'workshop-exercise'
  ) {
    // Handle the special case of tutorials that are offered as home page cards
    const url = documentType.id === 'tutorial' && document.primaryKey.length === 1 && document.primaryKey[0].startsWith('#')
      ? `/${document.primaryKey[0]}`
      : `/static-content/${document.primaryKey.join('/')}.html`;

    return {
      link: {
        isRoute: true,
        url,
        text: document.hyperlinkName || document.primaryKey.join(' - ')
      },
      summary: makeGenericSummary(document, documentType)
    };
  }

  return {
    link: {
      isRoute: true,
      url: '',
      text: document.hyperlinkName || document.primaryKey.join('/')
    },
    summary: makeGenericSummary(document, documentType)
  }
}

function makeRecordLink(document: SiteSearchDocument, projectUrls?: ProjectUrls, organismToProject?: OrganismToProject, projectId?: string): ResultEntryDetails['link'] {
  const text = safeHtml(document.hyperlinkName || document.primaryKey.join(' - '));
  const route = `/record/${document.documentType}/${document.primaryKey.join('/')}`;

  // use standard link if not in portal, or if no organism present
  if (projectId !== 'EuPathDB' || document.organism == null) {
    return {
      isRoute: true,
      url: route,
      text
    }
  }

  // stub url. these are nullish while loading
  if (projectId == null || projectUrls == null || organismToProject == null) {
    return {
      isRoute: false,
      url: '',
      text
    };
  }

  const documentProject = findDocumentProject(organismToProject, document.organism);
  const baseUrl = documentProject && projectUrls[documentProject];

  // if baseUrl is not found, return standard link. we _could_ throw instead...
  return {
    isRoute: !baseUrl,
    url: baseUrl ? new URL('app' + route, baseUrl).toString() : route,
    text: document.hyperlinkName || document.primaryKey.join(' - ')
  }
}

function makeGenericSummary(document: SiteSearchDocument, documentType: SiteSearchDocumentType) {
  const summaryFields = documentType.summaryFields
    .flatMap(summaryField => {
      if (summaryField.isSubtitle) return [];
      const value = formatSummaryFieldValue(document.summaryFieldData[summaryField.name]);
      return value == null ? [] : [ { ...summaryField, value } ]
    });

  if (summaryFields.length === 0) return null;
  
  return (
    <React.Fragment>
      {summaryFields.map(({ name, displayName, value }) => (
        <div key={name} className={cx('--SummaryField')}><strong>{displayName}:</strong> {safeHtml(value, null, 'span')}</div>
      ))}
    </React.Fragment>
  );
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
    node => node.children
  ).map(
    node => node.data.term
  );

  return intersection(
    allSiteSearchOrganisms,
    organismFilterLeaves
  );
}
