/*global wdk*/
import {
  ary,
  debounce,
  flow,
  get,
  groupBy,
  identity,
  isEqual,
  keyBy,
  mapValues,
  memoize,
  partition,
  pick,
  reverse,
  sortBy,
  stubTrue as T
} from 'lodash';
import natsort from 'natural-sort';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { Dialog, LoadingOverlay } from 'wdk-client/Components';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';
import { ViewController } from 'wdk-client/Controllers';
import { isMulti, isRange } from 'wdk-client/Components/AttributeFilter/AttributeFilterUtils';
import { Seq } from 'wdk-client/Utils/IterableUtils';
import { synchronized } from 'wdk-client/Utils/PromiseUtils';
import { preorder } from 'wdk-client/Utils/TreeUtils';
import * as StrategyActions from 'wdk-client/Actions/StrategyActions';
import * as RouterActions from 'wdk-client/Actions/RouterActions';
import { DEFAULT_STEP_WEIGHT, DEFAULT_STRATEGY_NAME } from 'wdk-client/StoreModules/QuestionStoreModule';

import QuestionWizard from '../components/QuestionWizard';
import {
  createInitialState,
  createInitialParamState,
  getDefaultParamValues,
  setFilterPopupVisiblity,
  setFilterPopupPinned,
  resetParamValues
} from '../util/QuestionWizardState';
import {addStep} from 'wdk-client/Utils/StrategyUtils';

const natSortComparator = natsort();

//  type State = {
//    question: Question;
//    activeGroup: Group;
//    groupUIState: Record<string, {
//      valid?: boolean;
//      loading?: boolean;
//      accumulatedTotal?: boolean;
//    }>;
//    paramUIState: Record<string, any>;
//    paramValues: Record<string, string>;
//  }

// FIXME Don't update param dependencies if value is empty

/**
 * Controller for question wizard
 *
 * FIXME Move state management into a Store. As-is, there are potential race
 * conditions due to `setState()` being async.
 */
class QuestionWizardController extends ViewController {

  constructor(props) {
    super(props);
    this.state = { };
    this.parameterMap = null;
    this.wizardEventHandlers = mapValues(this.getWizardEventHandlers(), handler => handler.bind(this));
    this.parameterEventHandlers = mapValues(this.getParameterEventHandlers(), handler => handler.bind(this));

    this._getAnswerCount = memoize(this._getAnswerCount, (...args) => JSON.stringify(args));
    this._getFilterCounts = memoize(this._getFilterCounts, (...args) => JSON.stringify(args));
    this._updateGroupCounts = synchronized(this._updateGroupCounts);
    this._commitParamValueChange = synchronized(debounce(this._commitParamValueChange, 750));

    this.setCustomName = this.setCustomName.bind(this);
  }

  getWizardEventHandlers() {
    return pick(this, [
      'onGroupSelect',
      'onInvalidGroupCountsUpdate',
      'onFilterPopupVisibilityChange',
      'onFilterPopupPinned',
      'onParamValuesReset',
      'onSubmit'
    ]);
  }

  getParameterEventHandlers() {
    return pick(this, [
      'onOntologyTermSearch',
      'onOntologyTermSelect',
      'onOntologyTermSort',
      'onOntologyTermSummaryUpdate',
      'onParamStateChange',
      'onParamValueChange',
      'onSubmit'
    ]);
  }

