import React from 'react';

import './StudyCard.scss';

import { CategoryIcon } from 'Client/App/Categories';
import { IconAlt as Icon, Link } from 'wdk-client/Components';
import { getSearchIconByType, getSearchNameByType } from 'Client/App/Searches/SearchUtils';

class StudyCard extends React.Component {
  constructor (props) {
    super(props);
    this.state = { searchType: null };
    this.displaySearchType = this.displaySearchType.bind(this);
    this.clearDisplaySearchType = this.clearDisplaySearchType.bind(this);
  }

  displaySearchType (type) {
    const searchType = getSearchNameByType(type);
    this.setState({ searchType });
  }

  clearDisplaySearchType () {
    const searchType = null;
    this.setState({ searchType });
  }

  render () {
    const { study, prefix, projectId } = this.props;
    const { searchType } = this.state;
    const { name, categories, route, headline, points, searchUrls, disabled, downloadUrl } = study;
    const myStudyTitle = "Go to the Study Details page.";
    const myDownloadTitle = "The files folder will open in a new browser tab.";

    return (
      <div className={'Card StudyCard ' + (disabled ? 'disabled' : '')}>
        <div className="box StudyCard-Heading">
          <h2 title={myStudyTitle}><Link to={route}>{name}</Link></h2>
          <div className="box StudyCard-Categories">
            {categories.map(cat => (
              <CategoryIcon category={cat} key={cat} />
            ))}
          </div>
          {/*<Link to={route} target="_blank" title={myStudyTitle}>
            <Icon fa="angle-double-right" /> 
          </Link> */}
        </div>
        <Link to={route} className="StudyCard-DetailsLink" title={myStudyTitle}>
          <small>Study Details <Icon fa="chevron-circle-right"/></small>
        </Link>
        <div className="box StudyCard-Stripe">
          {headline}
        </div>
        <div className="box StudyCard-Body">
          <Link to={route} title={myStudyTitle}>
            <ul>
              {points.map((point, index) => <li key={index} dangerouslySetInnerHTML={{ __html: point }} />)}
            </ul>
          </Link>
        </div>
        <div className="box StudyCard-Download">
          <a href={downloadUrl.url} target="_blank" title={myDownloadTitle}>
            Download Data <Icon fa="download"/></a>
        </div>
        <div className="box StudyCard-PreFooter">
          {searchType
            ? <span>Search <b>{searchType}</b></span>
            : <span className="generic">{disabled ? 'Search Unavailable' : 'Search The Data'}</span>
          }
        </div>
        <div className="box StudyCard-Footer">
          {Object.entries(searchUrls).map(entry => {
            const [ type, searchUrl ] = entry;
            const icon = getSearchIconByType(type);
            const webappUrl = (prefix ? prefix : '') + searchUrl;
            return (
              <div
                key={type}
                className="box"
                onMouseEnter={() => this.displaySearchType(type)}
                onMouseLeave={this.clearDisplaySearchType}>
                <a href={webappUrl}>
                  <Icon fa={icon} />
                </a>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
};

export default StudyCard;
