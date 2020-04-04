import React from 'react';
import { Link } from 'react-router-dom';
import { useWdkService } from 'wdk-client/Hooks/WdkServiceHook';
import { GenomeViewFeatureModel, GenomeViewSequenceModel } from 'wdk-client/Utils/GenomeSummaryViewUtils';

const PORTAL_SITE_PROJECT_ID = 'EuPathDB';

interface FeatureTooltipProps {
  feature: GenomeViewFeatureModel;
  sequence: GenomeViewSequenceModel;
  recordType: string;
}

export const FeatureTooltip: React.SFC<FeatureTooltipProps> = ({
  feature,
  sequence,
  recordType,
}) => {
  const config = useWdkService(wdkService => wdkService.getConfig(), []);
  const isPortalSite = config?.projectId === PORTAL_SITE_PROJECT_ID;

  return (
    <div id={feature.sourceId}>
      <h4>{feature.sourceId}</h4>
      <p>
        start: {`${feature.startFormatted}, end: ${feature.endFormatted}, on ${feature.strand} strand of ${sequence.sourceId}`}
      </p>
      <p>
        {feature.description}
      </p>
      {
        !isPortalSite &&
        <ul>
          <li>
            <Link to={`/record/${recordType}/${feature.sourceId}`} target="_blank">
              <u>
                Record page
              </u>
            </Link>
          </li>
          <li>
            <Link to={`/jbrowse?loc=${feature.context}&tracks=gene&data=/a/service/jbrowse/tracks/${sequence.organismAbbrev}`} target="_blank">
              <u>
                Genome browser
              </u>
            </Link>
          </li>
        </ul>
      }
    </div>
  );
};
