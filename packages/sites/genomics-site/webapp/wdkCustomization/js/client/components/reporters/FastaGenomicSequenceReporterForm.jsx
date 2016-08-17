import * as Wdk from 'wdk-client';
import SrtHelp from '../common/SrtHelp';

let util = Object.assign({}, Wdk.ComponentUtils, Wdk.ReporterUtils);
let { RadioList, Checkbox, TextBox } = Wdk.Components;

let FastaGenomicSequenceReporterForm = props => {

  let { formState, updateFormState, onSubmit } = props;
  let getUpdateHandler = fieldName => util.getChangeHandler(fieldName, updateFormState, formState);

  return (
    <div>
      <h3>Choose the region of the sequence(s):</h3>
      <div style={{margin:"2em"}}>
        <Checkbox value={formState.revComp} onChange={getUpdateHandler('revComp')}/> Reverse & Complement
      </div>
      <div style={{margin:"2em"}}>
        <b>Nucleotide positions:</b>
        <TextBox value={formState.start} onChange={getUpdateHandler('start')} size="6"/> to
        <TextBox value={formState.end} onChange={getUpdateHandler('end')} size="6"/> (0 = end)
      </div>
      <hr/>
      <h3>Download Type:</h3>
      <div style={{marginLeft:"2em"}}>
        <RadioList value={formState.attachmentType} items={util.attachmentTypes}
            onChange={getUpdateHandler('attachmentType')}/>
      </div>
      <div style={{margin:'0.8em'}}>
        <input type="submit" value="Get Sequences" onClick={onSubmit}/>
      </div>
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
            for the requested genomic regions, use "Nucleotide positions "
            <i>x</i> to <i>y</i>, where <i>y</i> is greater than <i>x</i>
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

export default FastaGenomicSequenceReporterForm;
