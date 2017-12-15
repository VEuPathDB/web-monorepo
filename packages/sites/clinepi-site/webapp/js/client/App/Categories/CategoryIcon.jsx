import React from 'react';

import './CategoryIcon.css';

import { getCategoryColor } from './CategoryUtils';

class CategoryIcon extends React.Component {
  render () {
    const { category } = this.props;
    if (!category) return null;
    const categoryColor = getCategoryColor(category);
    const categoryStyle = { backgroundColor: categoryColor };
    return (
      <span className="CategoryIcon" style={categoryStyle}>
        {category[0].toUpperCase()}
      </span>
    );
  }
};

export default CategoryIcon;
