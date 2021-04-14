import React, { ReactNode, useState } from 'react';
import { Button, Icon, Popover } from '@material-ui/core';

export interface PopoverButtonProps {
  /** Contents of the menu when opened */
  children: ReactNode;
  /** Contents of button */
  label: ReactNode;
}

/**
 * Renders a button that display `children` in a popover widget.
 */
export default function PopoverButton(props: PopoverButtonProps) {
  const { children, label } = props;
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const menu = (
    <Popover
      id="dropdown"
      open={Boolean(anchorEl)}
      onClose={() => setAnchorEl(null)}
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
      endIcon={<Icon className="fa fa-caret-down" />}
    >
      {label}
    </Button>
  );

  return (
    <>
      {button}
      {menu}
    </>
  );
}
