import React from 'react';

import {
  changeGroupVisibility,
  updateParamValue,
} from '@veupathdb/wdk-client/lib/Actions/QuestionActions';
import { IconAlt } from '@veupathdb/wdk-client/lib/Components';
import { ParameterGroup } from '@veupathdb/wdk-client/lib/Utils/WdkModel';

import { blastFormCx } from './BlastForm';

interface Props {
  searchName: string;
  group: ParameterGroup;
  uiState: any;
  onVisibilityChange: EventHandlers['setGroupVisibility'];
  children: React.ReactChild;
  disabled?: boolean;
}

interface EventHandlers {
  setGroupVisibility: typeof changeGroupVisibility;
  updateParamValue: typeof updateParamValue;
}

export function AdvancedParamGroup(props: Props) {
  const {
    searchName,
    group,
    uiState: { isVisible },
    onVisibilityChange,
    disabled = false,
  } = props;
  return (
    <div className={blastFormCx('ShowHideGroup')}>
      <button
        disabled={disabled}
        type="button"
        className={blastFormCx('ShowHideGroupToggle')}
        onClick={() => {
          onVisibilityChange({
            searchName,
            groupName: group.name,
            isVisible: !isVisible,
          });
        }}
      >
        <IconAlt fa={`caret-${isVisible ? 'down' : 'right'}`} />{' '}
        {group.displayName}
      </button>
      <div className={blastFormCx('ShowHideGroupContent')}>
        {isVisible ? props.children : null}
      </div>
    </div>
  );
}
