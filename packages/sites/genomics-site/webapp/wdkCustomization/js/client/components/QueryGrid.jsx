
let QueryGrid = React.createClass({

  render() {
    return (
      <div id="eupathdb-QueryGrid">
        <h1>Query Grid</h1>
        {this.setUpGrid(this.props.grid)}
      </div>
    );
  },

  setUpGrid(grid) {
    return (
      <ul className="searchTypes">
        {grid.map(item => {return <li>ID {item.recordClassName.split(".")[0]} By:
          {item.categories.length > 0 ? this.setUpCategories(item.categories) : this.setUpSearches(item.searches, false) }
        </li>})}
      </ul>
    );
  },

  setUpCategories(categories) {
    return(
      <ul>
        {categories.map(category => {
          return <li className="category">{category.categoryName}
            {this.setUpSearches(category.searches, true)}
          </li>
        })}
      </ul>
    );
  },

  setUpSearches(searches, withinCategory) {
    return(
      <ul className={withinCategory ? "" : "basic"}>
        {searches.map(search => {
          return <li>{search.displayName}</li>
        })}
      </ul>
    );
  }


});



export default QueryGrid;