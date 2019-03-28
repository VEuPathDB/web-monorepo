import React from 'react';
import { GenomeViewFeatureModel, GenomeViewSequenceModel } from 'wdk-client/Utils/GenomeSummaryViewUtils';

interface FeatureTooltipProps {
  feature: GenomeViewFeatureModel;
  sequence: GenomeViewSequenceModel;
  recordType: string;
  webAppUrl: string;
  siteName: string;
}

export const FeatureTooltip: React.SFC<FeatureTooltipProps> = ({
  feature,
  sequence,
  recordType,
  webAppUrl,
  siteName
}) => (
  <div id={feature.sourceId}>
    <h4>{feature.sourceId}</h4>
    <p>
      start: {`${feature.startFormatted}, end: ${feature.endFormatted}, on ${feature.strand} strand of ${sequence.sourceId}`}
    </p>
    <p>
      {feature.description}
    </p>
    <ul>
      <li>
        <a href={`${webAppUrl}/app/record/${recordType}/${feature.sourceId}`} target="_blank">
          <u>
            Record page
          </u>
        </a>
      </li>
      <li>
        <a href={`/cgi-bin/gbrowse/${siteName}/?name=${feature.context};h_feat=${feature.sourceId}@yellow`} target="_blank">
          <u>
            Gbrowse
          </u>
        </a>
      </li>
    </ul>
  </div>
);
