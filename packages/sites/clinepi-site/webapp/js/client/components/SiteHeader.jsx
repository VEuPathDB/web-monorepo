import React from 'react';
import { connect } from 'react-redux';
import { getStaticSiteData } from '../selectors/siteData';
import Header from 'Client/App/Header';
import { DataRestrictionDaemon } from 'Client/App/DataRestriction';

export default connect((state, props) => {
  const siteData = getStaticSiteData(state);
  const { dataRestriction } = state;
  const { user = {}, siteConfig, preferences, ...actions } = props;
  return { user, siteConfig, preferences, actions, siteData, dataRestriction };
})(props => {
  return <div>
    <Header {...props} />
    <DataRestrictionDaemon {...props} />
  </div>;
});
