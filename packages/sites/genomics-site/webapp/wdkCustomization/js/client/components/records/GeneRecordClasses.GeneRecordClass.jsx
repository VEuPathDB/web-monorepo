import lodash from 'lodash';
import React, { Component, Suspense, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';

import { RecordActions } from '@veupathdb/wdk-client/lib/Actions';
import * as Category from '@veupathdb/wdk-client/lib/Utils/CategoryUtils';
import { CollapsibleSection, CategoriesCheckboxTree, Loading, RecordTable as WdkRecordTable } from '@veupathdb/wdk-client/lib/Components';
import { renderAttributeValue, pure } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import {Seq} from '@veupathdb/wdk-client/lib/Utils/IterableUtils';
import {preorderSeq} from '@veupathdb/wdk-client/lib/Utils/TreeUtils';

import DatasetGraph from '@veupathdb/web-common/lib/components/DatasetGraph';
import ExternalResource from '@veupathdb/web-common/lib/components/ExternalResource';
import Sequence from '@veupathdb/web-common/lib/components/records/Sequence';
import {findChildren, isNodeOverflowing} from '@veupathdb/web-common/lib/util/domUtils';

import { projectId, webAppUrl } from '../../config';
import * as Gbrowse from '../common/Gbrowse';
import {OverviewThumbnails} from '../common/OverviewThumbnails';
import {SnpsAlignmentForm} from '../common/Snps';
import { addCommentLink } from '../common/UserComments';
import { withRequestFields } from './utils';
import { usePreferredOrganismsEnabledState, usePreferredOrganismsState } from '@veupathdb/preferred-organisms/lib/hooks/preferredOrganisms';

/**
 * Render thumbnails at eupathdb-GeneThumbnailsContainer
 */
export const RecordHeading = connect(
  state => ({ categoryTree: state.record.categoryTree }),
  RecordActions
)(class RecordHeading extends Component {

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
    this.props.updateSectionVisibility(anchor, true);
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
    let { categoryTree, recordClass } = this.props;
    let { attributes, tables } = this.props.record;
    // Get field present in record instance. This is leveraging the fact that
    // we filter the category tree in the store based on the contents of
    // MetaTable.
    let instanceFields = new Set(
      preorderSeq(categoryTree)
      .filter(node => !node.children.length)
      .map(node => node.properties.name[0]));

    let transcriptomicsThumbnail = {
      displayName: 'Transcriptomics',
      element: <img src={webAppUrl + '/wdkCustomization/images/transcription_summary.png'}/>,
      anchor: 'TranscriptionSummary'
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
    // FungiOrgLinkoutsTable is requested in componentWrappers
    return (
      <React.Fragment>
        <div ref={node => this.node = node}>
          <this.props.DefaultComponent {...this.props} />
        </div>
        <FungiOrgLinkoutsTable value={this.props.record.tables.FungiOrgLinkoutsTable}/>
      </React.Fragment>
    );
  }

});

export const RecordMainSection = connect(null)(({ DefaultComponent, dispatch, ...props }) => {
  return (
    <React.Fragment>
      {props.depth == null && (
        <div style={{ position: 'absolute', right: '3em' }}>
          <i className="fa fa-exclamation-triangle"/>&nbsp;
          <button className="link" onClick={() => dispatch(RecordActions.updateAllFieldVisibility(false))}>
            Collapse all sections for better performance
          </button>
        </div>
      )}
      <DefaultComponent {...props}/>
    </React.Fragment>
  );
  });

function FungiOrgLinkoutsTable(props) {
  if (props.value == null || props.value.length === 0) return null;
  const groupedLinks = lodash.groupBy(props.value, 'dataset');
  return (
    <div style={{marginTop: '2em'}}>
      <div className="eupathdb-RecordOverviewItem"><strong>Model Organism Orthologs</strong></div>
      {Object.entries(groupedLinks).map(([dataset, rows]) =>
        <div key={dataset} className="eupathdb-RecordOverviewItem" >
          <strong>{dataset}:</strong> {rows.map((row, index) => 
            <React.Fragment key={index}>
              {renderAttributeValue(row.link)}
              {index === rows.length - 1 ? null : ', '}
            </React.Fragment>
          )}
        </div>
      )}
    </div>
  );
}

const ExpressionChildRow = makeDatasetGraphChildRow('ExpressionGraphsDataTable');
const HostResponseChildRow = makeDatasetGraphChildRow('HostResponseGraphsDataTable', 'FacetMetadata', 'ContXAxisMetadata');
const CrisprPhenotypeChildRow = makeDatasetGraphChildRow('CrisprPhenotypeGraphsDataTable');
const PhenotypeScoreChildRow = makeDatasetGraphChildRow('PhenotypeScoreGraphsDataTable');
const PhenotypeChildRow = makeDatasetGraphChildRow('PhenotypeGraphsDataTable');
const UDTranscriptomicsChildRow = makeDatasetGraphChildRow('UserDatasetsTranscriptomicsGraphsDataTable');

export function RecordTable(props) {
  switch(props.table.name) {

    case 'ExpressionGraphs':
    case 'ProteinExpressionGraphs':
    case 'eQTLPhenotypeGraphs':
      return <props.DefaultComponent {...props} childRow={ExpressionChildRow}/>

    case 'GOTerms':
      return <SortKeyTable {...props}/>

    case 'HostResponseGraphs':
      return <props.DefaultComponent {...props} childRow={HostResponseChildRow} />

    case 'CrisprPhenotypeGraphs':
      return <props.DefaultComponent {...props} childRow={CrisprPhenotypeChildRow} />

    case 'PhenotypeScoreGraphs':
      return <props.DefaultComponent {...props} childRow={PhenotypeScoreChildRow} />

    case 'PhenotypeGraphs':
      return <props.DefaultComponent {...props} childRow={PhenotypeChildRow} />

    case 'UserDatasetsTranscriptomicsGraphs':
      return <props.DefaultComponent {...props} childRow={UDTranscriptomicsChildRow} />

    case 'MercatorTable':
      return <MercatorTable {...props} />

    case 'Orthologs':
      return (
        <Suspense fallback={<Loading />}>
          <OrthologsFormContainer {...props}/>
        </Suspense>
      );

    case 'WolfPsortForm':
      return <WolfPsortForm {...props}/>

    case 'BlastpForm':
      return <BlastpForm {...props}/>

    case 'MitoprotForm':
      return <MitoprotForm {...props}/>

    case 'InterProForm':
      return <InterProForm {...props}/>

    case 'MendelGPIForm':
      return <MendelGPIForm {...props}/>

    case 'StringDBForm':
      return <StringDBForm {...props}/>

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

    case 'TranscriptionSummary':
      return <TranscriptionSummaryForm {...props}/>

    default:
      return <props.DefaultComponent {...props} />
  }
}

/** Customize how a record table's description is rendered **/
export function RecordTableDescription(props) {
  switch(props.table.name) {

    /* Example: Render the content of the attribute `orthomdl_link` in a `p` tag.
    case 'GeneTranscripts':
      return renderAttributeValue(props.record.attributes.orthomcl_link, null, 'p');
    */

    case 'ECNumbers':
      return typeof props.record.tables.ECNumbers != "undefined" && props.record.tables.ECNumbers.length > 0 && renderAttributeValue(props.record.attributes.ec_number_warning, null, 'p');

    case 'ECNumbersInferred':
      return typeof props.record.tables.ECNumbersInferred != "undefined" && props.record.tables.ECNumbersInferred.length > 0 && renderAttributeValue(props.record.attributes.ec_inferred_description, null, 'p');

    case 'MetabolicPathways':
      return typeof props.record.tables.MetabolicPathways != "undefined" && props.record.tables.MetabolicPathways.length > 0 && renderAttributeValue(props.record.attributes.ec_num_warn, null, 'p');

    case 'CompoundsMetabolicPathways':
      return typeof props.record.tables.CompoundsMetabolicPathways != "undefined" && props.record.tables.CompoundsMetabolicPathways.length > 0 && renderAttributeValue(props.record.attributes.ec_num_warn, null, 'p');


    case 'LOPITResult':
      return typeof props.record.tables.LOPITResult != "undefined" && props.record.tables.LOPITResult.length > 0 && renderAttributeValue(props.record.attributes.LOPITGraphSVG, null, 'p');


    default:
      return <props.DefaultComponent {...props}/>
  }
}

function SNPsAlignment(props) {
  let { start_min, end_max, sequence_id, organism_full } = props.record.attributes;
  return (
    <SnpsAlignmentForm
      start={start_min}
      end={end_max}
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
  return connect(state => {
    let { record, recordClass } = state.record;

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
  })(withRequestFields(Wrapper));

  function Wrapper({ requestFields, ...props }) {
    useEffect(() => {
      requestFields({
        tables: [
          dataTableName,
          facetMetadataTableName,
          contXAxisMetadataTableName
        ].filter(tableName => tableName != null)
      })
    }, []);
    return <DatasetGraph {...props}/>;
  }
}

// SequenceTable Components
// ------------------------

const renderUtr = str =>
  <span style={{ backgroundColor: '#cae4ff' }}>{str.toLowerCase()}</span>

const renderIntron = str =>
  <span style={{ backgroundColor: '#dddddd', color: '#333' }}>{str.toLowerCase()}</span>

const SequencesTableChildRow = pure(function SequencesTableChildRow(props) {
  let {
    source_id,
    protein_sequence,
    transcript_sequence,
    genomic_sequence,
    protein_length,
    is_pseudo,
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
          <Sequence
            accession={source_id}
            sequence={protein_sequence}
          />
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
          <Sequence
            accession={source_id}
            sequence={transcript_sequence}
            highlightRegions={transcriptHighlightRegions}
          />
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
          <Sequence
            accession={source_id}
            sequence={genomic_sequence}
            highlightRegions={genomicHighlightRegions}
          />
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


class SortKeyTable extends React.Component {

  constructor(props) {
    super(props);
    // Memoize the sorting. Without this, the DataTable widget will think is
    // is a new table and reset the sorting. This is bad if a user has already
    // sorted the table.
    this.sortValue = lodash.memoize(value => lodash.sortBy(value, 'sort_key'));
  }

  render() {
    return <this.props.DefaultComponent {...this.props} value={this.sortValue(this.props.value)}/>
  }
}


class WolfPsortForm extends React.Component {
    inputHeader(t)  {
        if(t.length > 1) {
            return <p>Select the Protein:</p>
        }
    }
    printInputs(t)  {
        if(t.length == 1) {
            return (<input type="hidden" name="source_ID" value={t[0].protein_source_id}/>);
        }
        return (
            t.map(p => {
                return (
                    <label key={p.protein_source_id}>
                        <input type="radio" name="source_ID" value={p.protein_source_id}/>
                        {p.protein_source_id} <br/> </label>
                );
            })
        );
    }

    render() {
      let { project_id } = this.props.record.attributes;  
        let t = this.props.value;
           return (

     <div>  
       <form action="/cgi-bin/wolfPSORT.pl" target="_blank" method="post">
         <input type="hidden" name="project_id" value={projectId}/>
         <input type="hidden" id="input_type" name="input_type" value="fasta"/>
         <input type="hidden" id="id_type" name="id_type" value="protein"/>                       
      
                  {this.inputHeader(t)}
                  {this.printInputs(t)}

         <p>Select an organism type:</p>
         <input type="radio" name="organism_type" value="animal"/> Animal<br/>
         <input type="radio" name="organism_type" value="plant"/> Plant<br/>
         <input type="radio" name="organism_type" value="fungi"/> Fungi<br/><br/>
         <input type="submit"/>
       </form>
     </div>

        );
    }
}


class BlastpForm extends React.Component {

    inputHeader(t)  {
        if(t.length > 1) {
            return <p>Select the Protein:</p>
        }
    }

    printInputs(t)  {
        if(t.length == 1) {
            return (<input type="hidden" name="source_ID" value={t[0].protein_source_id}/>);
        }

        return (
            t.map(p => {
                return (
                    <label key={p.protein_source_id}>
                        <input type="radio" name="source_ID" value={p.protein_source_id}/>
                        {p.protein_source_id} <br/> </label>
                );
            })
        );
    }

    render() {
      let { project_id } = this.props.record.attributes;
      let t = this.props.value;

      return (
        <div> 
          <form action="/cgi-bin/ncbiBLAST.pl" target="_blank" method="post">
            <input type="hidden" name="project_id" value={projectId}/>
            <input type="hidden" id="program" name="program" value="blastp"/>
            <input type="hidden" id="id_type" name="id_type" value="protein"/>                       

                     {this.inputHeader(t)}
                     {this.printInputs(t)}

            <p>Select the Database:</p>
            <input type="radio" name="database" value="nr"/> Non-redundant protein sequences (nr)<br/> 
            <input type="radio" name="database" value="refseq_protein"/> Reference proteins (refseq_protein)<br/> 
            <input type="radio" name="database" value="swissprot"/> UniProtKB/Swiss-Prot(swissprot)<br/>
            <input type="radio" name="database" value="SMARTBLAST/landmark"/> Model Organisms (landmark)<br/>
            <input type="radio" name="database" value="pat"/> Patented protein sequences(pat)<br/>
            <input type="radio" name="database" value="pdb"/> Protein Data Bank proteins(pdb)<br/>
            <input type="radio" name="database" value="env_nr_v5"/> Metagenomic proteins(env_nr)<br/>
            <input type="radio" name="database" value="tsa_nr_v5"/> Transcriptome Shotgun Assembly proteins (tsa_nr)<br/><br/>

            <input type="submit"/>
          </form>
        </div>
        );
    }
}


class MitoprotForm extends React.Component {

    inputHeader(t)  {
        if(t.length > 1) {
            return <p>Select the Protein:</p>
        }
    }

    printInputs(t)  {
        if(t.length == 1) {
            return (<input type="hidden" name="source_ID" value={t[0].protein_source_id}/>);
        }

        return (
            t.map(p => {
                return (
                    <label key={p.protein_source_id}>
                        <input type="radio" name="source_ID" value={p.protein_source_id}/>
                        {p.protein_source_id} <br/> </label>
                );
            })
        );
    }

    render() {
      let { project_id } = this.props.record.attributes;  
      let t = this.props.value;
      return (
          <div>
            <form action="/cgi-bin/mitoprot.pl" target="_blank" method="post">
              <input type="hidden" name="project_id" value={projectId}/>
              <input type="hidden" id="id_type" name="id_type" value="protein"/>                            

                  {this.inputHeader(t)}
                  {this.printInputs(t)}

              <input type="submit"/>
            </form>
          </div>
        );
    }
}


class InterProForm extends React.Component {

    inputHeader(t)  {
        if(t.length > 1) {
            return <p>Select the Protein:</p>
        }
    }

    printInputs(t)  {
        if(t.length == 1) {
            return (<input type="hidden" name="source_ID" value={t[0].protein_source_id}/>);
        }

        return (
            t.map(p => {
                return (
                    <label key={p.protein_source_id}>
                        <input type="radio" name="source_ID" value={p.protein_source_id}/>
                        {p.protein_source_id} <br/> </label>
                );
            })
        );
    }

    render() {
      let { project_id } = this.props.record.attributes;  
      let t = this.props.value;
      return (

      <div> 
        <form action="/cgi-bin/interPro.pl" target="_blank" method="post">
          <input type="hidden" name="project_id" value={projectId}/>
          <input type="hidden" id="id_type" name="id_type" value="protein"/>                       
          <input type="hidden" name="leaveIt" value=""/>

                  {this.inputHeader(t)}
                  {this.printInputs(t)}

          <input type="submit"/>
        </form>
      </div>
        );
    }
}


class MendelGPIForm extends React.Component {

    inputHeader(t)  {
        if(t.length > 1) {
            return <p>Select the Protein:</p>
        }
    }

    printInputs(t)  {
        if(t.length == 1) {
            return (<input type="hidden" name="source_ID" value={t[0].protein_source_id}/>);
        }

        return (
            t.map(p => {
                return (
                    <label key={p.protein_source_id}>
                        <input type="radio" name="source_ID" value={p.protein_source_id}/>
                        {p.protein_source_id} <br/> </label>
                );
            })
        );
    }


    render() {
      let { project_id } = this.props.record.attributes;  
      let t = this.props.value;
      return (
        <div> 
          <form action="/cgi-bin/mendelGPI.pl" target="_blank" method="post">
            <input type="hidden" name="project_id" value={projectId}/>
            <input type="hidden" id="id_type" name="id_type" value="protein"/>

                  {this.inputHeader(t)}
                  {this.printInputs(t)}

            <p>Select Taxonomic Set:</p>
            <input type="radio" name="LSet" value="metazoa"/> Metazoa<br/>
            <input type="radio" name="LSet" value="protozoa"/> Protozoa<br/><br/>
            <input type="submit"/>
          </form>
        
        </div>
      );
    }
}


class StringDBForm extends React.Component {

    inputHeader(t)  {
        if(t.length > 1) {
            return <p>Select the Protein:</p>
        }
    }

    printInputs(t)  {
        if(t.length == 1) {
            return (<input type="hidden" name="source_ID" value={t[0].protein_source_id}/>);
        }

        return (
            t.map(p => {
                return (
                    <label key={p.protein_source_id}>
        
                        <input type="radio" name="source_ID" value={p.protein_source_id}/>{p.protein_source_id}<br/></label>
                );
            })
        );
    }

    printOrganismInputs(s,genus_species)  {
      const defaultOrganismEntry = s.find(p => p[1] === genus_species) || s[0];
      return (
        <select name="organism" defaultValue={defaultOrganismEntry[0]}>
          {s.map(p => <option value={p[0]}>{p[1]}</option>)}
        </select>
      );
    }

    render() {
      let {project_id, genus_species } = this.props.record.attributes;  
      let t = this.props.value;
      let s = JSON.parse(t[0].jsonString);
      return (
        <div> 
          <form action="/cgi-bin/string.pl" target="_blank" method="post">
            <input type="hidden" name="project_id" value={projectId}/>
            <input type="hidden" id="id_type" name="id_type" value="protein"/>

                  {this.inputHeader(t)}
                  {this.printInputs(t)}
      
            <p>Please select the organism:<br/><br/>
              {this.printOrganismInputs(s,genus_species)}
            <br/></p>
            <input type="submit"/>
          </form>
        </div>
        );
    }
}

function OrthologsFormContainer(props) {
  const [ preferredOrganismsEnabled ] = usePreferredOrganismsEnabledState();

  const [ preferredOrganisms ] = usePreferredOrganismsState();

  const filteredValue = useMemo(() => {
    if (!preferredOrganismsEnabled) {
      return props.value;
    }

    const preferredOrganismsSet = new Set(preferredOrganisms);

    return props.value.filter(({ organism }) => preferredOrganismsSet.has(organism));
  }, [ props.value, preferredOrganisms, preferredOrganismsEnabled ]);

  return <OrthologsForm {...props} value={filteredValue} />;
}

class OrthologsForm extends SortKeyTable {

  toggleAll(checked) {
    const node = ReactDOM.findDOMNode(this);
    for (const input of node.querySelectorAll('input[name="gene_ids"]')) {
      input.checked = checked;
    }
  }

  render() {
      let { source_id, gene_type } = this.props.record.attributes;

      let is_protein = (gene_type === 'protein coding' || gene_type === 'protein coding gene') ? true : false;
      let not_protein = is_protein ? false : true;

      if ( (this.props.value.length === 0) || not_protein ) {
          return ( <this.props.DefaultComponent {...this.props} value={this.sortValue(this.props.value)}/> ) 
      } else {
        return (
          <form action="/cgi-bin/isolateAlignment" target="_blank" method="post">
            <input type="hidden" name="type" value="geneOrthologs"/>
            <input type="hidden" name="project_id" value={projectId}/>
            <input type="hidden" name="gene_ids" value={source_id}/>

            <this.props.DefaultComponent {...this.props} value={this.sortValue(this.props.value)}/>
            <input type="button" name="CheckAll" value="Check All" onClick={() => this.toggleAll(true)}/>
            <input type="button" name="UnCheckAll" value="Uncheck All" onClick={() => this.toggleAll(false)}/> 
            <br/>
            <p><b>Select sequence type for Clustal Omega multiple sequence alignment:</b></p>
            <p>Please note: selecting a large flanking region or a large number of sequences will take several minutes to align.</p>
            <div id="userOptions" >
             { is_protein && <> <input type="radio" name="sequence_Type" value="protein" defaultChecked={is_protein} /> Protein </> }
             { is_protein && <> <input type="radio" name="sequence_Type" value="CDS" /> CDS (spliced) </> }
              <input type="radio" name="sequence_Type" value="genomic" defaultChecked={not_protein}/> Genomic
              <span className="genomic">
                <input type="number" id="oneOffset" name="oneOffset" placeholder="0" size="4" pattern='[0-9]+' min="0" max="2500"/> nt upstream (max 2500)
                <input type="number" id="twoOffset" name="twoOffset" placeholder="0" size="4" pattern='[0-9]+' min="0" max="2500"/> nt downstream (max 2500)
              </span>
              <p>Output format: &nbsp; 
              <select name='clustalOutFormat'>
                <option value="clu">Mismatches highlighted</option>
                <option value="fasta">FASTA</option>
                <option value="phy">PHYLIP</option>
                <option value="st">STOCKHOLM</option>
                <option value="vie">VIENNA</option>
              </select></p>
              <input type="submit" value="Run Clustal Omega for selected genes"/>
            </div>  
          </form>
        );
    }
  }
}

class TranscriptionSummaryForm extends SortKeyTable {
  render() {
      let { source_id } = this.props.record.attributes;

	var height = 700;
        if (this.props.value.length === 0) {
          return (
            <p><em>No data available</em></p>
          );
        } else {
	  if (((this.props.value.length + 1) * 40) > 700) {
	    height = (this.props.value.length + 1) * 40;
	  } 
	}

        return (
          <div id="transcriptionSummary">
            <ExternalResource>
              <iframe src={"/cgi-bin/dataPlotter.pl?project_id=" + projectId + "&id=" + source_id + "&type=RNASeqTranscriptionSummary&template=1&datasetId=All&wl=0&facet=na&contXAxis=na&fmt=html"} height={height} width="1100" frameBorder="0"></iframe>
            </ExternalResource>
          </div>
        );
  }
}

const UserCommentsTable = addCommentLink(props => props.record.attributes.user_comment_link_url);
