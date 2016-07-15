/* global wdk */
import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import lodash from 'lodash';
import {NativeCheckboxList} from 'wdk-client/Components';
import {seq} from 'wdk-client/IterableUtils';
import {isNodeOverflowing} from '../../util/domUtils';
import DatasetGraph from '../common/DatasetGraph';
import Sequence from '../common/Sequence';
import {OverviewThumbnails} from '../common/OverviewThumbnails';
import * as Gbrowse from '../common/Gbrowse';
import {SnpsAlignmentForm} from '../common/Snps';

let transcriptomicsThumbnail = {
  displayName: 'Transcriptomics',
  element: <img src={wdk.assetsUrl('wdkCustomization/images/transcriptomics.jpg')}/>,
  anchor: 'ExpressionGraphs'
};

/**
 * Render thumbnails at eupathdb-GeneThumbnailsContainer
 */
export class RecordOverview extends React.Component {

  constructor(...args) {
    super(...args);
    this.handleThumbnailClick = this.handleThumbnailClick.bind(this);
  }

  componentDidMount() {
    this.addProductTooltip();
    this.thumbsContainer = this.node.querySelector('.eupathdb-ThumbnailsContainer');
    if (this.thumbsContainer) this.renderThumbnails();
    else console.error('Warning: Could not find ThumbnailsContainer');
  }

  handleThumbnailClick(thumbnail) {
    this.context.eventHandlers.toggleSection(thumbnail.anchor, true);
  }

  componentDidUpdate() {
    if (this.thumbsContainer) this.renderThumbnails();
  }

  componentWillUnmount() {
    if (this.thumbsContainer) ReactDOM.unmountComponentAtNode(this.thumbsContainer);
    $(this.node).find('.eupathdb-RecordOverviewTitle, .eupathdb-GeneOverviewSubtitle').qtip('destroy', true);
  }

  addProductTooltip() {
    $(this.node).find('.eupathdb-RecordOverviewTitle, .eupathdb-GeneOverviewSubtitle')
    .wdkTooltip({
      content: {
        text: (event, api) => {
          return api.elements.target.find('.eupathdb-RecordOverviewDescription').text();
        }
      },
      events: {
        show: (event, api) => {
          if (!isNodeOverflowing(api.elements.target[0])) {
            event.preventDefault();
          }
        }
      }
    });
  }

