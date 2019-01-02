import { RecordClass, GenomeSummaryViewReport } from 'wdk-client/Utils/WdkModel';

import React from 'react';

const record: GenomeSummaryViewReport = { sequences: [], isDetail: false, maxLength: 10 };

const locationCellRenderFactory = (recordClass: RecordClass) => ({ row: sequence }: { row: any }) =>
  <div className="canvas">
    <div 
      className="ruler" 
      title={`${sequence.sourceId}, length: ${sequence.length}`}
      style={{ width: sequence.percentLength }}
    >
      {
        sequence.regions.map((region: any) =>
          <Region 
            key={region.sourceId} 
            recordClass={recordClass}
            region={region}
          />
        )
      }
    </div>
  </div>;

interface RegionProps {
  recordClass: RecordClass;
  region: any;
}

const Region: React.SFC<RegionProps> = ({ 
  recordClass, 
  region 
}) => region.featureCount > 1
  ? <MultiFeatureRegion recordClass={recordClass} region={region} />
  : <SingleFeatureRegion region={region} feature={region[0]} />

type MultiFeatureRegionProps = RegionProps;

const MultiFeatureRegion: React.SFC<MultiFeatureRegionProps> = ({
  recordClass,
  region
}) => 
  <div
    className={`region ${region.strand}`}
    title={`${region}, with ${region.featureCount} ${recordClass.displayNamePlural}. Click to view detail.`}
    style={{
      left: `${region.percentStart}%`,
      width: `${region.percentLength}%`
    }}
  >
  </div>;

interface SingleFeatureRegionProps {
  region: any;
  feature: any;
}

const SingleFeatureRegion: React.SFC<SingleFeatureRegionProps> = ({ 
  region, 
  feature 
}) =>
  <div
    className={`feature ${feature.strand}`}
    style={{ 
      left: `${region.percentStart}%`,
      width: `${region.percentLength}%` 
    }}
  >
  </div>;

