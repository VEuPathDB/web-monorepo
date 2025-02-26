import { useState } from 'react';
import { Tooltip } from '@veupathdb/coreui';

import { Cancel } from '@veupathdb/coreui/lib/assets/icons';
import { gray, red } from '@veupathdb/coreui/lib/definitions/colors';

import VariableTree, { VariableTreeProps } from './VariableTree';

interface ClearSelectionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  style?: React.CSSProperties;
}

export function ClearSelectionButton({
  onClick,
  disabled,
  style,
}: ClearSelectionButtonProps) {
  const [hovering, setHovering] = useState(false);
  const size = 20;

  return (
    <Tooltip title={disabled ? '' : 'Clear selection'}>
      <button
        onClick={() => onClick()}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        style={{
          width: size,
          height: size,
          background: 'none',
          border: 'none',
          padding: 0,
          ...style,
        }}
        disabled={disabled}
      >
        <Cancel
          width={size}
          height={size}
          color={disabled ? gray[400] : hovering ? red[700] : gray[800]}
        />
      </button>
    </Tooltip>
  );
}

export default function VariableTreeDropdown(props: VariableTreeProps) {
  return <VariableTree {...props} asDropdown={true} />;
}