  async loadQuestion() {
    // clear state
    this.setState(state => mapValues(state, () => undefined));

    const { questionName, wdkService, submissionMetadata } = this.props;
    const step = submissionMetadata.type === 'edit-step'
      ? await wdkService.findStep(submissionMetadata.stepId)
      : undefined;
    const questionAndParameters = await wdkService.getQuestionAndParameters(questionName);
    const question = step
      ? await wdkService.getQuestionGivenParameters(questionName, step.searchConfig.parameters)
      : questionAndParameters;

    const recordClass = await wdkService.findRecordClass(question.outputRecordClassName);
    const defaultParamValues = questionAndParameters.parameters.reduce((defaultParamValues, param) => Object.assign(defaultParamValues, {
        [param.name]: param.initialDisplayValue
      }), {});
    const paramValues = step ? step.searchConfig.parameters : defaultParamValues;
    // FIXME Deal with invalid steps
    this.setState(createInitialState(question, recordClass, paramValues, defaultParamValues, step && step.customName), () => {
      document.title = `Search for ${recordClass.displayName} by ${question.displayName}`;

      // store <string, Parameter>Map for quick lookup
      this.parameterMap = new Map(question.parameters.map(p => [ p.name, p ]))

      const lastConfiguredGroup = Seq.from(question.groups)
        .filter(group => group.parameters.some(paramName => paramValues[paramName] !== defaultParamValues[paramName]))
        .last();
      const configuredGroups = lastConfiguredGroup == null ? []
        : Seq.from(question.groups)
            .takeWhile(group => group !== lastConfiguredGroup)
            .concat(Seq.of(lastConfiguredGroup));

      this._updateGroupCounts(configuredGroups);
      this._getAnswerCount({
        searchName: question.urlSegment,
        searchConfig: {
          parameters: defaultParamValues
        }
      }).then(initialCount => {
        this.setState({ initialCount });
      });

      this.onGroupSelect(question.groups[0]);
    });
  }

  // Top level action creator methods
  // --------------------------------


  /**
   * Update selected group and its count.
   */
  onGroupSelect(activeGroup) {
    this.setState({ activeGroup });

    if (activeGroup == null) return;

    // FIXME Updating group counts and filter param counts needs to wait for
    // any dependent param updates to finish first.

    // Update counts for active group and upstream groups
    const groupsToUpdate = Seq.from(this.state.question.groups)
      .takeWhile(group => group !== activeGroup)
      .concat(Seq.of(activeGroup));

    this._updateGroupCounts(groupsToUpdate);

    // TODO Perform sideeffects elsewhere
    // BEGIN_SIDE_EFFECTS
    this._initializeActiveGroupParams(activeGroup);
    // END_SIDE_EFFECTS
  }

  onParamStateChange(param, state) {
    this.setState(set(['paramUIState', param.name], state));
  }

  /**
   * Set filter popup visiblity
   */
  onFilterPopupVisibilityChange(show) {
    this.setState(state => setFilterPopupVisiblity(state, show));
  }

  /**
   * Set filter popup stickyness
   */
  onFilterPopupPinned(pinned) {
    this.setState(state => setFilterPopupPinned(state, pinned));
  }

  /**
   * Set all params to default values, then update group counts and ontology term summaries
   */
  onParamValuesReset() {
    // reset values
    this.setState(resetParamValues, () => {
      this._updateGroupCounts(
        Seq.from(this.state.question.groups)
          .filter(group => this.state.groupUIState[group.name].accumulatedTotal != null));
    })

    // clear ontology term summaries
    const paramUIState = mapValues(this.state.paramUIState, state => ({
      ...state,
      fieldStates: mapValues(state.fieldStates, fieldState => ({
        ...fieldState,
        summary: null
      }))
    }));

    this.setState({ paramUIState }, () => {
      Seq.from(this.state.activeGroup.parameters)
        .map(paramName => this.parameterMap.get(paramName))
        .filter(param => param.type === 'filter')
        .forEach(param => {
          this.onOntologyTermSelect(param, [], this.state.paramUIState[param.name].activeOntologyTerm);
        })
    })
  }

  /**
   * Force an update of ontology term counts. If `ontologyTerm` isMulti, then
   * update all of it's children's counts.
   */
  onOntologyTermSummaryUpdate(paramName, ontologyTerm) {
    const { filters } = JSON.parse(this.state.paramValues[paramName]);
    this._onUpdateOntologyTermSummary(paramName, ontologyTerm, filters);
  }

  /**
   * Force stale counts to be updated.
   */
  onInvalidGroupCountsUpdate() {
    this._updateGroupCounts(
      Seq.from(this.state.question.groups)
        .filter(group => this.state.groupUIState[group.name].valid === false));
  }

