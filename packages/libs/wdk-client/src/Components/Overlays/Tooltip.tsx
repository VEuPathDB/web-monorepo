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
  content: React.ReactNode; // title
  children: React.ReactElement; // children
  // open?: boolean; // open
  classes?: string; // classes
  // showTip?: boolean; // arrow
  showEvent?: string;
  showDelay?: number; // enterDelay
  hideEvent?: string;
  hideDelay?: number; // leaveDelay
  position?: TooltipPosition;
  // solo?: boolean;
  // onShow?: (e: Event) => void; // onOpen
  // onHide?: (e: Event) => void; // onClose
};

const WDKClientTooltip = ({
  content,
  children,
  // open,
  classes = 'qtip-wdk',
  // showTip = true,
  // showEvent,
  showDelay = defaultOptions.show.delay,
  // hideEvent,
  hideDelay = defaultOptions.hide.delay,
  position = defaultOptions.position,
}: // solo = true,
// onShow,
// onHide,
Props) => {
  const placement = positionMap[position.at ?? defaultOptions.position.at];

  return (
    <Tooltip
      title={content ?? <></>}
      // open={open}
      className={classes}
      arrow={true}
      enterDelay={showDelay}
      leaveDelay={hideDelay}
      // onOpen={onShow}
      // onClose={onHide}
      placement={placement}
    >
      {children}
    </Tooltip>
  );
};

export default WDKClientTooltip;
