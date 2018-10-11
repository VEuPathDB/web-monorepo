import React from 'react';
import { connect } from 'react-redux';
import { get, pick } from 'lodash';
import { FilterParamNew } from 'wdk-client/Components';
import { QuestionActionCreators } from 'wdk-client/ActionCreators';

const headingStyle = {
  fontSize: '1.2em',
  fontWeight: 500,
  margin: '2rem 0 1rem'
}

const enhance = connect(
  ({ question, globalData }) =>
    Object.assign({
      questionState: get(question, ['questions', 'SnpAlignmentForm'], {})
    }, pick(globalData.config, 'projectId'))
);

export const SnpsAlignmentForm = enhance(function SnpsAlignmentForm(props) {
  let { dispatch, start, end, sequenceId, organism, projectId,
    questionState: { questionStatus, question, paramValues, paramUIState }
  } = props;

  if (questionStatus != 'complete') return null;

  let questionName = question.urlSegment;
  let parameter = question.parametersByName.ngsSnp_strain_meta;
  let uiState = paramUIState.ngsSnp_strain_meta;
  let value = paramValues.ngsSnp_strain_meta;

  return (
    <div>
      <form action="/cgi-bin/isolateClustalw" method="post" target="_blank" autoComplete="off" >
        <input name="project_id" value={projectId} type="hidden"/>
        <input name="sid" value={sequenceId} type="hidden"/>

	<div style={headingStyle}>Genomic region:</div>
	<label>Default positions are the start and end of the gene. These can be changed +/- 10,000.</label><br/>
        <label>Start position: <input name="start" defaultValue={start} type="number" min={start-10000} max={parseFloat(start)+10000}/>&nbsp;&nbsp;
        End position: <input name="end" defaultValue={end} type="number" min={end-10000} max={parseFloat(end)+10000}/></label>


        <input name="organism" value={organism} type="hidden"/>
        <input name="filter_param_value" type="hidden" value={value}/>

        <div style={headingStyle}>Select output options:</div>
        <div className="form-radio"><label><input name="type" type="radio" value="htsSnp" defaultChecked={true} /> Show Alignment</label></div>
        <div className="form-radio"><label><input name="type" type="radio" value="fasta" /> Multi-FASTA</label></div>
        <div className="form-radio" style={{ marginTop: '1rem' }}>
          <input name="metadata" value="1" type="checkbox" /> Include metadata in the output
        </div>

        <div style={headingStyle}>Select strains:</div>

        <FilterParamNew
          ctx={{ questionName, parameter, paramValues }}
          parameter={parameter}
          value={value}
          uiState={uiState}
          dispatch={dispatch}
          onParamValueChange={value => {
            dispatch(QuestionActionCreators.ParamValueUpdatedAction.create({
              questionName,
              parameter,
              dependentParameters: [],
              paramValues,
              paramValue: value
            }))
          }}
        />
        <button style={{display: 'block', margin: '2rem auto',}} type="submit" className="btn">View Results</button>
      </form>
    </div>
  )
});
