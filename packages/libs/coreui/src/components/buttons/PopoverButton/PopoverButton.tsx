import {
  ReactNode,
  useState,
  useEffect,
  useMemo,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from 'react';
import { Popover } from '@material-ui/core';
import SwissArmyButton from '../SwissArmyButton';
import { gray } from '../../../definitions/colors';
import { ButtonStyleSpec, PartialButtonStyleSpec } from '..';
import { ArrowDown } from '../../icons';
import { merge } from 'lodash';
import { Dimmable } from '../../containers';

// The default styles largely mimic the style of the MUI button was previously used in this component
const defaultStyle: ButtonStyleSpec = {
  default: {
    color: gray[200],
    textColor: 'black',
    fontWeight: 500,
    border: {
      radius: 5,
    },
    dropShadow: {
      color: gray[500],
      blurRadius: '5px',
      offsetX: '0px',
      offsetY: '2px',
    },
  },
  hover: {
    color: gray[300],
    textColor: 'black',
    fontWeight: 500,
    border: {
      radius: 5,
    },
    dropShadow: {
      color: gray[600],
      blurRadius: '5px',
      offsetX: '0px',
      offsetY: '2px',
    },
  },
  pressed: {
    color: gray[300],
    fontWeight: 500,
    textColor: 'black',
    border: {
      radius: 5,
    },
    dropShadow: {
      color: gray[600],
      blurRadius: '7px',
      offsetX: '0px',
      offsetY: '4px',
    },
  },
  disabled: {
    color: gray[100],
    textColor: gray[300],
    fontWeight: 500,
    dropShadow: {
      color: gray[300],
      blurRadius: '5px',
      offsetX: '0px',
      offsetY: '2px',
    },
  },
  icon: {
    fontSize: '1em',
  },
};

export interface PopoverButtonHandle {
  /** Closes the popover */
  close: () => void;
}

export interface PopoverButtonProps {
  /** Contents of the menu when opened */
  children: ReactNode;

  /** Contents of button */
  buttonDisplayContent: ReactNode;

  /** Allows for additional cleanup when popover closes */
  onClose?: () => void;

  /** Don't let popover close while this is true */
  deferClosing?: boolean;

  /** Used in SingleSelect component to set focus when popover opens */
  setIsPopoverOpen?: (isOpen: boolean) => void;

  isDisabled?: boolean;

  styleOverrides?: PartialButtonStyleSpec;
}

/**
 * Renders a button that display `children` in a popover widget.
 */

const PopoverButton = forwardRef<PopoverButtonHandle, PopoverButtonProps>(
  function PopoverButton(props, ref) {
    const {
      children,
      buttonDisplayContent,
      onClose,
      setIsPopoverOpen,
      isDisabled = false,
      styleOverrides = {},
      deferClosing,
    } = props;
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [isClosePending, setIsClosePending] = useState(false);

    const finalStyle = useMemo(
      () => merge({}, defaultStyle, styleOverrides),
      [styleOverrides]
    );

    const onCloseHandler = useCallback(() => {
      if (deferClosing) {
        setIsClosePending(true);
        return;
      }
      setTimeout(() => {
        anchorEl?.focus(); // return focus to button
      });
      setAnchorEl(null);
      onClose && onClose();
    }, [anchorEl, onClose, deferClosing]);

    // mop up any deferred closing that needs to be done
    useEffect(() => {
      if (isClosePending && !deferClosing) {
        setIsClosePending(false);
        onCloseHandler();
      }
    }, [isClosePending, deferClosing, onCloseHandler]);

    // Expose a `close()` method to external components via ref
    useImperativeHandle(
      ref,
      () => ({
        close: () => setIsClosePending(true),
      }),
      []
    );

    useEffect(() => {
      if (!setIsPopoverOpen) return;
      if (anchorEl) {
        setIsPopoverOpen(true);
      } else {
        setIsPopoverOpen(false);
      }
    }, [anchorEl, setIsPopoverOpen]);

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
        <Dimmable dimmed={isClosePending} blocking fullscreen>
          {children}
        </Dimmable>
      </Popover>
    );

    const button = (
      <SwissArmyButton
        text={buttonDisplayContent}
        textTransform="none"
        onPress={(event) => setAnchorEl(event.currentTarget)}
        disabled={isDisabled}
        styleSpec={finalStyle}
        icon={ArrowDown}
        iconPosition="right"
        additionalAriaProperties={{
          'aria-controls': 'dropdown',
          'aria-haspopup': 'true',
          type: 'button',
        }}
      />
    );

    return (
      <div
        style={{
          width: 'fit-content',
          ...(isDisabled ? { cursor: 'not-allowed' } : {}),
        }}
        onClick={(event) => {
          // prevent click event from propagating to ancestor nodes
          event.stopPropagation();
        }}
      >
        {button}
        {menu}
      </div>
    );
  }
);

export default PopoverButton;
