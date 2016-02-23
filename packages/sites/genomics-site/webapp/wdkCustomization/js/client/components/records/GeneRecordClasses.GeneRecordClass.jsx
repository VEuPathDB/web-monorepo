import React from 'react';
import lodash from 'lodash';
import ExpressionGraph from '../common/ExpressionGraph';
import * as Gbrowse from '../common/Gbrowse';
import { isNodeOverflowing } from '../../utils';

let {
  ComponentUtils,
  OntologyUtils,
  TreeUtils
} = Wdk.client;

let {
  NativeCheckboxList,
  RecordLink,
  Sticky
} = Wdk.client.Components;

export const GENE_ID = 'gene';
export const TRANSCRIPT_ID = 'transcript';
export const TRANSCRIPT_ID_KEY_PREFIX = 'eupathdb::previousTranscriptId::';
export const RECORD_CLASS_NAME = 'GeneRecordClasses.GeneRecordClass';

function scrollToElementById(id) {
  let el = document.getElementById(id);
  if (el == undefined) return;
  let rect = el.getBoundingClientRect();
  if (rect.top < 0) return;
  el.scrollIntoView();
}

// Clone ontology tree, adding a prefix to the label property
function prefixLabel(prefix, root) {
  return Object.assign({}, root, {
    properties: Object.assign({}, root.properties, {
      label: [ prefix + '-' + OntologyUtils.getPropertyValue('label', root) ]
    }),
    children: root.children.map(child => prefixLabel(prefix, child)),
    __original: root
  });
}

// For use on the Transcript Record page.
// This will load the target transcript without calling the router, thus
// keeping the URL the same.
function TranscriptLink(props, context) {
  let { onClick = () => {} } = props;
  let geneId = props.recordId.find(p => p.name === 'gene_source_id').value;
  let transcriptId = props.recordId.find(p => p.name === 'source_id').value;
  return (
    <a
      {...props}
      href={'./geneId'}
      onClick={(event) => {
        event.preventDefault();
        // store the last requested transcript id for the gene id
        window.sessionStorage.setItem(TRANSCRIPT_ID_KEY_PREFIX + geneId, transcriptId);
        context.actionCreators.RecordViewActionCreator.fetchRecordDetails(
          props.recordClass.urlSegment,
          props.recordId.map(p => p.value)
        );
        onClick(event);
      }}
    >
      {props.children}
    </a>
  );
}
TranscriptLink.contextTypes = {
  actionCreators: React.PropTypes.object
};

/**
 * Create a new record ID based on an existing ID.
 *
 * @param {Array<Object>} oldId
 * @param {Object} newParts New ID values
 */
function makeRecordId(oldId, newParts) {
  return oldId.map(idPart => {
    return Object.assign({}, idPart, {
      value: newParts[idPart.name] || idPart.value
    });
  });
}

function TranscriptList(props, context) {
  let { record, recordClass } = props;
  let params = { class: recordClass.name };
  if (record.tables.GeneTranscripts == null) return null;

  return (
    <div className="eupathdb-TranscriptListContainer">
    <ul className="eupathdb-TranscriptRecordNavList">
    {record.tables.GeneTranscripts.map(row => {
      let { transcript_id } = row;
      let recordId = makeRecordId(record.id, {
        source_id: transcript_id
      });
      let active = record.id.find(p => p.name === 'source_id').value === transcript_id;
      return (
        <li key={transcript_id}>
          <TranscriptLink
            className={active ? 'active' : ''}
            recordId={recordId}
            recordClass={recordClass}
            onClick={() => {
              scrollToElementById(TRANSCRIPT_ID);
            }}
          >
            {transcript_id}
          </TranscriptLink>
        </li>
      );
    })}
    </ul>
    </div>
  );
}

