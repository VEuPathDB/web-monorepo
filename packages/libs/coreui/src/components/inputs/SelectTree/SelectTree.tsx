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
  const {
    shouldCloseOnSelection,
    wrapPopover,
    currentList,
    selectedList = [],
  } = props;

  const [buttonDisplayContent, setButtonDisplayContent] = useState<ReactNode>(
    currentList && currentList.length
      ? currentList.join(', ')
      : props.buttonDisplayContent
  );

  /** Used as a hack to "auto close" the popover when shouldCloseOnSelection is true */
  const [key, setKey] = useState('');

  useEffect(() => {
    if (!shouldCloseOnSelection) return;
    setKey(selectedList.join(', '));
    onClose();
  }, [shouldCloseOnSelection, selectedList]);

  const onClose = () => {
    setButtonDisplayContent(
      selectedList.length ? selectedList.join(', ') : props.buttonDisplayContent
    );
  };

  const checkboxTree = <CheckboxTree {...props} selectedList={selectedList} />;

  return (
    <PopoverButton
      key={shouldCloseOnSelection ? key : ''}
      buttonDisplayContent={buttonDisplayContent}
      onClose={onClose}
      isDisabled={props.isDisabled}
    >
      {wrapPopover ? wrapPopover(checkboxTree) : checkboxTree}
    </PopoverButton>
  );
}

SelectTree.LinkPlacement = LinksPosition;
export default SelectTree;
