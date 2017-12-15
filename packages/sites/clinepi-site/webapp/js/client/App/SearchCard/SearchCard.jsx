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
    const { search } = this.props;
    const { type, study, url, description } = search;

    const studyObj = this.getStudyById(study);

    const icon = getSearchIconByType(type);
    const name = getSearchNameByType(type);
    const bodyClass = getBodyClassByType(type);

    return (
      <div className={'Card LinkCard SearchCard ' + bodyClass}>
        <box className="SearchCard-Icon">
          <Icon fa={icon} />
        </box>
        <box className="SearchCard-Body">
          <h2>{studyObj ? studyObj.name : 'Unknown Study'}</h2>
          <h3>{name}</h3>
          <p>{description}</p>
        </box>
        <a href={url} className="SearchCard-Footer">
          Explore Results <Icon fa={'chevron-circle-right'} />
        </a>
      </div>
    );
  }
};

export default SearchCard;
