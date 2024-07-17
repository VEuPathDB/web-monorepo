import { ReactNode, useEffect, useState } from 'react';
import PopoverButton from '../../buttons/PopoverButton/PopoverButton';
import CheckboxTree, {
  CheckboxTreeProps,
  LinksPosition,
} from '../checkboxes/CheckboxTree/CheckboxTree';

export interface SelectTreeProps<T> extends CheckboxTreeProps<T> {
  buttonDisplayContent: ReactNode;
  shouldCloseOnSelection?: boolean;
  wrapPopover?: (checkboxTree: ReactNode) => ReactNode;
  isDisabled?: boolean;
}

function SelectTree<T>(props: SelectTreeProps<T>) {
  const [buttonDisplayContent, setButtonDisplayContent] = useState<ReactNode>(
    props.currentList && props.currentList.length
      ? props.currentList.join(', ')
      : props.buttonDisplayContent
  );
  const { selectedList, shouldCloseOnSelection, wrapPopover } = props;

  /** Used as a hack to "auto close" the popover when shouldCloseOnSelection is true */
  const [key, setKey] = useState('');

  useEffect(() => {
    if (!shouldCloseOnSelection) return;
    setKey(selectedList.join(', '));
    onClose();
  }, [shouldCloseOnSelection, selectedList]);

  function truncatedButtonContent(selectedList: string[]) {
    return (
      <span
        style={{
          // this styling is copied from SelectList!
          maxWidth: '300px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {selectedList.join(', ')}
      </span>
    );
  }

  const onClose = () => {
    setButtonDisplayContent(
      selectedList.length
        ? truncatedButtonContent(selectedList)
        : props.buttonDisplayContent
    );
  };

  const checkboxTree = (
    <CheckboxTree
      tree={props.tree}
      getNodeId={props.getNodeId}
      getNodeChildren={props.getNodeChildren}
      onExpansionChange={props.onExpansionChange}
      shouldExpandDescendantsWithOneChild={
        props.shouldExpandDescendantsWithOneChild
      }
      shouldExpandOnClick={props.shouldExpandOnClick}
      showRoot={props.showRoot}
      renderNode={props.renderNode}
      expandedList={props.expandedList}
      isSelectable={props.isSelectable}
      selectedList={selectedList}
      filteredList={props.filteredList}
      customCheckboxes={props.customCheckboxes}
      isMultiPick={props.isMultiPick}
      name={props.name}
      onSelectionChange={props.onSelectionChange}
      currentList={props.currentList}
      defaultList={props.defaultList}
      isSearchable={props.isSearchable}
      autoFocusSearchBox={props.autoFocusSearchBox}
      showSearchBox={props.showSearchBox}
      searchBoxPlaceholder={props.searchBoxPlaceholder}
      searchIconName={props.searchIconName}
      searchBoxHelp={props.searchBoxHelp}
      searchTerm={props.searchTerm}
      onSearchTermChange={props.onSearchTermChange}
      searchPredicate={props.searchPredicate}
      renderNoResults={props.renderNoResults}
      linksPosition={props.linksPosition}
      additionalActions={props.additionalActions}
      additionalFilters={props.additionalFilters}
      isAdditionalFilterApplied={props.isAdditionalFilterApplied}
      wrapTreeSection={props.wrapTreeSection}
      styleOverrides={props.styleOverrides}
      customTreeNodeCssSelectors={props.customTreeNodeCssSelectors}
    />
  );

  return (
    <PopoverButton
      key={shouldCloseOnSelection ? key : ''}
      buttonDisplayContent={buttonDisplayContent}
      onClose={onClose}
      isDisabled={props.isDisabled}
    >
      <div css={{ margin: '1em' }}>
        {wrapPopover ? wrapPopover(checkboxTree) : checkboxTree}
      </div>
    </PopoverButton>
  );
}

const defaultProps = {
  showRoot: false,
  expandedList: null,
  isSelectable: false,
  selectedList: [],
  customCheckboxes: {},
  isMultiPick: true,
  onSelectionChange: () => {},
  isSearchable: false,
  showSearchBox: true,
  searchBoxPlaceholder: 'Search...',
  searchBoxHelp: '',
  searchTerm: '',
  onSearchTermChange: () => {},
  searchPredicate: () => true,
  linksPosition: LinksPosition.Both,
  isDisabled: false,
};

SelectTree.defaultProps = defaultProps;
SelectTree.LinkPlacement = LinksPosition;
export default SelectTree;
