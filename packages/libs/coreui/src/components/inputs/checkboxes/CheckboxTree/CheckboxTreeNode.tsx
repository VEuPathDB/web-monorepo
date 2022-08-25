import React, { ChangeEvent } from 'react';
import { isLeaf } from '../../SelectTree/Utils';
import IndeterminateCheckbox, { IndeterminateCheckboxProps } from '../IndeterminateCheckbox';
import { ArrowRight, ArrowDropDown } from '@material-ui/icons';
import { CSSProperties } from '@emotion/serialize';

export type CheckboxListStyleSpec = {
  list: {
    listStyle: CSSProperties['listStyle'],
  },
  children: {
    padding: CSSProperties['padding']
  },
};

const defaultStyle = {
  list: {
    listStyle: 'none',
  },
  children: {
    padding: '0 0 0 1.5em',
  },
}

const visibleElement = { display: '' };
const hiddenElement = { display: 'none' };

type TreeRadioProps<T> = {
  name: string;
  checked: boolean;
  value: string;
  node: T;
  onChange: (node: T, checked: boolean) => void;
}

function TreeRadio<T>({
    name,
    checked,
    value,
    node,
    onChange
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
            onKeyDown={(e) => e.key === 'Enter' ? handleClick() : null}
        />
    )
}

type NodeState = {
  isSelected: boolean;
  isVisible: boolean;
  isIndeterminate?: boolean;
  isExpanded?: boolean;
}

export type CustomCheckboxes<T> = {[index: string]: React.ComponentType<Partial<IndeterminateCheckboxProps<T>>>};

type Props<T> = {
  node: T;
  name: string;
  path: number[];
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
}

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
    shouldExpandOnClick
  }: Props<T>
) {
    // We have to apply the generic type `T` to these child components. This is
    // a known TypeScript issue and will likely be solved in the future.
    // const IndeterminateCheckboxT = IndeterminateCheckbox as new () => IndeterminateCheckbox<T>;
    // const TreeRadioT = TreeRadio as new () => TreeRadio<T>;

    let { isSelected, isIndeterminate, isVisible, isExpanded } = getNodeState(node);
    let isLeafNode = isLeaf(node, getNodeChildren);
    let nodeVisibilityCss = isVisible ? visibleElement : hiddenElement;
    let childrenVisibilityCss = isExpanded ? visibleElement : hiddenElement;
    let inputName = isLeafNode ? name : '';
    let nodeId = getNodeId(node);
    const nodeElement = renderNode(node, path);
    const commonInputProps = {
      name: inputName,
      checked: isSelected,
      node,
      value: nodeId,
    };
    const checkboxProps: IndeterminateCheckboxProps<T> = {...commonInputProps, indeterminate: !!isIndeterminate, onChange: (e: ChangeEvent<HTMLInputElement>) => toggleSelection(node, e.target.checked) };
    const CustomCheckbox = (customCheckboxes && (nodeId in customCheckboxes)) ? customCheckboxes[nodeId] : undefined;

    return (
      <li css={{
        nodeVisibilityCss, 
        ...defaultStyle.list,
      }}>
        <div css={{
          display: 'flex',
        }}>
          {isLeafNode || isActiveSearch ? (
            null
          ) : (
            isExpanded ? <ArrowDropDown onClick={() => toggleExpansion(node)}/> :
              <ArrowRight onClick={() => toggleExpansion(node)}/>
          )}
          {!isSelectable || (!isMultiPick && !isLeafNode) ? (
            <div
              onClick={shouldExpandOnClick ? () => toggleExpansion(node) : undefined}
              >
              {nodeElement}
            </div>
          ) : (
            <label>
              {CustomCheckbox ? <CustomCheckbox {...checkboxProps} /> : isMultiPick
                  ? <IndeterminateCheckbox {...checkboxProps} />
                  : <TreeRadio
                      {...commonInputProps}
                      onChange={toggleSelection}
                    />
              } {nodeElement}
            </label>
          )}
        </div>
        { !isLeafNode && isVisible && isExpanded &&
          <ul css={{childrenVisibilityCss, ...defaultStyle.children}}>
            {getNodeChildren(node).map((child, index) =>
              <CheckboxTreeNode
                key={"node_" + getNodeId(child)}
                name={name}
                node={child}
                path={path.concat(index)}
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
                customCheckboxes={customCheckboxes} />
            )}
          </ul>
        }
      </li>
    );
}