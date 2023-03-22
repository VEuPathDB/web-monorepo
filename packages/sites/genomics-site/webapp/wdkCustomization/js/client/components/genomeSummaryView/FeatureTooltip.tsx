import React from 'react';
import { Link } from 'react-router-dom';
import {
  GenomeViewFeatureModel,
  GenomeViewSequenceModel,
  useIsPortalSite
} from '../../util/GenomeSummaryViewUtils';

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
  const isPortalSite = useIsPortalSite();

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
          {/* <li>
            <Link to={`/jbrowse?loc=${feature.context}&tracks=gene&data=/a/service/jbrowse/tracks/${sequence.organismAbbrev}`} target="_blank">
              <u>
                Genome browser
              </u>
            </Link>
          </li> */}
        </ul>
      }
    </div>
  );
};
