import { ReactNode, useEffect, useState } from 'react';
import PopoverButton from '../../buttons/PopoverButton/PopoverButton';
import CheckboxTree, {
  CheckboxTreeProps,
  LinksPosition,
} from '../checkboxes/CheckboxTree/CheckboxTree';

export interface SelectTreeProps<T> extends CheckboxTreeProps<T> {
  buttonDisplayContent: ReactNode;
  shouldCloseOnSelection?: boolean;
  hasPopoverButton?: boolean; // default=true
  wrapPopover?: (checkboxTree: ReactNode) => ReactNode;
  isDisabled?: boolean;
  /** update `selectedList` state instantly when a selection is made (default: true) */
  instantUpdate?: boolean;
}

function SelectTree<T>(props: SelectTreeProps<T>) {
  const [buttonDisplayContent, setButtonDisplayContent] = useState<ReactNode>(
    props.currentList && props.currentList.length
      ? props.currentList.join(', ')
      : props.buttonDisplayContent
  );
  const {
    selectedList,
    onSelectionChange,
    shouldCloseOnSelection,
    hasPopoverButton = true,
    instantUpdate = true,
    wrapPopover,
  } = props;

  // This local state is updated whenever a checkbox is clicked in the species tree.
  // When `instantUpdate` is false, pass the final value to `onSelectionChange` when the popover closes.
  // When it is true we call `onSelectionChange` whenever `localSelectedList` changes
  const [localSelectedList, setLocalSelectedList] = useState(selectedList);

  /** Used as a hack to "auto close" the popover when shouldCloseOnSelection is true */
  const [key, setKey] = useState('');

  useEffect(() => {
    if (!shouldCloseOnSelection) return;
    setKey(selectedList.join(', '));
    onClose();
  }, [shouldCloseOnSelection, localSelectedList]);

  // live updates to caller when needed
  useEffect(() => {
    if (!instantUpdate) return;
    onSelectionChange(localSelectedList);
  }, [onSelectionChange, localSelectedList]);

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
      localSelectedList.length
        ? truncatedButtonContent(localSelectedList)
        : props.buttonDisplayContent
    );
    if (!instantUpdate) onSelectionChange(localSelectedList);
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
      selectedList={localSelectedList}
      filteredList={props.filteredList}
      customCheckboxes={props.customCheckboxes}
      isMultiPick={props.isMultiPick}
      name={props.name}
      onSelectionChange={setLocalSelectedList}
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

  return hasPopoverButton ? (
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
  ) : (
    <>{wrapPopover ? wrapPopover(checkboxTree) : checkboxTree}</>
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
  instantUpdate: true, // Set default value to true
};

SelectTree.defaultProps = defaultProps;
SelectTree.LinkPlacement = LinksPosition;
export default SelectTree;
