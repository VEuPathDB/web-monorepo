import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useLocation } from 'react-router';

import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { CheckboxTreeProps } from '@veupathdb/coreui/lib/components/inputs/checkboxes/CheckboxTree/CheckboxTree';
import { Tooltip } from '@veupathdb/coreui';

import { pruneDescendantNodes } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import {
  CheckBoxEnumParam,
  EnumParam,
  Parameter,
  SelectEnumParam,
  TreeBoxEnumParam,
  TreeBoxVocabNode,
  TypeAheadEnumParam,
} from '@veupathdb/wdk-client/lib/Utils/WdkModel';

import ParamComponent from '@veupathdb/wdk-client/lib/Views/Question/ParameterComponent';
import EnumParamModule from '@veupathdb/wdk-client/lib/Views/Question/Params/EnumParam';
import {
  isMultiPick,
  toMultiValueArray,
  toMultiValueString,
} from '@veupathdb/wdk-client/lib/Views/Question/Params/EnumParamUtils';
import TreeBoxEnumParamComponent, {
  State,
} from '@veupathdb/wdk-client/lib/Views/Question/Params/TreeBoxEnumParam';
import {
  Props as DefaultParamProps,
  isPropsType,
} from '@veupathdb/wdk-client/lib/Views/Question/Params/Utils';

import { pruneNodesWithSingleExtendingChild } from '@veupathdb/web-common/lib/util/organisms';

import {
  useRenderOrganismNode,
  useOrganismSearchPredicate,
} from '../hooks/organismNodes';
import {
  usePreferredOrganismsEnabledState,
  usePreferredOrganismsState,
  usePreferredSpecies,
} from '../hooks/preferredOrganisms';
import { useReferenceStrains } from '../hooks/referenceStrains';

import { OrganismPreferencesWarning } from './OrganismPreferencesWarning';

type FlatEnumParam = SelectEnumParam | CheckBoxEnumParam | TypeAheadEnumParam;

export const ORGANISM_PROPERTIES_KEY = 'organismProperties';

export const PRUNE_NODES_WITH_SINGLE_EXTENDING_CHILD_PROPERTY =
  'pruneNodesWithSingleExtendingChild';
export const SHOW_ONLY_PREFERRED_ORGANISMS_PROPERTY =
  'showOnlyPreferredOrganisms';
export const HIGHLIGHT_REFERENCE_ORGANISMS_PROPERTY =
  'highlightReferenceOrganisms';
export const IS_SPECIES_PARAM_PROPERTY = 'isSpeciesParam';

interface OrganismParamProps<T extends Parameter, S = void>
  extends DefaultParamProps<T, S> {
  isSearchPage?: boolean;
}

export function OrganismParam(props: OrganismParamProps<Parameter, State>) {
  if (!isOrganismParamProps(props)) {
    throw new Error(
      `Tried to render non-organism parameter ${props.parameter.name} with OrganismParam.`
    );
  }

  return (
    <div className="OrganismParam">
      <Suspense fallback={<Loading />}>
        <ValidatedOrganismParam {...props} />
      </Suspense>
    </div>
  );
}

export function ValidatedOrganismParam(
  props: OrganismParamProps<EnumParam, State>
) {
  return props.parameter.displayType === 'treeBox' ? (
    <TreeBoxOrganismEnumParam
      {...(props as OrganismParamProps<TreeBoxEnumParam, State>)}
    />
  ) : (
    <FlatOrganismEnumParam
      {...(props as OrganismParamProps<FlatEnumParam, State>)}
    />
  );
}

