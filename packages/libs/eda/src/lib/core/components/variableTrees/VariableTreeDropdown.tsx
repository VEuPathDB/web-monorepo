import { useState } from 'react';
import { Button } from '@material-ui/core';

import PopoverButton from '@veupathdb/components/lib/components/widgets/PopoverButton';

import { cx } from '../../../workspace/Utils';
import './VariableTree.scss';
import { useStudyEntities } from '../../hooks/study';
import VariableTree, { VariableTreeProps } from './VariableTree';

export default function VariableTreeDropdown(props: VariableTreeProps) {
  const { rootEntity, entityId, variableId, onChange } = props;
  const [hideDisabledFields, setHideDisabledFields] = useState(false);
  const entities = useStudyEntities(rootEntity);
  const variable = entities
    .find((e) => e.id === entityId)
    ?.variables.find((v) => v.id === variableId);
  const label = variable?.displayName ?? 'Select a variable';
  return (
    <div className={cx('-VariableTreeDropdown')}>
      <PopoverButton label={label} key={`${entityId}/${variableId}`}>
        {variable && (
          <div style={{ textAlign: 'center', padding: '.75em 0.25em 0.25em' }}>
            <Button
              type="button"
              style={{ width: '90%' }}
              variant="contained"
              color="default"
              size="small"
              onClick={() => onChange()}
            >
              Clear selection
            </Button>
          </div>
        )}
        <div className={cx('-VariableTreeDropdownTreeContainer')}>
          <VariableTree
            {...props}
            hideDisabledFields={hideDisabledFields}
            setHideDisabledFields={setHideDisabledFields}
          />
        </div>
      </PopoverButton>
    </div>
  );
}
