import { useCallback, useMemo, useState } from 'react';

import { noop } from 'lodash';

import { IconAlt } from '@veupathdb/wdk-client/lib/Components';
import CheckboxTree, {
  LinksPosition,
} from '@veupathdb/coreui/lib/components/inputs/checkboxes/CheckboxTree/CheckboxTree';
import Toggle from '@veupathdb/wdk-client/lib/Components/Icon/Toggle';
import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { makeSearchHelpText } from '@veupathdb/wdk-client/lib/Utils/SearchUtils';
import {
  Node,
  pruneDescendantNodes,
} from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import { TreeBoxVocabNode } from '@veupathdb/wdk-client/lib/Utils/WdkModel';

import {
  useOrganismSearchPredicate,
  useRenderOrganismNode,
} from '../hooks/organismNodes';

import {
  makeInitialPreviewExpansion,
  makePreviewTree,
} from '../utils/configTrees';
import { getNodeChildren, getNodeId } from '../utils/organismNodes';

import { PreferredOrganismsToggleHelp } from './PreferredOrganismsToggleHelp';

import './PreferredOrganismsConfig.scss';
import { Tooltip } from '@veupathdb/coreui';
import useSnackbar from '@veupathdb/coreui/lib/components/notifications/useSnackbar';

export const cx = makeClassNameHelper('PreferredOrganismsConfig');

interface Props {
  availableOrganisms: Set<string>;
  configSelection: string[];
  configIsUnchanged: boolean;
  newOrganisms: Set<string>;
  organismTree: Node<TreeBoxVocabNode>;
  displayName: string;
  referenceStrains: Set<string>;
  savePreferredOrganisms: () => void;
  savingPreferredOrganismsEnabled: boolean;
  setConfigSelection: (newConfigSelection: string[]) => void;
  revertConfigSelection: () => void;
  toggleHelpVisible: boolean;
}

