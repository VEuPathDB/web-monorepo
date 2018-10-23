import React from 'react';
import { connect } from 'react-redux';
import { getStaticSiteData } from '../selectors/siteData';
import Header from 'Client/App/Header';
import { DataRestrictionDaemon } from 'Client/App/DataRestriction';
import headerMenuItems from '../data/headerMenuItems';
import Announcements from 'Client/components/Announcements';

export default connect((state, props) => {
  const siteData = getStaticSiteData(state);
  const { dataRestriction } = state;
  const { user = {}, siteConfig, preferences, ...actions } = props;
  const location = window.location;
  return { user, location, siteConfig, preferences, actions, siteData, dataRestriction, headerMenuItems };
})(props => {
  return <div>
    <Header {...props} />
    <DataRestrictionDaemon {...props} />
    <Announcements projectId={props.siteConfig.projectId}
                   webAppUrl={props.siteConfig.webAppUrl} 
                   location={props.location} 
                   announcements={props.siteConfig.announcements}/>
  </div>;
});
