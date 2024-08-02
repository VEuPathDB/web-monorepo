import React, { useMemo, useState } from 'react';

import { orderBy } from 'lodash';

import { Checkbox } from '@veupathdb/wdk-client/lib/Components';
import { LinksPosition } from '@veupathdb/coreui/lib/components/inputs/checkboxes/CheckboxTree/CheckboxTree';
import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { makeSearchHelpText } from '@veupathdb/wdk-client/lib/Utils/SearchUtils';
import {
  mapStructure,
  pruneDescendantNodes,
} from '@veupathdb/wdk-client/lib/Utils/TreeUtils';

import {
  PhyleticDistributionUiTree,
  getNodeChildren,
} from 'ortho-client/utils/phyleticDistribution';
import {
  TaxonTree,
  getTaxonNodeId,
  makeInitialExpandedNodes,
  taxonSearchPredicate,
} from 'ortho-client/utils/taxons';

import './PhyleticDistributionCheckbox.scss';
import { SelectTree } from '@veupathdb/coreui';

const cx = makeClassNameHelper('PhyleticDistributionCheckbox');

interface Props {
  selectionConfig: SelectionConfig;
  speciesCounts: Record<string, number>;
  taxonTree: TaxonTree;
}

type SelectionConfig =
  | {
      selectable: false;
    }
  | {
      selectable: true;
      onSpeciesSelected: (selection: string[]) => void;
      selectedSpecies: string[];
    };

export function PhyleticDistributionCheckbox({
  selectionConfig,
  speciesCounts,
  taxonTree,
}: Props) {
  const phyleticDistributionUiTree = useMemo(
    () => makePhyleticDistributionUiTree(speciesCounts, taxonTree),
    [speciesCounts, taxonTree]
  );

  const [expandedNodes, setExpandedNodes] = useState(() =>
    makeInitialExpandedNodes(taxonTree)
  );

  const [hideMissingSpecies, setHideMissingSpecies] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');

  const prunedPhyleticDistributionUiTree = useMemo(
    () =>
      filterPhyleticDistributionUiTree(
        phyleticDistributionUiTree,
        hideMissingSpecies
      ),
    [phyleticDistributionUiTree, hideMissingSpecies]
  );

  return (
    <SelectTree
      buttonDisplayContent="Species"
      tree={prunedPhyleticDistributionUiTree}
      getNodeId={getTaxonNodeId}
      getNodeChildren={getNodeChildren}
      onExpansionChange={setExpandedNodes}
      shouldExpandOnClick={false}
      expandedList={expandedNodes}
      renderNode={renderNode}
      isMultiPick={selectionConfig.selectable}
      isSelectable={selectionConfig.selectable}
      onSelectionChange={
        selectionConfig.selectable
          ? selectionConfig.onSpeciesSelected
          : undefined
      }
      instantUpdate={true}
      selectedList={
        selectionConfig.selectable ? selectionConfig.selectedSpecies : undefined
      }
      isSearchable
      searchBoxPlaceholder="Type a taxonomic name"
      searchBoxHelp={makeSearchHelpText('the taxons below')}
      searchTerm={searchTerm}
      onSearchTermChange={setSearchTerm}
      searchPredicate={taxonSearchPredicate}
      linksPosition={LinksPosition.Top}
      additionalActions={[
        <label className={cx('--MissingSpeciesFilter')}>
          <Checkbox
            value={hideMissingSpecies}
            onChange={setHideMissingSpecies}
          />
          &nbsp; Hide zero counts
        </label>,
      ]}
    />
  );
}

function makePhyleticDistributionUiTree(
  speciesCounts: Record<string, number>,
  taxonTree: TaxonTree
) {
  return mapStructure(
    (node: TaxonTree, mappedChildren: PhyleticDistributionUiTree[]) => ({
      ...node,
      children: orderBy(mappedChildren, (child) => child.species, 'desc'),
      speciesCount: node.species
        ? speciesCounts[node.abbrev] ?? 0
        : mappedChildren.reduce(
            (memo, { speciesCount }) => memo + speciesCount,
            0
          ),
    }),
    (node: TaxonTree) => node.children,
    taxonTree
  );
}

function filterPhyleticDistributionUiTree(
  phyleticDistributionUiTree: PhyleticDistributionUiTree,
  hideMissingSpecies: boolean
) {
  return hideMissingSpecies
    ? pruneDescendantNodes(
        (node) => node.speciesCount > 0,
        phyleticDistributionUiTree
      )
    : phyleticDistributionUiTree;
}

function renderNode(node: PhyleticDistributionUiTree) {
  return (
    <div className={cx('--Node', node.species && 'species')}>
      <span className={cx('--NodeName')}>
        {node.name}
        &nbsp;
        <code className={cx('--NodeAbbrev')}>({node.abbrev})</code>
      </span>
      <span className={cx('--NodeCount')}>{node.speciesCount}</span>
    </div>
  );
}
