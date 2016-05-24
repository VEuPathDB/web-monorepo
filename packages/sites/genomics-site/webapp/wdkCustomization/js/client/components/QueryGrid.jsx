let QueryGrid;
QueryGrid = React.createClass({

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
      <div>
        <ul>
          {grid.filter(item => {
            return item.categories.length > 0
          }).map(item => {
            return <li className="threeTierList">ID {item.recordClassName.split(".")[0]} By:
              {this.setUpCategories(item.categories)}
            </li>
          })}
        </ul>
        <ul>
          {grid.filter(item => {
            return item.categories.length === 0
          }).map(item => {
            return <li className="twoTierList">ID {item.recordClassName.split(".")[0]} By:
              {this.setUpSearches(item.searches)}
            </li>
          })}
        </ul>
      </div>
    );
  },

  setUpCategories(categories) {
    return (
      <ul>
        {categories.map(category => {
          return <li className="category">{category.categoryName}
            {this.setUpSearches(category.searches)}
          </li>
        })}
      </ul>
    );
  },

  setUpSearches(searches) {
    return (
      <ul className="fa-ul">
        {searches.map(search => {
          return(
            search.displayName == null ? "" :
              <li><i className="bullet fa-li fa fa-circle-o"></i>{search.displayName}</li>
          )
        })}
      </ul>
    );
  }

});



export default QueryGrid;