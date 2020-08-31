import React, { Component } from 'react';
import { isLeaf } from 'wdk-client/Utils/TreeUtils';
import IndeterminateCheckbox from 'wdk-client/Components/InputControls/IndeterminateCheckbox';

const visibleElement = {display: ""};
const hiddenElement = {display: "none"};

type TreeRadioProps<T> = {
  name: string;
  checked: boolean;
  value: string;
  node: T;
  onChange: (node: T, checked: boolean) => void;
  className: string;
}

class TreeRadio<T> extends Component<TreeRadioProps<T>> {

  handleClick() {
    let { checked, onChange, node } = this.props;
    if (!checked) {
      onChange(node, false);
    }
  }

  render() {
    let { name, checked, value, className } = this.props;
    return (
      <input type="radio" className={className} name={name} value={value} checked={checked} onChange={this.handleClick.bind(this)} />
    );
  }
}


type NodeState = {
  isSelected: boolean;
  isVisible: boolean;
  isIndeterminate?: boolean;
  isExpanded?: boolean;
}

type Props<T> = {
  node: T;
  name: string;
  path: number[];
  listClassName: string;
  getNodeState: (node: T) => NodeState;
  isSelectable: boolean;
  isMultiPick: boolean;
  isActiveSearch: boolean;
  toggleExpansion: (node: T) => void;
  toggleSelection: (node: T, checked: boolean) => void;
  getNodeId: (node: T) => string;
  getNodeChildren: (node: T) => T[];
  renderNode: (node: T, path?: number[]) => React.ReactNode;
  shouldExpandOnClick: boolean;
}

class CheckboxTreeNode<T> extends Component<Props<T>> {

  toggleExpansion = () => {
    this.props.toggleExpansion(this.props.node);
  }

  shouldComponentUpdate(nextProps: Props<T>) {
    return (nextProps.node !== this.props.node);
  }

  render() {
    let {
      name,
      node,
      path,
      listClassName,
      getNodeState,
      isSelectable,
      isMultiPick,
      isActiveSearch,
      toggleSelection,
      toggleExpansion,
      getNodeId,
      getNodeChildren,
      renderNode,
      shouldExpandOnClick
    } = this.props;

    // We have to apply the generic type `T` to these child components. This is
    // a known TypeScript issue and will likely be solved in the future.
    const IndeterminateCheckboxT = IndeterminateCheckbox as new () => IndeterminateCheckbox<T>;
    const TreeRadioT = TreeRadio as new () => TreeRadio<T>;

    let { isSelected, isIndeterminate, isVisible, isExpanded } = getNodeState(node);
    let isLeafNode = isLeaf(node, getNodeChildren);
    let nodeVisibilityCss = isVisible ? visibleElement : hiddenElement;
    let childrenVisibilityCss = isExpanded ? visibleElement : hiddenElement;
    let nodeType = isLeafNode ? "leaf"
                 : isExpanded ? "expanded"
                 : "collapsed";
    let classNames = 'wdk-CheckboxTreeItem wdk-CheckboxTreeItem__' + nodeType +
      (isSelectable ? ' wdk-CheckboxTreeItem__selectable' : '');
    let inputName = isLeafNode ? name : '';
    const nodeElement = renderNode(node, path);

    return (
      <li className={classNames} style={nodeVisibilityCss}>
        <div className="wdk-CheckboxTreeNodeWrapper">
          {isLeafNode || isActiveSearch ? (
            <i className="wdk-CheckboxTreeToggle"/>
          ) : (
            <i
              className={'fa fa-caret-' + (isExpanded ? 'down ' : 'right ') +
                'wdk-CheckboxTreeToggle wdk-CheckboxTreeToggle__' + (isExpanded ? 'expanded' : 'collapsed') }
              onClick={this.toggleExpansion}
            />
          )}
          {!isSelectable || (!isMultiPick && !isLeafNode) ? (
            <div
              className="wdk-CheckboxTreeNodeContent"
              onClick={shouldExpandOnClick ? this.toggleExpansion : undefined}
            >
              {nodeElement}
            </div>
          ) : (
            <label className="wdk-CheckboxTreeNodeContent">
              {isMultiPick ?
                <IndeterminateCheckboxT
                  className="wdk-CheckboxTreeCheckbox"
                  name={inputName}
                  checked={isSelected}
                  indeterminate={!!isIndeterminate}
                  node={node}
                  value={getNodeId(node)}
                  toggleCheckbox={toggleSelection} /> :
                <TreeRadioT
                  className="wdk-CheckboxTreeCheckbox"
                  name={inputName}
                  checked={isSelected}
                  value={getNodeId(node)}
                  node={node}
                  onChange={toggleSelection} />
              } {nodeElement}
            </label>
          )}
        </div>
        { !isLeafNode && isVisible && isExpanded &&
          <ul className={listClassName} style={childrenVisibilityCss}>
            {getNodeChildren(node).map((child, index) =>
              <CheckboxTreeNode
                key={"node_" + getNodeId(child)}
                name={name}
                node={child}
                path={path.concat(index)}
                listClassName={listClassName}
                getNodeState={getNodeState}
                isSelectable={isSelectable}
                isMultiPick={isMultiPick}
                isActiveSearch={isActiveSearch}
                toggleSelection={toggleSelection}
                toggleExpansion={toggleExpansion}
                shouldExpandOnClick={shouldExpandOnClick}
                getNodeId={getNodeId}
                getNodeChildren={getNodeChildren}
                renderNode={renderNode} />
            )}
          </ul>
        }
      </li>
    );
  }
}

export default CheckboxTreeNode;
