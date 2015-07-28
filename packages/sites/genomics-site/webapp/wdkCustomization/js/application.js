import Wdk from 'wdk';
import {
  DatasetRecord,
  Tooltip
} from './records/DatasetRecordClasses.DatasetRecordClass';

let Link = ReactRouter.Link;

let rootElement = document.getElementsByTagName('main')[0];
let rootUrl = rootElement.getAttribute('data-baseUrl');
let endpoint = rootElement.getAttribute('data-serviceUrl');

let recordComponentsMap = {
  "DatasetRecordClasses.DatasetRecordClass": DatasetRecord
};

Wdk.flux.components.Record.wrapComponent(function(Record) {
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

Wdk.flux.components.AnswerTableCell.wrapComponent(function(AnswerTableCell) {
  return React.createClass({
    render() {
      let cell = <AnswerTableCell {...this.props}/>;

      if (this.props.recordClass === "DatasetRecordClasses.DatasetRecordClass"
         && this.props.attribute.name === "primary_key") {
        return (
          <Tooltip text={this.props.record.attributes.description.value} witdh={this.props.width}>
            {cell}
          </Tooltip>
        );
      }

      return cell;
    }
  });
});

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
                <Link to="record" params={params} query={query}>
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

Wdk.flux.components.RecordNavigationSection.wrapComponent(function(RecordNavigationSection) {
  return React.createClass({
    componentDidMount() {
      this.fetchTranscripts(this.props);
    },

    componentWillReceiveProps(nextProps) {
      if (this.props.record !== nextProps.record) {
        this.fetchTranscripts(nextProps);
      }
    },

    fetchTranscripts(props) {
      let { recordClass } = props;
      if (recordClass.fullName == 'TranscriptRecordClasses.TranscriptRecordClass') {
        let spec = {
          primaryKey: props.record.id,
          attributes: [],
          tables: [ 'GeneTranscripts' ]
        };
        props.recordActions.fetchRecordDetails(recordClass.fullName, spec);
      }
    },

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
});

window._app = Wdk.flux.createApplication({
  rootUrl,
  endpoint,
  rootElement
});
