import './CategoryIcon.css';

import { capitalize } from 'lodash';
import React from 'react';
import { Mesa } from '@veupathdb/wdk-client/lib/Components';

const { AnchoredTooltip } = Mesa;
import { getCategoryColor } from './CategoryUtils';

class CategoryIcon extends React.Component {
  render () {
    const { category } = this.props;
    if (!category || category === 'Unknown') return null;
    const categoryName = capitalize(category);
    const categoryColor = getCategoryColor(category);
    const categoryStyle = { backgroundColor: categoryColor };

    return (
      <div style={{ position: 'relative' }}>
        <AnchoredTooltip
          debug={true}
          content={<div><strong>{categoryName}</strong></div>}
          style={{ width: 'auto', textTransform: 'capitalize' }}>
          <span className="CategoryIcon" style={categoryStyle}>
            {category[0].toUpperCase()}
          </span>
        </AnchoredTooltip>
      </div>
    );
  }
};

export default CategoryIcon;
