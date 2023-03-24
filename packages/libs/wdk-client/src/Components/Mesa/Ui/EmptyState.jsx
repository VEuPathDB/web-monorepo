import React from 'react';

import Icon from '../../../Components/Mesa/Components/Icon';
import { makeClassifier } from '../../../Components/Mesa/Utils/Utils';

class EmptyState extends React.PureComponent {
  constructor(props) {
    super(props);
    this.getCulprit = this.getCulprit.bind(this);
  }

  getCulprit() {
    const { culprit } = this.props;
    switch (culprit) {
      case 'search':
        return {
          icon: 'search',
          title: 'No Results',
          content: (
            <div>
              <p>Sorry, your search returned no results.</p>
            </div>
          ),
        };
      case 'nocolumns':
        return {
          icon: 'columns',
          title: 'No Columns Shown',
          content: (
            <div>
              <p>
                Whoops, looks like you've hidden all columns. Use the column
                editor to show some columns.
              </p>
            </div>
          ),
        };
      case 'filters':
        return {
          icon: 'filter',
          title: 'No Filter Results',
          content: (
            <div>
              <p>
                No rows exist that match all of your column filter settings.
              </p>
            </div>
          ),
        };
      case 'nodata':
      default:
        return {
          icon: 'table',
          title: 'No Results',
          content: null,
        };
    }
  }

  render() {
    const culprit = this.getCulprit();
    const emptyStateClass = makeClassifier('EmptyState');

    return (
      <div className={emptyStateClass()}>
        <div className={emptyStateClass('BodyWrapper')}>
          <div
            className={emptyStateClass('Body')}
            style={{ textAlign: 'center' }}
          >
            <Icon fa={culprit.icon} className={emptyStateClass('Icon')} />
            <h2>{culprit.title}</h2>
            {culprit.content}
          </div>
        </div>
      </div>
    );
  }
}

export default EmptyState;
