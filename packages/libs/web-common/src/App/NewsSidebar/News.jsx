import { compose, replace, truncate } from 'lodash/fp';
import React from 'react';

import { Link } from '@veupathdb/wdk-client/lib/Components';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { Seq } from '@veupathdb/wdk-client/lib/Utils/IterableUtils';

import { STATIC_ROUTE_PATH } from 'ebrc-client/routes';
import TwitterTimeline from 'ebrc-client/components/TwitterTimeline';

import './News.scss';

const transformNewItem = compose(
  truncate({ length: 200 }),
  replace(/(<([^>]+)>)/ig, '') // strip html chars
);

const getProfileIdFromTwitterUrl =
  replace(/(?:.*)twitter.com\/(.*)$/, '$1')

function useNewsUrl() {
  const config = useWdkService(wdkService => wdkService.getConfig(), []);

  return `${STATIC_ROUTE_PATH}/${(config || {}).displayName}/news.html`;
}

const News = ({ twitterUrls, news, error }) => {
  const newsUrl = useNewsUrl();

  return (
    <React.Fragment>
      <div className="stack wdk-Showcase">
        <div className="row wdk-Showcase-HeadingRow">
          <div className="box">
            <h2>News</h2>
          </div>
        </div>
        <div className="row wdk-Showcase-ContentRow">
          <div className="News">
            <div className="NewsList">
            {error && <div className="NewsLoadError"><em>Error loading news items.</em></div>}
            {Seq.from(news ? news.records : Seq.empty())
                .map(({ attributes }) => (
                  <div className="NewsEntry" key={attributes.id}>
                    <h4 className="NewsHeadline">
                      <Link to={`${newsUrl}#${attributes.tag}`}>
                        {attributes.headline}
                      </Link>
                    </h4>
                    <div className="NewsDate">{new Date(attributes.date.replace(/-/g, '\/')).toDateString()}</div>
                    <div className="NewsTeaser">
                      {transformNewItem(attributes.item)} <Link to={`${newsUrl}#${attributes.tag}`}> read more</Link>
                    </div>
                  </div>
                ))
            //    .take(2)
                .toArray()}
            </div>
            <Link className="AllNewsLink" to={newsUrl}>See all news</Link>
          </div>
          {twitterUrls.map(twitterUrl =>
            <TwitterTimeline key={twitterUrl} theme="light" linkColor="#0f5970" height={1140} profileId={getProfileIdFromTwitterUrl(twitterUrl)}/>
          )}
        </div>
      </div>
    </React.Fragment>
  );
};

export default News;
