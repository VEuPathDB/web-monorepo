import { useMemo, useState } from 'react';

import { noop } from 'lodash';

import { CheckboxTree, IconAlt } from '@veupathdb/wdk-client/lib/Components';
import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { makeSearchHelpText } from '@veupathdb/wdk-client/lib/Utils/SearchUtils';
import { Node } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
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

import { PreferredOrganismsToggle } from './PreferredOrganismsToggle';

import './PreferredOrganismsConfig.scss';

export const cx = makeClassNameHelper('PreferredOrganismsConfig');

interface Props {
  availableOrganisms: Set<string>;
  newOrganisms: Set<string>;
  organismTree: Node<TreeBoxVocabNode>;
  preferredOrganisms: string[];
  preferredOrganismsEnabled: boolean;
  projectId: string;
  referenceStrains: Set<string>;
  savePreferredOrganisms: (newPreferredOrganisms: string[]) => void;
  togglePreferredOrganisms: () => void;
}

export function PreferredOrganismsConfig({
  availableOrganisms,
  newOrganisms,
  organismTree,
  preferredOrganisms,
  preferredOrganismsEnabled,
  projectId,
  referenceStrains,
  savePreferredOrganisms,
  togglePreferredOrganisms,
}: Props) {
  const renderConfigNode = useRenderOrganismNode(
    referenceStrains,
    newOrganisms
  );

  const [configSelection, setConfigSelection] = useState(preferredOrganisms);
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

  return (
    <div className={cx()}>
      <h1>My Organism Preferences</h1>
      <p className={cx('--Instructions')}>
        <span>
          Set your{' '}
          <span className={cx('--InlineTitle')}>My Organism Preferences</span>{' '}
          to limit the organisms you see throughout {projectId}.
        </span>
        <span>
          <PreferredOrganismsToggle
            enabled={preferredOrganismsEnabled}
            onClick={togglePreferredOrganisms}
          />
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
              In this release of {projectId},{' '}
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
          <h2>Choose organisms to keep</h2>
          <CheckboxTree<TreeBoxVocabNode>
            tree={organismTree}
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
            linksPosition={CheckboxTree.LinkPlacement.Both}
          />
        </div>
        <div className={cx('--Preview')}>
          <h2>
            Preview of{' '}
            <span className={cx('--InlineTitle')}>My Organism Preferences</span>{' '}
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
          </h2>
          <div className={cx('--PreviewContent')}>
            <div className={cx('--PreviewInstructions')}>
              {projectId} will restrict the organisms it displays, throughout
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
                linksPosition={CheckboxTree.LinkPlacement.None}
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

  return (
    <>
      {newOrganismCount === 1 ? (
        <>
          there is 1 {NEW} organism. View it by typing "new" into the search
          box.
        </>
      ) : (
        <>
          there are {newOrganismCount} {NEW} organisms. View them by typing
          "new" into the search box.
        </>
      )}
    </>
  );
}