function TreeBoxOrganismEnumParam(
  props: OrganismParamProps<TreeBoxEnumParam, State>
) {
  const [showOnlyReferenceOrganisms, setShowOnlyReferenceOrganisms] =
    useState<boolean>(false);

  const { selectedValues, onChange } = useEnumParamSelectedValues(props);

  const paramWithPrunedVocab = useTreeBoxParamWithPrunedVocab(
    props.parameter,
    selectedValues,
    onChange,
    props.isSearchPage
  );

  const { maxSelectedCount } = paramWithPrunedVocab;

  const referenceStrains = useReferenceStrains();

  const shouldHighlightReferenceOrganisms =
    props.parameter.properties?.[ORGANISM_PROPERTIES_KEY].includes(
      HIGHLIGHT_REFERENCE_ORGANISMS_PROPERTY
    ) ?? false;

  const renderNode = useRenderOrganismNode(
    shouldHighlightReferenceOrganisms ? referenceStrains : undefined,
    undefined
  );
  const searchPredicate = useOrganismSearchPredicate(referenceStrains);

  const wrapCheckboxTreeProps = useCallback(
    (props: CheckboxTreeProps<TreeBoxVocabNode>) => ({
      ...props,
      isMultiPick: maxSelectedCount !== 1,
      renderNode,
      searchPredicate,
      filteredList:
        showOnlyReferenceOrganisms && referenceStrains
          ? Array.from(referenceStrains)
          : undefined,
      isAdditionalFilterApplied: showOnlyReferenceOrganisms,
      additionalFilters: [
        <Tooltip
          title={
            <span style={{ fontWeight: 'normal' }}>
              Show only reference organisms{' '}
              <span style={{ fontWeight: 'bolder' }}>[Reference]</span>
            </span>
          }
        >
          <label className="OrganismFilter--OnlyMatchesToggle">
            <input
              style={{ marginRight: '0.25em' }}
              type="checkbox"
              checked={showOnlyReferenceOrganisms}
              onChange={() => setShowOnlyReferenceOrganisms((value) => !value)}
            />
            <span style={{ fontSize: '0.95em' }}>Reference only</span>
          </label>
        </Tooltip>,
      ],
      styleOverrides: {
        searchBox: {
          container: {
            flexGrow: 1,
            width: 'auto',
          },
        },
      },
    }),
    [
      maxSelectedCount,
      renderNode,
      searchPredicate,
      showOnlyReferenceOrganisms,
      referenceStrains,
    ]
  );

  return hasEmptyVocabularly(paramWithPrunedVocab) ? (
    <EmptyParamWarning />
  ) : (
    <TreeBoxEnumParamComponent
      {...props}
      selectedValues={selectedValues}
      onChange={onChange}
      context={props.ctx}
      parameter={paramWithPrunedVocab}
      wrapCheckboxTreeProps={wrapCheckboxTreeProps}
    />
  );
}

function FlatOrganismEnumParam(
  props: OrganismParamProps<FlatEnumParam, State>
) {
  const { selectedValues, onChange } = useEnumParamSelectedValues(props);

  const paramWithPrunedVocab = useFlatParamWithPrunedVocab(
    props.parameter,
    selectedValues,
    onChange,
    props.isSearchPage
  );

  return hasEmptyVocabularly(paramWithPrunedVocab) ? (
    <EmptyParamWarning />
  ) : (
    <ParamComponent {...props} parameter={paramWithPrunedVocab} />
  );
}

function useTreeBoxParamWithPrunedVocab(
  parameter: TreeBoxEnumParam,
  selectedValues: string[],
  onChange: (newValue: string[]) => void,
  isSearchPage?: boolean
) {
  const preferredValues = usePreferredValues(
    parameter,
    selectedValues,
    isSearchPage
  );

  const [preferredOrganismsEnabled] = usePreferredOrganismsEnabledState();

  const paramWithPrunedVocab = useMemo(() => {
    const shouldPruneNodesWithSingleExtendingChild = parameter.properties?.[
      ORGANISM_PROPERTIES_KEY
    ].includes(PRUNE_NODES_WITH_SINGLE_EXTENDING_CHILD_PROPERTY);

    const prunedVocabulary = shouldPruneNodesWithSingleExtendingChild
      ? pruneNodesWithSingleExtendingChild(parameter.vocabulary)
      : parameter.vocabulary;

    const shouldOnlyShowPreferredOrganisms =
      findShouldOnlyShowPreferredOrganisms(parameter);

    const preferredVocabulary =
      shouldOnlyShowPreferredOrganisms && preferredOrganismsEnabled
        ? pruneDescendantNodes(
            (node) =>
              node.children.length > 0 || preferredValues.has(node.data.term),
            prunedVocabulary
          )
        : prunedVocabulary;

    return parameter.vocabulary === preferredVocabulary
      ? parameter
      : {
          ...parameter,
          vocabulary: preferredVocabulary,
        };
  }, [parameter, preferredOrganismsEnabled, preferredValues]);

  useRestrictSelectedValues(
    selectedValues,
    onChange,
    preferredValues,
    paramWithPrunedVocab
  );

  return paramWithPrunedVocab;
}

