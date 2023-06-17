import React from 'react';
import FloatingButton from '@veupathdb/coreui/lib/components/buttons/FloatingButton';
import { Undo as UndoIcon } from '@veupathdb/coreui/lib/components/icons';
import { SwissArmyButtonVariantProps } from '@veupathdb/coreui/lib/components/buttons';

/**
 * using CoreUI
 */
export function ResetButtonCoreUI(props: SwissArmyButtonVariantProps) {
  return (
    <FloatingButton
      text={props.text ?? ''}
      ariaLabel={props.tooltip ?? ''}
      tooltip={props.tooltip}
      disabled={props.disabled ?? false}
      icon={UndoIcon}
      size={props.size ?? 'medium'}
      // using UIThemeProvider: currently, primary: { hue: colors.mutedCyan, level: 600 }
      themeRole={props.themeRole ?? 'primary'}
      onPress={props.onPress}
    />
  );
}
