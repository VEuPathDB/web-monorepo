import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import lodash from 'lodash';
import { projectId, webAppUrl } from '../../config';
import {NativeCheckboxList} from 'wdk-client/Components';
import { UserActionCreators } from 'wdk-client/ActionCreators';
import { pure } from 'wdk-client/ComponentUtils';
import {seq} from 'wdk-client/IterableUtils';
import {preorderSeq} from 'wdk-client/TreeUtils';
import {findChildren, isNodeOverflowing} from '../../util/domUtils';
import { withActions, withStore } from '../../util/component';
import DatasetGraph from '../common/DatasetGraph';
import Sequence from '../common/Sequence';
import {OverviewThumbnails} from '../common/OverviewThumbnails';
import * as Gbrowse from '../common/Gbrowse';
import {SnpsAlignmentForm} from '../common/Snps';

/**
 * Render thumbnails at eupathdb-GeneThumbnailsContainer
 */
export class RecordOverview extends Component {

  constructor(...args) {
    super(...args);
    this.handleThumbnailClick = this.handleThumbnailClick.bind(this);
    this.addProductTooltip = lodash.debounce(this.addProductTooltip.bind(this), 300);
  }

  componentDidMount() {
    this.addProductTooltip();
    window.addEventListener('resize', this.addProductTooltip);
    this.thumbsContainer = this.node.querySelector('.eupathdb-ThumbnailsContainer');
    if (this.thumbsContainer) this.renderThumbnails();
    else console.error('Warning: Could not find ThumbnailsContainer');
  }

  handleThumbnailClick({ anchor }) {
    this.context.eventHandlers.updateSectionVisibility(anchor, true);
  }

  componentDidUpdate() {
    if (this.thumbsContainer) this.renderThumbnails();
  }

  componentWillUnmount() {
    if (this.thumbsContainer) ReactDOM.unmountComponentAtNode(this.thumbsContainer);
    window.removeEventListener('resize', this.addProductTooltip);
  }

  addProductTooltip() {
    let products = seq(
      this.node.querySelectorAll(
        '.eupathdb-RecordOverviewTitle, .eupathdb-GeneOverviewSubtitle'))
      .filter(isNodeOverflowing)
      .flatMap(findChildren('.eupathdb-RecordOverviewDescription'));

    let items = seq(
      this.node.querySelectorAll('.eupathdb-RecordOverviewItem'))
      .filter(isNodeOverflowing);

    products.concat(items)
      .forEach(target => { target.title = target.textContent });
  }

  renderThumbnails() {
    let { store } = this.context;
    let { recordClass } = this.props;
    let { attributes, tables } = this.props.record;
    // Get field present in record instance. This is leveraging the fact that
    // we filter the category tree in the store based on the contents of
    // MetaTable.
    let instanceFields = new Set(
      preorderSeq(store.getState().categoryTree)
      .filter(node => !node.children.length)
      .map(node => node.properties.name[0])
      .toArray());

    let transcriptomicsThumbnail = {
      displayName: 'Transcriptomics',
      element: <img src={webAppUrl + '/wdkCustomization/images/transcriptomics.jpg'}/>,
      anchor: 'ExpressionGraphs'
    };

    let phenotypeThumbnail = {
      displayName: 'Phenotype',
      element: <img src={webAppUrl + '/wdkCustomization/images/transcriptomics.jpg'}/>,
      anchor: 'PhenotypeGraphs'
    };

    let crisprPhenotypeThumbnail = {
      displayName: 'Phenotype',
      element: <img src={webAppUrl + '/wdkCustomization/images/transcriptomics.jpg'}/>,
      anchor: 'CrisprPhenotypeGraphs'
    };

    let filteredGBrowseContexts = seq(Gbrowse.contexts)
    // inject transcriptomicsThumbnail before protein thumbnails
    .flatMap(context => {
      if (context.gbrowse_url === 'SnpsGbrowseUrl') {
        return [ phenotypeThumbnail, crisprPhenotypeThumbnail, context ];
      }
      if (context.gbrowse_url === 'FeaturesPbrowseUrl') {
        return [ transcriptomicsThumbnail, context ];
      }
      return [ context ];
    })
    // remove thumbnails whose associated fields are not present in record instance
    .filter(context => instanceFields.has(context.anchor))
    .map(context => context === transcriptomicsThumbnail
                 || context === phenotypeThumbnail
                 || context === crisprPhenotypeThumbnail
                  ? Object.assign({}, context, {
                      data: {
                        count: tables && tables[context.anchor] && tables[context.anchor].length
                      }
                    })
                  : Object.assign({}, context, {
                      element: <Gbrowse.GbrowseImage url={attributes[context.gbrowse_url]} includeImageMap={true}/>,
                      displayName: recordClass.attributesMap[context.gbrowse_url].displayName
                    })
    )
    .toArray();

    ReactDOM.render((
      <OverviewThumbnails
        title="Gene Features"
        thumbnails={filteredGBrowseContexts}
        onThumbnailClick={this.handleThumbnailClick}/>
    ), this.thumbsContainer);
  }