export function RecordOverview(props) {
  let {
    name,
    gene_type,
    chromosome,
    sequence_id,
    location_text,
    genus_species,
    strain,
    genome_status,
    data_release_policy,
    special_link,
    user_comment_link,
    new_product_name,
    product,
    context_start,
    context_end,
    source_id,
    protein_length = 865,
    protein_gtracks = 'InterproDomains%1ESignalP%1ETMHMM%1EExportPred%1EHydropathyPlot%1EBLASTP%1ELowComplexity%1ESecondaryStructure'
  } = props.record.attributes;


    // TODO:  get the attribute name from the model instead of the hard coded one in contexts
    Gbrowse.contexts.map(thumbnail => (
        thumbnail.imgUrl = props.record.attributes[thumbnail.gbrowse_url]
    ));


  return (
    <div className="wdk-RecordOverview">
      <div className="GeneOverviewTitle">
        <h1 className="GeneOverviewId">{props.record.displayName + ' '}</h1>
        <h2 className="GeneOverviewProduct">{product}</h2>
      </div>
      <div className="GeneOverviewLeft">
        <OverviewItem label="Gene" value={name}/>
        <OverviewItem label="Type" value={gene_type}/>
        <OverviewItem label="Chromosome" value={chromosome}/>
        <OverviewItem label="Location" value={location_text}/>
        <br/>
        <OverviewItem label="Species" value={genus_species}/>
        <OverviewItem label="Strain" value={strain}/>
        <OverviewItem label="Status" value={genome_status}/>
        <br/>
        <div className="GeneOverviewItem">{ComponentUtils.safeHtml(user_comment_link)}</div>
      </div>

      <div className="GeneOverviewRight">
        <div className="GeneOverviewItem">{ComponentUtils.safeHtml(new_product_name)}</div>
        <div className="GeneOverviewItem">{ComponentUtils.safeHtml(special_link)}</div>
        <div className="GeneOverviewItem GeneOverviewIntent">{ComponentUtils.safeHtml(data_release_policy)}</div>

        <OverviewThumbnails  thumbnails={Gbrowse.contexts}/>
      </div>
    </div>
  );
}

function OverviewItem(props) {
  let { label, value = 'undefined' } = props;
  return value == null ? <noscript/> : (
    <div className="GeneOverviewItem"><label>{label}</label> {ComponentUtils.safeHtml(value)}</div>
  );
}

// TODO Smart position of popover
class OverviewThumbnails extends React.Component {

  constructor(...args) {
    super(...args);
    this.timeoutId = null;
    this.node = null;
    this.state = {
      showPopover: false
    };
    this._computePosition = this._computePosition.bind(this);
    this._detectOverflow = lodash.throttle(this._detectOverflow.bind(this), 250);
  }

  componentDidMount() {
    window.addEventListener('resize', this._detectOverflow);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._detectOverflow);
  }

  setActiveThumbnail(event, thumbnail) {
    if (thumbnail === this.state.activeThumbnail) return;
    this.setState({
      activeThumbnail: thumbnail,
      screenX: event.target.offsetLeft + event.target.clientWidth,
      showPopover: false
    });
  }

    showPopover() {
        this._setShowPopover(true, 250);
    }

    hidePopover() {
        this._setShowPopover(false, 250);
    }

    _setShowPopover(show, delay) {
        clearTimeout(this.timeoutId);
        this.timeoutId = setTimeout(() => {
            this.setState({ showPopover: show });
        }, delay);
    }

    _computePosition(popoverNode) {
        if (popoverNode == null) return;
        let popoverWidth = popoverNode.clientWidth;
        let popoverLeft = this.state.screenX + popoverWidth + 10 > window.innerWidth
                        ? 10
                        : this.state.screenX + 10;
        this.setState({ popoverLeft });
    }

  _detectOverflow() {
    console.log('is overflowed', isNodeOverflowing(this.node));
  }

  render() {
    return (
      <div ref={ n => this.node = n } className="eupathdb-GeneThumbnails">
        {this.props.thumbnails.map(thumbnail => (
          <div className="eupathdb-GeneThumbnailWrapper">
            <div className="eupathdb-GeneThumbnailLabel">
              <a href={'#' + thumbnail.gbrowse_url}>{thumbnail.displayName}</a>
            </div>
            <div className="eupathdb-GeneThumbnail"
              onMouseEnter={event => { this.showPopover(); this.setActiveThumbnail(event, thumbnail) }}
              onMouseLeave={() => this.hidePopover()}>
              <a href={'#' + thumbnail.gbrowse_url}>
                <img width="150" src={thumbnail.imgUrl}/>
              </a>
            </div>
          </div>
        ))}
        {this.renderPopover()}
      </div>
    );
  }

  renderPopover() {
    if (this.state.showPopover) {
      return (
        <div className="eupathdb-GeneThumbnailPopover"
          style={{ left: this.state.popoverLeft || '' }}
          ref={this._computePosition}
          onMouseEnter={event => { this.showPopover() }}
          onMouseLeave={() => { this.hidePopover() }}>
          <h3>{this.state.activeThumbnail.displayName}</h3>
          <div>(Click on image to view section on page)</div>
          <a href={'#' + this.state.activeThumbnail.gbrowse_url}
            onClick={() => this.setState({ showPopover: false })}>
            <img src={this.state.activeThumbnail.imgUrl}/>
          </a>
        </div>
      );
    }
  }

}

