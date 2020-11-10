import React from 'react';

import { debounce } from 'lodash';

import { IconAlt as Icon } from 'wdk-client/Components';
import CardList from './CardList';

import './Showcase.scss';
import ShowcaseFilter from './ShowcaseFilter';

class Showcase extends React.Component {
  constructor (props) {
    super(props);

    const { items } = props.content;
    this.state = { filteredItems: items };
    this.handleFilter = debounce(this.handleFilter.bind(this), 300);
  }

  UNSAFE_componentWillReceiveProps ({ content }) {
    const { items } = content;
    if (items !== this.props.items) {
      this.setState({ filteredItems: items });
    }
  }

  handleFilter (filteredItems) {
    this.setState({ filteredItems });
  }

  renderCardList (contentType, Card, props) {
    const { prefix, attemptAction, ...cardListProps } = props;
    return (
      <CardList
        {...cardListProps}
        attemptAction={attemptAction}
        additionalClassName={contentType}
        renderCard={(card) =>
          <Card card={card} attemptAction={attemptAction} prefix={prefix} key={card.name} />
        }
      />
    );
  }

  render () {
    const { handleFilter } = this;
    const { filteredItems: list } = this.state;
    const { content, prefix, attemptAction } = this.props;
    const { title, viewAllUrl, viewAllAppUrl, filters, filtersLabel, contentType, contentNamePlural, items, description, isLoading, isExpandable, tableViewLink, cardComponent, getSearchStringForItem, matchPredicate } = content;
    const cards = this.renderCardList(contentType, cardComponent, {
      attemptAction,
      contentNamePlural,
      filters,
      filtersLabel,
      isLoading,
      prefix,
      list,
      isExpandable,
      tableViewLink,
      getSearchStringForItem,
      matchPredicate
    });


    return (
      <div className="stack wdk-Showcase">
        <div className="row wdk-Showcase-HeadingRow">
          <div className="box">
            {!title ? null : <h2>{title}</h2>}
            {!description ? null : <p>{description}</p>}
          </div>
          <div className="box wdk-Showcase-HeadingControls">
            {/*!filters ? null : <ShowcaseFilter filters={filters} onFilter={handleFilter} items={items} />*/}
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
}

export default Showcase;
