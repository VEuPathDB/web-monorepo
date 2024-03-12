import React from 'react';
import { Tooltip } from '@veupathdb/coreui';

const defaultOptions = {
  position: {
    my: 'top left',
    at: 'bottom left',
  } as const,
  hide: {
    fixed: true,
    delay: 250,
  },
  show: {
    solo: true,
    delay: 1000,
  },
};

const positionMap = {
  'top left': 'top-start',
  'top center': 'top',
  'top right': 'top-end',
  'right center': 'right',
  'bottom right': 'bottom-end',
  'bottom center': 'bottom',
  'bottom left': 'bottom-start',
  'left center': 'left',
} as const;

type PositionValue = keyof typeof positionMap;

export interface TooltipPosition {
  my?: PositionValue;
  at?: PositionValue;
}

// FIXME Add `renderContent` props that is a function that returns `typeof content`
type Props = {
  content: React.ReactNode;
  children: React.ReactElement;
  classes?: string;
  showEvent?: string;
  showDelay?: number;
  hideEvent?: string;
  hideDelay?: number;
  position?: TooltipPosition;
};

const WDKClientTooltip = ({
  content,
  children,
  classes = 'qtip-wdk',
  showDelay = defaultOptions.show.delay,
  hideDelay = defaultOptions.hide.delay,
  position = defaultOptions.position,
}: Props) => {
  const placement = positionMap[position.at ?? defaultOptions.position.at];

  return (
    <Tooltip
      title={content ?? <></>}
      className={classes}
      arrow={true}
      enterDelay={showDelay}
      leaveDelay={hideDelay}
      placement={placement}
    >
      {children}
    </Tooltip>
  );
};

export default WDKClientTooltip;
