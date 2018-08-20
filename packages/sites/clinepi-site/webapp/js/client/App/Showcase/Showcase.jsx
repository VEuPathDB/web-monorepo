import React from 'react';

import './Showcase.scss';
import ShowcaseFilter from './ShowcaseFilter';

import { IconAlt as Icon } from 'wdk-client/Components';
import { StudyCardList } from 'Client/App/Studies';
import { SearchCardList } from 'Client/App/Searches';
import { ImageCardList } from 'Client/App/ImageCard';

class Showcase extends React.Component {
  constructor (props) {
    super(props);

    const { items } = props.content;
    this.state = { filteredItems: items };
    this.handleFilter = this.handleFilter.bind(this);
    this.componentWillReceiveProps = this.componentWillReceiveProps.bind(this);
  }

  componentWillReceiveProps ({ content }) {
    const { items } = content;
    if (items !== this.props.items) {
      this.setState({ filteredItems: items });
    }
  }

  handleFilter (filteredItems) {
    this.setState({ filteredItems });
  }

  getListRenderer (contentType, props) {
    switch (contentType.toLowerCase()) {
      case 'studycardlist':
        return <StudyCardList {...props} />
      case 'searchcardlist':
        return <SearchCardList {...props} />
      case 'imagecardlist':
        return <ImageCardList {...props} />
    }
  }

  render () {
    const { handleFilter } = this;
    const { filteredItems } = this.state;
    const { content, prefix, projectId, attemptAction } = this.props;
    const { title, viewAllUrl, viewAllAppUrl, filters, contentType, items, description } = content;
    const cards = this.getListRenderer(contentType, {
      attemptAction,
      prefix,
      projectId,
      list: filteredItems
    });


    return (
      <div className="stack wdk-Showcase">
        <div className="row wdk-Showcase-HeadingRow">
          <div className="box">
            {!title ? null : <h2>{title}</h2>}
            {!description ? null : <p>{description}</p>}
          </div>
          <div className="box wdk-Showcase-HeadingControls">
            {!filters ? null : <ShowcaseFilter filters={filters} onFilter={handleFilter} items={items} />}
            {!viewAllUrl && !viewAllAppUrl ? null : (
              <a href={viewAllAppUrl ? prefix + viewAllAppUrl : viewAllUrl}>
                <button className="ViewAll">View All <Icon fa="angle-double-right" /></button>
              </a>
            )}
          </div>
        </div>
        <div className="row wdk-Showcase-ContentRow">
          {cards}
        </div>
      </div>
    );
  }
};

export default Showcase;