function useFlatParamWithPrunedVocab(
  parameter: FlatEnumParam,
  selectedValues: string[],
  onChange: (newValue: string[]) => void,
  isSearchPage?: boolean
) {
  const preferredValues = usePreferredValues(
    parameter,
    selectedValues,
    isSearchPage
  );

  const [preferredOrganismsEnabled] = usePreferredOrganismsEnabledState();

  const paramWithPrunedVocab = useMemo(() => {
    const shouldOnlyShowPreferredOrganisms =
      findShouldOnlyShowPreferredOrganisms(parameter);

    return shouldOnlyShowPreferredOrganisms && preferredOrganismsEnabled
      ? {
          ...parameter,
          vocabulary: parameter.vocabulary.filter(([term]) =>
            preferredValues.has(term)
          ),
        }
      : parameter;
  }, [parameter, preferredOrganismsEnabled, preferredValues]);

  useRestrictSelectedValues(
    selectedValues,
    onChange,
    preferredValues,
    paramWithPrunedVocab
  );

  return paramWithPrunedVocab;
}

function useEnumParamSelectedValues(
  props: OrganismParamProps<EnumParam, State>
) {
  const paramIsMultiPick = isMultiPick(props.parameter);

  const selectedValues = useMemo(() => {
    return paramIsMultiPick
      ? toMultiValueArray(props.value)
      : props.value == null || props.value === ''
      ? []
      : [props.value];
  }, [paramIsMultiPick, props.value]);

  const transformValue = useCallback(
    (newValue: string[]) => {
      if (paramIsMultiPick) {
        return toMultiValueString(newValue);
      } else {
        return newValue.length === 0 ? '' : newValue[0];
      }
    },
    [paramIsMultiPick]
  );

  const onParamValueChange = props.onParamValueChange;

  const onChange = useCallback(
    (newValue: string[]) => {
      onParamValueChange(transformValue(newValue));
    },
    [onParamValueChange, transformValue]
  );

  return {
    selectedValues,
    onChange,
  };
}

function usePreferredValues(
  parameter: EnumParam,
  selectedValues: string[],
  isSearchPageProp?: boolean
) {
  const [preferredOrganisms] = usePreferredOrganismsState();
  const preferredSpecies = usePreferredSpecies();

  const { pathname } = useLocation();

  const isSearchPage = isSearchPageProp ?? pathname.startsWith('/search');

  const selectedValuesRef = useRef(selectedValues);
  useEffect(() => {
    selectedValuesRef.current = selectedValues;
  }, [selectedValues]);

  const initialSelectedValuesRef = useRef(selectedValues);
  useEffect(() => {
    initialSelectedValuesRef.current = selectedValuesRef.current;
  }, [isSearchPage, pathname]);

  const preferredValues = useMemo(
    () =>
      findPreferredValues(
        new Set(preferredOrganisms),
        preferredSpecies,
        initialSelectedValuesRef.current,
        parameter.vocabulary,
        isSearchPage,
        findPreferenceType(parameter)
      ),
    [parameter, isSearchPage, preferredOrganisms, preferredSpecies]
  );

  return preferredValues;
}

