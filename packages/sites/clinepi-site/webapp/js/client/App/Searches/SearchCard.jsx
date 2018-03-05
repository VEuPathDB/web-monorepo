import React from 'react';

import './SearchCard.scss';

import { IconAlt as Icon } from 'wdk-client/Components';
import studies from 'Client/data/studies.json';
import { getSearchIconByType, getSearchNameByType, getBodyClassByType } from './SearchUtils';

class SearchCard extends React.Component {
  constructor (props) {
    super(props);
    this.getStudyById = this.getStudyById.bind(this);
  }

  getStudyById (sid) {
    return studies.find(({ id }) => id === sid);
  }

  render () {
    const { search, prefix = '' } = this.props;
    const { type, studyId, url, appUrl, description, disabled } = search;

    const href = typeof appUrl === 'string'
      ? prefix + appUrl
      : url;

    const studyObj = this.getStudyById(studyId);

    const icon = getSearchIconByType(type);
    const name = getSearchNameByType(type);
    const bodyClass = getBodyClassByType(type);

    return (
      <div className={'Card LinkCard SearchCard ' + bodyClass + (disabled ? ' disabled' : '')}>
        <div className="box SearchCard-Header">
          <div className="box SearchCard-Icon">
            <Icon fa={icon} />
          </div>
          <h2>{studyObj ? studyObj.name : 'Unknown Study'}</h2>
          <h3>{name}</h3>
        </div>
        <div className="box SearchCard-Body">
          <p>{description}</p>
        </div>
        <a href={href} className="SearchCard-Footer">
          Explore Results <Icon fa={'chevron-circle-right'} />
        </a>
      </div>
    );
  }
};

export default SearchCard;
