import QueryGrid from "../QueryGrid";
import { Loading } from 'wdk-client/Components';
import { Doc } from 'wdk-client/Components';
import { getTree, nodeHasProperty, getPropertyValue, nodeHasChildren, getNodeChildren } from 'wdk-client/OntologyUtils';
import { getSearchMenuCategoryTree } from '../../util/category.js';

let QueryGridController = React.createClass({

  componentWillMount() {
    this.setState({isLoading: true, grid: {}});
    getSearchMenuCategoryTree(this.props.wdkService, {}).then(grid => {
      this.putGeneSearchesFirst(grid);
      this.setState({isLoading: false, grid: grid});
    });
  },

  /**
   * A munge to move gene searches to top of tree
   * @param tree
   * @returns {*}
   */
  putGeneSearchesFirst(tree) {
    return getNodeChildren(tree).sort((a,b) => {
      if (getPropertyValue('EuPathDB alternative term',a) === 'Genes' && getPropertyValue('EuPathDB alternative term',b) !== 'Genes') return -1;
      if (getPropertyValue('EuPathDB alternative term',a) !== 'Genes' && getPropertyValue('EuPathDB alternative term',b) === 'Genes') return 1;
      return 0;
    });
  },

  render() {
    let title = "Query Grid";
    if (this.state.isLoading) {
      return ( <Doc title={title}><Loading/></Doc> );
    }
    return ( <Doc title={title}><QueryGrid {...this.state} /></Doc> );
  }

});

export default QueryGridController;
