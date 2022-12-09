import { STANDARD_REPORTER_NAME } from '@veupathdb/wdk-client/lib/Views/ReporterForm/reporterUtils';
import WdkServiceJsonReporterForm from '@veupathdb/wdk-client/lib/Views/ReporterForm/WdkServiceJsonReporterForm';

// load individual reporter forms
import TabularReporterForm from '../components/reporters/TabularReporterForm';
import TextReporterForm from '../components/reporters/TextReporterForm';
import XmlReporterForm from '../components/reporters/XmlReporterForm';
import JsonReporterForm from '../components/reporters/JsonReporterForm';
import Gff3ReporterForm from '../components/reporters/Gff3ReporterForm';
import FastaGeneReporterForm from '../components/reporters/FastaGeneReporterForm';
import SequenceGeneReporterForm from '../components/reporters/SequenceGeneReporterForm';
import SequenceSimpleReporterForm from '../components/reporters/SequenceSimpleReporterForm';
import SequenceDynSpanReporterForm from '../components/reporters/SequenceDynSpanReporterForm';
import SequenceGenomicSequenceReporterForm from '../components/reporters/SequenceGenomicSequenceReporterForm';
import SequenceSequenceReporterForm from '../components/reporters/SequenceSequenceReporterForm';
import FastaGenomicSequenceReporterForm from '../components/reporters/FastaGenomicSequenceReporterForm';
import FastaOrthoSequenceReporterForm from '../components/reporters/FastaOrthoSequenceReporterForm';
import TableReporterForm from '../components/reporters/TableReporterForm';
import TranscriptTableReporterForm from '../components/reporters/TranscriptTableReporterForm';
import TranscriptAttributesReporterForm from '../components/reporters/TranscriptAttributesReporterForm';

let EmptyReporter = props => ( null );

EmptyReporter.getInitialState = () => ({ formState: null, formUiState: null });

export function selectReporterComponent(reporterName, recordClassFullName) {
  switch (reporterName) {
    case 'attributesTabular':
      switch (recordClassFullName) {
        case 'TranscriptRecordClasses.TranscriptRecordClass':
          return TranscriptAttributesReporterForm;
        default:
          return TabularReporterForm;
      }
    case 'tableTabular':
      switch (recordClassFullName) {
        case 'TranscriptRecordClasses.TranscriptRecordClass':
          return TranscriptTableReporterForm;
        default:
          return TableReporterForm;
      }
    case 'tabular':
      return TabularReporterForm;
    case 'srt':
      switch (recordClassFullName) {
        // both gene and transcript use the same reporter
        case 'GeneRecordClasses.GeneRecordClass':
        case 'TranscriptRecordClasses.TranscriptRecordClass':
          return FastaGeneReporterForm;
        case 'SequenceRecordClasses.SequenceRecordClass':
          return FastaGenomicSequenceReporterForm;
        default:
          console.error("Unsupported FASTA recordClass: " + recordClassFullName);
          return EmptyReporter;
      }
    case 'bed':
    case 'sequence':
      switch (recordClassFullName) {
        // both gene and transcript use the same reporter
        case 'GeneRecordClasses.GeneRecordClass':
        case 'TranscriptRecordClasses.TranscriptRecordClass':
          return SequenceGeneReporterForm;
        case 'SequenceRecordClasses.SequenceRecordClass':
          return SequenceGenomicSequenceReporterForm;
        case 'DynSpanRecordClasses.DynSpanRecordClass':
        case 'PopsetRecordClasses.PopsetRecordClass':
        case 'EstRecordClasses.EstRecordClass':
          return SequenceSimpleReporterForm;
        default:
          console.error("Unsupported BED recordClass: " + recordClassFullName);
          return EmptyReporter;
      }
    case 'fasta':
      return FastaOrthoSequenceReporterForm;
    case 'gff3':
      return Gff3ReporterForm;
    case 'fullRecord':
      return TextReporterForm;
    case 'xml':
      return XmlReporterForm;
    case 'json':
      return JsonReporterForm;
    case STANDARD_REPORTER_NAME:
      return WdkServiceJsonReporterForm;
    default:
      return EmptyReporter;
  }
}
