import React from 'react';
import Autocomplete from 'react-autocomplete';
import {
  first,
  join,
  filter,
  concat,
  map
} from 'wdk-client/Utils/IterableUtils';
import { TypeAheadEnumParam, Parameter } from 'wdk-client/Utils/WdkModel';
import { Props, createParamModule } from 'wdk-client/Views/Question/Params/Utils';
import { isEnumParam, valueToArray } from 'wdk-client/Views/Question/Params/EnumParamUtils';

function isType(parameter: Parameter): parameter is TypeAheadEnumParam {
  return isEnumParam(parameter) && parameter.displayType === 'typeAhead';
}

function isParamValueValid() {
  return true;
}

class TypeAheadEnumParamComponent extends React.Component<Props<TypeAheadEnumParam>, { typeAheadValue: string }> {

  state = {
    typeAheadValue: ''
  }

  render() {
    const { typeAheadValue} = this.state;
    const { parameter, value, onParamValueChange } = this.props;
    const valueSet = new Set(valueToArray(value));
    const displayNameMap = new Map<string, string>(parameter.vocabulary.map(([term, display]) => [term, display] as [string, string]));
    const removeTerm = (term: string) =>
      onParamValueChange(join(',', filter(value => value !== term, valueSet)));
    return (
      <div>
        {Array.from(map(term =>
          <div key={term}>
            {displayNameMap.get(term)} <button type="button" onClick={() => removeTerm(term)}>X</button>
          </div>,
          valueSet
        ))}
        <Autocomplete
          inputProps={{
            type: 'text',
            required: !parameter.allowEmptyValue
          }}
          getItemValue={first}
          items={parameter.vocabulary}
          menuStyle={{
            border: '1px solid #ccc',
            borderRadius: '3px',
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
            background: 'rgba(255, 255, 255, 0.9)',
            padding: '2px 0',
            fontSize: '90%',
            position: 'fixed',
            overflow: 'auto',
            maxHeight: '50%',
          }}
          renderItem={([term, display], isHighlighted) =>
            <div key={term} style={{ background: isHighlighted ? 'lightskyblue' : 'white', padding: '.5em' }}>
              {display}
            </div>
          }
          renderMenu={function(this: Autocomplete.Props, items, value, style) {
            // for browsers that support calc and vh, override the default height
            const top = typeof style.top === 'number' ? `${style.top}px`
                      : style.top || '0px';
            const maxHeight = `calc(100vh - ${top} - 25px)`;
            const children = value.length >= 3
              ? items
              : <div style={{ padding: '.5em' }}><em>Please enter 3 or more characters</em></div>;

            return (
              <div style={{...style, ...this.menuStyle, maxHeight}}>
                {children}
              </div>
            );
          }}
          value={typeAheadValue}
          onSelect={typeAheadValue => {
            if (parameter.multiPick && valueSet.size > 0) onParamValueChange(join(',', concat(valueSet, [typeAheadValue])));
            else onParamValueChange(typeAheadValue);
            // this.setState({ typeAheadValue: '' });
          }}
          onChange={(event, typeAheadValue) => {
            this.setState({ typeAheadValue });
          }}
          shouldItemRender={([term, display], value) =>
            !valueSet.has(term) && (term.includes(value) || display.includes(value))
          }
        />
      </div>
    );
  }
}

export default createParamModule({
  isType,
  isParamValueValid,
  Component: TypeAheadEnumParamComponent
});
