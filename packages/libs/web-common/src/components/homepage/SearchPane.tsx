/** @jsx jsx */
import { jsx, css } from '@emotion/react';
import { useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { memoize, noop, keyBy } from 'lodash';

import {
  CategoriesCheckboxTree,
  Link,
  Loading,
  IconAlt,
} from '@veupathdb/wdk-client/lib/Components';
import {
  LinksPosition,
  CheckboxTreeStyleSpec,
} from '@veupathdb/coreui/dist/components/inputs/checkboxes/CheckboxTree/CheckboxTree';
import { RootState } from '@veupathdb/wdk-client/lib/Core/State/Types';
import { useSessionBackedState } from '@veupathdb/wdk-client/lib/Hooks/SessionBackedState';
import {
  CategoryTreeNode,
  getDisplayName,
  getTargetType,
  getRecordClassUrlSegment,
  isIndividual,
  getFormattedTooltipContent,
} from '@veupathdb/wdk-client/lib/Utils/CategoryUtils';
import {
  makeClassNameHelper,
  wrappable,
} from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { decode, arrayOf, string } from '@veupathdb/wdk-client/lib/Utils/Json';
import { Question } from '@veupathdb/wdk-client/lib/Utils/WdkModel';

import { HtmlTooltip } from '@veupathdb/components/lib/components/widgets/Tooltip';

import {
  combineClassNames,
  useAlphabetizedSearchTree,
} from 'ebrc-client/components/homepage/Utils';

import './SearchPane.scss';

const cx = makeClassNameHelper('ebrc-SearchPane');
const EXPANDED_BRANCHES_SESSION_KEY = 'homepage-left-panel-expanded-branch-ids';

const searchPaneStyleOverrides: CheckboxTreeStyleSpec = {
  searchBox: {
    clearSearchButton: { top: '3px' },
    input: {
      borderRadius: '0.5em',
      fontSize: '0.9em',
      borderColor: '#999',
      background: '#dfdfdf',
    },
    optionalIcon: {
      top: 0,
      cursor: 'text',
    },
  },
  treeNode: {
    topLevelNodeWrapper: {
      backgroundColor: '#dfdfdf',
      margin: '.25em 0',
      border: '.0625rem solid #ddd',
      borderRadius: '.5em',
      padding: '.35em',
      cursor: 'pointer',
    },
  },
  treeSection: {
    ul: {
      padding: '0 1em 0 0.5em',
    },
  },
};

const headerMenuItemStyleOverrides: CheckboxTreeStyleSpec = {
  searchBox: {
    ...searchPaneStyleOverrides.searchBox,
    input: {
      ...searchPaneStyleOverrides.searchBox?.input,
      background: '#fff',
    },
    optionalIcon: {
      fontSize: '1.25em',
      cursor: 'text',
      top: '3px',
    },
  },
  treeSection: {
    container: {
      whiteSpace: 'normal',
      width: 'max-content',
    },
    ul: {
      padding: 0,
    },
  },
};

export type Props = {
  containerClassName?: string;
  searchTree: CategoryTreeNode | undefined;
};

export const SearchPane = (props: Props) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedBranches, setExpandedBranches] = useSessionBackedState(
    [],
    EXPANDED_BRANCHES_SESSION_KEY,
    JSON.stringify,
    memoize((s: string) => decode(arrayOf(string), s))
  );

  const alphabetizedSearchTree = useAlphabetizedSearchTree(props.searchTree);

  return (
    <nav
      className={combineClassNames(cx(), props.containerClassName)}
      style={{ fontSize: '14px' }}
    >
      <h2>Search for...</h2>
      <div
        style={{
          fontSize: '1.2em',
        }}
      >
        <SearchCheckboxTree
          searchTree={alphabetizedSearchTree}
          searchTerm={searchTerm}
          expandedBranches={expandedBranches}
          setSearchTerm={setSearchTerm}
          setExpandedBranches={setExpandedBranches}
        />
      </div>
    </nav>
  );
};

export type SearchCheckboxTreeProps = {
  searchTree?: CategoryTreeNode;
  searchTerm: string;
  expandedBranches: string[];
  setSearchTerm: (newSearchTerm: string) => void;
  setExpandedBranches: (newExpandedBranches: string[]) => void;
  linksPosition?: LinksPosition;
  showSearchBox?: boolean;
  type?: 'searchPane' | 'headerMenu';
};

