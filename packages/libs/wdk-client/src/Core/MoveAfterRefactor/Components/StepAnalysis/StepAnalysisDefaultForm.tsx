import React, { Fragment, ReactNode } from 'react';
import { StepAnalysisParameter } from '../../../../Utils/StepAnalysisUtils';
import { ParamComponent } from '../../../../Views/Question/Params';
import { join, mapValues, split } from 'lodash/fp';
import { HelpIcon } from '../../../../Components';

interface StepAnalysisDefaultFormProps {
  paramSpecs: StepAnalysisParameter[];
  paramValues: Record<string, string[]>;
  updateParamValues: (newParamValues: Record<string, string[]>) => void;
  onFormSubmit: () => void;
}

export const StepAnalysisDefaultForm: React.SFC<StepAnalysisDefaultFormProps> = ({
  paramSpecs,
  paramValues,
  updateParamValues,
  onFormSubmit
}) => (
  <table style={tableStyle}>
    <tbody>
      {
        paramSpecs
          .filter(({ isVisible }) => isVisible)
          .map(paramSpec => 
            <StepAnalysisParamRow 
              key={paramSpec.name} 
              displayName={<ParamDisplayName paramSpec={paramSpec} />}
              paramValues={paramValues} 
              paramSpec={paramSpec} 
              onChange={value => {
                updateParamValues({
                  ...paramValues,
                  [paramSpec.name]: denormalizeParamValue(value)
                });
              }}
            />
          )
      }
      <tr>
        <td colSpan={2} style={submitTdStyle}>
          <input onClick={onFormSubmit} type="submit" value="Submit" />
        </td>
      </tr>
    </tbody>
  </table>
)

interface StepAnalysisRowProps {
  displayName: ReactNode;
  paramValues: Record<string, string[]>;
  paramSpec: StepAnalysisParameter;
  onChange: (newValue: string) => void;
}

const StepAnalysisParamRow: React.SFC<StepAnalysisRowProps> = ({
  displayName,
  paramValues,
  paramSpec,
  onChange
}) =>
  <tr>
    <td style={fieldTdStyle}>
      <label>
        <span style={labelSpanStyle}>{displayName}</span>
        {
          paramSpec.help &&
          <HelpIcon tooltipPosition={tooltipPosition}>{paramSpec.help}</HelpIcon> 
        }
      </label>    
    </td>
    <td>
      <ParamComponent
        key={paramSpec.name}  
        ctx={{
          questionName: '',
          parameter: paramSpec,
          paramValues: normalizeParamValues(paramValues)
        }}
        parameter={paramSpec}
        value={(paramValues[paramSpec.name] || []).join(',')}
        uiState={uiState}
        dispatch={NOOP}
        onParamValueChange={onChange}
      />
    </td>
  </tr>

interface ParamDisplayNameProps {
  paramSpec: StepAnalysisParameter;
}

const ParamDisplayName: React.SFC<ParamDisplayNameProps> = ({
  paramSpec
}) => (
  <Fragment>
    {paramSpec.displayName}
    {
      paramSpec.type === 'NumberParam' &&
      <span style={numberParamRangeSpanStyle}>({paramSpec.min} - {paramSpec.max})</span>
    }
  </Fragment>
);

const uiState = {};
const NOOP = () => {};

const normalizeParamValues = (paramValues: Record<string, string[]>) => mapValues(join(','), paramValues);
const denormalizeParamValue = split(/\s*,\s*/g);

const tooltipPosition = { 
  my: 'top center', 
  at: 'bottom center'
};

const tableStyle: React.CSSProperties = {
  margin: '0px auto'
};

const fieldTdStyle: React.CSSProperties = {
  textAlign: 'left',
  verticalAlign: 'top'
};

const labelSpanStyle: React.CSSProperties = {
  display: 'inline-block',
  marginTop: '4px',
  fontWeight: 'bold',
  paddingRight: '.5em'
};

const submitTdStyle: React.CSSProperties = {
  textAlign: 'center'
};

const numberParamRangeSpanStyle: React.CSSProperties = {
  color: 'blue',
  fontSize: '0.95em',
  fontFamily: 'monospace'
};
