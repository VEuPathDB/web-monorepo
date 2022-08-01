import React, { ReactNode, useState } from 'react';
import { Button, Popover } from '@material-ui/core';
import { ArrowDropDown } from '@material-ui/icons';

export interface PopoverButtonProps {
  /** Contents of the menu when opened */
  children: ReactNode;
  /** Contents of button */
  buttonDisplayContent: ReactNode;
  onClose: () => void;
}

/**
 * Renders a button that display `children` in a popover widget.
 */
export default function PopoverButton(props: PopoverButtonProps) {
  const { children, buttonDisplayContent, onClose } = props;
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const onCloseHandler = () => {
    setAnchorEl(null);
    onClose();
  }

  const menu = (
    <Popover
      id="dropdown"
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