export function PreferredOrganismsConfig({
  availableOrganisms,
  configSelection,
  configIsUnchanged,
  newOrganisms,
  organismTree,
  displayName,
  referenceStrains,
  savePreferredOrganisms,
  savingPreferredOrganismsEnabled,
  setConfigSelection,
  revertConfigSelection,
  toggleHelpVisible,
}: Props) {
  const [showOnlyReferenceOrganisms, setShowOnlyReferenceOrganisms] =
    useState(false);
  const toggleShowOnlyReferenceOrganisms = useCallback(() => {
    setShowOnlyReferenceOrganisms((value) => !value);
  }, []);

  const configTree = useMemo(
    () =>
      !showOnlyReferenceOrganisms
        ? organismTree
        : pruneDescendantNodes(
            (node) =>
              node.children.length > 0 || referenceStrains.has(node.data.term),
            organismTree
          ),
    [organismTree, referenceStrains, showOnlyReferenceOrganisms]
  );

  const configTreeFilters = useMemo(
    () => [
      <button
        style={{
          background: 'none',
          border: 'none',
          padding: '0 0.25em',
          whiteSpace: 'nowrap',
        }}
        type="button"
        onClick={toggleShowOnlyReferenceOrganisms}
      >
        <Toggle on={showOnlyReferenceOrganisms} /> Show only reference organisms
      </button>,
    ],
    [showOnlyReferenceOrganisms, toggleShowOnlyReferenceOrganisms]
  );

  const renderConfigNode = useRenderOrganismNode(
    referenceStrains,
    newOrganisms
  );

  const [configFilterTerm, setConfigFilterTerm] = useState('');
  const [configExpansion, setConfigExpansion] = useState<string[]>([]);
  const configSearchPredicate = useOrganismSearchPredicate(
    referenceStrains,
    newOrganisms
  );

  const renderPreviewNode = useRenderOrganismNode(referenceStrains, undefined);
  const previewExpansion = useMemo(
    () => makeInitialPreviewExpansion(organismTree),
    [organismTree]
  );
  const previewTree = useMemo(
    () => makePreviewTree(organismTree, configSelection),
    [organismTree, configSelection]
  );

  const [describeNewOrganisms, setDescribeNewOrganisms] = useState(true);

  const { enqueueSnackbar } = useSnackbar();

  return (
    <div className={cx()}>
      <h1>
        My Organism Preferences
        <PreferredOrganismsToggleHelp visible={toggleHelpVisible} />
      </h1>
      <p className={cx('--Instructions')}>
        <span>
          Set your{' '}
          <span className={cx('--InlineTitle')}>My Organism Preferences</span>{' '}
          to limit the organisms you see throughout {displayName}.
        </span>
      </p>
      {describeNewOrganisms && newOrganisms.size > 0 && (
        <p
          className={cx('--NewOrganisms')}
          style={{
            margin: '3px',
            padding: '.5em',
            borderRadius: '0.5em',
            borderWidth: '1px',
            borderColor: 'lightgrey',
            borderStyle: 'solid',
            background: '#E3F2FD',
            display: 'inline-block',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
            }}
          >
            <span className="fa-stack" style={{ fontSize: '1rem' }}>
              <i
                className="fa fa-exclamation-triangle fa-stack-2x"
                style={{ color: '#ffeb3b' }}
              />
              <i
                className="fa fa-exclamation fa-stack-1x"
                style={{ color: 'black', fontSize: '1.3em', top: 2 }}
              />
            </span>
            <div style={{ marginLeft: '1rem' }}>
              {makeNewOrganismDescription(newOrganisms.size)}{' '}
            </div>
            <button
              type="button"
              style={{
                background: 'none',
                marginLeft: '1rem',
                border: 'none',
                padding: 0,
                color: '#7c7c7c',
              }}
              onClick={() => {
                setDescribeNewOrganisms(false);
              }}
            >
              <IconAlt fa="times" />
            </button>
          </div>
        </p>
      )}
      <div className={cx('--Main')}>
        <div className={cx('--Selections')}>
          <h2>
            Choose organisms to keep
            {
              <div className={cx('--ConfigButtons')}>
                {
                  <>
                    <Tooltip
                      title={
                        configIsUnchanged
                          ? 'No changes to apply'
                          : !configSelection.length
                          ? 'Please select at least one organism'
                          : ''
                      }
                    >
                      <button
                        type="button"
                        className={`btn ${cx('--ApplyButton')}`}
                        disabled={!savingPreferredOrganismsEnabled}
                        onClick={function handleApplyPrefOrgsChanges() {
                          enqueueSnackbar(
                            'Your preferred organisms have been updated.',
                            { variant: 'success' }
                          );
                          savePreferredOrganisms();
                        }}
                      >
                        Apply
                      </button>
                    </Tooltip>
                    <Tooltip
                      title={configIsUnchanged ? 'No changes to cancel' : ''}
                    >
                      <button
                        type="button"
                        className={`btn ${cx('--CancelButton')}`}
                        onClick={revertConfigSelection}
                        disabled={configIsUnchanged}
                      >
                        X
                      </button>
                    </Tooltip>
                  </>
                }
              </div>
            }
          </h2>
          <CheckboxTree<TreeBoxVocabNode>
            tree={configTree}
            getNodeId={getNodeId}
            getNodeChildren={getNodeChildren}
            isSearchable
            searchTerm={configFilterTerm}
            onSearchTermChange={setConfigFilterTerm}
            searchPredicate={configSearchPredicate}
            searchBoxHelp={makeSearchHelpText('the list below')}
            searchBoxPlaceholder="Type a taxonomic name"
            renderNode={renderConfigNode}
            expandedList={configExpansion}
            onExpansionChange={setConfigExpansion}
            shouldExpandDescendantsWithOneChild
            isSelectable
            selectedList={configSelection}
            onSelectionChange={setConfigSelection}
            linksPosition={LinksPosition.Top}
            additionalFilters={configTreeFilters}
            isAdditionalFilterApplied={showOnlyReferenceOrganisms}
            styleOverrides={{
              searchAndFilterWrapper: {
                justifyContent: 'flex-start',
                maxWidth: '600px',
              },
              treeLinks: {
                container: {
                  justifyContent: 'flex-start',
                  marginLeft: '2em',
                },
              },
            }}
          />
        </div>
        <div className={cx('--Preview')}>
          <h2>
            <div>
              {!configIsUnchanged && (
                <>
                  <span className={cx('--PreviewTag')}>Preview of </span>{' '}
                </>
              )}
              <span className={cx('--InlineTitle')}>
                My Organism Preferences
              </span>{' '}
              (
              <span
                className={cx(
                  '--SelectionCount',
                  configSelection.length === 0 && 'empty'
                )}
              >
                {configSelection.length}
              </span>{' '}
              of {availableOrganisms.size})
            </div>
          </h2>
          <div className={cx('--PreviewContent')}>
            <div className={cx('--PreviewInstructions')}>
              {displayName} will restrict the organisms it displays, throughout
              the site, to those you have chosen, as shown below.
            </div>
            {configSelection.length === 0 ? (
              <div className={cx('--NoPreferencesSelected')}>
                Please select at least one organism
              </div>
            ) : (
              <CheckboxTree<TreeBoxVocabNode>
                tree={previewTree}
                getNodeId={getNodeId}
                getNodeChildren={getNodeChildren}
                renderNode={renderPreviewNode}
                expandedList={previewExpansion}
                onExpansionChange={noop}
                shouldExpandDescendantsWithOneChild
                linksPosition={LinksPosition.None}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function makeNewOrganismDescription(newOrganismCount: number) {
  const NEW = <span style={{ color: '#3fa415' }}>NEW</span>;
  const MY_ORGANISM_PREFERENCES = (
    <span className={cx('--InlineTitle')}>My Organism Preferences</span>
  );

  return (
    <>
      {newOrganismCount === 1 ? (
        <>
          There is 1 {NEW} organism since the last time you set your{' '}
          {MY_ORGANISM_PREFERENCES}. View it by typing "new" into the search
          box.
        </>
      ) : (
        <>
          There are {newOrganismCount} {NEW} organisms since the last time you
          set your {MY_ORGANISM_PREFERENCES}. View them by typing "new" into the
          search box.
        </>
      )}
    </>
  );
}
