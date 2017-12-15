import React from 'react';

import './StudyCard.scss';

import { CategoryIcon } from 'Client/App/Categories';
import { IconAlt as Icon } from 'wdk-client/Components';
import { getSearchIconByType, getSearchNameByType } from 'Client/App/SearchCard/SearchUtils';

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
    const { study } = this.props;
    const { searchType } = this.state;
    const { name, categories, url, headline, points, searchUrls, disabled } = study;

    return (
      <stack className={'Card StudyCard ' + (disabled ? 'disabled' : '')}>
        <box className="StudyCard-Heading">
          <h2>{name}</h2>
          <box className="StudyCard-Categories">
            {categories.map(cat => <CategoryIcon category={cat} key={cat} />)}
          </box>
          <a href={url} target="_blank">
            <Icon fa="angle-double-right" />
          </a>
        </box>
        <box className="StudyCard-Stripe">
          {headline}
        </box>
        <box className="StudyCard-Body">
          <ul>
            {points.map((point, idx) => <li key={idx} dangerouslySetInnerHTML={{ __html: point }} />)}
          </ul>
        </box>
        <box className="StudyCard-PreFooter">
          {searchType
            ? <span>Search for <b>{searchType}</b></span>
            : <span className="generic">{disabled ? 'Search Unavailable' : 'Search The Data'}</span>
          }
        </box>
        <box className="StudyCard-Footer">
          {Object.entries(searchUrls).map(entry => {
            const [ type, searchUrl ] = entry;
            const icon = getSearchIconByType(type)
            return (
              <box
                key={type}
                onMouseEnter={() => this.displaySearchType(type)}
                onMouseLeave={this.clearDisplaySearchType}>
                <a href={searchUrl}>
                  <Icon fa={icon} />
                </a>
              </box>
            );
          })}
        </box>
      </stack>
    );
  }
};

export default StudyCard;
