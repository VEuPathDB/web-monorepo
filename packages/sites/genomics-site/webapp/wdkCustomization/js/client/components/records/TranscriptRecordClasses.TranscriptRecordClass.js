import ExpressionGraph from '../common/ExpressionGraph';

let Link = ReactRouter.Link;
let Sticky = Wdk.client.Components.Sticky;

function scrollToElementById(id) {
  let el = document.getElementById(id);
  if (el === undefined) return;
  let rect = el.getBoundingClientRect();
  if (rect.top < 0) return;
  el.scrollIntoView();
}

function TranscriptList(props) {
  let { record, recordClass } = props;
  let params = { class: recordClass.fullName };
  if (record.tables.GeneTranscripts == null) return null;

  return (
    <div className="eupathdb-TranscriptListContainer">
    <ul className="eupathdb-TranscriptRecordNavList">
    {record.tables.GeneTranscripts.map(row => {
      let { transcript_id } = row;
      let query = Object.assign({}, record.id, {
        source_id: transcript_id
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

export function RecordNavigationSectionCategories(props) {
  let { categories } = props;
  let geneCategory = categories.find(cat => cat.name === 'gene_parent');
  let transCategory = categories.find(cat => cat.name === 'trans_parent');
  return (
    <div className="eupathdb-TranscriptRecordNavigationSectionContainer">
      <h3>Gene</h3>
      <props.DefaultComponent
        {...props}
        categories={geneCategory.subCategories}
      />
      <h3>Transcript</h3>
      <TranscriptList {...props}/>
      <props.DefaultComponent
        {...props}
        categories={transCategory.subCategories}
      />
    </div>
  );
}

export let RecordMainSection = React.createClass({

  render() {
    let { categories } = this.props;

    let uncategorized = categories.find(c => c.name === undefined);
    categories = categories.filter(c => c !== uncategorized);
    return(
      <div>
        {categories.map(this.renderCategory)}
      </div>
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
        <this.props.DefaultComponent {...this.props} categories={[category]}/>
      </section>
    );
  },

  renderGeneCategory(category) {
    return (
      <section id={category.name} key={category.name}>
        <this.props.DefaultComponent {...this.props} categories={category.subCategories}/>
      </section>
    );
  },

  renderTransCategory(category) {
    let { recordClass, record, collapsedCategories } = this.props;
    let allCategoriesHidden = category.subCategories.every(cat => collapsedCategories.includes(cat.name));
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
            :  <this.props.DefaultComponent {...this.props} categories={category.subCategories}/>}
        </div>
      </section>
    );
  }

});

export function ExpressionGraphTable(props) {
  let included = props.tableMeta.properties.includeInTable || [];

  let tableMeta = Object.assign({}, props.tableMeta, {
    attributes: props.tableMeta.attributes.filter(tm => included.indexOf(tm.name) > -1)
  });

  return (
    <props.DefaultComponent
      {...props}
      tableMeta={tableMeta}
      childRow={childProps =>
        <ExpressionGraph rowData={props.table[childProps.rowIndex]}/>}
    />
  );
}


export function MercatorTable(props) {
  return (
    <div className="eupathdb-MercatorTable">
      <form action="/cgi-bin/pairwiseMercator">
        <input type="hidden" name="project_id" value={wdk.MODEL_NAME}/>

        <div className="form-group">
          <label><strong>Contig ID:</strong> <input name="contig" defaultValue={props.record.attributes.sequence_id}/></label>
        </div>

        <div className="form-group">
          <label>
            <strong>Nucleotide positions: </strong>
            <input
              name="start"
              defaultValue={props.record.attributes.gene_start_min}
              maxLength="10"
              size="10"
            />
          </label>
          <label> to <input
              name="stop"
              defaultValue={props.record.attributes.gene_end_max}
              maxLength="10"
              size="10"
            />
          </label>
          <label> <input name="revComp" type="checkbox" defaultChecked={true}/> Reverse & compliment </label>
        </div>

        <div className="form-group">
          <strong>Genomes to align:</strong>
          <Wdk.client.Components.CheckboxList
            name="genomes"
            items={props.table.map(row => ({
              value: row.abbrev,
              display: row.organism
            }))}
          />
        </div>

        <div className="form-group">
          <strong>Select output:</strong>
          <div className="form-radio"><label><input name="type" type="radio" value="clustal" defaultChecked={true}/> Multiple sequence alignment (clustal)</label></div>
          <div className="form-radio"><label><input name="type" type="radio" value="fasta_ungapped"/> Multi-FASTA</label></div>
        </div>

        <input type="submit"/>
      </form>
    </div>
  );
}
