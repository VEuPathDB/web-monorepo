import React, { ReactNode } from "react";
import PopoverButton from "../../buttons/PopoverButton";
import CheckboxTree, { CheckboxTreeProps, LinksPosition } from "./CheckboxTree";
  
interface SelectTreeProps<T> extends CheckboxTreeProps<T> {
    /** A button's content if/when no values are currently selected */
    defaultButtonDisplayContent: ReactNode;
}

function SelectTree<T>(props: SelectTreeProps<T>) {
    return (
        <PopoverButton
            buttonDisplayContent={props.defaultButtonDisplayContent}
            onClose={() => null}
        >
            <CheckboxTree
                  tree={props.tree}
                  getNodeId={props.getNodeId}
                  getNodeChildren={props.getNodeChildren}
                  onExpansionChange={props.onExpansionChange}
                  shouldExpandDescendantsWithOneChild={props.shouldExpandDescendantsWithOneChild}
                  shouldExpandOnClick={props.shouldExpandOnClick}
                  showRoot={props.showRoot}
                  renderNode={props.renderNode}
                  expandedList={props.expandedList}
                  isSelectable={props.isSelectable}
                  selectedList={props.selectedList}
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
            />
        </PopoverButton>
    )
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
    searchBoxPlaceholder: "Search...",
    searchBoxHelp: '',
    searchTerm: '',
    onSearchTermChange: () => {},
    searchPredicate: () => true,
    linksPosition: LinksPosition.Both
  };

SelectTree.defaultProps = defaultProps;
SelectTree.LinkPlacement = LinksPosition;
export default SelectTree;