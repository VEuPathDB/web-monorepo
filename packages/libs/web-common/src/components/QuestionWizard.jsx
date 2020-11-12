import React from 'react';
import PropTypes from 'prop-types';
import { result, zip } from 'lodash';
import ActiveGroup from './ActiveGroup';
import {
  IconAlt as Icon,
  Loading,
  Sticky,
  TextBox,
} from '@veupathdb/wdk-client/lib/Components';
import { wrappable } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { Seq } from '@veupathdb/wdk-client/lib/Utils/IterableUtils';
import { makeQuestionWizardClassName as makeClassName } from '../util/classNames';
import {
  groupParamsValuesAreDefault
} from '../util/QuestionWizardState';

import FilterFinder from './FilterFinder';
import FilterSummary from './FilterSummary';
import QuestionWizardPropTypes from './QuestionWizardPropTypes';

/**
 * QuestionWizard component
 */
function QuestionWizard(props) {
  const {
    question,
    activeGroup,
  } = props.wizardState;
  
  const {
    additionalHeadingContent = null
  } = props;

   const {
    questionSummary = null
  } = props;

  return (
    <div className={makeClassName()}>
      <div className={makeClassName('HeadingContainer')}>
        <h1 className={makeClassName('Heading')}>
          {question.displayName} &nbsp;
          {question.groups.some(groupName => !groupParamsValuesAreDefault(props.wizardState, groupName)) && (
            <button
              type="button"
              title="View a summary of active filters"
              className="wdk-Link"
              onClick={() => props.wizardEventHandlers.onFilterPopupVisibilityChange(!props.wizardState.filterPopupState.visible)}
            >
              <Icon fa="filter" className={makeClassName('GroupFilterIcon')}/>
            </button>
          )}
        </h1>
        <FilterSummary {...props} />
        {additionalHeadingContent}
      </div>
      {questionSummary}
      <FilterFinder {...props} />
      <Navigation {...props} />
      {activeGroup == null ? (
        <div className={makeClassName('ActiveGroupContainer')}>
          <p className={makeClassName('HelpText')}>
            {question.summary}
          </p>
        </div>
      ) : (
        <ActiveGroup {...props} />
      )}
    </div>

  )
}

QuestionWizard.propTypes = QuestionWizardPropTypes;

export default wrappable(QuestionWizard);


/**
 * GroupList component
 */
