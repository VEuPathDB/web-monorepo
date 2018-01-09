import React from 'react';

import './CategoryIcon.css';

const { Tooltip } = Mesa;
import { getCategoryColor } from './CategoryUtils';

class CategoryIcon extends React.Component {
  render () {
    const { category } = this.props;
    if (!category) return null;
    const categoryColor = getCategoryColor(category);
    const categoryStyle = { backgroundColor: categoryColor };
    const position = this.anchor ? Tooltip.getOffset(this.anchor) : {};
    const { top, left } = position;
    return (
      <div style={{ position: 'relative' }}>
        <Tooltip
          content={(<span>A <b>{category}</b> study</span>)}
          style={{ width: 'auto', textTransform: 'capitalize' }}
          position={{ top, left }}>
          <span className="CategoryIcon" style={categoryStyle}>
            {category[0].toUpperCase()}
          </span>
          <span ref={(a) => this.anchor = a} />
        </Tooltip>
      </div>
    );
  }
};

export default CategoryIcon;
