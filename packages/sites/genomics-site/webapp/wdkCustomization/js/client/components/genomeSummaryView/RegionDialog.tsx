import React from 'react';

import { Dialog } from '@veupathdb/wdk-client/lib/Components';
import { GenomeViewSequenceModel, GenomeViewRegionModel } from '../../util/GenomeSummaryViewUtils';
import { FeatureTable } from './FeatureTable';
import { FeatureTooltip } from './FeatureTooltip';
import { Tooltip } from '@veupathdb/components/lib/components/widgets/Tooltip';

interface RegionDialogProps {
  region: GenomeViewRegionModel;
  sequence: GenomeViewSequenceModel;
  open: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  displayName: string;
  displayNamePlural: string;
  recordType: string;
}

export const RegionDialog: React.SFC<RegionDialogProps> = ({
  region,
  sequence,
  open,
  onOpen,
  onClose,
  displayName,
  displayNamePlural,
  recordType,
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
                key={feature.sourceId}
                interactive
                title={
                  <FeatureTooltip
                    feature={feature}
                    sequence={sequence}
                    recordType={recordType}
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
        sequence={sequence}
        displayName={displayName}
        displayNamePlural={displayNamePlural}
        recordType={recordType}
      />
    </div>
  </Dialog>
);
