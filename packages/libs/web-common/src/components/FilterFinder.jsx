import { keyBy } from 'lodash';
import PropTypes from 'prop-types';
import React, { useMemo, useState } from 'react';
import Select from 'react-select';
import { isMulti } from '@veupathdb/wdk-client/lib/Components/AttributeFilter/AttributeFilterUtils';
import { getOntologyTree } from '@veupathdb/wdk-client/lib/Views/Question/Params/FilterParamNew/FilterParamUtils';
import { getLeaves } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import { parseSearchQueryString, areTermsInString } from '@veupathdb/wdk-client/lib/Utils/SearchUtils';

const cx = (suffix = '') => `ebrc-QuestionWizardFilterFinder${suffix}`;

const styles = {
  control: base => ({
    ...base,
    borderColor: 'hsl(0, 0%, 50%)',
    minHeight: 'auto'
  }),
  menuList: base => ({
    ...base,
    maxHeight: '60vh'
  }),
  indicatorsContainer: base => ({
    ...base,
    display: 'none'
  }),
  placeholder: base => ({
    ...base,
    display: 'flex',
    left: '.5em',
    right: '.5em',
    justifyContent: 'space-between'
  })
}

export default function FilterFinder({question, onSelectGroup, onSelectFilterParamField}){
  const [ inputValue, setInputValue ] = useState('');
  const options = useMemo(() => makeOptions(question), [question]);
  return (
    <Select
      className={cx()}
      controlShouldRenderValue={false}
      placeholder={<React.Fragment>Find a variable <i className="fa fa-search"/></React.Fragment>}
      options={options}
      noOptionsMessage={noOptionsMessage}
      formatGroupLabel={formatGroupLabel}
      formatOptionLabel={formatOptionLabel}
      inputValue={inputValue}
      filterOption={selectFilter}
      onChange={handleChange}
      onInputChange={handleInputChange}
      styles={styles}
    />
  );

  function handleChange(option, { action }) {
    if (action !== 'select-option') return;
    const { groupIx, parameter, ontologyItem } = option;
    onSelectFilterParamField(groupIx, parameter, ontologyItem);
  }

  function handleInputChange(value, { action }) {
    if (action === 'input-change') setInputValue(value);
  }
}
FilterFinder.propTypes = {
  question: PropTypes.object.isRequired,
  onSelectGroup: PropTypes.func.isRequired,
  onSelectFilterParamField: PropTypes.func.isRequired
}
function findPath(ontologyItemsByTerm, ontologyTerm) {
  const path = [];
  const ontologyItem = ontologyItemsByTerm[ontologyTerm];
  if(!ontologyItem){
    return null;
  }
  let parent = ontologyItem.parent;
  while (parent != null) {
    const parentItem = ontologyItemsByTerm[parent];
    path.unshift(parentItem);
    parent = parentItem.parent;
  }
  return path;
}

function selectFilter(candidate, input) {
  if (!input) return false;
  const { matchString } = candidate.data;
  const tokens = parseSearchQueryString(input);
  return areTermsInString(tokens, matchString);
}

function noOptionsMessage({ inputValue }) {
  return inputValue
    ? 'No options'
    : (
      <div>
        <p>Start typing to see options.</p>
        <p>Each word you enter will be matched at the beginning of words in variable names and descriptions.</p>
      </div>
    )
}

function formatOptionLabel({ group, path, ontologyItem }, { context }) {
  if (context === 'value') return ontologyItem.display;
  return <FilterFinderOption group={group} path={path} ontologyItem={ontologyItem}/>
}

function formatGroupLabel({ group }) {
  return (
    <button type="button" style={{ overflow: 'visible', pointerEvents: 'none' }} className="ebrc-QuestionWizardParamGroupButton">
      {group.displayName}
    </button>
  );
}

function FilterFinderOption(props) {
  const { group, path, ontologyItem } = props;
  const groupSegment = (
    <button type="button" style={{ overflow: 'visible', pointerEvents: 'none' }} className="ebrc-QuestionWizardParamGroupButton">
      {group.displayName}
    </button>
  );
  return (
    <div className={cx('--Label')}>
      {groupSegment}
      <div className={cx('--TermAndPath')}>
        <div className={cx('--Term')}>
          {ontologyItem.display}
        </div>
        <div className={cx('--Path')}>
          {path.map((item, index) => (
            <React.Fragment key={item.term}>
              {item.display}
              {index < (path.length - 1) ? <b> &raquo; </b> : null}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

function makeOptions(question) {
  const groupPairsByName = keyBy(question.groups.map((group, ix) => [group, ix]), p => p[0].name);
  return question.parameters
    .filter(parameter => parameter.type === 'filter')
    .flatMap(parameter => {
      const ontologyItemsByTerm = keyBy(parameter.ontology, 'term');
      const [ group, groupIx ] = groupPairsByName[parameter.group];
      const tree = getOntologyTree(parameter);
      const leaves = getLeaves(tree, node => isMulti(node.field) ? [] : node.children);
      const options = leaves
        .map(node => {
          const path = findPath(ontologyItemsByTerm, node.field.term);
          const matchString = makeMatchString(node, path, parameter.values[node.field.term]);
          if (path && matchString) {
            return {
              group,
              groupIx,
              matchString,
              ontologyItem: node.field,
              parameter,
              path,
              value: parameter.name + '/' + node.field.term
            };
          } else {
              return null;
          }
        }).filter(e => e);
      return options;
    });
  }

  function makeMatchString(node, path, values = []) {
    return getLeaves(node, node => node.children).map(node => node.field) // multiFilter children
      .concat(path)
      .concat([node.field])
      .flatMap(field => field ? [field.display, field.description, field.variableName]: [])
      .concat(values)
      .join(' ');
  }
