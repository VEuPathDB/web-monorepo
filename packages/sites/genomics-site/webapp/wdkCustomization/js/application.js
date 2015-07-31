import Wdk from 'wdk';
import {
  DatasetRecord,
  Tooltip
} from './records/DatasetRecordClasses.DatasetRecordClass';

let Link = ReactRouter.Link;

let rootElement = document.getElementsByTagName('main')[0];
let rootUrl = rootElement.getAttribute('data-baseUrl');
let endpoint = rootElement.getAttribute('data-serviceUrl');

Wdk.flux.components.AnswerTableCell.wrapComponent(function(AnswerTableCell) {
  let ApiAnswerTableCell = React.createClass({
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
  return ApiAnswerTableCell;
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

Wdk.flux.components.Record.wrapComponent(function(Record) {
  let TranscriptRecord = React.createClass({
      componentDidMount() {
        this.setStateFromProps(this.props);
        this.fetchTranscripts(this.props);
      },
      componentWillReceiveProps(nextProps) {
        this.setStateFromProps(nextProps);
        this.fetchTranscripts(nextProps);
      },
      setStateFromProps(props) {
        if ('GeneTranscripts' in props.record.tables) {
          this.setState(props);
        }
      },
      fetchTranscripts(props) {
        if (!('GeneTranscripts' in props.record.tables)) {
          let { recordClass } = props;
          let spec = {
            primaryKey: props.record.id,
            attributes: [],
            tables: [ 'GeneTranscripts' ]
          };
          props.recordActions.fetchRecordDetails(recordClass.fullName, spec);
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

Wdk.flux.components.RecordNavigationSection.wrapComponent(function(RecordNavigationSection) {
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

Wdk.flux.components.RecordMainSection.wrapComponent(function(RecordMainSection) {
  let ApiRecordMainSection = React.createClass({

    render() {
      let { recordClass, categories, depth = 1 } = this.props;

      if (recordClass.fullName == 'TranscriptRecordClasses.TranscriptRecordClass' && depth == 1) {
        let uncategorized = categories.find(c => c.name === 'uncategorized');
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
      let { recordClass, record } = this.props;
      return (
        <div id={category.name} key={category.name}>
          {this.props.record.tables.GeneTranscripts.map(row => {
            let { transcript_id } = row;
            let isActive = transcript_id === record.id.source_id;
            let query = Object.assign({}, record.id, { source_id: transcript_id });
            let params = { class: recordClass.fullName };
            return isActive ? (
              <section key={transcript_id}>
                <h1 style={{ marginBottom: '1em' }} className="wdk-Record-sectionHeader">
                  {'Transcript ' + transcript_id}
                </h1>
                <RecordMainSection {...this.props} categories={category.subCategories}/>
              </section>
            ) : (
              <section key={transcript_id}>
                <h1 style={{ opacity: '0.6', marginBottom: '1em' }} className="wdk-Record-sectionHeader">
                  <Link to="record" params={params} query={query} style={{ color: 'inherit' }} onClick={() => scrollToElementById('trans_parent')}>
                    {'Transcript ' + transcript_id}
                  </Link>
                </h1>
              </section>
            );
          })}
        </div>
      );
    }

  });

  return ApiRecordMainSection;
});

function scrollToElementById(id) {
  let el = document.getElementById(id);
  if (el) el.scrollIntoView();
}

window._app = Wdk.flux.createApplication({
  rootUrl,
  endpoint,
  rootElement
});