export const SearchCheckboxTree = wrappable(
  ({
    searchTree,
    searchTerm,
    expandedBranches,
    setSearchTerm,
    setExpandedBranches,
    linksPosition,
    showSearchBox,
    type = 'searchPane',
  }: SearchCheckboxTreeProps) => {
    const noSelectedLeaves = useMemo(() => [] as string[], []);
    const styleOverrides =
      type === 'searchPane'
        ? searchPaneStyleOverrides
        : headerMenuItemStyleOverrides;

    const questionsByUrlSegment = useSelector((state: RootState) =>
      keyBy(state.globalData.questions, 'urlSegment')
    );

    const renderNode = useCallback(
      (node: CategoryTreeNode, path: number[] | undefined) => (
        <SearchPaneNode
          node={node}
          questionsByUrlSegment={questionsByUrlSegment}
          path={path}
          type={type}
        />
      ),
      [questionsByUrlSegment]
    );

    return !searchTree ? (
      <Loading />
    ) : (
      <CategoriesCheckboxTree
        selectedLeaves={noSelectedLeaves}
        onChange={noop}
        tree={searchTree}
        expandedBranches={expandedBranches}
        searchTerm={searchTerm}
        isSelectable={false}
        searchBoxPlaceholder="Filter the searches below..."
        leafType="search"
        renderNode={renderNode}
        renderNoResults={renderNoResults}
        onUiChange={setExpandedBranches}
        onSearchTermChange={setSearchTerm}
        showSearchBox={showSearchBox != null ? showSearchBox : true}
        linksPosition={
          linksPosition != null ? linksPosition : LinksPosition.Top
        }
        styleOverrides={styleOverrides}
        type={type}
        searchIconPosition="left"
      />
    );
  }
);

const renderNoResults = (searchTerm: string) => (
  <div>
    <p>
      <strong>We could not find any searches matching "{searchTerm}".</strong>
    </p>
    <p>
      Perhaps you meant to{' '}
      <Link to={`/search?q=${encodeURIComponent(searchTerm)}`}>
        run a site-wide search for "{searchTerm}"
      </Link>
      ?
    </p>
  </div>
);

interface SearchPaneNodeProps {
  questionsByUrlSegment: Record<string, Question>;
  node: CategoryTreeNode;
  path: number[] | undefined;
  type?: 'searchPane' | 'headerMenu';
}

function SearchPaneNode({
  questionsByUrlSegment = {},
  node,
  path,
  type = 'searchPane',
}: SearchPaneNodeProps) {
  const [offerTooltip, setOfferTooltip] = useState(true);

  const nodeMetadata =
    isIndividual(node) && getTargetType(node) === 'search'
      ? { isSearch: true, searchName: (node.wdkReference as any).urlSegment }
      : { isSearch: false };

  const baseUrlSegment = nodeMetadata.isSearch ? nodeMetadata.searchName : null;

  // autoRun searches whose questions (1) require no parameters and (2) are not internal dataset questions
  // (N.B.: internal dataset questions are currently being detected by the presence of
  // "datasetCategory" and "datasetSubtype" properties)
  const urlSegment =
    questionsByUrlSegment[baseUrlSegment]?.paramNames.length === 0 &&
    questionsByUrlSegment[baseUrlSegment]?.properties?.datasetCategory ==
      null &&
    questionsByUrlSegment[baseUrlSegment]?.properties?.datasetSubtype == null
      ? `${baseUrlSegment}?autoRun`
      : baseUrlSegment;

  const displayName = getDisplayName(node);
  const displayElement = nodeMetadata.isSearch ? (
    <Link
      onClick={() => {
        setOfferTooltip(false);
      }}
      to={`/search/${getRecordClassUrlSegment(node)}/${urlSegment}`}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <span
          style={{ marginRight: '0.25em', color: 'gray', fontSize: '0.7em' }}
        >
          <IconAlt fa="search" />
        </span>
        <span style={{ color: '#069' }}>{displayName}</span>
      </div>
    </Link>
  ) : (
    <span
      // @ts-ignore
      css={{
        cursor: 'pointer',
        fontWeight:
          path?.length === 1 && type === 'searchPane' ? 'bold' : 'normal',
        '&:hover': {
          textDecoration: 'underline',
        },
      }}
    >
      {displayName}
    </span>
  );

  const tooltipContent = getFormattedTooltipContent(node);

  return tooltipContent && offerTooltip ? (
    <HtmlTooltip title={tooltipContent}>{displayElement}</HtmlTooltip>
  ) : (
    displayElement
  );
}
