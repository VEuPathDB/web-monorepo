import React from 'react';
import Autocomplete from 'react-autocomplete';

import {
  Seq,
  first,
  join,
  filter,
  concat,
  map
} from '../../../../Utils/IterableUtils';
import { ListEnumParam, Parameter } from '../../../../Utils/WdkModel';
import enumParamModule from '../EnumParam';
import { Props } from '../Utils';

const valueToArray = (value: string) =>
  value === '' ? [] : value.split(/\s*,\s*/g);

export function isType(parameter: Parameter): parameter is ListEnumParam {
  return (
    enumParamModule.isType(parameter) && (
      parameter.displayType === 'select' ||
      parameter.displayType === 'checkBox' ||
      parameter.displayType === 'typeAhead'
    )
  );
}

type ParamProps = Props<ListEnumParam, void>;

export function ListEnumParam(props: ParamProps) {
  switch(props.parameter.displayType) {
    case 'select': return <SelectEnumParam {...props} />;
    case 'checkBox': return <CheckboxEnumParam {...props}/>;
    case 'typeAhead': return <TypeAheadEnumParam {...props} />;
  }
}

// FIXME Handle better multi vs single
function SelectEnumParam(props: ParamProps) {
  const valueArray = valueToArray(props.value);
  return (
    <select
      multiple={props.parameter.multiPick}
      value={props.parameter.multiPick ? valueArray : props.value}
      onChange={event => {
        const nextValue = Seq.from(event.target.querySelectorAll('option'))
          .filter(option => option.selected)
          .map(option => option.value)
          .join(',');
        props.onParamValueChange(nextValue);
      }}
    >
      {props.parameter.vocabulary.map(entry => (
        <option key={entry[0]} value={entry[0]}>{entry[1]}</option>
      ))}
    </select>
  );
}

function CheckboxEnumParam(props: ParamProps) {
  const { ctx, onParamValueChange, parameter, value } = props;
  const valueSet = new Set(valueToArray(value));
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (parameter.multiPick) {
      const nextValueSet = new Set(valueSet);
      if (event.target.checked) nextValueSet.add(event.target.value);
      else nextValueSet.delete(event.target.value);
      const nextValue = [ ...nextValueSet ].join(',');
      onParamValueChange(nextValue);
    }
    else {
      onParamValueChange(event.target.value);
    }
  };
  const selectAll = () => onParamValueChange(parameter.vocabulary.map(([term]) => term).join(','));
  const clearAll = () => onParamValueChange('');
  const inputType = parameter.multiPick ? 'checkbox' : 'radio';

  return (
    <React.Fragment>
      {parameter.vocabulary.map(([ term, display ]) => {
        const id = `${ctx.questionName}__${parameter.name}__${term}`;
        return (
          <div key={term}>
            <input id={id} type={inputType} onChange={handleChange} checked={valueSet.has(term)} value={term}/> <label htmlFor={id}>{display}</label>
          </div>
        )
      })}
      {parameter.multiPick && (
        <div style={{ marginTop: '.5rem', fontSize: '.65rem' }}>
          <button type="button" onClick={selectAll} className="wdk-Link">select all</button>
          &nbsp;|&nbsp;
          <button type="button" onClick={clearAll} className="wdk-Link">clear all</button>
        </div>
      )}
    </React.Fragment>
  )
}

class TypeAheadEnumParam extends React.Component<ParamProps, { typeAheadValue: string }> {

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
            type: 'text'
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
