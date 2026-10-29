import { CSSProperties, ReactElement } from 'react';
import { Runnable } from '../../../../../Utils';
import { FilledButton, Modal } from '@veupathdb/coreui';
import { IconAlt } from '@veupathdb/wdk-client/lib/Components';
import { gray } from '@veupathdb/coreui/lib/definitions/colors';
import { ButtonStateStyleSpec } from '@veupathdb/coreui/lib/components/buttons';
import { useUITheme } from '@veupathdb/coreui/lib/components/theming';

export interface OverwriteWarningModalProps {
  readonly onAccept: Runnable;
  readonly onReject: Runnable;
}

export function OverwriteWarningModal({
  onAccept,
  onReject,
}: OverwriteWarningModalProps): ReactElement {
  const warnColor = useUITheme()!.palette.warning.hue['600'];

  const cancelStyle: Partial<ButtonStateStyleSpec> = {
    color: gray[300],
    textColor: 'black'
  };

  const containerStyle: CSSProperties = {
    margin: '1em',
  };

  return <Modal
    title="Copy dataset metadata from an existing dataset"
    themeRole="warning"
    titleSize="medium"
    toggleVisible={_ => onReject()}
    visible={true}
    closeOnEsc={true}
  >
    <div style={{ margin: '1.5em 1.5em 6em 1.5em', maxWidth: '650px' }}>
      <p style={{
        fontWeight: 600,
        fontSize: '2em',
        display: 'flex',
        columnGap: '1ch',
        alignItems: 'center',
      }}>
        <IconAlt
          fa="exclamation-triangle"
          style={{ color: warnColor, fontSize: '1.5em' }}
        />{' '}
        WARNING
      </p>
      <p style={{ fontSize: '1.5em' }}>
        Copying metadata from an existing dataset will{' '}
        <strong><em>overwrite</em></strong> any metadata already entered for
        the current dataset.
      </p>
    </div>
    <div style={{ display: 'flex', justifyContent: "space-between" }}>
      <FilledButton
        onPress={onReject}
        text="Cancel"
        styleOverrides={{
          container: containerStyle,
          default: cancelStyle,
          hover: { ...cancelStyle, border: { color: gray[400] } },
          pressed: cancelStyle,
        }}
      />
      <FilledButton
        onPress={onAccept}
        text="Copy & overwrite metadata"
        styleOverrides={{ container: containerStyle }}
      />
    </div>
  </Modal>
}

