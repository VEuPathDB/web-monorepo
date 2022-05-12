import React, { useCallback, useEffect, useMemo, useState } from 'react';

import Select, { ActionMeta, Styles, ValueType } from 'react-select';

import { IconAlt } from '@veupathdb/wdk-client/lib/Components';
import { Task } from '@veupathdb/wdk-client/lib/Utils/Task';

export interface ExportOption<T extends string, S, E> {
  label: React.ReactNode;
  value: T;
  onSelectionTask: Task<S, E>;
  onSelectionFulfillment?: (selection: S) => void;
  onSelectionError?: (error: E) => void;
}

export interface Props<T extends string, S, E> {
  isDisabled?: boolean;
  options: ExportOption<T, S, E>[];
}

export function ResultExportSelector<T extends string, S, E>({
  isDisabled = false,
  options,
}: Props<T, S, E>) {
  const [ selectedOption, setSelectedOption ] = useState<ExportOption<T, S, E>>();

  const onChange = useCallback((
    option: ValueType<ExportOption<T, S, E>, false>,
    { action }: ActionMeta<ExportOption<T, S, E>>
  ) => {
    if (
      option != null &&
      action === 'select-option'
    ) {
      setSelectedOption(option);
    }
  }, []);

  useEffect(() => {
    return selectedOption
      ?.onSelectionTask
      .run(
        selectedOption.onSelectionFulfillment,
        selectedOption.onSelectionError
      );
  }, [selectedOption]);

  const styles = useMemo((): Partial<Styles<ExportOption<T, S, E>, false>> => ({
    container: (baseStyles) => ({
      ...baseStyles,
      width: '13em',
      marginLeft: '3em',
      borderBottom: '2px bottom #999',
    }),
    placeholder: (baseStyles, placeholderProps) => ({
      ...baseStyles,
      ...(
        !placeholderProps.isDisabled
          ? { color: 'black', }
          : {}
      ),
    }),
    control: (baseStyles, controlProps) => ({
      ...baseStyles,
      minHeight: '35px',
      height: '35px',
      ...(
        !controlProps.isDisabled
          ? { borderBottom: '2px solid #999', }
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