export function GeneRecordAttribute(props) {
    let context = Gbrowse.contexts.find(context => context.gbrowse_url === props.name);
    if (context != null) {
      return ( <Gbrowse.GbrowseContext {...props} context={context} /> );
  }

//  if (props.name === 'protein_gtracks') {
//    return ( <Gbrowse.ProteinContext {...props} /> );
//  }

  return ( <props.WdkRecordAttribute {...props}/> );
}

let treeCache = new WeakMap;
function extractGeneAndTranscriptTrees(categories) {
  if (!treeCache.has(categories)) {
    let fakeOntology = { tree: { children: categories } };
    let geneRoot = prefixLabel(GENE_ID, OntologyUtils.getTree(
      fakeOntology,
      node => lodash.get(node, 'properties.geneOrTranscript[0]') === GENE_ID
    ));

    let transcriptRoot = prefixLabel(TRANSCRIPT_ID, OntologyUtils.getTree(
      fakeOntology,
      node => lodash.get(node, 'properties.geneOrTranscript[0]') === TRANSCRIPT_ID
    ));

    treeCache.set(categories, { geneRoot, transcriptRoot });
  }
  return treeCache.get(categories);
}

export function RecordNavigationSectionCategories(props) {
  let { categories } = props;
  let { geneRoot, transcriptRoot } = extractGeneAndTranscriptTrees(categories);
  return (
    <div className="eupathdb-TranscriptRecordNavigationSectionContainer">
      <h3>Gene</h3>
      <props.DefaultComponent
        {...props}
        isVisible={node => props.isVisible(node.__original)}
        categories={geneRoot.children}
      />
      <h3>Transcript</h3>
      <TranscriptList {...props}/>
      <props.DefaultComponent
        {...props}
        isVisible={node => props.isVisible(node.__original)}
        categories={transcriptRoot.children}
      />
    </div>
  );
}

export function RecordMainSection(props) {
  let { recordClass, record } = props;
  return (
    <div>
      <Sticky className="eupathdb-TranscriptSticky" fixedClassName="eupathdb-TranscriptSticky-fixed">
      {/*  <h2 className="eupathdb-TranscriptHeading">Transcript</h2> */ }
        <nav className="eupathdb-TranscriptTabList">
          {props.record.tables.GeneTranscripts.map(row => {
            let { transcript_id } = row;
            let recordId = makeRecordId(record.id, {
              source_id: transcript_id
            });
            let active = record.id.find(p => p.name === 'source_id').value === transcript_id;
            let className = [
              'eupathdb-TranscriptLink',
              active ? 'eupathdb-TranscriptLink-active active': ''
            ].join(' ');
            return (
              <TranscriptLink
                key={transcript_id}
                recordId={recordId}
                recordClass={recordClass}
                className={className}
              >
                {transcript_id}
              </TranscriptLink>
            );
          })}
        </nav>
      </Sticky>
      <div className="eupathdb-TranscriptTabContent">
        <props.DefaultComponent {...props} />
      </div>
    </div>
  );
}