  render() {
    return (
      <div ref={node => this.node = node}>
        {this.props.children}
      </div>
    );
  }

}

RecordOverview.contextTypes = {
  eventHandlers: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired
};

export function RecordTable(props) {
  switch(props.table.name) {
    case 'ExpressionGraphs':
    case 'ProteinExpressionGraphs':   return <DatasetGraphTable {...props} dataTableName="ExpressionGraphsDataTable"/>
    case 'HostResponseGraphs':        return <DatasetGraphTable {...props} dataTableName="HostResponseGraphsDataTable"/>
    case 'CrisprPhenotypeGraphs':     return <DatasetGraphTable {...props} dataTableName="CrisprPhenotypeGraphsDataTable"/>
    case 'PhenotypeGraphs':           return <DatasetGraphTable {...props} dataTableName="PhenotypeGraphsDataTable"/>
    case 'MercatorTable':             return <MercatorTable {...props} />
    case 'ProteinProperties':         return <ProteinPbrowseTable {...props} />
    case 'ProteinExpressionPBrowse':  return <ProteinPbrowseTable {...props} />
    case 'Sequences':                 return <SequencesTable {...props} />
    case 'UserComments':              return <UserCommentsTable {...props} />
    case 'SNPsAlignment':             return <SNPsAlignment {...props} />
    default:                          return <props.DefaultComponent {...props} />
  }
}

function SNPsAlignment(props) {
  let { context_start, context_end, sequence_id, organism_full } = props.record.attributes;
  return (
    <SnpsAlignmentForm
      start={context_start}
      end={context_end}
      sequenceId={sequence_id}
      organism={organism_full} />
  )
}

function DatasetGraphTable(props) {
  let dataTable = {
    value: props.record.tables[props.dataTableName],
    table: props.recordClass.tablesMap[props.dataTableName],
    record: props.record,
    recordClass: props.recordClass,
    DefaultComponent: props.DefaultComponent
  };
  return (
    <props.DefaultComponent
      {...props}
      childRow={childProps => <DatasetGraph {...childProps} dataTable={dataTable} />}
    />
  );
}

function ProteinPbrowseTable(props) {
  return (
    <props.DefaultComponent
      {...props}
      childRow={childProps => <Gbrowse.ProteinContext {...childProps} />}
    />
  );
}


// SequenceTable Components
// ------------------------

const renderUtr = str =>
  <span style={{ backgroundColor: '#cae4ff' }}>{str.toLowerCase()}</span>

const renderIntron = str =>
  <span style={{ backgroundColor: '#dddddd', color: '#333' }}>{str.toLowerCase()}</span>

