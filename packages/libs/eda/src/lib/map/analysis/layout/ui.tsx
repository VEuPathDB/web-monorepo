/**
 * Small presentational building blocks shared by the map's panels and
 * toolbars, so that every control looks and behaves the same way.
 */
import { CSSProperties, ReactNode, forwardRef } from 'react';
import { Tooltip } from '@material-ui/core';
import { Close, FileCopyOutlined, Launch } from '@material-ui/icons';
import useSnackbar from '@veupathdb/coreui/lib/components/notifications/useSnackbar';
import { useUITheme } from '@veupathdb/coreui/lib/components/theming';
import {
  LatLng,
  copyText,
  formatLatLng,
  googleMapsUrl,
} from '../utils/coordinates';

export const mapUi = {
  border: '1px solid #d9d9d9',
  radius: 6,
  shadow: '0 1px 5px rgba(0, 0, 0, 0.25)',
  muted: '#5f6368',
  panelBackground: 'white',
  hoverBackground: '#f1f3f4',
  railWidth: 64,
  settingsPanelWidth: 400,
  selectionPanelWidth: 460,
};

export function usePrimaryColor() {
  const theme = useUITheme();
  return theme?.palette.primary.hue[theme.palette.primary.level] ?? '#1f6fb2';
}

interface IconButtonProps {
  title: string;
  onClick: () => void;
  children: ReactNode;
  active?: boolean;
  disabled?: boolean;
  /** visible text next to / under the icon */
  label?: ReactNode;
  labelPosition?: 'below' | 'right';
  style?: CSSProperties;
}

/** an icon button with a tooltip and an optional visible label */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    {
      title,
      onClick,
      children,
      active = false,
      disabled = false,
      label,
      labelPosition = 'right',
      style,
    },
    ref
  ) {
    const primary = usePrimaryColor();
    const button = (
      <button
        ref={ref}
        type="button"
        aria-label={title}
        aria-pressed={active}
        disabled={disabled}
        onClick={onClick}
        css={{
          display: 'flex',
          flexDirection: labelPosition === 'below' ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: labelPosition === 'below' ? 2 : 6,
          border: 'none',
          borderRadius: mapUi.radius,
          padding: labelPosition === 'below' ? '6px 2px' : '4px 8px',
          background: active ? primary : 'transparent',
          color: active ? 'white' : 'inherit',
          cursor: disabled ? 'default' : 'pointer',
          opacity: disabled ? 0.45 : 1,
          fontSize: labelPosition === 'below' ? 11 : 13,
          lineHeight: 1.2,
          '&:hover': {
            background: disabled
              ? undefined
              : active
              ? primary
              : mapUi.hoverBackground,
          },
          '&:focus-visible': { outline: `2px solid ${primary}` },
          svg: { fontSize: 20 },
        }}
        style={style}
      >
        {children}
        {label != null && <span>{label}</span>}
      </button>
    );
    // MUI's Tooltip can't attach to a disabled button: wrap it
    return (
      <Tooltip
        title={title}
        placement={labelPosition === 'below' ? 'right' : 'bottom'}
      >
        {disabled ? <span>{button}</span> : button}
      </Tooltip>
    );
  }
);

/** a plain text button; `primary` for the main action of a panel */
export function TextButton({
  children,
  onClick,
  primary = false,
  disabled = false,
  title,
}: {
  children: ReactNode;
  onClick: () => void;
  primary?: boolean;
  disabled?: boolean;
  title?: string;
}) {
  const primaryColor = usePrimaryColor();
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      css={{
        border: `1px solid ${primary ? primaryColor : '#c4c7c5'}`,
        background: primary ? primaryColor : 'white',
        color: primary ? 'white' : primaryColor,
        borderRadius: mapUi.radius,
        padding: '5px 12px',
        fontSize: 13,
        fontWeight: 500,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        whiteSpace: 'nowrap',
        '&:hover': {
          filter: disabled ? undefined : 'brightness(0.95)',
        },
      }}
    >
      {children}
    </button>
  );
}

/** title row of a docked panel or sheet */
export function PanelHeader({
  title,
  onClose,
  closeTitle = 'Close',
  actions,
}: {
  title: ReactNode;
  onClose?: () => void;
  closeTitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div
      css={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 12px 10px 16px',
        borderBottom: mapUi.border,
        flexShrink: 0,
        h2: { fontSize: 16, fontWeight: 600, margin: 0, padding: 0 },
      }}
    >
      <h2 css={{ flex: 1, minWidth: 0 }}>{title}</h2>
      {actions}
      {onClose && (
        <IconButton title={closeTitle} onClick={onClose}>
          <Close />
        </IconButton>
      )}
    </div>
  );
}

/** a labelled block inside a panel */
export function PanelSection({
  title,
  children,
  help,
}: {
  title?: ReactNode;
  children: ReactNode;
  help?: ReactNode;
}) {
  return (
    <section css={{ padding: '12px 16px', borderBottom: '1px solid #eee' }}>
      {title != null && (
        <h3
          css={{
            fontSize: 12,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: mapUi.muted,
            margin: '0 0 8px 0',
            padding: 0,
          }}
        >
          {title}
        </h3>
      )}
      {help != null && (
        <div css={{ fontSize: 12, color: mapUi.muted, marginBottom: 8 }}>
          {help}
        </div>
      )}
      {children}
    </section>
  );
}

/**
 * "12.34567, -1.23456" with copy-to-clipboard and open-in-Google-Maps
 * buttons. `approximate` prefixes a "≈" (e.g. a marker's average position).
 */
export function Coordinates({
  position,
  approximate = false,
}: {
  position: LatLng;
  approximate?: boolean;
}) {
  const { enqueueSnackbar } = useSnackbar();
  const text = formatLatLng(position);
  return (
    <span css={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
      <span
        css={{ fontFamily: 'monospace', fontSize: 12, whiteSpace: 'nowrap' }}
        title={approximate ? 'Average position of the records here' : undefined}
      >
        {approximate ? '≈ ' : ''}
        {text}
      </span>
      <IconButton
        title="Copy latitude, longitude"
        onClick={async () => {
          const ok = await copyText(text);
          enqueueSnackbar(
            ok ? `Copied ${text}` : 'Could not copy to the clipboard',
            {
              variant: ok ? 'success' : 'error',
              anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
            }
          );
        }}
        style={{ padding: 3 }}
      >
        <FileCopyOutlined style={{ fontSize: 15 }} />
      </IconButton>
      <Tooltip title="Open in Google Maps (new tab)">
        <a
          href={googleMapsUrl(position)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open in Google Maps"
          css={{ display: 'inline-flex', padding: 3, color: 'inherit' }}
        >
          <Launch style={{ fontSize: 15 }} />
        </a>
      </Tooltip>
    </span>
  );
}
