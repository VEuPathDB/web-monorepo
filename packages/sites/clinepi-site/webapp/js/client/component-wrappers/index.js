import { compose } from 'lodash/fp';
import { connect } from 'react-redux';
import React from 'react';
import { Seq } from 'wdk-client/IterableUtils';

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
  QuestionWizardController: compose(
    withRestrictionHandler(Action.search, (state, props) => {
      const { questions = [], recordClasses = [] } = state.globalData;
      return Seq.from(questions)
        .filter(question => question.fullName === props.questionName)
        .flatMap(question => Seq.from(recordClasses)
          .filter(recordClass => recordClass.fullName === question.recordClassName))
        .first();
    }),
    QuestionWizardController
  ),
  DownloadFormController: withRestrictionHandler(Action.downloadPage, state => state.downloadForm.recordClass),
  RecordController: withRestrictionHandler(Action.recordPage, state => state.record.recordClass),
  // FIXME Add restricted results panel
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
    (state, props) => ({ recordClass: getRecordClassSelector(state, props), dataRestriction: state.dataRestriction }),
    { attemptAction },
    (stateProps, dispatchProps, childProps) => ({ stateProps, dispatchProps, childProps })
  )
  return Child => enhance(class RestrictionHandler extends React.Component {
    constructor(props) {
      super(props);
      this.state = { allowed: null };
    }
    componentDidMount() {
      this.doAttemptAction();
    }
    componentDidUpdate(prevProps) {
      if (this.props.stateProps.recordClass == null) return;

      if (!isStudyRecordClass(this.props.stateProps.recordClass) && this.state.allowed == null) {
        this.setState({ allowed: true });
      }

      else if (this.props.stateProps.recordClass !== prevProps.stateProps.recordClass) {
        this.doAttemptAction();
      }
    }
    doAttemptAction() {
      if (this.props.stateProps.recordClass == null) return;

      const studyId = getIdFromRecordClassName(this.props.stateProps.recordClass.fullName);
      this.props.dispatchProps.attemptAction(action, {
        studyId,
        onDeny: () => {
          document.body.style.overflow = 'hidden';
          this.setState({ allowed: false })
        },
        onAllow: () => {
          this.setState({ allowed: true })
        }
      });
    }
    render() {
      const { allowed } = this.state
      const child = <Child {...this.props.childProps}/>;

      // always wrap child with a div to prevent child from being unmounted

      if (allowed == null) return (
        <div style={{visibility: 'hidden'}}>{child}</div>
      )

      if (allowed) return (
        <div>{child}</div>
      )

      return (
        <div
          style={{
            pointerEvents: 'none',
            filter: 'blur(6px)'
          }}
          onSubmit={stopEvent}
          onSelect={stopEvent}
          onClickCapture={stopEvent}
          onChangeCapture={stopEvent}
          onInputCapture={stopEvent}
          onFocusCapture={stopEvent}
          onKeyDownCapture={stopEvent}
          onKeyUpCapture={stopEvent}
          onKeyPressCapture={stopEvent}
        >
          {child}
        </div>
      );
    }
  });
}

function stopEvent(event) {
  event.stopPropagation();
  event.preventDefault();
}
