import React from 'react';
import ExpressionGraph from '../common/ExpressionGraph';

let {
  OntologyUtils,
  TreeUtils
} = Wdk.client;

let {
  CheckboxList,
  RecordLink,
  Sticky
} = Wdk.client.Components;

export const GENE_ID = 'gene';
export const TRANSCRIPT_ID = 'transcript';
export const TRANSCRIPT_ID_KEY_PREFIX = 'eupathdb::previousTranscriptId::';

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
  // FIXME Remove early return when attributes for GBrowse are available
  // return <props.DefaultComponent {...props} />;

  return (
    <div>
      <props.DefaultComponent {...props}/>
      <GbrowseContext record={props.record}/>
    </div>
  );
}

let gbrowseScripts = [ '/gbrowse/apiGBrowsePopups.js', '/gbrowse/wz_tooltip.js' ]
function injectGbrowseScripts(iframe) {
  if (iframe == null) return;

  let gbrowseWindow = iframe.contentWindow.window;
  let gbrowseDocumentBody = iframe.contentWindow.document.body;

  gbrowseWindow.wdk = wdk;
  gbrowseWindow.jQuery = jQuery;

  for (let scriptUrl of gbrowseScripts) {
    let script = document.createElement('script');
    script.src = scriptUrl;
    gbrowseDocumentBody.appendChild(script);
  }
}

function resizeIframe(event) {
  let iframe = event.target;
  iframe.style.height = iframe.contentWindow.document.body.scrollHeight + 20 + 'px';
}

export function GbrowseContext(props) {
  let {
    sequence_id,
    gene_context_start,
    gene_context_end,
    gene_source_id,
    dna_gtracks = 'test'
  } = props.record.attributes;

  let lowerProjectId = wdk.MODEL_NAME.toLowerCase();
  let lowerGeneId = gene_source_id.toLowerCase();

  let queryParams = {
    name: `${sequence_id}:${gene_context_start}..${gene_context_end}`,
    hmap: 'gbrowseSyn',
    l: dna_gtracks,
    width: 800,
    embed: 1,
    h_feat: `${lowerGeneId}@yellow`,
    genepage: 1
  };

  let queryParamString = Object.keys(queryParams).reduce((str, key) => `${str};${key}=${queryParams[key]}` , '');
  let iframeUrl = `/cgi-bin/gbrowse_img/${lowerProjectId}/?${queryParamString}`;
  let gbrowseUrl = `/cgi-bin/gbrowse/${lowerProjectId}/?name=${sequence_id}:${gene_context_start}..${gene_context_end};h_feat=${lowerGeneId}@yellow`;

  return (
    <div id="genomic-context">
      <center>
        <strong>Genomic Context</strong>
        <a id="gbView" href={gbrowseUrl}>View in Genome Browser</a>
        <div>(<i>use right click or ctrl-click to open in a new window</i>)</div>
        <div id="${gnCtxDivId}"></div>
        <iframe src={iframeUrl} style={{ width: '1000px', border: 'none' }} ref={injectGbrowseScripts} onLoad={resizeIframe}/>
        <a id="gbView" href={gbrowseUrl}>View in Genome Browser</a>
        <div>(<i>use right click or ctrl-click to open in a new window</i>)</div>
      </center>
    </div>
  );
}

export function ProteinContext(props) {
  let { source_id, protein_length, protein_gtracks } = props.record.attributes;

  return (
    <div id="protein-features">
      <strong>Protein Features</strong>
      <iframe
        src={`/cgi-bin/gbrowse_img/${wdk.MODEL_NAME.toLowerCase()}aa/?name=${source_id}:1..${protein_length};l=${protein_gtracks};hmap=pbrowse;width=800;embed=1;genepage=1`}
        onLoad={resizeIframe}
        style={{ width: '1000px', border: 'none' }}
      />
    </div>
  );
}

let treeCache = new WeakMap;
function extractGeneAndTranscriptTrees(categories) {
  if (!treeCache.has(categories)) {
    let fakeOntology = { tree: { children: categories } };
    let geneRoot = prefixLabel(GENE_ID, OntologyUtils.getTree(
      fakeOntology,
      node => _.get(node, 'properties.geneOrTranscript[0]') === GENE_ID
    ));

    let transcriptRoot = prefixLabel(TRANSCRIPT_ID, OntologyUtils.getTree(
      fakeOntology,
      node => _.get(node, 'properties.geneOrTranscript[0]') === TRANSCRIPT_ID
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
          <CheckboxList
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