  /**
   * Update paramUI state based on ontology term.
   */
  onOntologyTermSelect(param, filters, ontologyTerm) {
    const {
      summary,
      loading = false,
      invalid = false,
      multiLeafInvalid = false
    } = get(this.state, ['paramUIState', param.name, 'fieldStates', ontologyTerm], {});
    if ((summary == null || invalid || multiLeafInvalid) && !loading) {
      this._onUpdateOntologyTermSummary(param.name, ontologyTerm, filters);
    }
    this.setState(set(['paramUIState', param.name, 'activeOntologyTerm'], ontologyTerm));
  }

  onOntologyTermSort(param, term, sort) {
    let uiState = this.state.paramUIState[param.name];
    let field = uiState.ontology.find(field => field.term === term);
    if (field == null || isRange(field)) return;

    this.setState(update(
      ['paramUIState', param.name],
      uiState => {
        let { fieldStates, defaultMemberFieldState, defaultMultiFieldState } = uiState;
        let { filters = [] } = JSON.parse(this.state.paramValues[param.name]);
        let filter = filters.find(f => f.field === term);

        return {
          ...uiState,
          fieldStates: {
            ...fieldStates,
            [term]: {
              ...(fieldStates[term] || isMulti(field) ? defaultMultiFieldState : defaultMemberFieldState),
              sort,
              summary: isMulti(field)
                ? sortMultiFieldSummary(fieldStates[term].summary, uiState.ontology, sort)
                : {
                  ...fieldStates[term].summary,
                  valueCounts: sortDistribution(fieldStates[term].summary.valueCounts, sort, filter)
                }
            }
          }
        };
      }
    ));
  }

  onOntologyTermSearch(param, term, searchTerm) {
    let uiState = this.state.paramUIState[param.name];
    let { fieldStates, defaultMemberFieldState } = uiState;
    let newState = Object.assign({}, uiState, {
      fieldStates: Object.assign({}, fieldStates, {
        [term]: Object.assign({}, fieldStates[term] || defaultMemberFieldState, {
          searchTerm
        })
      })
    });
    this.onParamStateChange(param, newState);
  }

  /**
   * Update parameter value, update dependent parameter vocabularies and
   * ontologies, and update counts.
   */
  onParamValueChange(param, paramValue) {
    const prevParamValue = this.state.paramValues[param.name];

    // FIXME Add set updatingParams state for downstream groups
    this.setState(
      set(['paramValues', param.name], paramValue),
      () => {
        this._commitParamValueChange(param, paramValue, prevParamValue);
      }
    );

    if (this.state.activeGroup.name === param.group) {
      this.setState(set(['groupUIState', param.group, 'loading'], true));
    }

    if (param.type === 'filter') {
      // for each changed member updated member field, resort
      let paramState = this.state.paramUIState[param.name];
      let { filters = [] } = JSON.parse(paramValue);
      let { filters: prevFilters = [] } = JSON.parse(this.state.paramValues[param.name]);
      let filtersByTerm = keyBy(filters, 'field');
      let prevFiltersByTerm = keyBy(prevFilters, 'field');
      let fieldMap = new Map(paramState.ontology.map(entry => [ entry.term, entry ]));
      let fieldStates = mapValues(paramState.fieldStates, (fieldState, term) =>
        isRange(fieldMap.get(term)) || filtersByTerm[term] === prevFiltersByTerm[term]
        ? fieldState
        : { ...fieldState, ...isMulti(fieldMap.get(term))
          ? {
              ...fieldState,
              summary: sortMultiFieldSummary(
                fieldState.summary,
                paramState.ontology,
                (paramState.fieldStates[term] || paramState.defaultMultiFieldState).sort
              )
            }
          : {
            ...fieldState,
            summary: {
              ...fieldState.summary,
              valueCounts: sortDistribution(
                fieldState.summary.valueCounts,
                (paramState.fieldStates[term] || paramState.defaultMemberFieldState).sort,
                filtersByTerm[term]
              )
            }
          }
        }
      );
      this.onParamStateChange(param, Object.assign({}, paramState, { fieldStates }));
    }
  }

