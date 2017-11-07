import { get } from 'lodash';
import { IconAlt } from 'wdk-client/Components';
import { withStore } from 'ebrc-client/util/component';
import Index from '../components/Index';
import RelativeVisitsGroup from '../components/RelativeVisitsGroup';
import RelatedCaseControlGroup from '../components/RelatedCaseControlGroup';
import { CategoriesCheckboxTree } from 'wdk-client/Components';
import * as Category from 'wdk-client/CategoryUtils';

const injectState = withStore(state => ({
  studies: get(state, 'globalData.siteConfig.studies'),
  webAppUrl: get(state, 'globalData.siteConfig.webAppUrl')
}));

export default {
  IndexController: WdkIndexController => class IndexController extends WdkIndexController {

    getStateFromStore() {
      const displayName = get(this.store.getState(), 'globalData.siteConfig.displayName');
      const webAppUrl = get(this.store.getState(), 'globalData.siteConfig.webAppUrl');
      const studies = get(this.store.getState(), 'globalData.siteConfig.studies');
      return { displayName, webAppUrl, studies };
    }

    getTitle() {
      return this.state.displayName;
    }

    renderView() {
      return (
        <Index {...this.state} />
      )
    }

  },

  RecordTable: RecordTable => props => {
    if ('tableIsTree' in props.table.properties) {
          return <TableAsTree {...props}/>;
    }

     return <RecordTable {...props}/>;
  },

  QuestionWizard: QuestionWizard => injectState(props => {
    let { studies, webAppUrl } = props;
    let activeStudy = studies.find(s => s.active);
    return (
      <div>
        <div className="clinepi-StudyLink">
          <IconAlt fa="info-circle"/>&nbsp;
          Learn about the <a href={`${webAppUrl}/app/${activeStudy.route}`} target="_blank">{activeStudy.name} Study</a>
        </div>
        <QuestionWizard {...props} />
      </div>
    )
  }),

  ActiveGroup: ActiveGroup => props => {
    // Attempt to get the relative observations layout settings and determine
    // if the active group should use the layout. If not, use the default layout.
    return RelativeVisitsGroup.shouldUseLayout(props) ? <RelativeVisitsGroup {...props} DefaultComponent={ActiveGroup}/>
      : RelatedCaseControlGroup.shouldUseLayout(props) ? <RelatedCaseControlGroup {...props} DefaultComponent={ActiveGroup}/>
      : <ActiveGroup {...props}/>
  },

  QuestionWizardController: QuestionWizardController => class extends QuestionWizardController {
    constructor(props) {
      super(props);
      Object.assign(this.state, {
        useRangeForNumRelativeEvents: false
      });
    }

    getEventHandlers() {
      return Object.assign(super.getEventHandlers(), {
        setUseRangeForNumRelativeEvents: this.setUseRangeForNumRelativeEvents
      });
    }

    setUseRangeForNumRelativeEvents(useRangeForNumRelativeEvents) {
      this.setState({ useRangeForNumRelativeEvents });
    }

    setParamValue(param, paramValue) {
      super.setParamValue(param, paramValue);
      RelatedCaseControlGroup.handleParamChange(this, param, paramValue);
    }
  }

}



function makeTree(rows){
    const n = Category.createNode; // helper for below

    let myTree = n('root', 'root', null, []);

    for(let i = 0; i < rows.length; i++){
        let is_leaf = rows[i].is_leaf;

        if(is_leaf == 1) {
            setKeep(rows[i], rows);
        }
    }

    addChildren(myTree, rows, n);

    return myTree;
}


function setKeep(node, rows) {
    node.keep = 1;

    let parent = node.parent_source_id;

    for(let i = 0; i < rows.length; i++){
        let id = rows[i].unique_id;

        if(parent == id) {
            setKeep(rows[i], rows);
            break;
        }
    }
}


function addChildren(t, rows, n) {
    for(let i = 0; i < rows.length; i++){
        let parent = rows[i].parent_source_id;
        let id = rows[i].unique_id;
        let display = rows[i].display_name;
        let keep = rows[i].keep;

        if(parent == Category.getId(t) && keep == 1){
            let node = n(id, display, null, []);
            t.children.push(node);
        }
    }

    for(let j = 0; j < t.children.length; j++) {
        addChildren(t.children[j], rows, n);
    }
}

class TableAsTree extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      selectedLeaves: [],
      expandedBranches: []
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleUiChange = this.handleUiChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleSearchTermChange = this.handleSearchTermChange.bind(this);
  }

  handleChange(selectedLeaves) {
    this.setState({selectedLeaves});
  }

  handleUiChange(expandedBranches) {
    this.setState({expandedBranches});
  }

  handleSubmit() {
    this.props.onChange(this.props.isMultiPick ? this.state.selectedLeaves : this.state.selectedLeaves[0]);
  }

  handleSearchTermChange(searchTerm) {
    this.setState({searchTerm});
  }

  render() {
    return (
        <div className="form-group">
          <CategoriesCheckboxTree
            name="Characteristics"
            searchBoxPlaceholder={`Search for Characteristics here`}
            autoFocusSearchBox={false}
            tree={makeTree(this.props.value)}
            leafType="string"
            isMultiPick={true}
            searchTerm={this.state.searchTerm}
            onChange={this.handleChange}
            onUiChange={this.handleUiChange}
            selectedLeaves={this.state.selectedLeaves}
            expandedBranches={this.state.expandedBranches}
            onSearchTermChange={this.handleSearchTermChange}
            isSelectable={false}
          />
        </div>
    );
  }
}
