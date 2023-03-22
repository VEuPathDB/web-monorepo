import React from 'react';
import { RadioList, Checkbox, TextBox } from '@veupathdb/wdk-client/lib/Components';
import * as ComponentUtils from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import * as ReporterUtils from '@veupathdb/wdk-client/lib/Views/ReporterForm/reporterUtils';
import SrtHelp from '../SrtHelp';

let util = Object.assign({}, ComponentUtils, ReporterUtils);

export let fastaGenomicSequenceReporterFormFactory = regionDescription => {
  /** @type import('./Types').ReporterFormComponent */
  const FastaGenomicSequenceReporterForm = props => {
    let { formState, updateFormState, onSubmit, includeSubmit } = props;
    let getUpdateHandler = fieldName => util.getChangeHandler(fieldName, updateFormState, formState);

    return (
      <div>
        <h3>Choose the {regionDescription} of the sequence(s):</h3>
        <div style={{margin:"2em"}}>
          <Checkbox name="revComp" value={formState.revComp} onChange={getUpdateHandler('revComp')}/> Reverse & Complement
        </div>
        <div style={{
          margin: '0 2em 2em 2em',
          display: 'inline-grid',
          gridTemplateColumns: 'repeat(5, auto)',
          alignItems: 'center',
          gridGap: '0.5em'
        }}>
          <b>Nucleotide positions:</b>
          <TextBox name="start" value={formState.start} onChange={getUpdateHandler('start')} size="6"/> to
          <TextBox name="end" value={formState.end} onChange={getUpdateHandler('end')} size="6"/> (0 = end)
        </div>
        <h3>Download Type:</h3>
        <div style={{marginLeft:"2em"}}>
          <RadioList name="attachmentType" value={formState.attachmentType} items={util.attachmentTypes}
              onChange={getUpdateHandler('attachmentType')}/>
        </div>
        { includeSubmit &&
          <div style={{margin:'0.8em'}}>
            <button className="btn" type="submit" onClick={onSubmit}>Get Sequences</button>
          </div>
        }
        <div>
          <hr/>
          <h3>Options:</h3>
          <ul>
            <li>
              <i><b>complete sequence</b></i> to retrieve the complete sequence
              for the requested genomic regions, use "Nucleotide positions 1 to 10000"
            </li>
            <li>
              <i><b>specific sequence region</b></i> to retrieve a specific region
              for the requested genomic regions, use "Nucleotide positions
              <i>x</i> to <i>y</i>", where <i>y</i> is greater than <i>x</i>
            </li>
          </ul>
          <hr/>
        </div>
        <SrtHelp/>
      </div>
    );
  };

  FastaGenomicSequenceReporterForm.getInitialState = () => ({
    formState: {
      attachmentType: 'plain',
      revComp: true,
      start: 1,
      end: 0
    },
    formUiState: {}
  });

  return FastaGenomicSequenceReporterForm;
};



export default fastaGenomicSequenceReporterFormFactory('region');
