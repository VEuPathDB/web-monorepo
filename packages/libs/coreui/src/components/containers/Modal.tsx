import { CSSProperties, ReactNode, useMemo, useState } from 'react';
import { merge } from 'lodash';
import useDimensions from 'react-cool-dimensions';
import { Modal as ResponsiveModal } from 'react-responsive-modal';

// Components
import { H3 } from '../typography';
import { CloseCircle } from '../icons';

// Definitions
import colors, { blue, gray } from '../../definitions/colors';
import { UITheme } from '../theming/types';

// Hooks
import useUITheme from '../theming/useUITheme';
import { useEffect } from 'react';
import { Subset } from '../../definitions/types';

type ModalStyleSpec = {
  border: {
    color: CSSProperties['borderColor'];
    width: number;
    radius: CSSProperties['borderRadius'];
    style: CSSProperties['borderStyle'];
  };
  header: {
    primaryBackgroundColor: CSSProperties['backgroundColor'];
    secondaryBackgroundColor: CSSProperties['backgroundColor'];
  };
  content: {
    padding: {
      // TODO: It would be better to fully support all valid values.
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
    overflow: {
      x: CSSProperties['overflowX'];
      y: CSSProperties['overflowY'];
    };
  };
  size: {
    width: CSSProperties['width'];
    height: CSSProperties['height'];
  };
};

export type ModalProps = {
  /** Adds a title to the modal. */
  title?: ReactNode;
  /** Indicates which theme role to use for style augmentation. */
  themeRole?: keyof UITheme['palette'];
  /**
   * Whether or not to include a default close button in the top
   * right corner of the modal? Defaults to false.
   * */
  includeCloseButton?: boolean;
  /**
   * The prop must be a function that accepts a boolean value and
   * modifies the value being passed into the modal as
   * the `visible` prop.
   */
  toggleVisible: (visible: boolean) => void;
  /** Optional. Function to invoke when modal is opened. */
  onOpen?: () => void;
  /** Optional. Function to invoke when modal is closed. */
  onClose?: () => void;
  /** Controls the visibility of the modal. */
  visible: boolean;
  /** Optional. Control the zIndex of the modal. Defaults to 1000. */
  zIndex?: number;
  /** Allows you to adjust the style of the modal. Applied *after* theming augmentation. */
  styleOverrides?: Subset<ModalStyleSpec>;
  /** The contents of the modal.  */
  children: ReactNode;
};

export default function Modal({
  title,
  visible,
  zIndex = 1000,
  toggleVisible,
  onOpen,
  onClose,
  includeCloseButton = false,
  themeRole,
  styleOverrides = {},
  children,
}: ModalProps) {
  const theme = useUITheme();
  const [hasModalBeenOpened, setHasModalBeenOpened] = useState(false);

  // Track the height of the title text.
  const { observe, height: titleHeight } = useDimensions();

  // Track the height of the modal content.
  const { observe: observeModalContent, height: modalContentHeight } =
    useDimensions();

  const componentStyle: ModalStyleSpec = useMemo(() => {
    const defaultStyle: ModalStyleSpec = {
      border: {
        width: 2,
        style: 'solid',
        color: gray[500],
        radius: 7,
      },
      content: {
        padding: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        },
        overflow: {
          x: 'auto',
          y: 'auto',
        },
      },
      header: {
        primaryBackgroundColor: blue[500],
        secondaryBackgroundColor: blue[600],
      },
      size: {
        width: undefined,
        height: undefined,
      },
    };

    // TODO: Handle color problems when level is too dark.
    const themeStyle: Partial<ModalStyleSpec> =
      theme && themeRole
        ? {
            header: {
              primaryBackgroundColor:
                theme.palette[themeRole].hue[theme.palette.primary.level],
              secondaryBackgroundColor:
                theme.palette[themeRole].hue[theme.palette.primary.level + 100],
            },
          }
        : {};

    return merge({}, defaultStyle, themeStyle, styleOverrides);
  }, [themeRole, styleOverrides, theme]);

  // Invoke onOpen and onClose callbacks if specified as appropriate.
  useEffect(() => {
    if (visible) {
      // If this is the first time the modal has been open, let's record that.
      !hasModalBeenOpened && setHasModalBeenOpened(true);
      // Invoke onOpenCallback if it is defined.
      onOpen && onOpen();
    } else {
      // Invoke the onClose callback if that modal has been opened
      // previously and it is defined.
      hasModalBeenOpened && onClose && onClose();
    }
  }, [visible, onOpen, onClose]);

  return (
    <ResponsiveModal
      ref={observeModalContent}
      open={visible}
      onClose={() => toggleVisible && toggleVisible(false)}
      showCloseIcon={false}
      closeOnEsc={true}
      styles={{
        root: {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          pointerEvents: visible ? 'all' : 'none',
          zIndex,
        },
        overlay: {
          backgroundColor: gray[700] + '90',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: visible ? 1 : 0,
        },
        modalContainer: {
          position: 'absolute',
          ...(componentStyle.size.width
            ? {
                width: componentStyle.size.width,
                height: componentStyle.size.height,
              }
            : { top: 75, right: 75, bottom: 75, left: 75 }),

          background: colors.white,
          borderRadius: componentStyle.border.radius,
          outlineColor: componentStyle.border.color,
          outlineWidth: componentStyle.border.width,
          outlineStyle: componentStyle.border.style,
          outlineOffset: -1 * componentStyle.border.width + 1,
          overflow: 'hidden',
          opacity: visible ? 1 : 0,
        },
        modal: {
          width: '100%',
          height: '100%',
        },
      }}
    >
      {title && (
        <div
          css={{
            height: titleHeight + 40,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            css={{
              flex: 1,
              backgroundColor: componentStyle.header.primaryBackgroundColor,
              transition: 'all ease .25s',
            }}
          >
            <H3
              ref={observe}
              color='white'
              additionalStyles={{
                margin: 0,
                padding: 0,
                paddingRight: 25,
                paddingLeft: 25,
                top: 35,
                position: 'relative',
              }}
              useTheme={false}
            >
              {title}
            </H3>
          </div>
          <div
            css={{
              flexBasis: 15,
              backgroundColor: componentStyle.header.secondaryBackgroundColor,
              transition: 'all ease .25s',
            }}
          />
        </div>
      )}
      {includeCloseButton && toggleVisible && (
        <CloseCircle
          fill={title ? 'white' : gray[600]}
          css={{ position: 'absolute', top: 15, right: 15 }}
          fontSize={24}
          onClick={() => toggleVisible(!visible)}
          role='button'
          aria-label='Close modal button.'
        />
      )}
      <div
        css={{
          height: modalContentHeight - (title ? titleHeight + 39 : 0),
          overflowX: componentStyle.content.overflow.x,
          overflowY: componentStyle.content.overflow.y,
        }}
      >
        <div
          css={{
            paddingTop: componentStyle.content.padding.top,
            paddingRight: componentStyle.content.padding.right,
            paddingBottom: componentStyle.content.padding.bottom,
            paddingLeft: componentStyle.content.padding.left,
          }}
        >
          {children}
        </div>
      </div>
    </ResponsiveModal>
  );
}
