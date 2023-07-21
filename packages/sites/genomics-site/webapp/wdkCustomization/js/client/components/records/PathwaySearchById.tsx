import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Select from 'react-select';
import { ActionMeta, InputActionMeta, ValueType } from 'react-select/src/types';
import { Option } from 'react-select/src/filters';

import { Core } from 'cytoscape';
import { isEqual, orderBy, uniqWith } from 'lodash';

import { HelpIcon } from '@veupathdb/wdk-client/lib/Components';
import { safeHtml } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { stripHTML } from '@veupathdb/wdk-client/lib/Utils/DomUtils';

import { NodeSearchCriteria } from './pathway-utils';

interface Props {
  cy: Core;
  helpText?: JSX.Element;
  onSearchCriteriaChange: (
    searchCriteria: NodeSearchCriteria | undefined
  ) => void;
}

interface NodeOptionDatum {
  name: string | undefined;
  node_identifier: string | undefined;
}

export function PathwaySearchById({
  cy,
  helpText,
  onSearchCriteriaChange,
}: Props) {
  const [searchTerm, setSearchTerm] = useState('');

  const options = useMemo(() => {
    const nodes = cy.nodes();

    const identifiableNodes = nodes
      .toArray()
      .filter(
        (node) =>
          node.data('node_identifier') != null || node.data('name') != null
      );

    const nodeOptionData: NodeOptionDatum[] = identifiableNodes.map((node) => ({
      name:
        typeof node.data('name') === 'string' ? node.data('name') : undefined,
      node_identifier:
        typeof node.data('node_identifier') === 'string'
          ? node.data('node_identifier')
          : undefined,
    }));

    const uniqueNodeOptionData = uniqWith(nodeOptionData, isEqual);

    const uniqueNodeOptions = uniqueNodeOptionData.map(
      ({ node_identifier, name }) => ({
        value: makeOptionValue(node_identifier, name),
        label:
          name != null && node_identifier != null
            ? `${node_identifier} (${name})`
            : node_identifier ?? name ?? '',
        data: null,
      })
    );

    return orderBy(uniqueNodeOptions, (nodeOption) => nodeOption.label);
  }, [cy]);

  const fullOptions = useMemo(
    () =>
      searchTerm.length > 0
        ? [
            {
              label: `Free-text search for "${searchTerm}"`,
              value: makeOptionValue(searchTerm, searchTerm),
              data: 'free-text',
            },
            ...options,
          ]
        : options,
    [options, searchTerm]
  );

  const [selection, setSelection] = useState([] as Option[]);

  useEffect(() => {
    setSearchTerm('');
    setSelection([]);
  }, [cy]);

  const onChange = useCallback((newSelection: unknown) => {
    const newSelectionArray =
      newSelection == null
        ? []
        : Array.isArray(newSelection)
        ? (newSelection as Option[])
        : [newSelection as Option];

    setSelection(newSelectionArray);
    setSearchTerm('');
  }, []);

  const onInputChange = useCallback(
    (inputValue: string, { action }: InputActionMeta) => {
      if (action === 'input-change') {
        setSearchTerm(inputValue);
      }
    },
    []
  );

  const filterOption = useCallback((option: Option, newSearchTerm: string) => {
    const normalizedInputValue = newSearchTerm.toLowerCase();

    const normalizedOptionValue = stripHTML(option.value).toLowerCase();

    return normalizedOptionValue.includes(normalizedInputValue);
  }, []);

  const noOptionsMessage = useCallback(
    () => 'No names or identifiers match your search term',
    []
  );

  const formatOptionLabel = useCallback(
    (option: Option) => safeHtml(option.label),
    []
  );

  useEffect(() => {
    if (selection.length === 0) {
      onSearchCriteriaChange(undefined);
    } else {
      const newSearchCriteria = selection.map((item) => {
        const operator = item.data === 'free-text' ? '@*=' : '=';

        const { node_identifier, name } = parseOptionValue(item.value);

        const nodeIdentifierSelector =
          node_identifier.length === 0
            ? ''
            : `[node_identifier ${operator} '${node_identifier}']`;

        const nameSelector =
          name.length === 0 ? '' : `[name ${operator} '${name}']`;

        if (item.data === 'free-text') {
          return [nodeIdentifierSelector, nameSelector]
            .filter((selector) => selector.length > 0)
            .map((selector) => `node${selector}`)
            .join(', ');
        } else {
          return `node${nodeIdentifierSelector}${nameSelector}`;
        }
      });

      onSearchCriteriaChange(newSearchCriteria.join(', '));
    }
  }, [selection]);

  return (
    <div className="veupathdb-PathwaySearchById">
      <Select
        isMulti
        isClearable
        isSearchable
        components={{
          DropdownIndicator: null,
        }}
        options={fullOptions}
        filterOption={filterOption}
        noOptionsMessage={noOptionsMessage}
        value={selection}
        onChange={onChange}
        inputValue={searchTerm}
        onInputChange={onInputChange}
        placeholder="Search all nodes"
        formatOptionLabel={formatOptionLabel}
        styles={{
          container: (base) => ({
            ...base,
            zIndex: 99,
            flex: 'auto',
            paddingRight: '0.25em',
          }),
        }}
      />
      {helpText && <HelpIcon>{helpText}</HelpIcon>}
    </div>
  );
}

function makeOptionValue(
  node_identifier: string | undefined = '',
  name: string | undefined = ''
) {
  return `${node_identifier}\0${name}`;
}

function parseOptionValue(value: string) {
  const [node_identifier = '', name = ''] = value.split('\0');

  return {
    node_identifier,
    name,
  };
}
