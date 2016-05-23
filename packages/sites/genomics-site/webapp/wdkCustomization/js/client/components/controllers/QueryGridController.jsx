import QueryGrid from "../QueryGrid";
import { Loading } from 'wdk-client/Components';
import { Doc } from 'wdk-client/Components';
import { getTree, nodeHasProperty, getPropertyValue, nodeHasChildren, getNodeChildren } from 'wdk-client/OntologyUtils';
import { isQualifying } from 'wdk-client/CategoryUtils';

let QueryGridController = React.createClass({

  componentWillMount() {
    this.setState({isLoading: true, ontology: null, questions: []});
    return Promise.all([
        this.props.wdkService.getOntology(),
        this.props.wdkService.getQuestions(),
      ])
      .then(([ ontology, questions]) => {
        try {
          let categoryOntology = getTree(ontology, this.isCategoryOrGeneSearch());
          let grid = this.structureQuestions(questions, categoryOntology);
          this.setState({isLoading: false, grid: grid});
        }
        catch (error) {
          throw error;
        }
      })
      .catch(function(error) {
        console.error(error);
        throw new Error(error.message);
      });
  },

  isCategoryOrGeneSearch() {
    return (node) => {
      return (
        this.isQualifyingNode("search", node, "TranscriptRecordClasses.TranscriptRecordClass") ||
          (node.properties['targetType'] == null && nodeHasChildren(node))
      )
    };
  },

  isQualifyingNode(type, node, recordClassName) {
    return (nodeHasProperty('targetType', type, node) && nodeHasProperty('recordClassName', recordClassName, node));
  },

  isGeneQuestion() {
    return (node) => {
      return (
        nodeHasProperty('recordClassName', "TranscriptRecordClasses.TranscriptRecordClass", node)
      )
    };
  },

  getRecordClassNames(questions) {
    let recordClassNames = questions.map(question => question.recordClassName);
    return recordClassNames.filter((recordClassName, index) => {
      return recordClassNames.indexOf(recordClassName) == index;
    });
  },

  makeGrid(recordClassNames, categoryOntology, questions) {
    let grid = recordClassNames.map(recordClassName => Object.assign({}, {recordClassName: recordClassName, categories: []}));
    recordClassNames.forEach((recordClassName, i) => {
      let categories = [];
      getNodeChildren(categoryOntology).forEach(categoryNode => {
        if(nodeHasChildren(categoryNode) && getPropertyValue("recordClassName", getNodeChildren(categoryNode)[0]) === recordClassName) {
          let searches = getNodeChildren(categoryNode).map(search => {return ({fullName: getPropertyValue("name",search)})});
          categories.push({categoryName: getPropertyValue("EuPathDB alternative term", categoryNode), searches: searches});
        }
      });
      if(categories.length > 0) {
        Object.assign(grid[i], {categories: categories});
      }
      else {
        Object.assign(grid[i], {searches: []});
      }
    });
    return grid;
  },

  structureQuestions(questions, categoryOntology) {
    let headings = this.getRecordClassNames(questions);
    let grid = this.makeGrid(headings, categoryOntology, questions);
    let detailQuestions = questions.map(question => { return (
    {
      fullName: question.name,
      recordClassName: question.recordClassName,
      name: question.name.split(".")[0],
      displayName: question.displayName,
      description: question.description,
      urlSegment: question.urlSegment
    }
    )}).sort((a,b) => {
      if(a.name == 'GeneQuestions' && b.name != 'GeneQuestions') return -1;
      if(a.name != 'GeneQuestions' && b.name == 'GeneQuestions') return 1;
      return +(a.name > b.name) || +(a.name === b.name) - 1;
    });


    grid.forEach((item, i) => {
      detailQuestions.forEach(detailQuestion => {
        if(detailQuestion.recordClassName === item.recordClassName) {
          if(item.categories.length === 0) {
            grid[i].searches.push(detailQuestion);
          }
          else {
            item.categories.forEach(category => {
              category.searches.forEach(search => {
                if(detailQuestion.fullName === search.fullName) {
                  Object.assign(search, detailQuestion);
                }
              });
            });
          }
        }
      });
    });
    return grid;
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