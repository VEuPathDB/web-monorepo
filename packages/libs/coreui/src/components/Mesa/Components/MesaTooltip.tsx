import React, { CSSProperties } from 'react';

import { Tooltip } from '../../info/Tooltip';

interface Position {
  top?: CSSProperties['top'];
  left?: CSSProperties['left'];
}

interface MesaTooltipProps {
  hideDelay?: number;
  showDelay?: number;
  children: React.ReactElement;
  className?: string;
  content: React.ReactNode;
  corner?: string;
  position?: Position;
  style?: CSSProperties;
  getPosition?: () => Position;
  renderHtml?: boolean;
}

const MesaTooltip = ({
  hideDelay,
  showDelay,
  children,
  className,
  content,
  corner,
  position,
  style,
  getPosition,
  renderHtml,
}: MesaTooltipProps) => {
  const getPositionResult = getPosition?.();
  const currentPosition = position
    ? {
        top: position?.top ?? 0,
        left: position?.left ?? 0,
      }
    : getPositionResult
    ? {
        top: getPositionResult?.top ?? 0,
        left: getPositionResult?.left ?? 0,
      }
    : { top: 0, left: 0 };
  const finalStyle = {
    top: currentPosition.top,
    left: currentPosition.left,
    ...style,
  };

  return (
    <Tooltip
      title={
        renderHtml ? (
          <div dangerouslySetInnerHTML={{ __html: content as string }} />
        ) : (
          content ?? <></>
        )
      }
      leaveDelay={hideDelay}
      enterDelay={showDelay}
      // arrow={corner ? corner !== 'no-corner' : false}
      className={className + (corner ? ` ${corner}` : '')}
      style={finalStyle}
    >
      {children}
    </Tooltip>
  );
};

export default MesaTooltip;
