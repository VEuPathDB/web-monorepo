import React from 'react';
import { Tooltip, IconButton } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
//DKDK
import Undo from '@veupathdb/coreui/dist/components/icons/Undo';
import FloatingButton from '@veupathdb/coreui/dist/components/buttons/FloatingButton';
import { Undo as UndoIcon } from '@veupathdb/coreui/dist/components/icons';
import { SwissArmyButtonVariantProps } from '@veupathdb/coreui/dist/components/buttons';

interface Props {
  size?: number | string;
  color?: string;
  tooltipText?: string;
  disabled?: boolean;
  onClick?: () => void;
}

// Material UI CSS declarations
const useStyles = makeStyles((theme) => ({
  root: (props: Props) => ({
    size: props.size ?? 'small',
    // color: props.disabled ? 'lightgray' : theme.palette.primary.main,
    // color: theme.palette.primary.main,
    fill: props.disabled ? 'lightgray' : theme.palette.primary.main,
    background: 'none',
    border: 'none',
    padding: 0,
  }),
}));

/**
 * using CoreUI
 */
export function ResetButtonCoreUI(props: SwissArmyButtonVariantProps) {
  return (
    <FloatingButton
      // className={classes.root}
      text={props.text ?? ''}
      ariaLabel={props.tooltip ?? ''}
      tooltip={props.tooltip}
      disabled={false}
      icon={UndoIcon}
      size={props.size ?? 'medium'}
      // using UIThemeProvider: currently, primary: { hue: colors.mutedCyan, level: 600 }
      themeRole={props.themeRole ?? 'primary'}
      onPress={props.onPress}
    />
  );
}

/**
 * using Material-UI (MUI)
 */
export function ResetButtonMUI(props: Props) {
  const classes = useStyles(props);

  return (
    <Tooltip title={props.tooltipText ?? ''}>
      <IconButton
        className={classes.root}
        disabled={props.disabled}
        onClick={props.onClick}
      >
        <Undo />
      </IconButton>
    </Tooltip>
  );
}

/**
 * using pure button: original work, but make it as component
 */
export function ResetButtonOriginal(props: Props) {
  return (
    <Tooltip title={props.tooltipText ?? ''}>
      <button
        onClick={props.onClick}
        disabled={props.disabled}
        style={{
          width: props.size,
          height: props.size,
          background: 'none',
          border: 'none',
          padding: 0,
        }}
      >
        <Undo
          width={props.size}
          height={props.size}
          fill={props.disabled ? 'lightgray' : props.color}
        />
      </button>
    </Tooltip>
  );
}
