import React from 'react';
import { Link } from 'react-router-dom';
import { IconAlt as Icon } from '@veupathdb/wdk-client/lib/Components';
import { safeHtml } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { makeEdaRoute } from 'ebrc-client/routes';
import './AnalysisCard.scss';

interface Props {
  card: {
    displayName: string;
    studyDisplayName: string;
    description: string;
    analysisId: string;
    studyId: string;
  }
}

export function AnalysisCard(props: Props) {
  const { displayName, studyDisplayName, description, studyId, analysisId } = props.card;

  const link = `/${analysisId}/import`;

  return (
    <div className="Card LinkCard AnalysisCard">
      <div className="box AnalysisCard-Header">
        <div className="box AnalysisCard-Icon">
          <i className="ebrc-icon-edaIcon" />
        </div>
        <h2>{displayName}</h2>
        <h3>{safeHtml(studyDisplayName)}</h3>
      </div>
      <div className="box AnalysisCard-Body">
        {safeHtml(description, null, 'div')}
      </div>
      <Link to={makeEdaRoute(studyId) + link} className="AnalysisCard-Footer">
        See Analysis <Icon fa={'chevron-circle-right'} />
      </Link>
    </div>
  );
}
