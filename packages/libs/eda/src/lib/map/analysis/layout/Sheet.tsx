import { ReactNode, useEffect } from 'react';
import { PanelHeader, mapUi } from './ui';

interface Props {
  title: ReactNode;
  onClose: () => void;
  children: ReactNode;
  /** maximum width of the sheet (it never exceeds the space available) */
  maxWidth?: number;
}

/**
 * A large panel for page-like content (filters, downloads, notes, ...)
 * that slides over the map from the tool rail. It is clearly temporary:
 * a close button, Escape, or clicking the dimmed map closes it, and the
 * map and its settings are exactly as they were afterwards.
 */
export function Sheet({ title, onClose, children, maxWidth = 1200 }: Props) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // let inputs/dialogs inside the sheet use Escape themselves
      if (event.key === 'Escape' && !event.defaultPrevented) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      css={{
        position: 'absolute',
        inset: 0,
        zIndex: 5,
        display: 'flex',
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        css={{
          width: `min(${maxWidth}px, calc(100% - 48px))`,
          height: '100%',
          background: mapUi.panelBackground,
          boxShadow: '2px 0 12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <PanelHeader title={title} onClose={onClose} />
        <div css={{ flex: 1, overflow: 'auto', padding: '8px 24px 24px' }}>
          {children}
        </div>
      </div>
      {/* clicking the dimmed map closes the sheet */}
      <div
        aria-hidden="true"
        onClick={onClose}
        css={{ flex: 1, background: 'rgba(0, 0, 0, 0.2)', cursor: 'pointer' }}
      />
    </div>
  );
}
