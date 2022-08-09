import { ReactNode, useEffect, useState } from "react";
import PopoverButton from "../../buttons/PopoverButton";
import CheckboxTree, { CheckboxTreeProps, LinksPosition } from "./CheckboxTree";
  
export interface SelectTreeProps<T> extends CheckboxTreeProps<T> {
    buttonDisplayContent: ReactNode;
    closeOnSelection?: boolean;
}

function SelectTree<T>(props: SelectTreeProps<T>) {
    const [ buttonDisplayContent, setButtonDisplayContent] = useState<ReactNode>(props.currentList && props.currentList.length ? props.currentList.join(', ') : props.buttonDisplayContent);
    const { selectedList, closeOnSelection, tree } = props;
    const [ anchorEl, setAnchorEl ] = useState<HTMLElement | null>(null);

    useEffect(() => {
        if (!closeOnSelection) return;
        setAnchorEl(null);
        setButtonDisplayContent(selectedList.length ? selectedList.join(', ') : props.buttonDisplayContent);
    }, [closeOnSelection, selectedList])

    const onClose = () => {
        setButtonDisplayContent(selectedList.length ? selectedList.join(', ') : props.buttonDisplayContent);
    }

    return (
        <PopoverButton
            buttonDisplayContent={buttonDisplayContent}
            anchorEl={anchorEl}
            setAnchorEl={setAnchorEl}
            onClose={onClose}
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
                  selectedList={selectedList}
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