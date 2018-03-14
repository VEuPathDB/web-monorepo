import lodash from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import * as Category from 'wdk-client/CategoryUtils';
import { CategoriesCheckboxTree, RecordTable as WdkRecordTable } from 'wdk-client/Components';
import { pure } from 'wdk-client/ComponentUtils';
import {Seq} from 'wdk-client/IterableUtils';
import {preorderSeq} from 'wdk-client/TreeUtils';

import DatasetGraph from 'ebrc-client/components/DatasetGraph';
import { withStore } from 'ebrc-client/util/component';
import {findChildren, isNodeOverflowing} from 'ebrc-client/util/domUtils';

import { projectId, webAppUrl } from '../../config';
import * as Gbrowse from '../common/Gbrowse';
import {OverviewThumbnails} from '../common/OverviewThumbnails';
import Sequence from '../common/Sequence';
import {SnpsAlignmentForm} from '../common/Snps';
import { addCommentLink } from '../common/UserComments';

/**
 * Render thumbnails at eupathdb-GeneThumbnailsContainer
 */
export class RecordHeading extends Component {

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
    this.addProductTooltip.cancel();
  }

  addProductTooltip() {
    let products = Seq.from(
      this.node.querySelectorAll(
        '.eupathdb-RecordOverviewTitle, .eupathdb-GeneOverviewSubtitle'))
      .filter(isNodeOverflowing)
      .flatMap(findChildren('.eupathdb-RecordOverviewDescription'));

    let items = Seq.from(
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
      .map(node => node.properties.name[0]));

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

    let filteredGBrowseContexts = Seq.from(Gbrowse.contexts)
    .filter(context => context.includeInThumbnails !== false)
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
        <this.props.DefaultComponent {...this.props} />
      </div>
    );
  }

}

RecordHeading.contextTypes = {
  eventHandlers: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired
};

const ExpressionChildRow = makeDatasetGraphChildRow('ExpressionGraphsDataTable');
const HostResponseChildRow = makeDatasetGraphChildRow('HostResponseGraphsDataTable', 'FacetMetadata', 'ContXAxisMetadata');
const CrisprPhenotypeChildRow = makeDatasetGraphChildRow('CrisprPhenotypeGraphsDataTable');
const PhenotypeScoreChildRow = makeDatasetGraphChildRow('PhenotypeScoreGraphsDataTable');
const PhenotypeChildRow = makeDatasetGraphChildRow('PhenotypeGraphsDataTable');

