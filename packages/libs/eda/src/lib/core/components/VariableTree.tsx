import PopoverButton from '@veupathdb/components/lib/components/widgets/PopoverButton';
import { Button } from '@material-ui/core';
import { keyBy } from 'lodash';
import { useCallback, useMemo, useState, useContext } from 'react';
import { cx } from '../../workspace/Utils';
import { StudyEntity } from '../types/study';
import { VariableDescriptor } from '../types/variable';
import {
  edaVariableToWdkField,
  entitiesToFields,
  makeFieldTree,
} from '../utils/wdk-filter-param-adapter';
import VariableList from './VariableList';
import './VariableTree.scss';
import { useStudyEntities } from '../hooks/study';

export interface Props {
  rootEntity: StudyEntity;
  starredVariables?: string[];
  toggleStarredVariable: (targetVariableId: string) => void;
  entityId?: string;
  variableId?: string;
  disabledVariables?: VariableDescriptor[];
  /** term string is of format "entityId/variableId"  e.g. "PCO_0000024/EUPATH_0000714" */
  onChange: (variable?: VariableDescriptor) => void;
  includeMultiFilters?: boolean;
}
export function VariableTree(props: Props) {
  const {
    rootEntity,
    disabledVariables,
    starredVariables,
    toggleStarredVariable,
    entityId,
    variableId,
    onChange,
    includeMultiFilters = false,
  } = props;
  const entities = useStudyEntities(rootEntity);

  // This is used by the search functionality of FieldList.
  // It should be a map from field term to string.
  // In WDK searches, this is a concatenated string of values
  // for categorical-type variables.
  const valuesMap = useMemo(() => {
    const valuesMap: Record<string, string> = {};
    for (const entity of entities) {
      for (const variable of entity.variables) {
        if (variable.type !== 'category' && variable.vocabulary) {
          valuesMap[`${entity.id}/${variable.id}`] = variable.vocabulary.join(
            ' '
          );
        }
      }
    }
    return valuesMap;
  }, [entities]);

  const fields = useMemo(
    () => entitiesToFields(entities, { includeMultiFilters }),
    [entities, includeMultiFilters]
  );

  const featuredFields = useMemo(() => {
    return entities.flatMap((entity) =>
      entity.variables
        .filter(
          (variable) => variable.type !== 'category' && variable.isFeatured
        )
        .map((variable) => ({
          ...variable,
          id: `${entity.id}/${variable.id}`,
          displayName: `<span class="Entity">${entity.displayName}</span>: ${variable.displayName}`,
        }))
        .map((variable) =>
          edaVariableToWdkField(variable, { includeMultiFilters })
        )
    );
  }, [includeMultiFilters, entities]);

  // Construct the fieldTree using the fields defined above.
  const fieldTree = useMemo(() => makeFieldTree(fields), [fields]);

  const disabledFields = useMemo(
    () => disabledVariables?.map((v) => `${v.entityId}/${v.variableId}`),
    [disabledVariables]
  );

  // Used to lookup a field by entityId and variableId.
  const fieldsByTerm = useMemo(() => keyBy(fields, (f) => f.term), [fields]);

  const onActiveFieldChange = useCallback(
    (term?: string) => {
      if (term == null) {
        onChange(term);
        return;
      }
      const [entityId, variableId] = term.split('/');
      onChange({ entityId, variableId });
    },
    [onChange]
  );

  // Lookup activeField
  const activeField =
    entityId && variableId
      ? fieldsByTerm[`${entityId}/${variableId}`]
      : undefined;

  return (
    <VariableList
      activeField={activeField}
      disabledFieldIds={disabledFields}
      onActiveFieldChange={onActiveFieldChange}
      featuredFields={featuredFields}
      valuesMap={valuesMap}
      fieldTree={fieldTree}
      autoFocus={false}
      starredVariables={starredVariables}
      toggleStarredVariable={toggleStarredVariable}
    />
  );
}

export function VariableTreeDropdown(props: Props) {
  const { rootEntity, entityId, variableId, onChange } = props;

  const entities = useStudyEntities(rootEntity);
  const variable = entities
    .find((e) => e.id === entityId)
    ?.variables.find((v) => v.id === variableId);
  const label = variable?.displayName ?? 'Select a variable';
  return (
    <div className={cx('-VariableTreeDropdown')}>
      <PopoverButton label={label} key={`${entityId}/${variableId}`}>
        {variable && (
          <div style={{ textAlign: 'center', padding: '.75em 0.25em 0.25em' }}>
            <Button
              type="button"
              style={{ width: '90%' }}
              variant="contained"
              color="default"
              size="small"
              onClick={() => onChange()}
            >
              Clear selection
            </Button>
          </div>
        )}
        <div className={cx('-VariableTreeDropdownTreeContainer')}>
          <VariableTree {...props} />
        </div>
      </PopoverButton>
    </div>
  );
}
