import React, { useContext, useMemo } from 'react';
import { useAnalysisList } from '@veupathdb/eda/lib/core/hooks/analysis';
import { AnalysisClient } from '@veupathdb/eda/lib/core/api/AnalysisClient';
import { WdkDependenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';
import { edaServiceUrl } from '../../config';
import { Showcase } from '../../App/Showcase';
import { News } from '../../App/NewsSidebar';
import { FeaturedTools } from '../../components/homepage/FeaturedTools';
import { WorkshopExercises } from '../../components/homepage/WorkshopExercises';

import './HomePage.scss';

import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
const cx = makeClassNameHelper('vpdb-');

export default function HomePage({
  newsSidebar,
  twitterUrl,
  webAppUrl,
  projectId,
  siteData,
  attemptAction,
  homeContent,
}) {
  const { wdkService } = useContext(WdkDependenciesContext);
  const analysisClient = useMemo(
    () =>
      new AnalysisClient(
        {
          baseUrl: edaServiceUrl,
        },
        wdkService
      ),
    [wdkService]
  );
  const { analyses } = useAnalysisList(analysisClient);
  return (
    <div className="HomePage">
      <div className="Showcase-Section">
        <div className={cx('MainContent')}>
          <FeaturedTools />
          <hr />
          <WorkshopExercises />
        </div>
      </div>
      <div className="News-Section">
        <News twitterUrls={[twitterUrl]} {...newsSidebar} />
      </div>
    </div>
  );
}
