import { compose } from 'lodash/fp';
import { connect } from 'react-redux';
import React from 'react';

import {
  getIdFromRecordClassName,
  isStudyRecordClass,
  Action
} from 'ebrc-client/App/DataRestriction/DataRestrictionUtils';
import { attemptAction } from 'ebrc-client/App/DataRestriction/DataRestrictionActionCreators';

import RelativeVisitsGroup from '../components/RelativeVisitsGroup';

import QuestionWizardController from '../controllers/QuestionWizardController';

import ActiveGroup from './ActiveGroup';
import RecordHeading from './RecordHeading';
import RecordTable from './RecordTable';
import QuestionWizard from './QuestionWizard';
import RelatedCaseControlGroup from '../components/RelatedCaseControlGroup';
import SiteHeader from './SiteHeader';
import IndexController from './IndexController';

export default {

  IndexController,
  SiteHeader,

  // Related visits/case-control wizard steps
  ActiveGroup,
  FilterSummaryGroup: compose(
    guard(RelativeVisitsGroup.showFilterSummary),
    guard(RelatedCaseControlGroup.showFilterSummary)
  ),

  QuestionWizard,
  QuestionWizardController,
  DownloadFormController: withRestrictionHandler(Action.downloadPage, state => state.downloadForm.recordClass),
  RecordController: withRestrictionHandler(Action.recordPage, state => state.record.recordClass),
  RecordHeading,
  RecordTable,
}

function guard(propsPredicate) {
  return function makeGuardedComponent(Component) {
    return function GuardedComponent(props) {
      return propsPredicate(props)
        ? <Component {...props} />
        : null;
    }
  }
}

function withRestrictionHandler(action, getRecordClassSelector) {
  const enhance = connect(
    state => ({ recordClass: getRecordClassSelector(state) }),
    { attemptAction },
    (stateProps, dispatchProps, childProps) => ({ stateProps, dispatchProps, childProps })
  )
  return Child => enhance(class RestrictionHandler extends React.Component {
    componentDidUpdate(prevProps) {
      if (!isStudyRecordClass(this.props.stateProps.recordClass)) return;

      if (this.props.stateProps.recordClass !== prevProps.stateProps.recordClass) {
        const studyId = getIdFromRecordClassName(this.props.stateProps.recordClass.name);
        this.props.dispatchProps.attemptAction(action, { studyId });
      }
    }
    render() {
      return <Child {...this.props.childProps}/>
    }
  });
}
