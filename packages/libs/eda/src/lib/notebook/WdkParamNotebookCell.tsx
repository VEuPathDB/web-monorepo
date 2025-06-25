import ExpandablePanel from '@veupathdb/coreui/lib/components/containers/ExpandablePanel';
import { NotebookCellProps } from './NotebookCell';
import { WdkParamCellDescriptor } from './NotebookPresets';

export function WdkParamNotebookCell(
  props: NotebookCellProps<WdkParamCellDescriptor>
) {
  const { cell, isDisabled } = props;

  const { paramNames, title, wdkParameters } = cell;

  console.log(wdkParameters);

  return (
    <ExpandablePanel
      title={title}
      subTitle={''}
      state="open"
      themeRole="primary"
    >
      <div className={'NotebookCellContent' + (isDisabled ? ' disabled' : '')}>
        {paramNames.concat(', ')}
      </div>
    </ExpandablePanel>
  );
}
