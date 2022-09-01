import { ReactNode, useState, SetStateAction } from 'react';
import { Button, Popover, makeStyles } from '@material-ui/core';
import { ArrowDropDown } from '@material-ui/icons';
import { useEffect } from 'react';

export interface PopoverButtonProps {
  /** Contents of the menu when opened */
  children: ReactNode;

  /** Contents of button */
  buttonDisplayContent: ReactNode;

  /** Allows for additional cleanup when popover closes */
  onClose?: () => void;

  /** State setter used in Select component to set focus when popover opens */
  setIsPopoverOpen?: SetStateAction<any>;
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
  const { children, buttonDisplayContent, onClose, setIsPopoverOpen } = props;
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
      endIcon={<ArrowDropDown style={{height: '1.5em', width: '1.5em'}}/>}
      style={{
        textTransform: 'none',
      }}
    >
      {buttonDisplayContent}
    </Button>
  );

  return (
    <>
      {button}
      {menu}
    </>
  );
}