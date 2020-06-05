import React, { useCallback, useMemo } from 'react';

import { getLabel } from 'wdk-client/Utils/CategoryUtils';

import { Link } from 'wdk-client/Components';
import { LinksPosition } from 'wdk-client/Components/CheckboxTree/CheckboxTree';
import { useSessionBackedState } from 'wdk-client/Hooks/SessionBackedState';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';

import { useSearchTree, useSessionBackedSearchTerm, useSessionBackedExpandedBranches } from '../hooks/searchCheckboxTree';
import { SearchCheckboxTree } from 'ebrc-client/components/homepage/SearchPane';
import { NewsPane } from 'ebrc-client/components/homepage/NewsPane';
import { STATIC_ROUTE_PATH } from 'ebrc-client/routes';

const IS_NEWS_EXPANDED_SESSION_KEY = 'homepage-is-news-expanded';

const GROUP_RECORD_CLASS_FULL_NAME = 'GroupRecordClasses.GroupRecordClass';
const GROUP_SEARCH_TERM_SESSION_KEY = 'homepage-group-search-term';
const GROUP_EXPANDED_BRANCHES_SESSION_KEY = 'homepage-group-expanded-branch-ids';

const SEQUENCE_RECORD_CLASS_FULL_NAME = 'SequenceRecordClasses.SequenceRecordClass';
const SEQUENCE_SEARCH_TERM_SESSION_KEY = 'homepage-sequence-search-term';
const SEQUENCE_EXPANDED_BRANCHES_SESSION_KEY = 'homepage-sequence-expanded-branch-ids';

const cx = makeClassNameHelper('vpdb-');

import './OrthoMCLHomePageController.scss';


export function OrthoMCLHomePageController() {
  const groupSearchTree = usePartialSearchTree(GROUP_RECORD_CLASS_FULL_NAME);
  const [ groupSearchTerm, setGroupSearchTerm ] = useSessionBackedSearchTerm('', GROUP_SEARCH_TERM_SESSION_KEY);
  const [ groupExpandedBranches, setGroupExpandedBranches ] = useSessionBackedExpandedBranches([], GROUP_EXPANDED_BRANCHES_SESSION_KEY);

  const sequenceSearchTree = usePartialSearchTree(SEQUENCE_RECORD_CLASS_FULL_NAME);
  const [ sequenceSearchTerm, setSequenceSearchTerm ] = useSessionBackedSearchTerm('', SEQUENCE_SEARCH_TERM_SESSION_KEY);
  const [ sequenceExpandedBranches, setSequenceExpandedBranches ] = useSessionBackedExpandedBranches([], SEQUENCE_EXPANDED_BRANCHES_SESSION_KEY);

  const [ isNewsExpanded, setIsNewsExpanded ] = useSessionBackedState(
    false,
    IS_NEWS_EXPANDED_SESSION_KEY,
    encodeIsNewsExpanded,
    parseIsNewsExpanded
  );
  const toggleNews = useCallback(
    () => {
      setIsNewsExpanded(!isNewsExpanded);
    },
    [ isNewsExpanded, setIsNewsExpanded ]
  );

  return (
    <div className={cx('LandingContent', isNewsExpanded ? 'news-expanded' : 'news-collapsed')}>
      <div className={cx('Bubbles')}>
        <Bubble title="Identify Ortholog Groups" containerClassName="Groups">
          <SearchCheckboxTree
            searchTree={groupSearchTree}
            searchTerm={groupSearchTerm}
            expandedBranches={groupExpandedBranches}
            setSearchTerm={setGroupSearchTerm}
            setExpandedBranches={setGroupExpandedBranches}
            linksPosition={LinksPosition.None}
          />
        </Bubble>
        <Bubble title="Identify Protein Sequences" containerClassName="Sequences">
          <SearchCheckboxTree
            searchTree={sequenceSearchTree}
            searchTerm={sequenceSearchTerm}
            expandedBranches={sequenceExpandedBranches}
            setSearchTerm={setSequenceSearchTerm}
            setExpandedBranches={setSequenceExpandedBranches}
            linksPosition={LinksPosition.None}
          />
        </Bubble>
        <Bubble title="Tools" containerClassName="Tools">
          <ul>
            <li>
              <Link to="/search/sequence/ByBlast">
                BLAST
              </Link>
            </li>
            <li>
              <Link to="/proteome-upload">
                Assign your proteins to groups - TODO
              </Link>
            </li>
            <li>
              <Link to="/downloads">
                Download OrthoMCL software
              </Link>
            </li>
            <li>
              <Link to={`${STATIC_ROUTE_PATH}/content/OrthoMCL/webServices.html`}>
                Web services
              </Link>
            </li>
            <li>
              <a href="http://scholar.google.com/scholar?as_q=&num=10&as_epq=&as_oq=OrthoMCL&as_eq=encrypt+cryptography+hymenoptera&as_occt=any&as_sauthors=&as_publication=&as_ylo=&as_yhi=&as_sdt=1.&as_sdtp=on&as_sdtf=&as_sdts=39&btnG=Search+Scholar&hl=en" target="blank">
                Publications mentioning OrthoMCL
              </a>
            </li>
          </ul>
        </Bubble>
      </div>
      <NewsPane
        containerClassName={cx('NewsPane', isNewsExpanded ? 'news-expanded' : 'news-collapsed')}
        isNewsExpanded={isNewsExpanded}
        toggleNews={toggleNews}
      />
    </div>
  );
}

const encodeIsNewsExpanded = (b: boolean) => b ? 'y' : '';
const parseIsNewsExpanded = (s: string) => !!s;

const bubbleCx = makeClassNameHelper('vpdb-Bubble');

interface BubbleProps {
  title?: React.ReactNode,
  containerClassName?: string
}

const Bubble: React.FunctionComponent<BubbleProps> = props => {
  const className = props.containerClassName == null
    ? bubbleCx()
    : `${bubbleCx()} ${props.containerClassName}`;

  return (
    <div className={className}>
      <div className={bubbleCx('Header')}>
        {props.title}
      </div>
      <div className={bubbleCx('Content')}>
        {props.children}
      </div>
    </div>
  );
}

function usePartialSearchTree(recordClassName: string) {
  const fullSearchTree = useSearchTree();

  return useMemo(
    () => fullSearchTree == null
      ? undefined
      : fullSearchTree?.children.find(node => getLabel(node) === recordClassName),
    [ fullSearchTree ]
  );
}
