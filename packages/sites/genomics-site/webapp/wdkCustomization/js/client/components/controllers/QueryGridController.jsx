import React from 'react';
import QueryGrid from "../QueryGrid";
import { Loading } from 'wdk-client/Components';
import { getPropertyValue, getNodeChildren } from 'wdk-client/OntologyUtils';
import { getSearchMenuCategoryTree } from '../../util/category.js';

let QueryGridController = React.createClass({

  componentWillMount() {
    this.setState({isLoading: true, grid: {}});
    Promise.all([
      this.props.wdkService.getOntology(),
      this.props.wdkService.getRecordClasses()
    ]).then(([ ontology, recordClasses ]) => getSearchMenuCategoryTree(ontology, recordClasses, {})).then(grid => {
      this.putGeneSearchesFirst(grid);
      this.setState({isLoading: false, grid: grid});
    });
  },

  componentDidMount() {
    document.title = 'Query Grid';
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
    if (this.state.isLoading) {
      return ( <Loading/> );
    }
    return ( <QueryGrid {...this.state} /> );
  }

});

export default QueryGridController;
