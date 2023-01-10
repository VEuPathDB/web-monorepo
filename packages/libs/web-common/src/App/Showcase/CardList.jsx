import { upperFirst } from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import { Link, RealTimeSearchBox } from '@veupathdb/wdk-client/lib/Components';
import { projectId } from '@veupathdb/web-common/lib/config';
import PlaceholderCard from './PlaceholderCard';
import { Tooltip } from '@veupathdb/components/lib/components/widgets/Tooltip'

const CLASS_NAME = 'CardList';
const SHOW_CATEGORIES_DROPDOWN = (projectId === 'MicrobiomeDB');

const EXPANDABLE_CLASS_NAME = `${CLASS_NAME}_Expandable`;
const SEARCHABLE_CLASS_NAME = `${CLASS_NAME}_Searchable`;
const EXPANDED_CLASS_NAME = `${CLASS_NAME}_Expanded`;
const LOADING_CLASS_NAME = `${CLASS_NAME}_Loading`;
const EMPTY_CLASS_NAME = `${CLASS_NAME}_Empty`;

const LIST_CLASS_NAME = `${CLASS_NAME}__Entries`;
const SPINNER_CLASS_NAME = `${CLASS_NAME}__Spinner`;
const EMPTY_INDICATOR_CLASS_NAME = `${CLASS_NAME}__EmptyIndicator`;
const EXPAND_BUTTON_CLASS_NAME = `${CLASS_NAME}__ExpandButton link`;
const FILTER_CLASS_NAME = `${CLASS_NAME}__FilterInput`;

const ALLSTUDIES_LINK_CLASS_NAME = `${CLASS_NAME}__TableViewLink link`;

export default function CardList(props) {
  const {
    additionalClassName,
    isLoading,
    list,
    renderCard,
    filters,
    filtersLabel = 'category',
    isExpandable,
    isSearchable,
    tableViewLink,
    tableViewLinkText = 'Table view',
    contentNamePlural,
    getSearchStringForItem = () => '',
    matchPredicate = defaultMatchPredicate
  } = props;

  // state
  const [ isExpanded, setIsExpanded ] = React.useState(null);
  const [ filterString, setFilterString ] = React.useState(null);
  const [ categoryFilter, setCategoryFilter ] = React.useState();

  // save state to session storage
  React.useEffect(() => {
    const isExpandedStorageKey = `${additionalClassName}__isExpanded`;
    const filterStringStorageKey = `${additionalClassName}__filterString`;

    if (isExpanded == null) {
      const initialIsExpanded = sessionStorage.getItem(isExpandedStorageKey);
      setIsExpanded(initialIsExpanded === 'true');
    }
    else {
      sessionStorage.setItem(isExpandedStorageKey, isExpanded ? 'true' : 'false');
    }

    if (filterString == null) {
      const initialFilterString = sessionStorage.getItem(filterStringStorageKey);
      setFilterString(initialFilterString || '');
    }
    else {
      sessionStorage.setItem(filterStringStorageKey, filterString);
    }

  }, [ isExpanded, filterString, additionalClassName ]);

  if (filterString == null) return null;

  const isEmpty = list != null && list.length === 0;
  const className = `${CLASS_NAME} ${isLoading ? LOADING_CLASS_NAME : ''} ` +
    `${isEmpty ? EMPTY_CLASS_NAME : ''} ` +
    `${isExpandable ? EXPANDABLE_CLASS_NAME : ''} ` +
    `${isSearchable ? SEARCHABLE_CLASS_NAME : ''} ` +
    `${isExpandable && isExpanded ? EXPANDED_CLASS_NAME : ''} ${additionalClassName}`;

  const cardElements = list == null || isEmpty || isLoading
    ? Array(5).fill(null).map((_, index) => <PlaceholderCard key={index}/>)
    : list
    .filter(item => {
      if (!isExpandable) return true;
      const searchString = getSearchStringForItem(item);

      return matchPredicate(searchString, filterString);
    })
    .filter(item => {
      if (categoryFilter == null) return true;
      return item.categories.includes(categoryFilter);
    })
    .map((item, index) => renderCard(item, index));

  const cardList = cardElements.length > 0
    ? <div className={LIST_CLASS_NAME}>{cardElements}</div>
    : (
      <React.Fragment>
        <h3>Nothing matched your search</h3>
        <div>Try another search or <button type="button" className="link" onClick={() => setFilterString('')}>view all {contentNamePlural}</button>.</div>
      </React.Fragment>
    );

  const loadingIndicator = isLoading &&
    <div className={SPINNER_CLASS_NAME}>
      <i className="fa fa-circle-o-notch fa-spin fa-fw"></i>
      <span className="sr-only">Loading...</span>
    </div>;

  const emptyIndicator = isEmpty &&
    <div className={EMPTY_INDICATOR_CLASS_NAME}>
      Data is not available for this section.
    </div>

  const buttonTitle = isExpanded
    ? `Hide expanded view and list all ${contentNamePlural} horizontally`
    : `Show expanded view and search for specific ${contentNamePlural}`
  const expandButton = isExpandable &&
    <Tooltip title={buttonTitle}>
      <button type="button" className={EXPAND_BUTTON_CLASS_NAME} onClick={() => setIsExpanded(!isExpanded)}>
        {isExpanded
          ? <React.Fragment><i className="fa fa-ellipsis-h" aria-hidden="true"></i> Row view</React.Fragment>
          : <React.Fragment><i className="fa fa-th" aria-hidden="true"></i> Grid view</React.Fragment>
        }
      </button>
    </Tooltip>

  const filterInput = isSearchable && 
    <RealTimeSearchBox
      className={FILTER_CLASS_NAME}
      searchTerm={filterString}
      onSearchTermChange={setFilterString}
      placeholderText={`Find ${contentNamePlural}`}
      helpText={`Find ${contentNamePlural} by searching the visible content.`}
    />

// not in clinepi, redmine #43134
  const categorySelector = filters && SHOW_CATEGORIES_DROPDOWN &&
    <Select
      placeholder={`Select a ${filtersLabel}`}
      isClearable
      options={filters.map(filter => ({
        value: filter.id,
        label: (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ transform: 'scale(.75)' }}>{filter.display}</div> {upperFirst(filter.id)}
          </div>
        )
      }))}
      onChange={option => setCategoryFilter(option && option.value)}
    />
  const tableLink = tableViewLink &&
    <Tooltip title={"View content as a table"}>
      <Link to={tableViewLink} className={ALLSTUDIES_LINK_CLASS_NAME}><i className="ebrc-icon-table" aria-hidden="true"></i> {tableViewLinkText}</Link>
    </Tooltip>

  return (
    <div className={className}>
      {tableLink}
      {expandButton}
      <div className="filters">
        {filterInput}
        {categorySelector}
      </div>
      {cardList}
      {loadingIndicator}
      {emptyIndicator}
    </div>
  );
}

function defaultMatchPredicate(searchString, filterString) {
  return searchString.toLowerCase().includes(filterString.toLowerCase());
}

CardList.propTypes = {
  renderCard: PropTypes.func.isRequired,
  additionalClassName: PropTypes.string,
  isLoading: PropTypes.bool,
  list: PropTypes.array,
  isExpandable: PropTypes.bool,
  isSearchable: PropTypes.bool,
  isExpanded: PropTypes.bool,
  filterString: PropTypes.string,
  contentNamePlural: PropTypes.string,
  getSearchStringForItem: PropTypes.func
}
