import { isNull, negate } from 'lodash';
import React from 'react';
import { Seq } from '@veupathdb/wdk-client/lib/Utils/IterableUtils';
import {
  Dialog,
  IconAlt as Icon
} from '@veupathdb/wdk-client/lib/Components';
import { wrappable } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

import { makeQuestionWizardClassName as makeClassName } from '../util/classNames';

import FilterSummaryGroup from './FilterSummaryGroup';

/**
 * Show a summary of active filters
 */
class FilterSummary extends React.Component {
  render () {
    const { wizardState, wizardEventHandlers } = this.props;

    const filterSummary = Seq.from(wizardState.question.groups)
      .map(group => (
        <FilterSummaryGroup key={group.name} group={group} {...this.props}/>
      ))
      .filter(negate(isNull));

    return (
      <Dialog
        resizable
        draggable
        className={makeClassName('FilterSummary')}
        open={wizardState.filterPopupState.visible}
        title="Active Filters"
        buttons={[
          <button
            key="pin"
            type="button"
            title="Prevent summary popup from closing when clicking on filters."
            className={makeClassName('FilterPopupTitleButton')}
            onClick={() => wizardEventHandlers.onFilterPopupPinned(!wizardState.filterPopupState.pinned)}
          >
            <Icon fa={wizardState.filterPopupState.pinned ? 'circle' : 'thumb-tack'} />
          </button>,
          <button
            type="button"
            key="close"
            className={makeClassName('FilterPopupTitleButton')}
            onClick={() => wizardEventHandlers.onFilterPopupVisibilityChange(false)}
          >
            <Icon fa="close"/>
          </button>
        ]}
      >
        <div>
          {filterSummary.isEmpty() ? (
            <p>No filters applied</p>
          ) : (
            filterSummary
          )}
          <div className={makeClassName('FilterSummaryRemoveAll')}>
            <button type="button" className="wdk-Link" onClick={() => wizardEventHandlers.onParamValuesReset()}>
              Remove all
            </button>
          </div>
        </div>
      </Dialog>
    );
  }
}

export default wrappable(FilterSummary);