function Navigation(props) {
  const {
    wizardState: {
      updatingParamName,
      activeGroup,
      question,
      groupUIState,
      recordClass,
      initialCount
    },
    wizardEventHandlers: {
      onGroupSelect,
      onInvalidGroupCountsUpdate,
      onFilterPopupVisibilityChange,
      onSubmit
    },
    customName,
    setCustomName,
    showHelpText,
    isAddingStep
  } = props;
  const { groups } = question;
  const invalid = Object.values(groupUIState).some(uiState => uiState.valid === false && uiState.loading !== true);

  const finalCountState = Seq.of({ accumulatedTotal: initialCount })
    .concat(Seq.from(groups)
      .map(group => groupUIState[group.name])
      .filter(groupState => groupState.valid !== undefined))
    .last();

  // A Map from a group to its previous group
  const prevGroupMap = new Map(zip(groups.slice(1), groups.slice(0, -1)));

  // XXX We should probably have a separate component for RecordClassIcon to encapsulate this logic
  const iconName = question.iconName || recordClass.iconName || 'fa fa-database';

  const recordDisplayName = recordClass.shortDisplayNamePlural;

  return (
    <Sticky>
      {({isFixed}) => (
          <div className={makeClassName('NavigationContainer', isFixed && 'fixed')}>
            <div className={makeClassName('NavigationIconContainer')}>
              <button
                type="button"
                title="See search overview"
                className={makeClassName('IconButton')}
                onClick={() => onGroupSelect(null)}
              >
                <i className={makeClassName('Icon') + ' ' + iconName}/>
              </button>
            </div>
            <div className={makeClassName('ParamGroupSeparator')}>
              <div className={makeClassName('ParamGroupArrow')}/>
              <ParamGroupCount
                title={`All ${recordDisplayName}`}
                count={initialCount}
                isActive={activeGroup == groups[0]}
              />
            </div>

            {Seq.from(groups).flatMap(group => [(
              <div
                key={group.name}
                className={makeClassName('ParamGroup', group === activeGroup && 'active')}
              >
                <button
                  type="button"
                  title={`Filter ${recordDisplayName} by ${group.displayName}`}
                  className={makeClassName(
                    'ParamGroupButton',
                    group == activeGroup && 'active'
                  )}
                  onClick={() => onGroupSelect(group)}
                >
                  {group.displayName}
                </button>
                {groupParamsValuesAreDefault(props.wizardState, group) || (
                  <button
                    type="button"
                    title="View a summary of active filters"
                    className={makeClassName('GroupFilterIconButton') + ' wdk-Link'}
                    onClick={() => onFilterPopupVisibilityChange(!props.wizardState.filterPopupState.visible)}
                  >
                    <Icon
                      fa="filter"
                      className={makeClassName('GroupFilterIcon')}
                    />
                  </button>
                )}
                {showHelpText && activeGroup == null && group === groups[0] && (
                  <div className={makeClassName('GetStarted')}>
                    Click to get started. <em>(skipping ahead is ok)</em>
                  </div>
                )}
              </div>
            ), group !== groups[groups.length - 1] && (
              <div key={group.name + '__sep'} className={makeClassName('ParamGroupSeparator')}>
                <div className={makeClassName('ParamGroupArrow')}/>
                <ParamGroupCount
                  title={`${recordDisplayName} selected from previous steps.`}
                  count={groupUIState[group.name].accumulatedTotal}
                  isLoading={groupUIState[group.name].loading}
                  isValid={groupUIState[group.name].valid}
                  isActive={(group === activeGroup || group === prevGroupMap.get(activeGroup))}
                />
              </div>
            )])}
            <div className={makeClassName('SubmitContainer')}>
              <button
                type="button"
                disabled={updatingParamName != null}
                className={makeClassName('SubmitButton')}
                title="View the results of your search for further analysis."
                onClick={() => onSubmit()}
              >
                { finalCountState.accumulatedTotal == null || finalCountState.loading ? <Loading radius={4} className={makeClassName('ParamGroupCountLoading')}/>
                : finalCountState.valid === false ? `View ? ${recordDisplayName}`
                : `${isAddingStep ? 'Combine' : 'View'} ${result(finalCountState.accumulatedTotal, 'toLocaleString')} ${recordDisplayName}` }
              </button>
              {/*!isAddingStep && (
                <button
                  disabled={updatingParamName != null}
                  className={makeClassName('SubmitButton')}
                  title="Analyze the results of your search."
                  style={{width: '100%', marginTop: '.3em'}}
                  name="redirectPath"
                  value="/app/step/{stepId}/resultPanel?initialTab=stepAnalysis:menu"
                >Analyze results
                </button>
              )*/}
              <TextBox
                className={makeClassName('CustomNameInput')}
                value={customName || ''}
                onChange={setCustomName}
                type="text"
                name="customName"
                placeholder="Name this search"
              />
            </div>
            {invalid && (
              <div className={makeClassName('InvalidCounts')}>
                <button
                  type="button"
                  className="wdk-Link"
                  onClick={onInvalidGroupCountsUpdate}
                  title="Recompute invalid counts above"
                >
                  <Icon fa="refresh"/> Refresh counts
                </button>
              </div>
            )}
          </div>
      )}
    </Sticky>
  )
}

Navigation.propTypes = QuestionWizard.propTypes;

/** Render count or loading */
function ParamGroupCount(props) {
  return (
    <div title={props.title}
      className={makeClassName(
        'ParamGroupCount',
        props.isValid === false && 'invalid',
        props.isActive && 'active'
      )}
    >
      {props.isLoading === true ? (
        <Loading radius={2} className={makeClassName('ParamGroupCountLoading')}/>
      ) : (props.isValid === false ? '?' : result(props.count, 'toLocaleString'))}
    </div>
  )
}

ParamGroupCount.propTypes = {
  title: PropTypes.string,
  count: PropTypes.number,
  isValid: PropTypes.bool,
  isLoading: PropTypes.bool,
  isActive: PropTypes.bool
};
