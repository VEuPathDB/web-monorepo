import './CategoryIcon.css';

import React from 'react';
import { Mesa } from 'wdk-client/Components';

const { AnchoredTooltip } = Mesa;
import { getCategoryColor, getCategoryName } from './CategoryUtils';

class CategoryIcon extends React.Component {
  render () {
    const { category } = this.props;
    if (!category) return null;
    const categoryName = getCategoryName(category);
    const categoryColor = getCategoryColor(category);
    const categoryStyle = { backgroundColor: categoryColor };

    return (
      <div style={{ position: 'relative' }}>
        <AnchoredTooltip
          debug={true}
          content={categoryName}
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
