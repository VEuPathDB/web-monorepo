import Wdk from 'wdk';
import {
  DatasetRecord,
  Tooltip
} from './records/DatasetRecordClasses.DatasetRecordClass';

let Link = ReactRouter.Link;
let Sticky = Wdk.client.components.Sticky;

let rootElement = document.getElementsByTagName('main')[0];
let rootUrl = rootElement.getAttribute('data-baseUrl');
let endpoint = rootElement.getAttribute('data-serviceUrl');

let recordComponentsMap = {
  "DatasetRecordClasses.DatasetRecordClass": DatasetRecord
};

Wdk.client.components.Record.wrapComponent(function(Record) {
  let RecordComponentResolver =  React.createClass({
    render() {
      let Component = recordComponentsMap[this.props.recordClass.fullName] || Record;
      return (
        <Component {...this.props}/>
      );
    }
  });
  return RecordComponentResolver;
});

// Wdk.client.components.AnswerTableCell.wrapComponent(function(AnswerTableCell) {
//   return React.createClass({
//     render() {
//       let cell = <AnswerTableCell {...this.props}/>;
// 
//       if (this.props.recordClass === "DatasetRecordClasses.DatasetRecordClass"
//          && this.props.attribute.name === "primary_key") {
//         return (
//           <Tooltip text={this.props.record.attributes.description.value} witdh={this.props.width}>
//             {cell}
//           </Tooltip>
//         );
//       }
// 
//       return cell;
//     }
//   });
// });

let TranscriptList = React.createClass({

  mixins: [ ReactRouter.Navigation ],

  render() {
    let { record, recordClass } = this.props;
    let params = { class: recordClass.fullName };
    if (record.tables.GeneTranscripts == null) return null;

    return (
      <div>
        <div>Transcript</div>
        <ul className="eupathdb-TranscriptRecordNavList">
          {record.tables.GeneTranscripts.map(row => {
            let { transcript_id } = row;
            let query = React.addons.update(record.id, {
              source_id: { $set: transcript_id }
            });
            return (
              <li key={transcript_id}>
                <Link to="record" params={params} query={query} onClick={() => scrollToElementById('trans_parent')}>
                  {row.transcript_id}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

});

Wdk.client.components.Record.wrapComponent(function(Record) {
  let TranscriptRecord = React.createClass({
    componentDidMount() {
      this.handleNewProps(this.props);
    },
    componentWillReceiveProps(nextProps) {
      this.handleNewProps(nextProps);
    },
    handleNewProps(props) {
      if (!('GeneTranscripts' in props.record.tables)) {
        if (this.fetching) return;
        let { recordClass } = props;
        let spec = {
          primaryKey: props.record.id,
          attributes: [],
          tables: [ 'GeneTranscripts' ]
        };
        this.fetching = true;
        props.recordActions.fetchRecordDetails(recordClass.fullName, spec)
        .then(() => {
          this.fetching = false;
          this.setState(props);
        });
      } else {
        this.setState(props);
      }
    },
    render() {
      if (this.state === null) return null;
      return (
        <Record {...this.state}/>
      );
    }
  });

  let ApiRecord = React.createClass({
    render() {
      let { recordClass } = this.props;
      switch(recordClass.fullName) {
        case 'DatasetRecordClasses.DatasetRecordClass':
          return <DatasetRecord {...this.props}/>
        case 'TranscriptRecordClasses.TranscriptRecordClass':
          return <TranscriptRecord {...this.props}/>
        default:
          return <Record {...this.props}/>
      }
    }
  });

  return ApiRecord;
});

Wdk.client.components.RecordNavigationSection.wrapComponent(function(RecordNavigationSection) {
  let ApiRecordNavigationSection = React.createClass({
    render() {
      let { recordClass, categories } = this.props;
      if (recordClass.fullName == 'TranscriptRecordClasses.TranscriptRecordClass') {
        let geneCategory = categories.find(cat => cat.name === 'gene_parent');
        let transCategory = categories.find(cat => cat.name === 'trans_parent');
        return (
          <div>
            <RecordNavigationSection
              {...this.props}
              categories={geneCategory.subCategories}
              heading="Gene"
            />
            <RecordNavigationSection
              {...this.props}
              categories={transCategory.subCategories}
              heading={<TranscriptList {...this.props}/>}
            />
          </div>
        );
      }
      return <RecordNavigationSection {...this.props}/>
    }
  });
  return ApiRecordNavigationSection;
});

Wdk.client.components.RecordMainSection.wrapComponent(function(RecordMainSection) {
  let ApiRecordMainSection = React.createClass({

    render() {
      let { recordClass, categories, depth = 1 } = this.props;

      if (recordClass.fullName == 'TranscriptRecordClasses.TranscriptRecordClass' && depth == 1) {
        let uncategorized = categories.find(c => c.name === undefined);
        categories = categories.filter(c => c !== uncategorized);
        return(
          <div>
            {categories.map(this.renderCategory)}
          </div>
        );
      }

      return (
        <RecordMainSection {...this.props} categories={categories}/>
      );
    },

    renderCategory(category) {
      if (category.name == 'gene_parent') {
        return this.renderGeneCategory(category);
      }
      if (category.name == 'trans_parent') {
        return this.renderTransCategory(category);
      }
      return (
        <section id={category.name} key={category.name}>
          <h1>{category.displayName}</h1>
          <RecordMainSection {...this.props} categories={[category]}/>
        </section>
      );
    },

    renderGeneCategory(category) {
      return (
        <section id={category.name} key={category.name}>
          <RecordMainSection {...this.props} categories={category.subCategories}/>
        </section>
      );
    },

    renderTransCategory(category) {
      let { recordClass, record, hiddenCategories } = this.props;
      let allCategoriesHidden = category.subCategories.every(cat => hiddenCategories.includes(cat.name));
      return (
        <section id={category.name} key={category.name}>
          <Sticky className="eupathdb-TranscriptSticky" fixedClassName="eupathdb-TranscriptSticky-fixed">
            <h1 className="eupathdb-TranscriptHeading">Transcript</h1>
            <nav className="eupathdb-TranscriptTabList">
              {this.props.record.tables.GeneTranscripts.map(row => {
                let { transcript_id } = row;
                let isActive = transcript_id === record.id.source_id;
                let query = Object.assign({}, record.id, { source_id: transcript_id });
                let params = { class: recordClass.fullName };
                return (
                  <Link
                    to="record"
                    params={params}
                    query={query}
                    className="eupathdb-TranscriptLink"
                    activeClassName="eupathdb-TranscriptLink-active"
                  >
                    {transcript_id}
                  </Link>
                );
              })}
            </nav>
          </Sticky>
          <div className="eupathdb-TranscriptTabContent">
            {allCategoriesHidden
              ? <p>All Transcript categories are currently hidden.</p>
              :  <RecordMainSection {...this.props} categories={category.subCategories}/>}
          </div>
        </section>
      );
    }

  });

  return ApiRecordMainSection;
});

function scrollToElementById(id) {
  let el = document.getElementById(id);
  if (el === undefined) return;
  let rect = el.getBoundingClientRect();
  if (rect.top < 0) return;
  el.scrollIntoView();
}

window._app = Wdk.client.createApplication({
  rootUrl,
  endpoint,
  rootElement
});
