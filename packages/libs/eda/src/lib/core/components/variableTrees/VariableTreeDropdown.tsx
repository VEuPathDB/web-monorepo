import { useState } from 'react';
import { Tooltip } from '@material-ui/core';

import PopoverButton from '@veupathdb/components/lib/components/widgets/PopoverButton';
import { Cancel } from '@veupathdb/coreui/dist/assets/icons';
import { gray, red } from '@veupathdb/coreui/dist/definitions/colors';

import { cx } from '../../../workspace/Utils';
import './VariableTree.scss';
import { useStudyEntities } from '../../hooks/workspace';
import VariableTree, { VariableTreeProps } from './VariableTree';

export default function VariableTreeDropdown(props: VariableTreeProps) {
  const [clearButtonHover, setClearButtonHover] = useState(false);
  const { entityId, variableId, onChange } = props;
  const entities = useStudyEntities();
  const variable = entities
    .find((e) => e.id === entityId)
    ?.variables.find((v) => v.id === variableId);
  const label = variable?.displayName ?? 'Select a variable';
  const clearButtonSize = 20;

  return (
    <div className={cx('-VariableTreeDropdown')}>
      <PopoverButton label={label} key={`${entityId}/${variableId}`}>
        <div className={cx('-VariableTreeDropdownTreeContainer')}>
          <VariableTree {...props} />
        </div>
      </PopoverButton>
      <Tooltip title={variable === undefined ? '' : 'Clear selection'}>
        <button
          onClick={() => onChange()}
          onMouseEnter={() => setClearButtonHover(true)}
          onMouseLeave={() => setClearButtonHover(false)}
          style={{
            position: 'relative',
            width: clearButtonSize,
            height: clearButtonSize,
            background: 'none',
            border: 'none',
            marginLeft: 8,
            padding: 0,
            top: 1,
          }}
          disabled={variable === undefined}
        >
          <Cancel
            width={clearButtonSize}
            height={clearButtonSize}
            color={
              variable === undefined
                ? gray[400]
                : clearButtonHover
                ? red[700]
                : gray[800]
            }
            extraCSS={{
              position: 'absolute',
              top: '50%',
              left: 0,
              marginTop: -clearButtonSize / 2,
            }}
          />
        </button>
      </Tooltip>
    </div>
  );
}
