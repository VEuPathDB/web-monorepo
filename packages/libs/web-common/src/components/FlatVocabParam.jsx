import React from 'react';
import { paramPropTypes } from '../util/paramUtil';

import { isMultiPick } from '@veupathdb/wdk-client/lib/Views/Question/Params/EnumParamUtils';

/**
 * FlatVocabParam component. Currently only supports single select.
 * FIXME Handle all param options.
 */
export default function FlatVocabParam(props) {
  return (
    <select
      onChange={event => props.onParamValueChange(props.param, event.target.value)}
      value={props.value}
      multiple={isMultiPick(props.param)}
    >
      {props.uiState.vocabulary.map(entry => (
        <option key={entry[0]} value={entry[0]}>{entry[1]}</option>
      ))}
    </select>
  )
}

FlatVocabParam.propTypes = paramPropTypes;
