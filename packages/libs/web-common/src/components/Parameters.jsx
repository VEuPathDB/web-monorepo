import React from 'react';
import { HelpIcon } from 'wdk-client/Components';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';
import Param from './Param';
import { makeQuestionWizardClassName as makeClassName } from '../util/classNames';
import { paramGroupPropTypes } from '../util/paramUtil';

/**
 * Parameters that belong to a Paramter group
 */
function Parameters(props) {
  const {
    parameters,
    paramValues,
    paramUIState,
    eventHandlers
  } = props;
  const showLabel = parameters.length > 1;
  return (
    <div className={makeClassName('ParamContainer')}>
      {parameters.map(param => {
        return (
          <div key={param.name} className={makeClassName('Param', param.type)}>
            {showLabel && (
              <div className={makeClassName('ParamLabel', param.type)}>
                <label>{param.displayName}</label>
              </div>
            )}
            {showLabel && (
              <div className={makeClassName('ParamHelp', param.type)}>
                <HelpIcon>
                  {param.help}
                </HelpIcon>
              </div>
            )}
            <div
              className={makeClassName('ParamControl', param.type)}
              onKeyPress={event => {
                // Prevent form submission of ENTER is pressed while an input
                // field has focus. This is a hack and may bite us in the future
                // if we have param widgets that depend on the user agent's
                // default handling of the event.
                //
                // FIXME Handle this in a more robust manner.
                // The reason we do it this way is that the question wizard is
                // embedded inside of the classic WDK question form, which may
                // or may not use an inline submit handler, depending on the
                // context. The question wizard needs more control over the form
                // element in order to do the following in a more robust manner.
                if (event.target instanceof HTMLInputElement && event.key === 'Enter') {
                  event.preventDefault();
                }
              }}
            >
              <Param
                param={param}
                value={paramValues[param.name]}
                uiState={paramUIState[param.name]}
                {...eventHandlers}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

Parameters.propTypes = paramGroupPropTypes;

export default wrappable(Parameters);
