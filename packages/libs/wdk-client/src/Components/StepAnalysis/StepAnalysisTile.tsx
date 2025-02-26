import React from 'react';
import Spinnable from '../Shared/Spinnable';
import { memoize } from 'lodash/fp';
import { Tooltip } from '@veupathdb/coreui';

interface StepAnalysisTileProps {
  shortDescription: string;
  customThumbnailUrl?: string;
  displayName: string;
  inactive: boolean;
  newRelease: boolean;
  loading: boolean;
  loadChoice: () => void;
}

export const StepAnalysisTile: React.FC<StepAnalysisTileProps> = ({
  shortDescription,
  customThumbnailUrl,
  displayName,
  inactive,
  newRelease,
  loading,
  loadChoice,
}) => (
  <Tooltip title={shortDescription} placement="bottom">
    <div
      className={`${inactive ? 'inactive ' : ''}analysis-selector`}
      title={shortDescription}
      onClick={inactive ? NOOP : loadChoice}
      onKeyDown={inactive ? NOOP : onKeyDownFactory(loadChoice)}
      tabIndex={0}
    >
      {inactive && (
        <div className="analysis-selection-banner">Coming soon...</div>
      )}
      {newRelease && (
        <div className="analysis-selection-banner new-analysis"></div>
      )}
      <Spinnable
        className="analysis-selector-image"
        style={tileStyle(customThumbnailUrl)}
        spinning={loading}
      />
      <div className="analysis-selector-content">
        <div className="analysis-selector-title">{displayName}</div>
        <p className="analysis-selector-description">{shortDescription}</p>
      </div>
    </div>
  </Tooltip>
);

const ENTER_KEY_CODE = 13;

const onKeyDownFactory = memoize(
  (loadChoice: () => void) => (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.which === ENTER_KEY_CODE) {
      loadChoice();
    }
  }
);

const NOOP = () => {};

const tileStyle = (customThumbnailUrl?: string): React.CSSProperties =>
  customThumbnailUrl
    ? {
        backgroundImage: `url(${customThumbnailUrl})`,
        height: '140px',
      }
    : {
        height: '140px',
      };
