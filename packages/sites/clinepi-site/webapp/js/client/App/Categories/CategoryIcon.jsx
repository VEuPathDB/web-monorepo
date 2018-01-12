import React from 'react';

import './CategoryIcon.css';

const { AnchoredTooltip } = Mesa;
import { getCategoryColor, getCategoryName } from './CategoryUtils';

class CategoryIcon extends React.Component {
  render () {
    const { category } = this.props;
    if (!category) return null;
    const categoryName = getCategoryName(category);
    const categoryColor = getCategoryColor(category);
    const categoryStyle = { backgroundColor: categoryColor };
    const position = this.anchor ? Tooltip.getOffset(this.anchor) : {};
    const { top, left } = position;
    return (
      <div style={{ position: 'relative' }}>
        <AnchoredTooltip
          content={categoryName}
          style={{ width: 'auto', textTransform: 'capitalize' }}>
          <span className="CategoryIcon" style={categoryStyle}>
            {category[0].toUpperCase()}
          </span>
          <span ref={(a) => this.anchor = a} />
        </AnchoredTooltip>
      </div>
    );
  }
};

export default CategoryIcon;