  setCustomName(newCustomName) {
    this.setState({ customName: newCustomName });
  }

  onSubmit() {
    this.props.dispatch(async ({ wdkService }) => {
      try {
        this.setState({ submitting: true });
        const { submissionMetadata } = this.props;
        // submissionMetadata.type =
        //   | "create-strategy"
        //   | "add-binary-step"
        //   | "add-unary-step"
        //   | "submit-custom-form"
        //   | "edit-step"

        const customName = this.state.customName || this.state.question.shortDisplayName;

        if (submissionMetadata.type === 'edit-step') {
          // update step's customName and searchConfig
          return StrategyActions.requestReviseStep(
            submissionMetadata.strategyId,
            submissionMetadata.stepId,
            {
              customName
            },
            {
              ...submissionMetadata.previousSearchConfig,
              parameters: this.state.paramValues
            }
          );
        }

        // Each case below requires a new step to be created...
        const searchSpec = {
          searchName: this.props.questionName,
          searchConfig: {
            parameters: this.state.paramValues,
            wdkWeight: DEFAULT_STEP_WEIGHT
          },
          customName
        };

        const stepResponse = await wdkService.createStep(searchSpec);

        if (submissionMetadata.type === 'create-strategy') {
          // create a new step, then new strategy, then go to the strategy panel
          const strategyReponse = await wdkService.createStrategy({
            isSaved: false,
            isPublic: false,
            stepTree: { stepId: stepResponse.id },
            name: DEFAULT_STRATEGY_NAME
          });
          return [
            StrategyActions.fulfillCreateStrategy(strategyReponse.id, Date.now()),
            RouterActions.transitionToInternalPage(`/workspace/strategies/${strategyReponse.id}/${stepResponse.id}`)
          ];
        }

        if (submissionMetadata.type === 'add-binary-step') {
          // create steps and patch strategy's stepTree
          const strategy = await wdkService.getStrategy(submissionMetadata.strategyId);
          const { operatorQuestionState } = this.props;
          if (operatorQuestionState == null || operatorQuestionState.questionStatus !== 'complete') {
            throw new Error(`Tried to create an operator step using a nonexistent or unloaded question: ${submissionMetadata.operatorSearchName}`);
          }
          const operatorParamValues = operatorQuestionState.paramValues;
          const operatorStepResponse = await wdkService.createStep({
            searchName: submissionMetadata.operatorSearchName,
            searchConfig: {
              parameters: operatorParamValues
            }
          });
          return StrategyActions.requestPutStrategyStepTree(
            submissionMetadata.strategyId,
            addStep(
              strategy.stepTree,
              submissionMetadata.addType,
              operatorStepResponse.id,
              { stepId: stepResponse.id }
            )
          );
        }

        if (submissionMetadata.type === 'add-unary-step') {
          // create step and patch strategy's stepTree
          const strategy = await wdkService.getStrategy(submissionMetadata.strategyId);
          return StrategyActions.requestPutStrategyStepTree(
            submissionMetadata.strategyId,
            addStep(
              strategy.stepTree,
              submissionMetadata.addType,
              stepResponse.id,
              undefined
            )
          );
        }

        throw new Error(`Unknonwn submissionMetadata type: "${submissionMetadata.type}"`);
      }

      catch(error) {
        this.setState({ submitting: false });
        throw error;
      }
    });
  }

  _initializeActiveGroupParams(activeGroup) {
    activeGroup.parameters.forEach(paramName => {
      const param = this.state.question.parameters.find(param => param.name === paramName);
      if (param == null) throw new Error("Could not find param `" + paramName + "`.");
      if (param.type === 'filter') {
        const {
          activeOntologyTerm,
          fieldStates,
          ontology
        } = this._getParamUIState(this.state, paramName);
        const { filters } = JSON.parse(this.state.paramValues[param.name]);
        const activeOntologyItem = ontology.find(item => item.term === activeOntologyTerm);
        const activeOntologyItemNeedsUpdate = activeOntologyItem && (
          fieldStates[activeOntologyTerm] == null ||
          fieldStates[activeOntologyTerm].summary == null ||
          fieldStates[activeOntologyTerm].invalid
        );
        return Promise.all([
          this._updateFilterParamCounts(param.name, filters),
          activeOntologyItemNeedsUpdate
            ? this._onUpdateOntologyTermSummary(param.name, activeOntologyTerm, filters)
            : null
        ]);
      }
    })
  }

