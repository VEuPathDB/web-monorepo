import './CategoryIcon.css';

import { capitalize } from 'lodash';
import React from 'react';
import { Tooltip } from '@veupathdb/coreui';

import { getCategoryColor } from './CategoryUtils';

interface CategoryIconProps {
  category?: string;
}

class CategoryIcon extends React.Component<CategoryIconProps> {
  render() {
    const { category } = this.props;
    if (!category || category === 'Unknown') return null;
    const categoryName = capitalize(category);
    const categoryColor = getCategoryColor(category);
    const categoryStyle = categoryColor
      ? { backgroundColor: categoryColor }
      : undefined;

    return (
      <div style={{ position: 'relative' }}>
        <Tooltip title={categoryName}>
          <span className="CategoryIcon" style={categoryStyle}>
            {category[0].toUpperCase()}
          </span>
        </Tooltip>
      </div>
    );
  }
}

export default CategoryIcon;
