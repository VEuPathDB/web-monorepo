import React, { useMemo } from 'react';
import {
  CategoryTreeNode,
  getId,
  getChildren as getNodeChildren,
} from '../../Utils/CategoryUtils';
import { pure } from '../../Utils/ComponentUtils';
import Dialog from '../../Components/Overlays/Dialog';
import CategoriesCheckboxTree from '../../Components/CheckboxTree/CategoriesCheckboxTree';
import { Answer, Question } from '../../Utils/WdkModel';
import { flatMap, concat } from '../../Utils/IterableUtils';
import {
  ShowHideAddColumnsDialog,
  UpdateColumnsDialogSelection,
  UpdateColumnsDialogSearchString,
  UpdateColumnsDialogExpandedNodes,
  RequestColumnsChoiceUpdate,
} from '../../Views/ResultTableSummaryView/Types';
import { LinksPosition } from '@veupathdb/coreui/lib/components/inputs/checkboxes/CheckboxTree/CheckboxTree';
import { getLeaves } from '../../Utils/TreeUtils';
import { differenceWith } from 'lodash';
import { Tooltip } from '@veupathdb/coreui';

const MAX_COLUMNS_ALLOWED = 80;

export interface Props {
  answer: Answer;
  viewId: string;
  question: Question;
  columnsDialogIsOpen: boolean;
  columnsDialogSelection?: string[];
  columnsDialogExpandedNodes?: string[];
  columnsDialogSearchString?: string;
  columnsTree: CategoryTreeNode;
  showHideAddColumnsDialog: ShowHideAddColumnsDialog;
  updateColumnsDialogSelection: UpdateColumnsDialogSelection;
  updateColumnsDialogSearchString: UpdateColumnsDialogSearchString;
  updateColumnsDialogExpandedNodes: UpdateColumnsDialogExpandedNodes;
  requestColumnsChoiceUpdate: RequestColumnsChoiceUpdate;
}

function ResultTableAddColumnsDialog({
  answer,
  question,
  columnsDialogExpandedNodes,
  columnsDialogIsOpen,
  columnsDialogSelection,
  columnsDialogSearchString = '',
  columnsTree,
  showHideAddColumnsDialog,
  updateColumnsDialogSelection,
  updateColumnsDialogSearchString,
  updateColumnsDialogExpandedNodes,
  requestColumnsChoiceUpdate,
}: Props) {
  if (!columnsDialogIsOpen) return null;

  /**
   * This logic returns an accurate count of the checkboxes selected in the Dialog component.
   * Since columnsDialogSelection includes ids for non-selectable columns, the ids in columnsDialogSelection
   * that do not correspond with a checkbox are filtered out.
   */
  const numberOfColumnsSelected = useMemo(() => {
    const checkboxIds = getLeaves(columnsTree, getNodeChildren).map((node) =>
      getId(node)
    );
    const filteredCheckboxIds = differenceWith(
      checkboxIds,
      columnsDialogSelection ?? []
    );
    return Math.abs(checkboxIds.length - filteredCheckboxIds.length);
  }, [columnsDialogSelection, columnsTree]);

  const areMaxColumnsExceeded =
    columnsDialogSelection &&
    columnsDialogSelection?.length > MAX_COLUMNS_ALLOWED;

  const selectedColumnsMessage = (
    <div
      style={{
        fontStyle: 'italic',
        textAlign: 'center',
        fontSize: '1.1em',
        margin: '0.5em',
      }}
    >
      <span
        style={{
          color: '#c00',
        }}
      >
        {numberOfColumnsSelected} columns selected
      </span>
      , out of {MAX_COLUMNS_ALLOWED} columns allowed
    </div>
  );

  const updateButton = (
    <button
      type="button"
      className="btn"
      disabled={areMaxColumnsExceeded ? true : false}
      onClick={() => {
        if (columnsDialogSelection) {
          requestColumnsChoiceUpdate(
            columnsDialogSelection,
            question.urlSegment
          );
        }
        showHideAddColumnsDialog(false);
      }}
    >
      Update Columns
    </button>
  );

  const buttonWithTooltip = (
    <div style={{ textAlign: 'center' }}>
      {areMaxColumnsExceeded ? (
        <Tooltip
          title={
            'Please select no more than ' + MAX_COLUMNS_ALLOWED + ' columns'
          }
        >
          {updateButton}
        </Tooltip>
      ) : (
        updateButton
      )}
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
          updateColumnsDialogExpandedNodes(
            getExpandedBranches(answer, columnsTree)
          );
        }
      }}
    >
      <>
        {selectedColumnsMessage}
        <CategoriesCheckboxTree
          tree={columnsTree}
          searchBoxPlaceholder="Search Columns"
          searchIconPosition="right"
          leafType="column"
          selectedLeaves={columnsDialogSelection || answer.meta.attributes}
          currentSelection={answer.meta.attributes}
          defaultSelection={question.defaultAttributes}
          expandedBranches={getExpandedBranches(
            answer,
            columnsTree,
            columnsDialogExpandedNodes
          )}
          searchTerm={columnsDialogSearchString}
          onChange={updateColumnsDialogSelection}
          onUiChange={updateColumnsDialogExpandedNodes}
          onSearchTermChange={updateColumnsDialogSearchString}
          linksPosition={LinksPosition.Top}
          styleOverrides={{
            treeLinks: {
              container: {
                margin: '0 1em',
                textAlign: 'center',
              },
            },
            searchBox: {
              container: {
                margin: '0 1em',
              },
            },
            treeSection: {
              container: {
                margin: '0.5em 0 0.5em 1em',
              },
              ul: {
                padding: 0,
              },
            },
            treeNode: {
              nodeWrapper: {
                padding: '2px 0',
              },
              topLevelNodeWrapper: {
                padding: '2px 0',
              },
            },
          }}
        />
        {buttonWithTooltip}
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
    : root.children.some((child) => leaves.has(getId(child)))
    ? [id]
    : concat(
        flatMap(
          (child) => findAncestors(leaves, child, ancestors),
          root.children
        ),
        ancestors
      );
}
