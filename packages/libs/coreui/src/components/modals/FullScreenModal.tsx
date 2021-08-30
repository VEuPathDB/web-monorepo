import { ReactNode } from 'react';
import ReactModal from 'react-modal';

import H1 from '../headers/H1';
import { DARK_GRAY, LIGHT_BLUE, MEDIUM_GRAY } from '../../constants/colors';
import { H2 } from '../headers';

export type FullScreenModalProps = {
  title?: string;
  accentColor?: string;
  backgroundColor?: string;
  visible: boolean;
  children: ReactNode;
};

export default function FullScreenModal({
  title,
  accentColor = DARK_GRAY,
  backgroundColor = 'white',
  visible,
  children,
}: FullScreenModalProps) {
  return (
    <ReactModal
      isOpen={visible}
      style={{
        overlay: {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.55)',
        },
        content: {
          position: 'absolute',
          top: '50px',
          left: '50px',
          right: '50px',
          bottom: '50px',
          border: '4px solid',
          borderColor: accentColor,
          background: 'rgba(255, 255, 255, 1)',
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
          {/* <div css={{ height: 3, backgroundColor: DARK_GRAY, width: '100%' }} /> */}
        </div>
      )}
      <div css={{ padding: '25px 50px 50px 50px' }}>{children}</div>
    </ReactModal>
  );
}
