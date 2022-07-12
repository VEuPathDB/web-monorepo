import { FormEvent, ReactNode } from 'react';
import { uniqueId } from 'lodash';

enum LinksPosition {
  None,
  Top = 1 << 1,
  Bottom = 1 << 2,
  Both = Top | Bottom
}

type Item = {
  display: ReactNode
  value: string
}

export type CheckboxListProps = {
  /** Optional name attribute for the native input element */
  name?: string;

  /** The items available for selection in the checkbox list */
  items: Item[];

  /** An array of item values currently selected */
  value: string[];

  onChange: (e: FormEvent<HTMLInputElement>) => void;
  onSelectAll: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onClearAll: (e: React.MouseEvent<HTMLButtonElement>) => void;
  
  /**  Controls location of the "select all" and "clear all" buttons */
  linksPosition?: LinksPosition;
}

export default function CheckboxList({
    name,
    items,
    value,
    onChange,
    onSelectAll,
    onClearAll,
    linksPosition = LinksPosition.Bottom
}: CheckboxListProps) {

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
                  onChange={e => onChange(e)}
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
