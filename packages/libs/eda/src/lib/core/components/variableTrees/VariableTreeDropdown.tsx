import VariableTree, { VariableTreeProps } from './VariableTree';

export default function VariableTreeDropdown(props: VariableTreeProps) {
  return <VariableTree {...props} asDropdown={true} />;
}
