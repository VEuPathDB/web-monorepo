import {Tooltip} from 'wdk-client/Components';

let QueryGrid;
QueryGrid = React.createClass({

  render() {
    return (
      <div id="eupathdb-QueryGrid">
        <h1>All Available Searches</h1>
        <p>Select a search to start a new search strategy.</p>
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
            return(
              <li className="threeTierList">
                <div>{item.recordClassName.split(".")[0].replace("RecordClasses","")} Searches</div>
                {this.setUpCategories(item.categories)}
              </li>
            )
          })}
        </ul>
        <ul>
          {grid.filter(item => {
            return item.categories.length === 0
          }).map(item => {
            return(
              <li className="twoTierList">
                <div>{item.recordClassName.split(".")[0].replace("RecordClasses","")} Searches</div>
                {this.setUpSearches(item.searches)}
              </li>
            )
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
              <div>{category.categoryName}</div>
              {this.setUpSearches(category.searches)}
          </li>
          )
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
              <li>
                <i className="bullet fa fa-li fa-circle"></i>
                <Tooltip content={search.description}>
                <a href={wdk.webappUrl('showQuestion.do?questionFullName=' + search.fullName)}>
                  {search.displayName}
                </a>
                </Tooltip>
              </li>
          )
        })}
      </ul>
    );
  }

});



export default QueryGrid;