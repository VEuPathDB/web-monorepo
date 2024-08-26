import { every } from 'lodash';
import React from 'react';
import { Seq } from '@veupathdb/wdk-client/lib/Utils/IterableUtils';
import { Dialog, IconAlt as Icon } from '@veupathdb/wdk-client/lib/Components';
import { wrappable } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

import { makeQuestionWizardClassName as makeClassName } from '../util/classNames';

import FilterSummaryGroup from './FilterSummaryGroup';

import {
  QuestionWithParameters,
  Parameter,
  ParameterGroup,
  ParameterValue,
  ParameterValues,
} from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { FilterField } from '@veupathdb/wdk-client/lib/Components/AttributeFilter/Types';

type Props = {
  isVisible: boolean;
  isPinned: boolean;
  setVisible: (visible: boolean) => any;
  setPinned: (pinned: boolean) => any;
  children?: React.ReactNode;
};

class FilterSummaryDialog extends React.Component<Props> {
  render() {
    const props = this.props;
    return (
      <Dialog
        resizable
        draggable
        className={makeClassName('FilterSummary')}
        open={props.isVisible}
        title="Active Filters"
        buttons={[
          <button
            key="pin"
            type="button"
            title="Prevent summary popup from closing when clicking on filters."
            className={makeClassName('FilterPopupTitleButton')}
            onClick={() => props.setPinned(!props.isPinned)}
          >
            <Icon fa={props.isPinned ? 'circle' : 'thumb-tack'} />
          </button>,
          <button
            type="button"
            key="close"
            className={makeClassName('FilterPopupTitleButton')}
            onClick={() => props.setVisible(false)}
          >
            <Icon fa="close" />
          </button>,
        ]}
      >
        <div>{this.props.children}</div>
      </Dialog>
    );
  }
}

export default wrappable(FilterSummaryDialog);
