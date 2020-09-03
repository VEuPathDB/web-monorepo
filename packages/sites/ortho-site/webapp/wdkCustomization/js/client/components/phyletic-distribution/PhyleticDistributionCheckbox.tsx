import React, { useMemo, useState } from 'react';

import { orderBy } from 'lodash';

import { CheckboxTree } from 'wdk-client/Components';
import { LinksPosition } from 'wdk-client/Components/CheckboxTree/CheckboxTree';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import { mapStructure } from 'wdk-client/Utils/TreeUtils';

import {
  PhyleticDistributionUiTree,
  getNodeChildren
} from 'ortho-client/utils/phyleticDistribution';
import {
  TaxonTree,
  getTaxonNodeId,
  makeInitialExpandedNodes
} from 'ortho-client/utils/taxons';

import './PhyleticDistributionCheckbox.scss';

const cx = makeClassNameHelper('PhyleticDistributionCheckbox');

interface Props {
  selectionConfig: SelectionConfig;
  speciesCounts: Record<string, number>;
  taxonTree: TaxonTree;
}

type SelectionConfig =
  | {
      selectable: false
    }
  | {
      selectable: true,
      onSpeciesSelected: (selection: string[]) => void;
    };

export function PhyleticDistributionCheckbox({
  selectionConfig,
  speciesCounts,
  taxonTree
}: Props) {
  const phyleticDistributionUiTree = useMemo(
    () => makePhyleticDistributionUiTree(speciesCounts, taxonTree),
    [ speciesCounts, taxonTree ]
  );

  const [ expandedNodes, setExpandedNodes ] = useState(
    () => makeInitialExpandedNodes(taxonTree)
  );

  return (
    <div className={cx()}>
      <CheckboxTree
        tree={phyleticDistributionUiTree}
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
        showRoot
        linksPosition={LinksPosition.Top}
      />
    </div>
  );
}

export function makePhyleticDistributionUiTree(
  speciesCounts: Record<string, number>,
  taxonTree: TaxonTree
) {
  return mapStructure(
    (node: TaxonTree, mappedChildren: PhyleticDistributionUiTree[]) => ({
      ...node,
      children: orderBy(
        mappedChildren,
        child => child.species,
        'desc'
      ),
      speciesCount: node.species
        ? speciesCounts[node.abbrev] ?? 0
        : mappedChildren.reduce(
            (memo, { speciesCount }) => memo + speciesCount,
            0
          )
    }),
    (node: TaxonTree) => node.children,
    taxonTree
  );
}

function renderNode(phyleticDistributionUiTree: PhyleticDistributionUiTree) {
  return (
    <div className={cx('--Node')}>
      <span className={cx('--NodeName')}>
        {phyleticDistributionUiTree.name}
        &nbsp;
        <code className={cx('--NodeAbbrev')}>
          ({phyleticDistributionUiTree.abbrev})
        </code>
      </span>
      <span className={cx('--NodeCount')}>
        {phyleticDistributionUiTree.speciesCount}
      </span>
    </div>
  );
}
