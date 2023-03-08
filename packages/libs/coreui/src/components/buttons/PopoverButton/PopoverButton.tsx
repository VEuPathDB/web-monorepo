import { ReactNode, useState } from 'react';
import { Button, Popover, makeStyles } from '@material-ui/core';
import { useEffect } from 'react';

export interface PopoverButtonProps {
  /** Contents of the menu when opened */
  children: ReactNode;

  /** Contents of button */
  buttonDisplayContent: ReactNode;

  /** Allows for additional cleanup when popover closes */
  onClose?: () => void;

  /** Used in SingleSelect component to set focus when popover opens */
  setIsPopoverOpen?: (isOpen: boolean) => void;

  isDisabled?: boolean;
}

const useStyles = makeStyles({
  focusVisible: {
    outline: '1px dotted gray',
  },
});

/**
 * Renders a button that display `children` in a popover widget.
 */
export default function PopoverButton(props: PopoverButtonProps) {
  const { children, buttonDisplayContent, onClose, setIsPopoverOpen, isDisabled = false } = props;
  const [ anchorEl, setAnchorEl ] = useState<HTMLElement | null>(null);
  const classes = useStyles();

  const onCloseHandler = () => {
    setAnchorEl(null);
    onClose && onClose();
  }

  useEffect(() => {
    if (!setIsPopoverOpen) return;
    if (anchorEl) {
      setIsPopoverOpen(true);
    } else {
      setIsPopoverOpen(false);
    }
  }, [anchorEl])

  const menu = (
    <Popover
      id="dropdown"
      aria-expanded={!!anchorEl}
      open={Boolean(anchorEl)}
      onClose={onCloseHandler}
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      keepMounted
    >
        {children}
    </Popover>
  );

  const button = (
    <Button
      classes={{
        focusVisible: classes.focusVisible
      }}
      disableRipple
      aria-controls="dropdown"
      aria-haspopup="true"
      color="default"
      variant="contained"
      onClick={(event) => {
        setAnchorEl(event.currentTarget);
      }}
      endIcon={<i className="fa fa-caret-down" aria-hidden="true" style={{width: '20px'} }/>}
      style={{
        textTransform: 'none',
      }}
      disabled={isDisabled}
      aria-disabled={isDisabled}
    >
      {buttonDisplayContent}
    </Button>
  );

  return (
    <div style={{
      width: 'fit-content', 
      ...(isDisabled ? { cursor: 'not-allowed' } : {})
    }}>
      {button}
      {menu}
    </div>
  );
}