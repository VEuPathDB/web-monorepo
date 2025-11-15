import { memoize, uniq } from 'lodash';
import React, { useLayoutEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { scrollIntoViewIfNeeded } from '../../Utils/DomUtils';
import { Seq } from '../../Utils/IterableUtils';
import { areTermsInString, makeSearchHelpText } from '../../Utils/SearchUtils';
import { preorderSeq } from '../../Utils/TreeUtils';
import CheckboxTree, {
  LinksPosition,
} from '@veupathdb/coreui/lib/components/inputs/checkboxes/CheckboxTree/CheckboxTree';
import Icon from '../../Components/Icon/IconAlt';
import { Tooltip } from '@veupathdb/coreui';
import {
  isFilterField,
  isMulti,
  isRange,
  findAncestorFields,
} from '../../Components/AttributeFilter/AttributeFilterUtils';
import {
  Field,
  FieldTreeNode,
  TreeNode,
} from '../../Components/AttributeFilter/Types';

interface FieldListProps {
  autoFocus?: boolean;
  fieldTree: FieldTreeNode;
  onActiveFieldChange: (term: string) => void;
  activeField?: Field | null;
  valuesMap: Record<string, string[]>;
}

interface FieldListState {
  searchTerm: string;
  expandedNodes: string[];
}

/**
 * Tree of Fields, used to set the active field.
 */
export default class FieldList extends React.Component<
  FieldListProps,
  FieldListState
> {
  treeDomNode?: Element | Text | null;

  constructor(props: FieldListProps) {
    super(props);
    this.handleCheckboxTreeRef = this.handleCheckboxTreeRef.bind(this);
    this.getNodeId = this.getNodeId.bind(this);
    this.getNodeChildren = this.getNodeChildren.bind(this);
    this.handleExpansionChange = this.handleExpansionChange.bind(this);
    this.handleFieldSelect = this.handleFieldSelect.bind(this);
    this.handleSearchTermChange = this.handleSearchTermChange.bind(this);
    this.searchPredicate = this.searchPredicate.bind(this);
    this.getFieldSearchString = memoize(this.getFieldSearchString);

    this.state = {
      searchTerm: '',

      // expand branch containing selected field
      expandedNodes: this._getPathToField(this.props.activeField),
    };
  }

  componentWillReceiveProps(nextProps: FieldListProps) {
    if (
      nextProps.activeField == null ||
      this.props.activeField === nextProps.activeField
    )
      return;

    if (
      nextProps.activeField.parent != null &&
      !this.state.expandedNodes.includes(nextProps.activeField.parent)
    ) {
      this.setState({
        expandedNodes: uniq(
          this.state.expandedNodes.concat(
            this._getPathToField(nextProps.activeField)
          )
        ),
      });
    }
  }

  handleCheckboxTreeRef(component: any) {
    this.treeDomNode = ReactDOM.findDOMNode(component);
  }

  handleExpansionChange(expandedNodes: string[]) {
    this.setState({ expandedNodes });
  }

  handleFieldSelect(node: TreeNode<Field>) {
    this.props.onActiveFieldChange(node.field.term);
    const expandedNodes = Seq.from(this.state.expandedNodes)
      .concat(this._getPathToField(node.field))
      .concat(node.children.length > 0 ? Seq.of(node.field.term) : Seq.empty())
      .uniq()
      .toArray();
    this.setState({ expandedNodes });
  }

  handleSearchTermChange(searchTerm: string) {
    // update search term, then if it is empty, make sure selected field is visible
    this.setState({ searchTerm });
  }

  getNodeId(node: TreeNode<Field>) {
    return node.field.term;
  }

  getNodeChildren(node: TreeNode<Field>) {
    return isMulti(node.field) ? [] : node.children;
  }

  getFieldSearchString(node: TreeNode<Field>): string {
    return isMulti(node.field)
      ? preorderSeq(node)
          .map(getNodeSearchString(this.props.valuesMap))
          .join(' ')
      : getNodeSearchString(this.props.valuesMap)(node);
  }

  searchPredicate(node: TreeNode<Field>, searchTerms: string[]) {
    return areTermsInString(searchTerms, this.getFieldSearchString(node));
  }

  _getPathToField(field: Field | null | undefined): string[] {
    if (field == null) return [];

    return findAncestorFields(this.props.fieldTree, field.term)
      .map((field) => field.term)
      .toArray();
  }

  render(): JSX.Element {
    const { activeField, autoFocus, fieldTree } = this.props;

    return (
      <div className="field-list">
        <CheckboxTree<TreeNode<Field>>
          {...({
            ref: this.handleCheckboxTreeRef,
            autoFocusSearchBox: autoFocus,
            tree: fieldTree,
            expandedList: this.state.expandedNodes,
            getNodeId: this.getNodeId,
            getNodeChildren: this.getNodeChildren,
            onExpansionChange: this.handleExpansionChange,
            isSelectable: false,
            isSearchable: true,
            searchBoxPlaceholder: 'Find a variable',
            searchBoxHelp: makeSearchHelpText(
              'the variables by name or description'
            ),
            searchTerm: this.state.searchTerm,
            onSearchTermChange: this.handleSearchTermChange,
            searchPredicate: this.searchPredicate,
            renderNode: (node: FieldTreeNode) => (
              <FieldNode
                node={node}
                searchTerm={this.state.searchTerm}
                isActive={node.field.term === activeField?.term}
                handleFieldSelect={this.handleFieldSelect}
              />
            ),
            linksPosition: LinksPosition.Top,
            styleOverrides: {
              treeNode: {
                nodeWrapper: {
                  padding: 0,
                },
              },
            },
          } as any)}
        />
      </div>
    );
  }
}

function getNodeSearchString(valuesMap: Record<string, string[]>) {
  return function ({
    field: { term, display = '', description = '', variableName = '' },
  }: TreeNode<Field>): string {
    return `${display} ${description} ${variableName} ${
      valuesMap[term] || ''
    }`.toLowerCase();
  };
}

interface FieldNodeProps {
  node: TreeNode<Field>;
  isActive: boolean;
  searchTerm: string;
  handleFieldSelect: (node: TreeNode<Field>) => void;
}

function FieldNode({
  node,
  isActive,
  searchTerm,
  handleFieldSelect,
}: FieldNodeProps): JSX.Element {
  const nodeRef = useRef<HTMLAnchorElement>(null);

  useLayoutEffect(() => {
    if (isActive && nodeRef.current && nodeRef.current.offsetParent) {
      scrollIntoViewIfNeeded(nodeRef.current.offsetParent as HTMLElement);
    }
  }, [isActive, nodeRef.current, searchTerm]);

  return (
    <Tooltip title={node.field.description ?? ''} leaveDelay={0}>
      {isFilterField(node.field) ? (
        <a
          ref={nodeRef}
          className={
            'wdk-AttributeFilterFieldItem' +
            (isActive ? ' wdk-AttributeFilterFieldItem__active' : '')
          }
          href={'#' + node.field.term}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleFieldSelect(node);
          }}
        >
          <Icon fa={getIcon(node.field)} /> {node.field.display}
        </a>
      ) : (
        <div className="wdk-Link wdk-AttributeFilterFieldParent">
          {node.field.display}
        </div>
      )}
    </Tooltip>
  );
}

function getIcon(field: Field): string {
  return isRange(field) ? 'bar-chart-o' : isMulti(field) ? 'th-list' : 'list';
}
