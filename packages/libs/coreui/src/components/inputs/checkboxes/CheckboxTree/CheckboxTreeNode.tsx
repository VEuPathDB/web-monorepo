import React from 'react';
import { isLeaf } from '../../SelectTree/Utils';
import IndeterminateCheckbox, {
  IndeterminateCheckboxProps,
} from '../IndeterminateCheckbox';
import { ArrowRight, ArrowDown } from '../../../icons';

export type CheckboxTreeNodeStyleSpec = {
  list?: {
    listStyle: React.CSSProperties['listStyle'];
  };
  children?: {
    padding: React.CSSProperties['padding'];
    margin: React.CSSProperties['margin'];
  };
  nodeWrapper?: React.CSSProperties;
  topLevelNodeWrapper?: React.CSSProperties;
  leafNodeLabel?: React.CSSProperties;
  nodeLabel?: React.CSSProperties;
  labelTextWrapper?: React.CSSProperties;
};

export const defaultTreeNodeStyleSpec: CheckboxTreeNodeStyleSpec = {
  list: {
    listStyle: 'none',
  },
  children: {
    padding: '0 0 0 1.5em',
    margin: 0,
  },
  nodeWrapper: {
    display: 'flex',
    alignItems: 'start',
    padding: '1px 0',
  },
  topLevelNodeWrapper: {},
  leafNodeLabel: {
    display: 'flex',
    width: '100%',
    marginLeft: '1.25em',
    alignItems: 'start',
  },
  nodeLabel: {
    display: 'flex',
    width: '100%',
    marginLeft: '0.5em',
    alignItems: 'start',
  },
  labelTextWrapper: {
    width: '100%',
    margin: 'auto 0',
    paddingLeft: '0.25em',
  },
};

type TreeRadioProps<T> = {
  name: string;
  checked: boolean;
  value: string;
  node: T;
  onChange: (node: T, checked: boolean) => void;
};

function TreeRadio<T>({
  name,
  checked,
  value,
  node,
  onChange,
}: TreeRadioProps<T>) {
  const handleClick = () => {
    if (!checked) {
      onChange(node, false);
    }
  };

  return (
    <input
      type="radio"
      name={name}
      value={value}
      checked={checked}
      onChange={handleClick}
    />
  );
}

type NodeState = {
  isSelected: boolean;
  isVisible: boolean;
  isIndeterminate?: boolean;
  isExpanded?: boolean;
};

export type CustomCheckboxes<T> = {
  [index: string]: React.ComponentType<Partial<IndeterminateCheckboxProps<T>>>;
};

type Props<T> = {
  node: T;
  name: string;
  path: string;
  getNodeState: (node: T) => NodeState;
  isSelectable: boolean;
  isMultiPick: boolean;
  isActiveSearch: boolean;
  toggleExpansion: (node: T) => void;
  toggleSelection: (node: T, checked: boolean) => void;
  getNodeId: (node: T) => string;
  getNodeChildren: (node: T) => T[];
  renderNode: (node: T, path?: number[]) => React.ReactNode;
  customCheckboxes?: CustomCheckboxes<T>;
  shouldExpandOnClick: boolean;
  isTopLevelNode?: boolean;
};

export default function CheckboxTreeNode<T>({
  name,
  node,
  path,
  getNodeState,
  isSelectable,
  isMultiPick,
  isActiveSearch,
  toggleSelection,
  toggleExpansion,
  getNodeId,
  getNodeChildren,
  renderNode,
  customCheckboxes,
  shouldExpandOnClick,
  isTopLevelNode = false,
}: Props<T>) {
  let { isSelected, isIndeterminate, isVisible, isExpanded } =
    getNodeState(node);
  let isLeafNode = isLeaf(node, getNodeChildren);
  let inputName = isLeafNode ? name : '';
  let nodeId = getNodeId(node);
  const nodeElement = renderNode(node, path.split('/').map(Number));
  const commonInputProps = {
    name: inputName,
    checked: isSelected,
    node,
    value: nodeId,
  };
  const checkboxProps: IndeterminateCheckboxProps<T> = {
    ...commonInputProps,
    indeterminate: !!isIndeterminate,
    onChange: (isChecked: boolean) => toggleSelection(node, isChecked),
  };
  const CustomCheckbox =
    customCheckboxes && nodeId in customCheckboxes
      ? customCheckboxes[nodeId]
      : undefined;

  return (
    <li className={`list ${isVisible ? 'visible-element' : 'hidden-element'}`}>
      <div
        className={isTopLevelNode ? 'top-level-node-wrapper' : 'node-wrapper'}
      >
        {isLeafNode ? null : isActiveSearch ? (
          // this retains the space of the expansion toggle icons for easier formatting
          <div className="active-search-buffer"></div>
        ) : isExpanded ? (
          <ArrowDown
            className="arrow-icon"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              toggleExpansion(node);
            }}
            onKeyDown={(e) =>
              e.key === 'Enter' ? toggleExpansion(node) : null
            }
          />
        ) : (
          <ArrowRight
            className="arrow-icon"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              toggleExpansion(node);
            }}
            onKeyDown={(e) =>
              e.key === 'Enter' ? toggleExpansion(node) : null
            }
          />
        )}
        {!isSelectable || (!isMultiPick && !isLeafNode) ? (
          <div
            className="label-text-wrapper"
            onClick={
              shouldExpandOnClick ? () => toggleExpansion(node) : undefined
            }
          >
            {nodeElement}
          </div>
        ) : (
          <label className={isLeafNode ? 'leaf-node-label' : 'node-label'}>
            {CustomCheckbox ? (
              <CustomCheckbox {...checkboxProps} />
            ) : isMultiPick ? (
              <IndeterminateCheckbox {...checkboxProps} />
            ) : (
              <TreeRadio {...commonInputProps} onChange={toggleSelection} />
            )}
            <div className="label-text-wrapper">{nodeElement}</div>
          </label>
        )}
      </div>
      {!isLeafNode && isVisible && isExpanded && (
        <ul
          className={`children ${
            isExpanded ? 'visible-element' : 'hidden-element'
          }`}
        >
          {getNodeChildren(node).map((child, index) => (
            <CheckboxTreeNode
              key={'node_' + getNodeId(child)}
              name={name}
              node={child}
              path={path + '/' + index}
              getNodeState={getNodeState}
              isSelectable={isSelectable}
              isMultiPick={isMultiPick}
              isActiveSearch={isActiveSearch}
              toggleSelection={toggleSelection}
              toggleExpansion={toggleExpansion}
              shouldExpandOnClick={shouldExpandOnClick}
              getNodeId={getNodeId}
              getNodeChildren={getNodeChildren}
              renderNode={renderNode}
              customCheckboxes={customCheckboxes}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
