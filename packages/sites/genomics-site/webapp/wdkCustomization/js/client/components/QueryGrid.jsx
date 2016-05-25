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
            return <li className="threeTierList">Identify {item.recordClassName.split(".")[0].replace("RecordClasses","s")} By:
              {this.setUpCategories(item.categories)}
            </li>
          })}
        </ul>
        <ul>
          {grid.filter(item => {
            return item.categories.length === 0
          }).map(item => {
            return <li className="twoTierList">Identify {item.recordClassName.split(".")[0].replace("RecordClasses","s")} By:
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
          return <li>{category.categoryName}
            {this.setUpSearches(category.searches)}
          </li>
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
                <a href={wdk.webappUrl('showQuestion.do?questionFullName=' + search.fullName)}>
                  <i className="bullet fa-li fa fa-search"></i>{search.displayName}
                </a>
              </li>
          )
        })}
      </ul>
    );
  }

});



export default QueryGrid;