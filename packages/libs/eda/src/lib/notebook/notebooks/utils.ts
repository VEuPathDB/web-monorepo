import {
  NotebookCellDescriptor,
  isComputeCellDescriptor,
  isSharedComputeInputsCellDescriptor,
} from '../Types';

// For any ComputeCellDescriptor that has a sharedInputsCellId but no explicit
// sharedInputNames, derive sharedInputNames from the referenced SharedComputeInputsCell.
export function withResolvedSharedInputNames(
  cells: NotebookCellDescriptor[]
): NotebookCellDescriptor[] {
  const sharedInputsMap = new Map(
    cells
      .filter(isSharedComputeInputsCellDescriptor)
      .map((c) => [c.id, c.inputNames] as const)
  );
  return cells.map((cell) =>
    isComputeCellDescriptor(cell) &&
    cell.sharedInputsCellId &&
    !cell.sharedInputNames
      ? {
          ...cell,
          sharedInputNames: sharedInputsMap.get(cell.sharedInputsCellId),
        }
      : cell
  );
}
