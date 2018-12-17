import React from 'react';
import { Loading, Tooltip } from '../../../../Components';
import Spinnable from '../Shared/Spinnable';

interface StepAnalysisTileProps {
  shortDescription: string;
  customThumbnailUrl?: string;
  displayName: string;
  inactive: boolean;
  newRelease: boolean;
  loading: boolean;
  loadChoice: () => void;
}

export const StepAnalysisTile: React.SFC<StepAnalysisTileProps> = ({
  shortDescription, 
  customThumbnailUrl, 
  displayName,
  inactive,
  newRelease,
  loading,
  loadChoice
}) => (
  <Tooltip content={shortDescription}>
    <div className={`${inactive ? 'inactive' : ''} analysis-selector`}
      title={shortDescription}
      onClick={loadChoice}
      onKeyDown={loadChoice}
    >
      {
        inactive &&
        <div className="analysis-selection-banner">Coming soon...</div>
      }
      {
        newRelease &&
        <div className="analysis-selection-banner new-analysis"></div>
      }
      {
        loading 
          ? <Spinnable className="analysis-selector-image" style={tileStyle(customThumbnailUrl)} />
          : <div className="analysis-selector-image" style={tileStyle(customThumbnailUrl)} />
      }
      <div className="analysis-selector-content">
        <div className="analysis-selector-title">{displayName}</div>
        <p className="analysis-selector-description">{shortDescription}</p>
      </div>
    </div>
  </Tooltip>
);

const tileStyle = (customThumbnailUrl?: string) =>
  customThumbnailUrl
    ? {
      backgroundImage: `url(${customThumbnailUrl})`
    } 
    : {};