function useRestrictSelectedValues(
  selectedValues: string[],
  onChange: (newValue: string[]) => void,
  preferredValues: Set<string>,
  parameter: EnumParam
) {
  const [preferredOrganismsEnabled] = usePreferredOrganismsEnabledState();

  const selectedValuesRef = useRef({ selectedValues, onChange });

  useEffect(() => {
    selectedValuesRef.current = {
      selectedValues,
      onChange,
    };
  }, [selectedValues, onChange]);

  useEffect(() => {
    const { selectedValues, onChange } = selectedValuesRef.current;

    const shouldOnlyShowPreferredOrganisms =
      findShouldOnlyShowPreferredOrganisms(parameter);

    if (
      shouldOnlyShowPreferredOrganisms &&
      preferredOrganismsEnabled &&
      !hasEmptyVocabularly(parameter)
    ) {
      const preferredSelectedValues = selectedValues.filter((selectedValue) =>
        preferredValues.has(selectedValue)
      );

      if (preferredSelectedValues.length !== selectedValues.length) {
        if (
          !Array.isArray(parameter.vocabulary) ||
          preferredSelectedValues.length > 0
        ) {
          onChange(preferredSelectedValues);
        } else if (!isMultiPick(parameter)) {
          onChange([parameter.vocabulary[0][0]]);
        }
      }
    }
  }, [preferredOrganismsEnabled, preferredValues, parameter]);
}

function isOrganismParamProps<S = void>(
  props: OrganismParamProps<Parameter, S>
): props is OrganismParamProps<EnumParam, S> {
  return isPropsType(props, isOrganismParam);
}

export function isOrganismParam(parameter: Parameter): parameter is EnumParam {
  return (
    parameter?.properties?.[ORGANISM_PROPERTIES_KEY] != null &&
    EnumParamModule.isType(parameter)
  );
}

function findShouldOnlyShowPreferredOrganisms(parameter: Parameter) {
  return parameter.properties?.[ORGANISM_PROPERTIES_KEY].includes(
    SHOW_ONLY_PREFERRED_ORGANISMS_PROPERTY
  );
}

function hasEmptyVocabularly(parameter: EnumParam) {
  return Array.isArray(parameter.vocabulary)
    ? parameter.vocabulary.length === 0
    : parameter.vocabulary.children.length === 0;
}

function findPreferenceType(parameter: Parameter) {
  const isSpeciesParam = parameter.properties?.[
    ORGANISM_PROPERTIES_KEY
  ].includes(IS_SPECIES_PARAM_PROPERTY);

  return isSpeciesParam ? 'species' : 'organism';
}

function findPreferredValues(
  preferredOrganismValues: Set<string>,
  preferredSpecies: Set<string>,
  selectedValues: string[],
  vocabulary: EnumParam['vocabulary'],
  isSearchPage: boolean,
  preferenceType: 'organism' | 'species'
) {
  const basePreferredValues =
    preferenceType === 'organism' ? preferredOrganismValues : preferredSpecies;

  const basePreferredValuesWithDescendants = Array.isArray(vocabulary)
    ? basePreferredValues
    : findPreferredDescendants(vocabulary, basePreferredValues);

  return isSearchPage
    ? basePreferredValuesWithDescendants
    : new Set([...basePreferredValuesWithDescendants, ...selectedValues]);
}

function findPreferredDescendants(
  vocabRoot: TreeBoxVocabNode,
  preferredValues: Set<string>
) {
  const preferredDescendants = new Set<string>();

  _traverse(vocabRoot, false);

  return preferredDescendants;

  function _traverse(node: TreeBoxVocabNode, preferredNodeInAncestry: boolean) {
    const nodeIsPreferred = preferredValues.has(node.data.term);

    if (preferredNodeInAncestry || nodeIsPreferred) {
      preferredDescendants.add(node.data.term);
    }

    node.children.forEach((child) => {
      _traverse(child, preferredNodeInAncestry || nodeIsPreferred);
    });
  }
}

function EmptyParamWarning() {
  return (
    <OrganismPreferencesWarning
      action="use this search"
      explanation="Your current preferences exclude all organisms used in this search."
    />
  );
}