const SequencesTableChildRow = pure(function SequencesTableChildRow(props) {
  let {
    protein_sequence,
    transcript_sequence,
    genomic_sequence,
    protein_length,
    transcript_length,
    genomic_sequence_length,
    five_prime_utr_coords,
    three_prime_utr_coords,
    gen_rel_intron_utr_coords
  } = props.rowData;

  let transcriptRegions = [
    JSON.parse(five_prime_utr_coords) || undefined,
    JSON.parse(three_prime_utr_coords) || undefined
  ].filter(coords => coords != null)

  let transcriptHighlightRegions = transcriptRegions.map(coords => {
    return { renderRegion: renderUtr, start: coords[0], end: coords[1] };
  });

  let genomicRegions = JSON.parse(gen_rel_intron_utr_coords || '[]');

  let genomicHighlightRegions = genomicRegions.map(coord => {
    return {
      renderRegion: coord[0] === 'Intron' ? renderIntron : renderUtr,
      start: coord[1],
      end: coord[2]
    };
  });

  let genomicRegionTypes = lodash(genomicRegions)
    .map(region => region[0])
    .sortBy()
    .sortedUniq()
    .value();

  let legendStyle = { marginRight: '1em', textDecoration: 'underline' };
  return (
    <div>
      {protein_sequence == null ? null : (
        <div style={{ padding: '1em' }}>
          <h3>Predicted Protein Sequence</h3>
          <div><span style={legendStyle}>{protein_length} aa</span></div>
          <Sequence sequence={protein_sequence}/>
        </div>
        )}

        {protein_sequence == null ? null : <hr/>}

        <div style={{ padding: '1em' }}>
          <h3>Predicted RNA/mRNA Sequence (Introns spliced out{ transcriptRegions.length > 0 ? '; UTRs highlighted' : null })</h3>
          <div>
            <span style={legendStyle}>{transcript_length} bp</span>
            { transcriptRegions.length > 0
              ? <span style={legendStyle}>{renderUtr('UTR')}</span>
              : null }
          </div>
          <Sequence sequence={transcript_sequence}
            highlightRegions={transcriptHighlightRegions}/>
        </div>

        <div style={{ padding: '1em' }}>
          <h3>Genomic Sequence { genomicRegionTypes.length > 0 ? ' (' + genomicRegionTypes.map(t => t + 's').join(' and ') + ' highlighted)' : null}</h3>
          <div>
            <span style={legendStyle}>{genomic_sequence_length} bp</span>
            {genomicRegionTypes.map(t => {
              const renderStr = t === 'Intron' ? renderIntron : renderUtr;
              return (
                <span style={legendStyle}>{renderStr(t)}</span>
              );
            })}
          </div>
          <Sequence sequence={genomic_sequence}
            highlightRegions={genomicHighlightRegions}/>
        </div>

      </div>
  );
});

function SequencesTable(props) {
  return (
    <props.DefaultComponent
      {...props}
      childRow={childProps => <SequencesTableChildRow {...childProps} />}
    />
  );
}

function MercatorTable(props) {
  return (
    <div className="eupathdb-MercatorTable">
      <form action="/cgi-bin/pairwiseMercator">
        <input type="hidden" name="project_id" value={projectId}/>

        <div className="form-group">
          <label><strong>Contig ID:</strong> <input type="text" name="contig" defaultValue={props.record.attributes.sequence_id}/></label>
        </div>

        <div className="form-group">
          <label>
            <strong>Nucleotide positions: </strong>
            <input
              type="text"
              name="start"
              defaultValue={props.record.attributes.start_min}
              maxLength="10"
              size="10"
            />
          </label>
          <label> to <input
              type="text"
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


const withUserAndAction = lodash.flowRight(
  withStore(state => ({ user: state.globalData.user, location: state.globalData.location })),
  withActions(UserActionCreators)
);

const UserCommentsTable = withUserAndAction(function UserCommentsTable(props) {
  let { user_comment_link_url } = props.record.attributes;
  return (
    <div>
      <p>
        <a href={user_comment_link_url}
          onClick={e => {
            const modifierPressed = e.metaKey || e.altKey || e.ctrlKey || e.shiftKey;
            const { isGuest } = props.user;
            if (modifierPressed || !isGuest) return;
            e.preventDefault();
            props.showLoginWarning('add a comment', user_comment_link_url);
          }}
        >
          Add a comment <i className="fa fa-comment"/>
        </a>
      </p>
      <props.DefaultComponent {...props} />
    </div>
  )
});