/*
export let RecordMainSection = React.createClass({

  render() {
    let { categories } = this.props;
    let { geneRoot, transcriptRoot } = extractGeneAndTranscriptTrees(categories);

    let uncategorized = categories.find(c => c.name === undefined);
    categories = categories.filter(c => c !== uncategorized);
    return(
      <div>
        {this.renderGeneCategory(geneRoot)}
        {this.renderTransCategory(transcriptRoot)}
      </div>
    );
  },

  renderGeneCategory(category) {
    return (
      <section id={GENE_ID}>
        <this.props.DefaultComponent {...this.props} categories={category.children}/>
      </section>
    );
  },

  renderTransCategory(category) {
    let { recordClass, record, collapsedCategories } = this.props;
    let allCategoriesHidden = category.children.every(cat => collapsedCategories.includes(cat.name));
    return (
      <section id={TRANSCRIPT_ID}>
        <Sticky className="eupathdb-TranscriptSticky" fixedClassName="eupathdb-TranscriptSticky-fixed">
          <h1 className="eupathdb-TranscriptHeading">Transcript</h1>
          <nav className="eupathdb-TranscriptTabList">
            {this.props.record.tables.GeneTranscripts.map(row => {
              let { transcript_id } = row;
              let recordId = makeRecordId(record.id, {
                source_id: transcript_id
              });
              let active = record.id.find(p => p.name === 'source_id').value === transcript_id;
              let className = [
                'eupathdb-TranscriptLink',
                active ? 'eupathdb-TranscriptLink-active active': ''
              ].join(' ');
              return (
                <TranscriptLink
                  key={transcript_id}
                  recordId={recordId}
                  recordClass={recordClass}
                  className={className}
                >
                  {transcript_id}
                </TranscriptLink>
              );
            })}
          </nav>
        </Sticky>
        <div className="eupathdb-TranscriptTabContent">
          {allCategoriesHidden
            ? <p>All Transcript categories are currently hidden.</p>
            :  <this.props.DefaultComponent {...this.props} categories={category.children}/>}
        </div>
      </section>
    );
  }

});
*/

export function ExpressionGraphTable(props) {
  let included = props.table.properties.includeInTable || [];

  let table = Object.assign({}, props.table, {
    attributes: props.table.attributes.filter(tm => included.indexOf(tm.name) > -1)
  });

  return (
    <props.DefaultComponent
      {...props}
      table={table}
      childRow={childProps =>
        <ExpressionGraph rowData={props.value[childProps.rowIndex]}/>}
    />
  );
}

export function ProteinPropertiesTable(props) {
  let included = props.table.properties.includeInTable || [];

  let table = Object.assign({}, props.table, {
    attributes: props.table.attributes.filter(tm => included.indexOf(tm.name) > -1)
  });

  return (
    <props.DefaultComponent
      {...props}
      table={table}
      childRow={childProps =>
        <Gbrowse.ProteinContext rowData={props.value[childProps.rowIndex]}/>}
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
              defaultValue={props.record.attributes.start_min}
              maxLength="10"
              size="10"
            />
          </label>
          <label> to <input
              name="stop"
              defaultValue={props.record.attributes.end_max}
              maxLength="10"
              size="10"
            />
          </label>
          <label> <input name="revComp" type="checkbox" defaultChecked={true}/> Reverse & compliment </label>
        </div>

        <div className="form-group">
          <strong>Genomes to align:</strong>
          <NativeCheckboxList
            name="genomes"
            items={props.value.map(row => ({
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
