import React, { CSSProperties, ReactElement } from 'react';
import { useUITheme } from '@veupathdb/coreui/lib/components/theming';
import { Runnable } from '../../../Utils';

export interface DatasetMetadataImportButtonProps {
  readonly onClick: Runnable;
}

export function DatasetMetadataImportButton(
  props: DatasetMetadataImportButtonProps
): ReactElement {
  const theme = useUITheme()?.palette?.primary;

  const style: CSSProperties | undefined = theme
    ? {
        backgroundColor: theme.hue['300'],
        boxShadow: '4px 5px ' + theme.hue['400'],
      }
    : undefined;

  return (
    <button type="button" onClick={props.onClick} style={style}>
      Import from Existing Dataset
    </button>
  );
}
