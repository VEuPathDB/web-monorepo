import React from 'react';
import { webAppUrl } from '../config';
import { Tooltip } from '@veupathdb/coreui';
import {
  getPropertyValue,
  nodeHasChildren,
  getNodeChildren,
} from '@veupathdb/wdk-client/lib/Utils/OntologyUtils';

class QueryGrid extends React.Component {
  render() {
    return (
      <div id="eupathdb-QueryGrid">
        <h1>All Available Searches</h1>
        <p>Select a search to start a new search strategy.</p>
        {this.setUpGrid(this.props.grid)}
      </div>
    );
  }

  setUpGrid(grid) {
    return (
      <div>
        <ul>
          {getNodeChildren(grid)
            .filter((item) => {
              return nodeHasChildren(getNodeChildren(item)[0]);
            })
            .map((item) => {
              return (
                <li className="threeTierList">
                  <div>
                    {getPropertyValue(
                      'EuPathDB alternative term',
                      item
                    ).replace(/s$/, '')}{' '}
                    Searches
                  </div>
                  {this.setUpCategories(getNodeChildren(item))}
                </li>
              );
            })}
        </ul>
        <ul>
          {getNodeChildren(grid)
            .filter((item) => {
              return !nodeHasChildren(getNodeChildren(item)[0]);
            })
            .map((item) => {
              return (
                <li className="twoTierList">
                  <div>
                    {getPropertyValue(
                      'EuPathDB alternative term',
                      item
                    ).replace(/s$/, '')}{' '}
                    Searches
                  </div>
                  {this.setUpSearches(getNodeChildren(item))}
                </li>
              );
            })}
        </ul>
      </div>
    );
  }

  setUpCategories(categories) {
    return (
      <ul>
        {categories.map((category) => {
          return (
            <li>
              <div>
                {getPropertyValue('EuPathDB alternative term', category)}
              </div>
              {this.setUpSearches(getNodeChildren(category))}
            </li>
          );
        })}
      </ul>
    );
  }

  setUpSearches(searches) {
    return (
      <ul className="fa-ul">
        {searches.map((search) => {
          return (
            <li>
              <i className="bullet fa fa-li fa-circle"></i>
              <Tooltip title={search.wdkReference.description}>
                <a
                  href={
                    webAppUrl +
                    '/showQuestion.do?questionFullName=' +
                    getPropertyValue('name', search)
                  }
                >
                  {search.wdkReference.displayName}
                </a>
              </Tooltip>
            </li>
          );
        })}
      </ul>
    );
  }
}

export default QueryGrid;
