import React from 'react';

import { Dialog, Tooltip } from 'wdk-client/Components';
import { GenomeViewSequenceModel, GenomeViewRegionModel } from 'wdk-client/Utils/GenomeSummaryViewUtils';
import { FeatureTable } from 'wdk-client/Components/GenomeSummaryView/FeatureTable';
import { FeatureTooltip } from 'wdk-client/Components/GenomeSummaryView/FeatureTooltip';

interface RegionDialogProps {
  region: GenomeViewRegionModel;
  sequence: GenomeViewSequenceModel;
  open: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  displayName: string;
  displayNamePlural: string;
  siteName: string;
  recordType: string;
  webAppUrl: string;
}

export const RegionDialog: React.SFC<RegionDialogProps> = ({
  region,
  sequence,
  open,
  onOpen,
  onClose,
  displayName,
  displayNamePlural,
  siteName,
  recordType,
  webAppUrl
}) => (
  <Dialog onClose={onClose} onOpen={onOpen} open={open}>
    <div key={region.sourceId} className="region">
      <h4>Region {region.stringRep}</h4>
      <div>  has {region.featureCount} {displayNamePlural}</div>
      <div>Region location:</div>
      <div className="end">{region.endFormatted}</div>
      <div className="start">{region.startFormatted}</div>
      <div className="canvas">
        <div className="ruler">
          {
            region.features.map(feature =>
              <Tooltip
                content={
                  <FeatureTooltip
                    feature={feature}
                    sequence={sequence}
                    recordType={recordType}
                    webAppUrl={webAppUrl}
                    siteName={siteName}
                  />
                }
              >
                <div 
                  key={feature.sourceId} 
                  className={`feature ${region.strand}`}
                  style={{
                    left: `${feature.percentStart}%`,
                    width: `${feature.percentLength}%`
                  }}
                >
                </div>      
              </Tooltip>        
            )
          }
        </div>
      </div>
      <br />
      <ul className="legend">
        {
          region.isForward
            ? <li> * <div className="icon feature forward"> </div> {displayNamePlural} on forward strand;</li>
            : <li> * <div className="icon feature reversed"> </div> {displayNamePlural} on reversed strand;</li>
        }
      </ul>
      <FeatureTable
        region={region}
        displayName={displayName}
        displayNamePlural={displayNamePlural}
        recordType={recordType}
        siteName={siteName}
        webAppUrl={webAppUrl}
      />
    </div>
  </Dialog>
);