  async _commitParamValueChange(param, paramValue, prevParamValue) {
    const groups = Seq.from(this.state.question.groups);

    this.setState(set(['updatingParamName'], param.name));

    await Promise.all([
      this._handleParamValueChange(param, paramValue, prevParamValue),
      this._updateDependedParams(param, paramValue, this.state.paramValues).then(nextState => {
        this.setState(nextState, () => {
          groups
            .dropWhile(group => group.name !== param.group)
            .takeWhile(group => this._groupHasCount(group))
            .forEach(group => {
              this.setState(set(['groupUIState', group.name, 'valid'], false));
            });
          this._updateGroupCounts(groups
            .takeWhile(group => group !== this.state.activeGroup)
            .concat(Seq.of(this.state.activeGroup)));
          // If an upstream group has changed, update active group's params
          return this._initializeActiveGroupParams(this.state.activeGroup);
        });
      })
    ]);

    this.setState(set(['updatingParamName'], undefined));
  }

  _handleParamValueChange(param, paramValue, prevParamValue) {
    if (param.type === 'filter') {
      const { filters = [] } = JSON.parse(paramValue);
      const { filters: oldFilters = [] } = JSON.parse(prevParamValue);
      const { ontology } = this.state.paramUIState[param.name];

      // Get an array of fields whose associated filters have been modified.
      const modifiedFields = Object.entries(groupBy(filters.concat(oldFilters), 'field'))
        .filter(([, filters]) => (
          // filter was added or removed
          filters.length === 1 ||
          // filter was modified
          !isEqual(filters[0], filters[1])
        ))
        .map(([ field ]) => ontology.find(entry => entry.term === field));

      if (modifiedFields.length > 0) {
        const firstModifiedField = modifiedFields[0];
        this.setState(update(
          ['paramUIState', param.name, 'fieldStates'],
          fieldStates => mapValues(fieldStates, (fieldState, term) => ({
            ...fieldState,
            invalid: modifiedFields.length > 1 || firstModifiedField.term !== term,
            multiLeafInvalid: isMulti(firstModifiedField)
          }))
        ));
      }

      return this._updateFilterParamCounts(param.name, filters)
    }

    return Promise.resolve();
  }

  /**
   * Returns a new object with updated paramValues and paramUIState
   * @param {*} rootParam
   * @param {*} paramValue
   */
  _updateDependedParams(rootParam, paramValue, paramValues) {
    return this.props.wdkService.getQuestionParamValues(
      this.state.question.urlSegment,
      rootParam.name,
      paramValue,
      paramValues
    ).then(
      // for each parameter returned, reset param value and state
      parameters =>
        Seq.from(parameters)
          .uniqBy(p => p.name)
          .flatMap(newParam => [
            set(['paramUIState', newParam.name], createInitialParamState(newParam)),
            set(['paramValues', newParam.name], newParam.initialDisplayValue),
            update(['question', 'parameters'], parameters =>
              parameters.map(currentParam => currentParam.name === newParam.name ? newParam : currentParam))
          ])
          .reduce(ary(flow, 2), identity)
    ).then(updater =>
      // Then, invalidate ontologyTermSummaries for dependent filter params
      Seq.from(this._getDeepParameterDependencies(rootParam))
        .filter(parameter => parameter.type === 'filter')
        .map(parameter =>
          update(
            ['paramUIState', parameter.name, 'fieldStates'],
            fieldStates => mapValues(fieldStates, fieldState => ({ ...fieldState, invalid: true }))
          )
        )
        .reduce(ary(flow, 2), updater)
    )

  }