  renderThumbnails() {
    let { recordClass } = this.props;
    let { attributes, tables } = this.props.record;
    let { gene_type, protein_expression_gtracks } = attributes;
    let isProteinCoding = gene_type === 'protein coding';
    let filteredGBrowseContexts = seq(Gbrowse.contexts)
    // inject transcriptomicsThumbnail before protein thumbnails
    .flatMap(context => context.gbrowse_url === 'FeaturesPbrowseUrl'
      ? [ transcriptomicsThumbnail, context ]
      : [ context ]
    )
    .filter(context => {
      return context === transcriptomicsThumbnail || context.gbrowse_url in attributes && (
        !context.isPbrowse || (isProteinCoding && context.gbrowse_url !== 'ProteomicsPbrowseUrl') ||
          (isProteinCoding && context.gbrowse_url === 'ProteomicsPbrowseUrl' && protein_expression_gtracks)
      );
    })
    .map(context => context === transcriptomicsThumbnail
      ? Object.assign({}, context, {
          data: {
            count: tables && tables.ExpressionGraphs && tables.ExpressionGraphs.length
          }
        })
      : Object.assign({}, context, {
          element: <Gbrowse.GbrowseImage url={attributes[context.gbrowse_url]}/>,
          displayName: recordClass.attributesMap.get(context.gbrowse_url).displayName
        })
    )
    .toArray();

    ReactDOM.render((
      <OverviewThumbnails thumbnails={filteredGBrowseContexts} onThumbnailClick={this.handleThumbnailClick}/>
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
  eventHandlers: React.PropTypes.object.isRequired
};

let expressionRE = /ExpressionGraphs|HostResponseGraphs|PhenotypeGraphs$/;
export function RecordTable(props) {
  return expressionRE.test(props.table.name)              ? <DatasetGraphTable {...props} />
       : props.table.name === 'MercatorTable'             ? <MercatorTable {...props} />
       : props.table.name === 'ProteinProperties'         ? <ProteinPbrowseTable {...props} />
       : props.table.name === 'ProteinExpressionPBrowse'  ? <ProteinPbrowseTable {...props} />
       : props.table.name === 'Sequences'                 ? <SequencesTable {...props} />
       : props.table.name === 'UserComments'              ? <UserCommentsTable {...props} />
       : props.table.name === 'SNPsAlignment'             ? <SNPsAlignment {...props} />
       : <props.DefaultComponent {...props} />
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
  let included = props.table.properties.includeInTable || [];

  let dataTable;

  if(props.table.name == "HostResponseGraphs") {
    // TODO
  }
  else {
    dataTable = Object.assign({}, {
      value: props.record.tables.ExpressionGraphsDataTable,
      table: props.recordClass.tables.find(obj => obj.name == "ExpressionGraphsDataTable"),
      record: props.record,
      recordClass: props.recordClass,
      DefaultComponent: props.DefaultComponent
    }
    );

  }

  let table = Object.assign({}, props.table, {
    attributes: props.table.attributes.filter(tm => included.indexOf(tm.name) > -1)
  });

  return (
    <div>
      <props.DefaultComponent
        {...props}
        table={table}
        childRow={childProps =>
          <DatasetGraph  rowData={props.value[childProps.rowIndex]} dataTable={dataTable}  />}
      />
    </div>
  );
}

function ProteinPbrowseTable(props) {
  let included = props.table.properties.includeInTable || [];

  let table = Object.assign({}, props.table, {
    attributes: props.table.attributes.filter(tm => included.indexOf(tm.name) > -1)
  });

  return (
    <props.DefaultComponent
      {...props}
      table={table}
      childRow={childProps =>
        <Gbrowse.ProteinContext {...props} rowData={props.value[childProps.rowIndex]}/>}
    />
  );
}

function SequencesTable(props) {
  let included = props.table.properties.includeInTable || [];
  let table = Object.assign({}, props.table, {
    attributes: props.table.attributes.filter(tm => included.indexOf(tm.name) > -1)
  });

  return (
    <props.DefaultComponent
      {...props}
      table={table}
      childRow={childProps => {
        let utrClassName = 'eupathdb-UtrSequenceNucleotide';
        let intronClassName = 'eupathdb-IntronSequenceNucleotide';

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
        } = childProps.rowData;

        let transcriptRegions = [
          JSON.parse(five_prime_utr_coords) || undefined,
          JSON.parse(three_prime_utr_coords) || undefined
        ].filter(coords => coords != null)

        let transcriptHighlightRegions = transcriptRegions.map(coords => {
          return { className: utrClassName, start: coords[0], end: coords[1] };
        });

        let genomicRegions = JSON.parse(gen_rel_intron_utr_coords || '[]');

        let genomicHighlightRegions = genomicRegions.map(coord => {
          return {
            className: coord[0] === 'Intron' ? intronClassName : utrClassName,
            start: coord[1],
            end: coord[2]
          };
        });

        let genomicRegionTypes = lodash(genomicRegions)
        .map(region => region[0])
        .sortBy()
        .uniq(true)
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
                { transcriptRegions.length > 0 ? <span style={legendStyle} className={utrClassName}>&nbsp;UTR&nbsp;</span> : null }
              </div>
              <Sequence sequence={transcript_sequence}
                highlightRegions={transcriptHighlightRegions}/>
            </div>

            <div style={{ padding: '1em' }}>
              <h3>Genomic Sequence { genomicRegionTypes.length > 0 ? ' (' + genomicRegionTypes.map(t => t + 's').join(' and ') + ' highlighted)' : null}</h3>
              <div>
                <span style={legendStyle}>{genomic_sequence_length} bp</span>
                {genomicRegionTypes.map(t => {
                  let className = t === 'Intron' ? intronClassName : utrClassName;
                  return (
                    <span style={legendStyle} className={className}>&nbsp;{t}&nbsp;</span>
                  );
                })}
              </div>
              <Sequence sequence={genomic_sequence}
                highlightRegions={genomicHighlightRegions}/>
            </div>

          </div>
        );
      }}
    />
  );
}

function MercatorTable(props) {
  return (
    <div className="eupathdb-MercatorTable">
      <form action="/cgi-bin/pairwiseMercator">
        <input type="hidden" name="project_id" value={wdk.MODEL_NAME}/>

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

function UserCommentsTable(props) {
  let { user_comment_link_url } = props.record.attributes;
  return (
    <div>
      <p>
        <a href={user_comment_link_url}
          onClick={e => {
            e.preventDefault();
            wdk.user.login('add a comment', user_comment_link_url);
          }}
        >
          Add a comment <i className="fa fa-comment"/>
        </a>
      </p>
      <props.DefaultComponent {...props} />
    </div>
  )
}
