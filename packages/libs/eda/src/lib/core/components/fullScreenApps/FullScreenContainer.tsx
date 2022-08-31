import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  children: React.ReactNode;
  onClose: () => void;
}
export default function FullScreenContainer(props: Props) {
  const [nodeRef, setNodeRef] = useState<HTMLDivElement>();
  useEffect(() => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    const currentStyle = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    setNodeRef(div);
    return function cleanup() {
      document.body.removeChild(div);
      document.body.style.overflow = currentStyle;
    };
  }, []);
  return nodeRef
    ? createPortal(
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1,
            background: 'white',
          }}
        >
          <button
            type="button"
            style={{
              position: 'absolute',
              zIndex: 2,
              right: 8,
              top: 8,
              fontSize: '3em',
              background: 'none',
              border: '0',
            }}
            onClick={props.onClose}
          >
            &times;
          </button>
          <div
            style={{
              position: 'absolute',
              zIndex: 1,
              height: '100%',
              width: '100%',
            }}
          >
            {props.children}
          </div>
        </div>,
        nodeRef
      )
    : null;
}
