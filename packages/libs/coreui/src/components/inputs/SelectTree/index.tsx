import { ReactNode } from "react";
import PopoverButton from "../../buttons/PopoverButton";
import CheckboxTree, { CheckboxTreeProps } from "./CheckboxTree";
  
interface SelectTreeProps extends CheckboxTreeProps<unknown> {
    /** A button's content if/when no values are currently selected */
    defaultButtonDisplayContent: ReactNode;
}

export default function SelectTree(props: SelectTreeProps) {
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