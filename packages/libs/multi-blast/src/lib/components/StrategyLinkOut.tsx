import { useState } from 'react';

import { AnchoredTooltip } from '@veupathdb/coreui/lib/components/Mesa';

import './StrategyLinkOut.scss';

export function StrategyLinkOut(props: {
  classNamePrefix?: string;
  onClick?: () => void;
  tooltipContent: string;
}) {
  const [loading, setLoading] = useState(false);
  const handleClick = () => {
    setLoading(true);
    onClick && onClick();
  };
  const {
    classNamePrefix = 'StrategyLinkOut',
    onClick,
    tooltipContent,
  } = props;
  const disabled = loading || onClick == null;
  return (
    <div className={classNamePrefix}>
      <AnchoredTooltip content={tooltipContent}>
        <button
          disabled={disabled}
          className="btn"
          type="button"
          onClick={handleClick}
        >
          <div className={`${classNamePrefix}--Text`}>
            <div>Export as a Search Strategy</div>
            <div>
              <small>to download or mine your results</small>
            </div>
          </div>
          <div className={`${classNamePrefix}--Arrow`}>
            <i className="fa fa-caret-right" />
          </div>
        </button>
      </AnchoredTooltip>
    </div>
  );
}
