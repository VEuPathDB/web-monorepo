import React from 'react';
import { CategoryTreeNode, getId } from 'wdk-client/Utils/CategoryUtils';
import { pure } from 'wdk-client/Utils/ComponentUtils';
import Dialog from 'wdk-client/Components/Overlays/Dialog';
import CategoriesCheckboxTree from 'wdk-client/Components/CheckboxTree/CategoriesCheckboxTree';
import { Answer, Question } from 'wdk-client/Utils/WdkModel';
import { flatMap, concat } from 'wdk-client/Utils/IterableUtils';

interface Props {
  answer: Answer;
  question: Question;
  columnsDialogIsOpen: boolean;
  columnsDialogSelection?: string[];
  columnsDialogExpandedNodes?: string[];
  columnsTree: CategoryTreeNode;
  showHideAddColumnsDialog: (show: boolean) => void;
  updateColumnsDialogSelection: (attributes: string[]) => void;
  updateColumnsDialogExpandedNodes: (nodes: string[]) => void;
  requestColumnsChoiceUpdate: (columns: string[], questionName: string) => void;
}

function ResultTableAddColumnsDialog({
  answer,
  question,
  columnsDialogExpandedNodes,
  columnsDialogIsOpen,
  columnsDialogSelection,
  columnsTree,
  showHideAddColumnsDialog,
  updateColumnsDialogSelection,
  updateColumnsDialogExpandedNodes,
  requestColumnsChoiceUpdate,
}: Props) {
  if (!columnsDialogIsOpen) return null;

  const button = (
    <div style={{ textAlign: 'center' }}>
      <button
        type="button"
        className="btn"
        onClick={() => {
          if (columnsDialogSelection) {
            requestColumnsChoiceUpdate(columnsDialogSelection, question.name)
          }
          showHideAddColumnsDialog(false);
        }}
      >
        Update Columns
      </button>
    </div>
  );

  return (
    <Dialog
      open
      modal
      draggable
      resizable
      title="Select Columns"
      className="AddColumnsDialog"
      onClose={() => {
        showHideAddColumnsDialog(false);
        if (answer && columnsTree) {
          updateColumnsDialogSelection(answer.meta.attributes);
          updateColumnsDialogExpandedNodes(getExpandedBranches(answer, columnsTree));
        }
      }}
    >
      <>
        {button}
        <CategoriesCheckboxTree
          tree={columnsTree}
          searchBoxPlaceholder="Search Columns"
          leafType="column"
          selectedLeaves={columnsDialogSelection || answer.meta.attributes}
          currentSelection={answer.meta.attributes}
          defaultSelection={question.defaultAttributes}
          expandedBranches={getExpandedBranches(answer, columnsTree, columnsDialogExpandedNodes)}
          searchTerm=""
          onChange={updateColumnsDialogSelection}
          onUiChange={updateColumnsDialogExpandedNodes}
          onSearchTermChange={console.log}
        />
        {button}
      </>
    </Dialog>
  );
}

export default pure(ResultTableAddColumnsDialog);

function getExpandedBranches(
  answer: Answer,
  columnsTree: CategoryTreeNode,
  expandedBranches?: string[]
) {
  return expandedBranches != null
    ? expandedBranches
    : Array.from(findAncestors(new Set(answer.meta.attributes), columnsTree));
}

function findAncestors(
  leaves: Set<string>,
  root: CategoryTreeNode,
  ancestors: Iterable<string> = []
): Iterable<string> {
  const id = getId(root);
  return leaves.has(id)
    ? []
    : root.children.some(child => leaves.has(getId(child)))
    ? [ id ]
    : concat(
        flatMap(child => findAncestors(leaves, child, ancestors), root.children),
        ancestors
      );
}
