import React from 'react';
import { connect } from 'react-redux';
import { useEda } from 'ebrc-client/config';
import { CategoryIcon } from 'ebrc-client/App/Categories';
import { IconAlt as Icon, Link } from '@veupathdb/wdk-client/lib/Components';
import { safeHtml } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import DownloadLink from './DownloadLink';
import { isPrereleaseStudy } from '@veupathdb/study-data-access/lib/data-restriction/DataRestrictionUtils';
import './StudyCard.scss';
import { makeEdaRoute } from 'ebrc-client/routes';
import { Tooltip } from '@veupathdb/components/lib/components/widgets/Tooltip'


class StudyCard extends React.Component {
  constructor (props) {
    super(props);
    this.state = { searchType: null };
    this.displaySearchType = this.displaySearchType.bind(this);
    this.clearDisplaySearchType = this.clearDisplaySearchType.bind(this);
  }

  displaySearchType (searchType) {
    this.setState({ searchType });
  }

  clearDisplaySearchType () {
    const searchType = null;
    this.setState({ searchType });
  }

  renderLinkouts() {
    const { analyses, attemptAction, card } = this.props;
    if (useEda) {
      return (
        <div className="StudyCard-LinkOuts">
         {// <DownloadLink className="box StudyCard-Download" linkText="Download" iconFirst studyAccess={card.access} studyId={card.id} studyUrl={card.downloadUrl.url} attemptAction={attemptAction}/>
          }
          {analyses?.some(analysis => analysis.studyId === card.id) &&
            <div className="box StudyCard-MyAnalyses">
              <Link to={{ pathname: makeEdaRoute(), search: `?s=${encodeURIComponent(card.name)}` }}>
                <i className="ebrc-icon-table"/> My analyses
              </Link>
            </div>
          }
        </div>
      );
    }
    else {
      return (
        <DownloadLink className="box StudyCard-Download" linkText="Download Data" studyAccess={card.access} studyId={card.id} studyUrl={card.downloadUrl.url} attemptAction={attemptAction}/>
      );
    }
  }

  renderFooter() {
    const { card, permissions } = this.props;
    if (useEda) {
      const { disabled } = card;
      const edaRoute = makeEdaRoute(card.id) + '/new';
      return (
        <Link className="StudyCard-SearchLink" to={edaRoute}>
          <div className="box StudyCard-PreFooter">
            { isPrereleaseStudy(card.access, card.id, permissions)
              ? <span title="Please check the study page">Coming Soon!</span>
              : <span>{disabled ? 'Explore Unavailable' : 'Explore The Data'}</span>
            }
          </div>
          <div className="box StudyCard-Footer">
            { (!isPrereleaseStudy(card.access, card.id, permissions))
             ? (
               <div className="box">
                 <i className="ebrc-icon-edaIcon"/>
               </div>
             ) : (
               <div className="emptybox">
                 &nbsp;
               </div>
             )}
          </div>
        </Link>
      );
    }
    else {
      const { searchType } = this.state;
      const { searches, disabled } = card;
      return (
        <>
          <div className="box StudyCard-PreFooter">
            { isPrereleaseStudy(card.access, card.id, permissions)
              ? <span title="Please check the study page">Coming Soon!</span>
              : searchType
                ? <span>by <b>{searchType}</b></span>
                : <span title="Click on an Icon">{disabled ? 'Explore Unavailable' : 'Explore The Data'}</span>
            }
          </div>
          <div className="box StudyCard-Footer">
            { (!isPrereleaseStudy(card.access, card.id, permissions) && searches.length)
              ? searches.map(({ icon, displayName, path }) => {
                  const route = `/search/${path}`;
                  return (
                    <div
                      key={path}
                      className="box"
                      onMouseEnter={() => this.displaySearchType(displayName)}
                      onMouseLeave={this.clearDisplaySearchType}>
                      <Link className="StudyCard-SearchLink" to={route}>
                        <i className={icon} />
                      </Link>
                    </div>
                  );
                })
              : (
                <div className="emptybox">
                  &nbsp;
                </div>
              )}
          </div>
        </>
      );
    }
  }

  render () {
    const { card } = this.props;
    const { id, name, categories, route, headline, points, disabled } = card;
    const myStudyTitle = "Go to the Study Details page";
    const primaryCategory = categories[0];
    const edaRoute = makeEdaRoute(card.id) + '/new';

    return (
      <div className={'Card StudyCard ' + (disabled ? 'disabled' : '') + ' StudyCard__' + id}>
        <div className="box StudyCard-Heading">
          <h2>
            <Tooltip title={myStudyTitle}>
              <Link to={useEda ? edaRoute + '/details' : route}>{safeHtml(name)}</Link>
            </Tooltip>
          </h2>
          <div className="box StudyCard-Categories">
            {primaryCategory && <CategoryIcon category={primaryCategory}/>}
          </div>
          {/*<Link to={route} target="_blank" title={myStudyTitle}>
            <Icon fa="angle-double-right" /> 
          </Link> */}
        </div>
        <Tooltip title={myStudyTitle}>
          <Link to={useEda ? edaRoute + '/details' : route} className="StudyCard-DetailsLink">
            <small>Study Details <Icon fa="chevron-circle-right" /></small>
          </Link>
        </Tooltip>
        <div className="box StudyCard-Stripe">
          {headline}
        </div>
        <div className="box StudyCard-Body">
          <ul>
            {points.map((point, index) => <li key={index} dangerouslySetInnerHTML={{ __html: point }} />)}
          </ul>
        </div>
        {this.renderLinkouts()}
        {this.renderFooter()}
      </div>
    );
  }
}

export default StudyCard;
