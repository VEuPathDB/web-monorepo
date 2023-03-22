import React from 'react';
import PropTypes from 'prop-types';
import { result, zip, memoize, every } from 'lodash';
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

import FilterFinder from './FilterFinder';
import FilterSummaryGroup from './FilterSummaryGroup';
import FilterSummaryDialog from './FilterSummaryDialog';
import { QuestionWizardProps } from '../util/WizardTypes';
import { 
  QuestionWithParameters,
  ParameterGroup,
  Parameter,
  ParameterValue
} from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import {
  FilteredCountState
} from '@veupathdb/wdk-client/lib/StoreModules/QuestionStoreModule'
import { FilterField } from '@veupathdb/wdk-client/lib/Components/AttributeFilter/Types';

const getParamMap = memoize((question: QuestionWithParameters) => new Map(question.parameters.map(p => [p.name, p])));
/**
 * QuestionWizard component
 */
function QuestionWizard(props : QuestionWizardProps) {
  const parametersByName = getParamMap(props.wizardState.question);

  const valuesDefaultInAllGroups = every(props.wizardState.parameterGroupUIs.map(group => group.allValuesDefault));
  return (
    <div className={makeClassName()}>
      <div className={makeClassName('HeadingContainer')}>
        <h1 className={makeClassName('Heading')}>
          {props.wizardState.question.displayName} &nbsp;
          {valuesDefaultInAllGroups ? null : (
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
        <FilterSummaryDialog
          isVisible={props.wizardState.filterPopupState.visible}
          isPinned={props.wizardState.filterPopupState.pinned}
          setVisible={props.wizardEventHandlers.onFilterPopupVisibilityChange}
          setPinned={props.wizardEventHandlers.onFilterPopupPinned}
         >
          { valuesDefaultInAllGroups ? (
            <p>No filters applied</p>
          ) : (
            props.wizardState.parameterGroupUIs.map((group,ix) => (
              group.allValuesDefault ? null : <FilterSummaryGroup
                key={group.name}
                wizardState={props.wizardState}
                groupDisplayName={group.displayName}
                groupParameters={group.parameters.map(paramName => parametersByName.get(paramName) as Parameter)}
                paramValues={props.wizardState.paramValues}
                defaultParamValues={props.wizardState.defaultParamValues}
                onParamValueChange={props.parameterEventHandlers.onParamValueChange}
                onSelectGroup={() => {
									props.wizardEventHandlers.onSelectGroup(ix);
									if (!props.wizardState.filterPopupState.pinned) {
										props.wizardEventHandlers.onFilterPopupVisibilityChange(false);
									}
								}}
                onSelectFilterParamField={(parameter: Parameter, field: FilterField) => {
									props.wizardEventHandlers.onSelectGroup(ix);
									if (!props.wizardState.filterPopupState.pinned) {
										props.wizardEventHandlers.onFilterPopupVisibilityChange(false);
									}
                  props.parameterEventHandlers.onSelectFilterParamField(ix, parameter, field);
                }}
                />
              ))
            )
           }
						<div className={makeClassName('FilterSummaryRemoveAll')}>
							<button type="button" className="wdk-Link" onClick={props.wizardEventHandlers.onParamValuesReset}>
								Remove all
							</button>
						</div>
        </FilterSummaryDialog>
        {props.additionalHeadingContent}
      </div>
      {props.questionSummary}
      <FilterFinder
         question={props.wizardState.question}
         onSelectGroup={props.wizardEventHandlers.onSelectGroup}
         onSelectFilterParamField={props.parameterEventHandlers.onSelectFilterParamField}/>
      <Navigation {...props} />
      {props.wizardState.activeGroupIx === -1 ? (
        <div className={makeClassName('ActiveGroupContainer')}>
          <p className={makeClassName('HelpText')}>
            {props.wizardState.question.summary}
          </p>
        </div>
      ) : (
        <ActiveGroup {...props} />
      )}
    </div>

  )
}

export default wrappable(QuestionWizard);


/**
 * GroupList component
 */
function Navigation(props: QuestionWizardProps) {
  const {
    wizardState: {
      updatingParamName,
      activeGroupIx,
      question,
      parameterGroupUIs,
      recordClass,
      initialCount
    },
    wizardEventHandlers: {
      onSelectGroup,
      onFilterPopupVisibilityChange,
      onSubmit
    },
    customName,
    setCustomName,
    showHelpText,
    isAddingStep
  } = props;

  const allValuesDefault = props.wizardState.parameterGroupUIs.filter(group =>
    group.allValuesDefault
  );
  const finalCountState = Seq.of(initialCount)
    .concat(
      Seq.from(parameterGroupUIs)
      .filter(groupState => groupState.filteredCountState !== 'initial')
      .map(groupState => groupState.filteredCountState))
    .last();

  // XXX We should probably have a separate component for RecordClassIcon to encapsulate this logic
  const iconName = question.iconName || recordClass.iconName || 'fa fa-database';

  const recordDisplayName = recordClass.shortDisplayNamePlural;

  return (
    <Sticky>
      {(o: {isFixed: boolean}) => (
          <div className={makeClassName('NavigationContainer', o.isFixed && 'fixed')}>
            <div className={makeClassName('NavigationIconContainer')}>
              <button
                type="button"
                title="See search overview"
                className={makeClassName('IconButton')}
                onClick={() => onSelectGroup(-1)}
              >
                <i className={makeClassName('Icon') + ' ' + iconName}/>
              </button>
            </div>
            <div className={makeClassName('ParamGroupSeparator')}>
              <div className={makeClassName('ParamGroupArrow')}/>
              <ParamGroupCount
                title={`All ${recordDisplayName}`}
                filteredCountState={initialCount}
                isActive={parameterGroupUIs[0].selectedInPanel}
              />
            </div>

            {parameterGroupUIs.map((group, ix) => (
						  <React.Fragment key={group.name}>
              <div
                key={group.name}
                className={makeClassName('ParamGroup', group.selectedInPanel && 'active')}
              >
                <button
                  type="button"
                  title={`Filter ${recordDisplayName} by ${group.displayName}`}
                  className={makeClassName(
                    'ParamGroupButton',
                    group.selectedInPanel && 'active'
                  )}
                  onClick={() => onSelectGroup(ix)}
                >
                  {group.displayName}
                </button>
                {group.allValuesDefault ? null : (
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
                {showHelpText && activeGroupIx === -1 && ix == 0 && (
                  <div className={makeClassName('GetStarted')}>
                    Click to get started. <em>(skipping ahead is ok)</em>
                  </div>
                )}
              </div>
              { ix !== parameterGroupUIs.length - 1 && (
              <div key={group.name + '__sep'} className={makeClassName('ParamGroupSeparator')}>
                <div className={makeClassName('ParamGroupArrow')}/>
                <ParamGroupCount
                  title={`${recordDisplayName} selected from previous steps.`}
                  filteredCountState={group.filteredCountState}
                  isActive={group.selectedInPanel || group.precedingTheGroupThatIsSelectedInPanel} 
                />
              </div>
              )}
              </React.Fragment>
             ))}
            <div className={makeClassName('SubmitContainer')}>
              <button
                type="button"
                disabled={updatingParamName != null}
                className={makeClassName('SubmitButton')}
                title="View the results of your search for further analysis."
                onClick={() => onSubmit()}
              >
                {
                  finalCountState === 'loading' ? <Loading radius={4} className={makeClassName('ParamGroupCountLoading')}/>
                 : (isAddingStep ? 'Combine' : 'View' ) + ' ' + fcsToEl(finalCountState) + (fcsToEl(finalCountState) ? ' ' : '') + recordDisplayName
               }
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
          </div>
      )}
    </Sticky>
  )
}


function fcsToEl(fcs: FilteredCountState){
  return (
    fcs === 'loading' ? <Loading radius={2} className={makeClassName('ParamGroupCountLoading')}/>
    : fcs === 'invalid' ? '?'
    : fcs === 'initial' ? ''
    : result(fcs, 'toLocaleString') as string
  );
}


/** Render count or loading */
function ParamGroupCount(props: {
  title: string,
  filteredCountState: FilteredCountState,
  isActive: boolean
}) {
  return (
    <div title={props.title}
      className={makeClassName(
        'ParamGroupCount',
        props.filteredCountState === 'invalid' && 'invalid',
        props.isActive && 'active'
      )}
    >
     {fcsToEl(props.filteredCountState) }
    </div>
  );
}

