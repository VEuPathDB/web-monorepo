import NumberedHeader from '@veupathdb/coreui/lib/components/forms/NumberedHeader';
import { colors } from '@material-ui/core';
import { NotebookCellDescriptorBase } from './NotebookPresets';

interface Props {
  cell: NotebookCellDescriptorBase<string>;
  stepNumber?: number;
}

export function NotebookCellPreHeader({ cell, stepNumber }: Props) {
  if (!cell.helperText) return null;

  return (
    <div className="NotebookCellHelpText">
      <span>
        {cell.numberedHeader && stepNumber != null ? (
          <NumberedHeader number={stepNumber} color={colors.grey[800]}>
            {cell.helperText}
          </NumberedHeader>
        ) : (
          cell.helperText
        )}
      </span>
    </div>
  );
}
