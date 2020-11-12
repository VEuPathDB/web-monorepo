import React from 'react';

import { IconAlt as Icon, Mesa } from '@veupathdb/wdk-client/lib/Components';

class ShowcaseFilter extends React.Component {
  constructor (props) {
    super(props);
    const { filters } = props;
    this.state = { activeFilters: [] };
    this.toggleFilter = this.toggleFilter.bind(this);
    this.applyFilterToList = this.applyFilterToList.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (this.props.filters !== prevProps.filters) {
      this.setState({ activeFilters: [] });
    }
  }

  toggleFilter (id) {
    const { activeFilters } = this.state;
    let newFilters;
    if (activeFilters.includes(id)) {
      newFilters = [ ...activeFilters.filter(filterId => filterId !== id) ];
    } else {
      newFilters = [ ...activeFilters, id ];
    }
    this.setState({ activeFilters: newFilters }, this.applyFilterToList);
  }

  applyFilterToList () {
    const { activeFilters } = this.state;
    const { items, filters, onFilter } = this.props;
    if (!onFilter || !items || !filters) return;
    const remainingItems = activeFilters.length === 0 ? items : items.filter(item => {
      return activeFilters.some(filterId => {
        const filterObj = filters.find(({ id }) => id === filterId);
        if (!filterObj) return false;
        return filterObj.predicate(item);
      });
    });
    onFilter(remainingItems);
  }

  render () {
    const { filters } = this.props;
    const { activeFilters } = this.state;
    return (
      <div className="row wdk-ShowcaseFilter">
        {filters.map(({ id, display }) => {
          const active = activeFilters.includes(id);
          const toggle = () => this.toggleFilter(id);
          return (
            <div className={'wdk-ShowcaseFilter-Item ' + (active ? 'active' : 'inactive')} key={id} onClick={toggle}>
              <Mesa.Checkbox checked={active} onChange={toggle} />
              {display}
            </div>
          );
        })}
      </div>
    );
  }
};

export default ShowcaseFilter;
