import React from 'react';
import { connect } from 'react-redux';

function GeneRecordLink(props) {
  const { recordId, geneRecordClass, children } = props;
  const geneId = recordId
    .filter(part => part.name !== 'source_id')
    .map(part => part.name === 'gene_source_id' ? { ...part, name: 'source_id' } : part);
  return <props.DefaultComponent
    recordClass={geneRecordClass}
    recordId={geneId}
  >{children}</props.DefaultComponent>
}

const mapStateToProps = state => ({
  geneRecordClass: state.globalData.recordClasses
    .find(recordClass => recordClass.name === 'GeneRecordClasses.GeneRecordClass')
});

export const RecordLink = connect(mapStateToProps)(GeneRecordLink);
