import { FormEvent, ReactNode } from 'react';
import { uniqueId } from 'lodash';

export enum LinksPosition {
  None,
  Top = 1 << 1,
  Bottom = 1 << 2,
  Both = Top | Bottom
}

type Item = {
  display: ReactNode
  value: any
}

type Props = {
  name?: string
  items: Item[]
  value: string[]
  onChange: (value: string[]) => void,
  linksPosition?: LinksPosition;
}

export default function CheckboxList({
    name,
    items,
    value,
    onChange,
    linksPosition = LinksPosition.Bottom
}: Props) {

  const onChangeHandler = (e: FormEvent<HTMLInputElement>) => {
    const valueChanged = e.currentTarget.value;
    const availableSelections = items.map(item => item.value);
    onChange(
      value.indexOf(valueChanged) == -1 ?
        value.concat(valueChanged).sort((a,b) => availableSelections.indexOf(a) - availableSelections.indexOf(b)) :
        value.filter(elem => elem != valueChanged)
    );
  };

  const onSelectAll = (e: React.MouseEvent<HTMLButtonElement>) => {
    onChange(items.map(item => item.value));
    e.preventDefault();
  };
  
  const onClearAll = (e: React.MouseEvent<HTMLButtonElement>) => {
    onChange([]);
    e.preventDefault();
  };

  let links = (
    <div>
      <button type="button" className="wdk-Link" onClick={e => onSelectAll(e)}>select all</button>
      {' | '}
      <button type="button" className="wdk-Link" onClick={e => onClearAll(e)}>clear all</button>
    </div>
  );
  return (
    <div>
      {linksPosition & LinksPosition.Top ? links : null}
      <div>
        {items.map(item => {
          // let id = `${uniqueId()}.${item.value}`;
          return (
            <div key={item.value}>
              <label>
                <input
                  // id={id}
                  type="checkbox"
                  name={name}
                  value={item.value}
                  checked={value.includes(item.value)}
                  onChange={e => onChangeHandler(e)}
                />
                {' '}{item.display}
              </label>
            </div>
          );
        })}
      </div>
      {linksPosition & LinksPosition.Bottom ? links : null}
    </div>
  );
}