  _getDeepParameterDependencies(rootParameter) {
    return Seq.from(rootParameter.dependentParams)
      .map(paramName => this.parameterMap.get(paramName))
      .flatMap(parameter => Seq.of(parameter).concat(this._getDeepParameterDependencies(parameter)));
  }

  /**
   * Fetch answer value for each group of parameters and update state with
   * counts. Default values will be used for parameters in groups to the right
   * of each group, and user supplied values will be used for the rest.
   *
   * @param {Iterable<Group>} groups
   */
  _updateGroupCounts(groups) {

    // set loading state for group counts
    const groupUIState = groups.reduce((state, group) => Object.assign(state, {
      [group.name]: Object.assign({}, state[group.name], {
        loading: true,
        valid: false
      })
    }), Object.assign({}, this.state.groupUIState));

    this.setState({ groupUIState });

    const defaultParamValues = getDefaultParamValues(this.state);

    // transform each group into an answer value promise with accumulated param
    // values of previous groups
    const stateByGroup = Seq.from(groups)
      .map(group => Seq.from(this.state.question.groups)
        .takeWhile(g => g !== group)
        .concat(Seq.of(group)))
      .map(groups => [
        groups.last(),
        {
          searchName: this.state.question.urlSegment,
          searchConfig: {
            parameters: groups.reduce((paramValues, group) => {
              return group.parameters.reduce((paramValues, paramName) => {
                return Object.assign(paramValues, {
                  [paramName]: this.state.paramValues[paramName]
                });
              }, paramValues);
            }, Object.assign({}, defaultParamValues))
          }
        }
      ])
      .map(([ group, answerSpec ]) => {
        const params = group.parameters.map(paramName => this.parameterMap.get(paramName));
        // TODO Use countPredictsAnswerCount filter property
        return (params.length === 1 && params[0].type === 'filter'
          ? this._getFilterCounts(
              params[0].name,
              JSON.parse(this.state.paramValues[params[0].name]).filters,
              answerSpec.searchConfig.parameters
            ).then(counts => counts.filtered)

          : this._getAnswerCount(answerSpec)
        ).then(
          totalCount => [ group, { accumulatedTotal: totalCount, valid: true, loading: false} ],
          error => {
            console.error('Error loading group count for %o.', group, error);
            return [ group, { valid: false, loading: false } ];
          }
        ).then(
          ([ group, state ]) => {
            const groupUIState = Object.assign({}, this.state.groupUIState, {
              [group.name]: Object.assign({}, this.state.groupUIState[group.name], state)
            });
            this.setState({ groupUIState });
          }
        );
      });

    return Promise.all(stateByGroup);
  }

  _getAnswerCount(answerSpec) {
    const formatConfig = {
      pagination: { offset: 0, numRecords: 0 }
    };
    return this.props.wdkService.getAnswerJson(answerSpec, formatConfig).then(answer => answer.meta.totalCount);
  }

  _getFilterCounts(paramName, filters, paramValues) {
    return this.props.wdkService.getFilterParamSummaryCounts(
      this.state.question.urlSegment,
      paramName,
      filters,
      paramValues
    );
  }

  _updateFilterParamCounts(paramName, filters) {
    return this._getFilterCounts(paramName, filters, this.state.paramValues).then(
      counts => {
        this.setState(update(
          ['paramUIState', paramName],
          uiState => ({
            ...uiState,
            filteredCount: counts.nativeFiltered,
            unfilteredCount: counts.nativeUnfiltered
          })
        ));
      }
    );
  }

