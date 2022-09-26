import { useState } from 'react';
import { Tooltip } from '@material-ui/core';

import PopoverButton from '@veupathdb/components/lib/components/widgets/PopoverButton';
import { Cancel } from '@veupathdb/coreui/dist/assets/icons';
import { gray, red } from '@veupathdb/coreui/dist/definitions/colors';

import { cx } from '../../../workspace/Utils';
import './VariableTree.scss';
import { useStudyEntities } from '../../hooks/workspace';
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
          extraCSS={{
            position: 'absolute',
            top: '50%',
            left: 0,
            marginTop: -size / 2,
          }}
        />
      </button>
    </Tooltip>
  );
}

export default function VariableTreeDropdown(props: VariableTreeProps) {
  const { entityId, variableId, onChange } = props;
  const entities = useStudyEntities();
  const variable = entities
    .find((e) => e.id === entityId)
    ?.variables.find((v) => v.id === variableId);
  const label = variable?.displayName ?? 'Select a variable';

  return (
    <div className={cx('-VariableTreeDropdown')}>
      <PopoverButton label={label} key={`${entityId}/${variableId}`}>
        <div className={cx('-VariableTreeDropdownTreeContainer')}>
          <VariableTree {...props} />
        </div>
      </PopoverButton>
      <ClearSelectionButton
        onClick={() => onChange()}
        disabled={variable === undefined}
        style={{ marginLeft: 8, position: 'relative', top: 1 }}
      />
    </div>
  );
}
