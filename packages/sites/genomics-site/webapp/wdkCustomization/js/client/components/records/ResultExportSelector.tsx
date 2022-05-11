import React, { useCallback, useMemo } from 'react';

import Select, { ActionMeta, Styles, ValueType } from 'react-select';

import { IconAlt } from '@veupathdb/wdk-client/lib/Components';

export interface ExportOption<T extends string> {
  label: React.ReactNode;
  value: T;
  onSelect: () => void;
}

export interface Props<T extends string> {
  isDisabled?: boolean;
  options: ExportOption<T>[];
}

export function ResultExportSelector<T extends string>({
  isDisabled = false,
  options,
}: Props<T>) {
  const onChange = useCallback((
    option: ValueType<ExportOption<T>, false>,
    { action }: ActionMeta<ExportOption<T>>
  ) => {
    if (
      option != null &&
      action === 'select-option'
    ) {
      option.onSelect();
    }
  }, []);

  const styles = useMemo((): Partial<Styles<ExportOption<T>, false>> => ({
    container: (baseStyles) => ({
      ...baseStyles,
      width: '20em',
      marginLeft: '3em',
      borderBottom: '2px bottom #999',
    }),
    placeholder: (baseStyles, placeholderProps) => ({
      ...baseStyles,
      ...(
        !placeholderProps.isDisabled
          ? { color: 'black' }
          : {}
      ),
    }),
    control: (baseStyles, controlProps) => ({
      ...baseStyles,
      minHeight: '35px',
      height: '35px',
      ...(
        !controlProps.isDisabled
          ? { borderBottom: '2px solid #999' }
          : {}
      ),
    }),
    dropdownIndicator: (baseStyles) => ({
      ...baseStyles,
      padding: '0 8px',
    }),
  }), []);

  return (
    <Select
      styles={styles}
      options={options}
      value={null}
      onChange={onChange}
      placeholder={
        <>
          <IconAlt fa="upload" className="button" />
          {' '}
          <span style={{ marginLeft: '0.5em' }}>
            Send to...
          </span>
        </>
      }
      isDisabled={isDisabled}
      controlShouldRenderValue={false}
      isSearchable={false}
    />
  );
}
