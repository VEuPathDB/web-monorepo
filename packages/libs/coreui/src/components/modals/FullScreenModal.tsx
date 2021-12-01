import { ReactNode } from 'react';
import ReactModal from 'react-modal';

import { gray } from '../../definitions/colors';
import { H2 } from '../headers';

export type FullScreenModalProps = {
  title?: string;
  accentColor?: string;
  backgroundColor?: string;
  visible: boolean;
  children: ReactNode;
  /** The CSS zIndex level to place the modal on. Defaults to 1000. */
  zIndex?: number;
  onOpen?: () => void;
  onClose?: () => void;
};

export default function FullScreenModal({
  title,
  accentColor = gray[500],
  backgroundColor = 'white',
  visible,
  children,
  zIndex = 1000,
  onOpen,
  onClose,
}: FullScreenModalProps) {
  return (
    <ReactModal
      isOpen={visible}
      onAfterOpen={onOpen}
      onAfterClose={onClose}
      style={{
        overlay: {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: gray[400],
          zIndex,
        },
        content: {
          position: 'absolute',
          top: '50px',
          left: '50px',
          right: '50px',
          bottom: '50px',
          border: '2px solid',
          borderColor: accentColor,
          background: backgroundColor,
          overflow: 'auto',
          borderRadius: '10px',
          outline: 'none',
          margin: 0,
          padding: 0,
        },
      }}
    >
      {title && (
        <div
          css={{
            padding: '25px 50px 0px 50px',
          }}
        >
          <H2
            text={title}
            underline
            additionalStyles={{ margin: 0 }}
            color={accentColor}
          />
        </div>
      )}
      <div css={{ padding: '25px 50px 50px 50px' }}>{children}</div>
    </ReactModal>
  );
}