export function RecordTable(props) {
  switch(props.table.name) {

    case 'ExpressionGraphs':
    case 'ProteinExpressionGraphs':
    case 'eQTLPhenotypeGraphs':
      return <props.DefaultComponent {...props} childRow={ExpressionChildRow}/>

    case 'HostResponseGraphs':
      return <props.DefaultComponent {...props} childRow={HostResponseChildRow} />

    case 'CrisprPhenotypeGraphs':
      return <props.DefaultComponent {...props} childRow={CrisprPhenotypeChildRow} />

    case 'PhenotypeScoreGraphs':
      return <props.DefaultComponent {...props} childRow={PhenotypeScoreChildRow} />

    case 'PhenotypeGraphs':
      return <props.DefaultComponent {...props} childRow={PhenotypeChildRow} />

    case 'MercatorTable':
      return <MercatorTable {...props} />

    case 'ProteinProperties':
      return <props.DefaultComponent {...props} childRow={Gbrowse.ProteinContext} />

    case 'ProteinExpressionPBrowse':
      return <props.DefaultComponent {...props} childRow={Gbrowse.ProteinContext} />

    case 'Sequences':
      return <props.DefaultComponent {...props} childRow={SequencesTableChildRow} />

    case 'UserComments':
      return <UserCommentsTable {...props} />

    case 'SNPsAlignment':
      return <SNPsAlignment {...props} />

    case 'RodMalPhenotype':
      return <props.DefaultComponent {...props} childRow={RodMalPhenotypeTableChildRow} />

    default:
      return <props.DefaultComponent {...props} />
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

const RodMalPhenotypeTableChildRow = pure(function RodMalPhenotypeTableChildRow(props) {
  let {
    phenotype
  } = props.rowData;
  return (
    <div>
    <b>Phenotype</b>:
    {phenotype == null ? null : phenotype}
    </div>
  )
});


function makeDatasetGraphChildRow(dataTableName, facetMetadataTableName, contXAxisMetadataTableName) {
  let DefaultComponent = WdkRecordTable;
  return withStore(state => {
    let { record, recordClass } = state;

    let dataTable = dataTableName && dataTableName in record.tables && {
      value: record.tables[dataTableName],
      table: recordClass.tablesMap[dataTableName],
      record: record,
      recordClass: recordClass,
      DefaultComponent: DefaultComponent
    };

   let facetMetadataTable = facetMetadataTableName && facetMetadataTableName in record.tables && {
      value: record.tables[facetMetadataTableName],
      table: recordClass.tablesMap[facetMetadataTableName],
      record: record,
      recordClass: recordClass,
      DefaultComponent: DefaultComponent
    };

   let contXAxisMetadataTable = contXAxisMetadataTableName && contXAxisMetadataTableName in record.tables && {
      value: record.tables[contXAxisMetadataTableName],
      table: recordClass.tablesMap[contXAxisMetadataTableName],
      record: record,
      recordClass: recordClass,
      DefaultComponent: DefaultComponent
    };

    return { dataTable, facetMetadataTable, contXAxisMetadataTable };
  })(DatasetGraph);
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

function makeTree(rows){
    const n = Category.createNode; // helper for below

    let myTree = n('root', 'root', null, []);

    addChildren(myTree, rows, n);

    return myTree;
}

function addChildren(t, rows, n) {
    for(let i = 0; i < rows.length; i++){
        let parent = rows[i].parent;
        let organism = rows[i].organism;
        let abbrev = rows[i].abbrev;

        if(parent == Category.getId(t) ){
            let node = n(abbrev, organism, null, []);
            t.children.push(node);
        }
    }

    for(let j = 0; j < t.children.length; j++) {
        addChildren(t.children[j], rows, n);
    }
}


class MercatorTable extends React.Component {

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
    let exceededMaxOrganisms = this.state.selectedLeaves.length > 15;
    return (
      <div className="eupathdb-MercatorTable">
        <form action="/cgi-bin/pairwiseMercator" target="_blank" method="post">
          <input type="hidden" name="project_id" value={projectId}/>

          <div className="form-group">
            <label><strong>Contig ID:</strong> <input type="text" name="contig" defaultValue={this.props.record.attributes.sequence_id}/></label>
          </div>

          <div className="form-group">
            <label>
              <strong>Nucleotide positions: </strong>
              <input
                type="text"
                name="start"
                defaultValue={this.props.record.attributes.start_min}
                maxLength="10"
                size="10"
              />
            </label>
            <label> to <input
                type="text"
                name="stop"
                defaultValue={this.props.record.attributes.end_max}
                maxLength="10"
                size="10"
              />
            </label>
            <label> <input name="revComp" type="checkbox" defaultChecked={false}/> Reverse &amp; complement </label>
          </div>

        <div className="form-group">

          <strong>Organisms to align: </strong>

          <p>
            Select 15 or fewer organisms from the tree below.
            <br/>
            {exceededMaxOrganisms && <i className="fa fa-warning" style={{ color: 'darkorange', width: '1.5em' }}/>}
            <span style={{ color: exceededMaxOrganisms ? 'darkred' : '' }}>
              You have currently selected {this.state.selectedLeaves.length}
            </span>
          </p>

          <CategoriesCheckboxTree
            name="genomes"
            searchBoxPlaceholder={`Search for Organism(s) to include in the alignment or expand the tree below`}
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
          />
        </div>

        <div className="form-group">
          <strong>Select output:</strong>
          <div className="form-radio"><label><input name="type" type="radio" value="clustal" defaultChecked={true}/> Multiple sequence alignment (clustal)</label></div>
          <div className="form-radio"><label><input name="type" type="radio" value="fasta_ungapped"/> Multi-FASTA</label></div>
        </div>

        <button
          style={{ display: 'block', margin: '2rem auto' }}
          className="btn"
          disabled={exceededMaxOrganisms}
          title={exceededMaxOrganisms ? 'Please fix errors listed above.' : 'Run alignment'}
          type="submit"
        >Run alignment</button>
      </form>
    </div>
    );
  }
}

const UserCommentsTable = addCommentLink(props => props.record.attributes.user_comment_link_url);
