import React, { ReactNode } from 'react';
import { every } from 'lodash';
import { Typography } from '@material-ui/core';
import { DARKEST_GRAY } from '../../constants/colors';

export interface LabelledGroupProps {
  /** Contents of the menu when opened */
  children: ReactNode;
  /** Contents of button */
  label: ReactNode;
  /** Additional styles to apply to the widget container. */
  containerStyles?: React.CSSProperties;
}

/**
 * Renders a grey outlined box with a label in the top left of the outline/border
 *
 * But renders nothing if no children are contained within it.
 */
export default function LabelledGroup(props: LabelledGroupProps) {
  const { children, label, containerStyles } = props;

  // don't render anything if all the children (or no children) are null
  if (every(React.Children.toArray(children), (child) => child == null))
    return null;

  return (
    <div
      style={{
        display: 'inline-flex',
        borderStyle: 'none',
        borderWidth: '0.125em',
        borderColor: '#cccccc',
        borderRadius: '0.2em',
        padding: '1em',
        //        minWidth: '45%',
        // marginTop: '1.5625em',
        marginRight: '1.5625em',
        ...containerStyles,
      }}
    >
      {/* wrapper div to prevent from inline-flex */}
      <div>
        {label && (
          <Typography
            variant="button"
            style={{ color: DARKEST_GRAY, fontWeight: 500, fontSize: '1.2em' }}
          >
            {label}
          </Typography>
        )}
        {children}
      </div>
    </div>
  );
}
