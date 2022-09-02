import { cx } from '../../../workspace/Utils';
import './VariableTree.scss';
import VariableTree, { VariableTreeProps } from './VariableTree';

export default function VariableTreeDropdown(props: VariableTreeProps) {
  return (
    <div className={cx('-VariableTreeDropdown')}>
      <VariableTree {...props} asDropdown={true} />
    </div>
  );
}
