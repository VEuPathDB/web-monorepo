import React, {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';

import Select, { ActionMeta, Styles, ValueType, mergeStyles } from 'react-select';

import { IconAlt } from '@veupathdb/wdk-client/lib/Components';
import { Task } from '@veupathdb/wdk-client/lib/Utils/Task';

export interface ExportOption<T extends string, S, E> {
  label: React.ReactNode;
  value: T;
  onSelectionTask: Task<S, E>;
  onSelectionFulfillment?: (selection: S) => void;
  onSelectionError?: (error: E) => void;
  isDisabled?: boolean;
}

export interface Props<T extends string, S, E> {
  isDisabled?: boolean;
  options: ExportOption<T, S, E>[];
  styleOverrides: Partial<Styles<ExportOption<T, S, E>, false>>;
}

export function ResultExportSelector<T extends string, S, E>({
  isDisabled = false,
  options,
  styleOverrides
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
        selection => {
          setSelectedOption(undefined);
          selectedOption?.onSelectionFulfillment?.(selection);
        },
        error => {
          setSelectedOption(undefined);
          selectedOption?.onSelectionError?.(error);
        }
      );
  }, [selectedOption]);

  const styles = useStyles(styleOverrides);

  return (
    <Select
      styles={styles}
      options={options}
      value={null}
      onChange={onChange}
      placeholder={
        <>
          <IconAlt fa="arrow-up fa-rotate-90" className="button" />
          {' '}
          <span style={{ marginLeft: '0.5em' }}>
            Send to...
          </span>
        </>
      }
      isDisabled={
        isDisabled ||
        Boolean(selectedOption)
      }
      controlShouldRenderValue={false}
      isSearchable={false}
    />
  );
}

function useStyles<T extends string, S, E>(
  styleOverrides: Partial<Styles<ExportOption<T, S, E>, false>>
) {
  const defaultStyles = useMemo((): Partial<Styles<ExportOption<T, S, E>, false>> => ({
    container: (baseStyles) => ({
      ...baseStyles,
      margin: '0 calc(1em + 5px)',
    }),
    placeholder: (baseStyles, placeholderProps) => ({
      ...baseStyles,
      '> i': {
        fontSize: '1.2em',
        marginRight: '2px',
      },
      ...(
        !placeholderProps.isDisabled
          ? {
              color: '#3e3e3e',
              '> i': {
                color: '#3e3e3e',
              },
            }
          : {}
      ),
    }),
    control: (baseStyles, controlProps) => ({
      ...baseStyles,
      minHeight: '33.5px',
      height: '33.5px',
      width: '10.5em',
      ...(
        !controlProps.isDisabled
          ? {
              backgroundColor: '#f5f5f7',
              border: '0.5px solid rgba(0, 0, 0, 0.1)',
              borderBottom: '3px solid #999',
              borderRadius: '6px',
              cursor: 'pointer',
              marginTop: '4px',
              '&:hover': {
                backgroundColor: '#f0f0f2',
                transform: 'scale(0.98)',
                WebkitTransform: 'scale(0.98)',
                boxShadow: '0 2px 5px rgb(0 0 0 / 5%)',
              }
            }
          : {
              cursor: 'not-allowed',
              borderWidth: '0.5px 0.5px 3px 0.5px',
            }
      ),
    }),
    indicatorSeparator: (baseStyles) => ({
      ...baseStyles,
      display: 'none',
    }),
    dropdownIndicator: (baseStyles, dropdownIndicatorProps) => ({
      ...baseStyles,
      padding: '0 8px',
      ...(
        !dropdownIndicatorProps.isDisabled
          ? {
              color: '#3e3e3e',
            }
          : {}
      )
    }),
    menu: (baseStyles) => ({
      ...baseStyles,
      width: '15em',
    }),
  }), []);

  return useMemo(
    () => mergeStyles(
      defaultStyles,
      styleOverrides
    ),
    [defaultStyles, styleOverrides]
  );
}