  _onUpdateOntologyTermSummary(paramName, ontologyTerm, filters) {
    const { ontology } = this.state.paramUIState[paramName];
    const ontologyItem = ontology.find(item => item.term === ontologyTerm);

    const { defaultMultiFieldState, defaultMemberFieldState, defaultRangeFieldState } = this.state.paramUIState[paramName];

    this.setState(update(
      ['paramUIState', paramName, 'fieldStates'],
      fieldStates => {
        const fieldState = fieldStates[ontologyTerm] ||
          ( isMulti(ontologyItem) ? defaultMultiFieldState
          : isRange(ontologyItem) ? defaultRangeFieldState
          : defaultMemberFieldState );
        return { ...fieldStates, [ontologyTerm]: { ...fieldState, loading: true } };
      }
    ));

    if (ontologyItem && isMulti(ontologyItem)) {
      // find all leaves
      const leafTerms = Seq.of(groupBy(ontology, 'parent'))
        .flatMap(parentMap =>
          Seq.from(preorder(ontologyItem, item => parentMap[item.term] || []))
            .filter(item => parentMap[item.term] == null)
            .map(item => item.term));

      const [ [ multiFilter ], otherFilters ] = partition(filters, filter => filter.field === ontologyTerm);

      const leafSummaryPromises = leafTerms
        .map(leafTerm =>
          this.props.wdkService.getOntologyTermSummary(
            this.state.question.urlSegment,
            paramName,
            // If UNION, don't include any leafTerms; if INTERSECT don't include current childTerm.
            otherFilters.concat(
              multiFilter == null || multiFilter.value.operation === 'union' ? []
              : updateObjectImmutably(multiFilter, [ 'value', 'filters' ], filters => filters.filter(filter => filter.field !== leafTerm))
            ),
            leafTerm,
            this.state.paramValues
          )
          .then(summary => ({ ...summary, term: leafTerm }))
        );

      return Promise.all(leafSummaryPromises).then(
        leafSummaries => {
          const { ontology } = this.state.paramUIState[paramName];
          this.setState(update(
            ['paramUIState', paramName, 'fieldStates', ontologyTerm],
            fieldState => ({
              ...fieldState,
              loading: false,
              invalid: false,
              multiLeafInvalid: false,
              summary: sortMultiFieldSummary(leafSummaries, ontology, fieldState.sort)
            })
          ));
        },
        error => {
          this.setState(update(
            ['paramUIState', paramName, 'fieldStates', ontologyTerm],
            fieldState => ({
              ...fieldState,
              loading: false
            })
          ));
          throw error;
        }
      );
    }

    return this.props.wdkService.getOntologyTermSummary(
      this.state.question.urlSegment,
      paramName,
      filters.filter(filter => filter.field !== ontologyTerm),
      ontologyTerm,
      this.state.paramValues
    ).then(
      summary => {
        this.setState(update(
          ['paramUIState', paramName, 'fieldStates', ontologyTerm],
          fieldState => {
            if (!isRange(ontologyItem)) {
              summary.valueCounts = sortDistribution(
                summary.valueCounts,
                fieldState.sort,
                filters
              );
            }
            return {
              ...fieldState,
              loading: false,
              invalid: false,
              summary
          };
          }
        ));
      },
      error => {
        this.setState(update(
          ['paramUIState', paramName, 'fieldStates', ontologyTerm],
          fieldState => ({ ...fieldState, loading: false })
        ))
        throw error;
      }
    );
  }

  _getParamUIState(state, paramName) {
    return state.paramUIState[paramName];
  }

  _groupHasCount(group) {
    return this.state.groupUIState[group.name].accumulatedTotal != null;
  }

  isRenderDataLoaded() {
    return this.state.question != null;
  }

  isRenderDataLoadError() {
    return this.state.question == null && this.state.error != null;
  }

  componentDidMount() {
    this.loadQuestion();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.questionName !== this.props.questionName) {
      this.loadQuestion();
    }
  }

  renderView() {
    return (
      <React.Fragment>
        {this.state.error && (
          <Dialog open modal title="An error occurred" onClose={() => this.setState({ error: undefined })}>
            {Seq.from(this.state.error.stack.split('\n'))
              .flatMap(line => [ line, <br/> ])}
          </Dialog>
        )}
        {this.state.submitting && <LoadingOverlay>Running search...</LoadingOverlay>}
        {this.state.question && (
          <QuestionWizard
            wizardState={this.state}
            wizardEventHandlers={this.wizardEventHandlers}
            parameterEventHandlers={this.parameterEventHandlers}
            customName={this.state.customName}
            setCustomName={this.setCustomName}
            isAddingStep={this.props.submissionMetadata.type.startsWith('add-')}
            showHelpText={!this.props.submissionMetadata.type === 'edit-step'}
          />
        )}
      </React.Fragment>
    )
  }

}

