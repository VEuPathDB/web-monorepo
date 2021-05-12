import React, { ReactNode, CSSProperties } from 'react';

export interface LabelledGroupProps {
  /** Contents of the menu when opened */
  children: ReactNode;
  /** Contents of button */
  label: ReactNode;
  /** optional width of box (CSS width property) */
  width?: CSSProperties['width'];
}

/**
 * Renders a grey outlined box with a label in the top left of the outline/border
 *
 * But renders nothing if no children are contained within it.
 */
export default function LabelledGroup(props: LabelledGroupProps) {
  const { children, label, width } = props;
  if (children == null) return null;
  return (
    <div
      style={{
        display: 'inline-flex',
        borderStyle: 'solid',
        borderWidth: '0.125em',
        borderColor: '#cccccc',
        borderRadius: '0.2em',
        padding: '1em',
        width: width ?? '30em',
        minWidth: '11em',
        marginTop: '1.5625em',
        marginRight: '1.5625em',
      }}
    >
      {/* wrapper div to prevent from inline-flex */}
      <div>
        <div
          style={{
            display: 'inline-block',
            position: 'relative',
            top: '-1.65em',
            paddingLeft: '0.3em',
            paddingRight: '0.3em',
            background: 'white',
            textAlign: 'center',
          }}
        >
          {label}
        </div>
        {children}
      </div>
    </div>
  );
}
