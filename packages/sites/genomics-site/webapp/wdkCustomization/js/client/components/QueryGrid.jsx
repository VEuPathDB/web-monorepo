let QueryGrid;
QueryGrid = React.createClass({

  render() {
    return (
      <div id="eupathdb-QueryGrid">
        <p>Select a search, which will be the first step in you new strategy.</p>
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
            return <li className="threeTierList">{item.recordClassName.split(".")[0].replace("RecordClasses","")} Searches
              {this.setUpCategories(item.categories)}
            </li>
          })}
        </ul>
        <ul>
          {grid.filter(item => {
            return item.categories.length === 0
          }).map(item => {
            return <li className="twoTierList">{item.recordClassName.split(".")[0].replace("RecordClasses","")} Searches
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
          return(
            <li>
              <span>{category.categoryName}</span>
              {this.setUpSearches(category.searches)}
          </li>
          )
        })}
      </ul>
    );
  },

  setUpSearches(searches) {
    let questionUrl = "/showQuestion.do?questionFullName=";
    return (
      <ul className="fa-ul">
        {searches.map(search => {
          return(
            search.displayName == null ? "" :
              <li title={search.description}>
                <i className="bullet fa fa-li fa-circle"></i>
                <a href={wdk.webappUrl('showQuestion.do?questionFullName=' + search.fullName)}>
                  {search.displayName}
                </a>
              </li>
          )
        })}
      </ul>
    );
  }

});



export default QueryGrid;