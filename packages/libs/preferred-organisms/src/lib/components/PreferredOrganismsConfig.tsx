import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { noop } from 'lodash';

import { CheckboxTree } from '@veupathdb/wdk-client/lib/Components';
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
  configSelection: string[];
  newOrganisms: Set<string>;
  organismTree: Node<TreeBoxVocabNode>;
  preferredOrganismsEnabled: boolean;
  projectId: string;
  referenceStrains: Set<string>;
  setConfigSelection: (newPreferredOrganisms: string[]) => void;
  togglePreferredOrganisms: () => void;
}

export function PreferredOrganismsConfig({
  availableOrganisms,
  configSelection,
  newOrganisms,
  organismTree,
  preferredOrganismsEnabled,
  projectId,
  referenceStrains,
  setConfigSelection,
  togglePreferredOrganisms,
}: Props) {
  const location = useLocation();

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

  return (
    <div className={cx()}>
      <h1>My Organism Preferences</h1>
      <p>
        <span>
          Set your{' '}
          <span className={cx('--InlineTitle')}>My Organism Preferences</span>{' '}
          to limit the organisms you see throughout {projectId}.
        </span>
        <span>
          {location.search.includes('showWipFeatures=true') && (
            <PreferredOrganismsToggle
              enabled={preferredOrganismsEnabled}
              onClick={togglePreferredOrganisms}
            />
          )}
        </span>
      </p>
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
