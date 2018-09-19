import { compose, constant } from 'lodash/fp';
import { connect } from 'react-redux';
import React from 'react';

import { getIdFromRecordClassName, Action } from 'Client/App/DataRestriction/DataRestrictionUtils';
import { attemptAction } from 'Client/App/DataRestriction/DataRestrictionActionCreators';

import RelativeVisitsGroup from '../components/RelativeVisitsGroup';
import SiteHeader from '../components/SiteHeader';

import IndexController from '../controllers/IndexController';
import QuestionWizardController from '../controllers/QuestionWizardController';

import ActiveGroup from './ActiveGroup';
import RecordHeading from './RecordHeading';
import RecordTable from './RecordTable';
import QuestionWizard from './QuestionWizard';
import RelatedCaseControlGroup from '../components/RelatedCaseControlGroup';

export default {
  ActiveGroup,
  DownloadFormController: withRestrictionHandler(Action.downloadPage, state => state.downloadForm.recordClass),
  FilterSummaryGroup: compose(
    guard(RelativeVisitsGroup.showFilterSummary),
    guard(RelatedCaseControlGroup.showFilterSummary)
  ),
  IndexController,
  QuestionWizard,
  QuestionWizardController,
  RecordController: withRestrictionHandler(Action.recordPage, state => state.record.recordClass),
  RecordHeading,
  RecordTable,
  SiteHeader: constant(SiteHeader),
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