QuestionWizardController.propTypes = {
  wdkService: PropTypes.object.isRequired,
  questionName: PropTypes.string.isRequired,
  /* See  import { SubmissionMetadata } from 'wdk-client/Actions/QuestionActions' */
  submissionMetadata: PropTypes.object.isRequired,
}

QuestionWizardController.defaultProps = {
  get wdkService() {
    return window.ebrc.context.wdkService;
  }
}

function mapStateToProps(state, props) {
  const { submissionMetadata } = props;
  if (submissionMetadata.type === 'add-binary-step') {
    const operatorQuestionState = state.question.questions[submissionMetadata.operatorSearchName];
    return { operatorQuestionState };
  }
  return {};
}

export default connect(mapStateToProps)(wrappable(QuestionWizardController));


/**
 * Creates an updater function that returns a new state object
 * with an updated value returns by fn at the specified path, replacing the
 * previous value.
 */
function update(path, fn) {
  return function updateState(state) {
    return updateObjectImmutably(state, path, fn);
  }
}

/**
 * Creates an updater function that returns a new state object
 * with an updated value at the specified path, replacing the previous value.
 */
function set(path, value) {
  return update(path, () => value);
}

/**
 * Creates a new object based on input object with an updated value
 * a the specified path.
 */
function updateObjectImmutably(object, [key, ...restPath], updateFn) {
  const isObject = typeof object === 'object';
  if (!isObject || (isObject && !(key in object)))
    throw new Error("Invalid key path");

  if (typeof updateFn !== 'function') {
    throw new Error("updateFn should be a function.");
  }

  return Object.assign({}, object, {
    [key]: restPath.length === 0
      ? updateFn(object[key])
      : updateObjectImmutably(object[key], restPath, updateFn)
  })
}

/**
 * Compare distribution values using a natural comparison algorithm.
 * @param {string|null} valueA
 * @param {string|null} valueB
 */
function compareDistributionValues(valueA, valueB) {
  return natSortComparator(
    valueA == null ? '' : valueA,
    valueB == null ? '' : valueB
  );
}

function filteredCountIsZero(entry) {
  return entry.filteredCount === 0;
}

/**
 * Sort distribution based on sort spec. `SortSpec` is an object with two
 * properties: `columnKey` (the distribution property to sort by), and
 * `direction` (one of 'asc' or 'desc').
 * @param {Distribution} distribution
 * @param {SortSpec} sort
 */
export function sortDistribution(distribution, sort, filter) {
  if (sort == null) return distribution;
  let { columnKey, direction, groupBySelected } = sort;
  let selectedSet = new Set(filter ? filter.value : []);
  let selectionPred = groupBySelected
    ? (a) => !selectedSet.has(a.value)
    : T

  // first sort by specified column
  let sortedDist = distribution.slice().sort(function compare(a, b) {
    let order =
      // if a and b are equal, fall back to comparing `value`
      columnKey === 'value' || a[columnKey] === b[columnKey]
        ? compareDistributionValues(a.value, b.value)
        : a[columnKey] > b[columnKey] ? 1 : -1;
    return direction === 'desc' ? -order : order;
  });

  // then perform secondary sort based on filtered count and selection
  return sortBy(sortedDist, [ filteredCountIsZero, selectionPred ])
}

function sortMultiFieldSummary(summaries, ontology, sort) {
  if (sort == null) return summaries;
  const fields = new Map(ontology.map(o => [o.term, o]));
  const sortedSummaries = sortBy(summaries, entry => sort.columnKey === 'display'
    ? fields.get(entry.term).display
    : entry[sort.columnKey]
  );
  return sort.direction === 'asc' ? sortedSummaries : reverse(sortedSummaries);
}
