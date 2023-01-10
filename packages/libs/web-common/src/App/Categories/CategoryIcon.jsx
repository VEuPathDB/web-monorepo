import './CategoryIcon.css';

import { capitalize } from 'lodash';
import React from 'react';
import { Tooltip } from '@veupathdb/components/lib/components/widgets/Tooltip';

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
        <Tooltip title={categoryName}>
          <span className="CategoryIcon" style={categoryStyle}>
            {category[0].toUpperCase()}
          </span>
        </Tooltip>
      </div>
    );
  }
};

export default CategoryIcon;
