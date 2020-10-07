import { compose } from 'lodash/fp';
import { connect, useSelector } from 'react-redux';
import React from 'react';

import { NotFoundController } from 'wdk-client/Controllers';
import { useWdkService } from 'wdk-client/Hooks/WdkServiceHook';
import { useSetDocumentTitle } from 'wdk-client/Utils/ComponentUtils';
import { Seq } from 'wdk-client/Utils/IterableUtils';

import {
  getIdFromRecordClassName,
  isStudyRecordClass,
  Action
} from 'ebrc-client/App/DataRestriction/DataRestrictionUtils';
import { attemptAction } from 'ebrc-client/App/DataRestriction/DataRestrictionActionCreators';
import { fetchStudies } from 'ebrc-client/App/Studies/StudyActionCreators';

import RelativeVisitsGroup from '../components/RelativeVisitsGroup';

import QuestionWizardController from '../controllers/QuestionWizardController';

import ActiveGroup from './ActiveGroup';
import RecordHeading from './RecordHeading';
import RecordTable from './RecordTable';
import QuestionWizard from './QuestionWizard';
import RelatedCaseControlGroup from '../components/RelatedCaseControlGroup';
import SiteHeader from './SiteHeader';
import IndexController from './IndexController';
import AnswerController from './AnswerController';
import ReporterSortMessage from './ReporterSortMessage';
import { SpecialContactUsInstructions } from './SpecialContactUsInstructions';


export default {
  ReporterSortMessage,
  AnswerController,
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
        .filter(question => question.urlSegment === props.questionName)
        .flatMap(question => Seq.from(recordClasses)
          .filter(recordClass => recordClass.urlSegment === question.outputRecordClassName))
        .first();
    }),
    QuestionWizardController
  ),
  DownloadFormController: compose(
    withRestrictionHandler(Action.downloadPage, state => state.downloadForm.recordClass),
    availableStudyGuard(
      downloadFormIsLoading,
      state => {
        const { recordClass, resultType } = state.downloadForm;

        if (
          downloadFormIsLoading(state) ||
          resultType == null ||
          resultType.type !== 'answerSpec'
        ) {
          return undefined;
        }

        const primaryKey = resultType.answerSpec.searchConfig.parameters.primaryKeys;

        return getStudyIdFromRecordClassAndPrimaryKey(
          recordClass,
          primaryKey
        );
      },
      StudyNotFoundPage
    )
  ),
  RecordController: compose(
    withRestrictionHandler(Action.recordPage, state => state.record.recordClass),
    availableStudyGuard(
      recordPageIsLoading,
      (state, props) => {
        const recordClass = state.record.recordClass;
        const primaryKey = props.ownProps.primaryKey;

        return getStudyIdFromRecordClassAndPrimaryKey(
          recordClass,
          primaryKey
        );
      },
      StudyNotFoundPage
    )
  ),
  // FIXME Add restricted results panel
  RecordHeading,
  RecordTable,
  ContactUsController: function(DefaultComponent) {
    const specialInstructions = <SpecialContactUsInstructions />;

    return () => <DefaultComponent specialInstructions={specialInstructions} />;
  }
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
          // document.body.style.overflow = 'hidden';
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

function availableStudyGuard(getRecordClassLoadingSelector, getStudyIdSelector, NotFound) {
  return function (DefaultComponent) {
    return function(props) {
      const studies = useWdkService(fetchStudies, []);

      const state = useSelector(state => state);

      const recordClassLoading = getRecordClassLoadingSelector(state, props);

      const targetId = getStudyIdSelector(state, props);

      const defaultElement = <DefaultComponent {...props} />;

      if (studies == null || recordClassLoading) {
        return (
          <div style={{ visibility: 'hidden' }}>
            {defaultElement}
          </div>
        );
      }

      const allValidStudies = studies[0];

      const studyIsAvailable = allValidStudies.some(
        ({ id, disabled }) => id === targetId && !disabled
      );

      return (
        targetId != null && !studyIsAvailable
          ? <NotFound />
          : <div>
              {defaultElement}
            </div>
      );
    }
  }
}

function StudyNotFoundPage() {
  useSetDocumentTitle('Page not found');

  return <NotFoundController />;
}

function getStudyIdFromRecordClassAndPrimaryKey(recordClass, primaryKey) {
  return recordClass == null
    ? undefined
    : recordClass.urlSegment === 'dataset'
    ? primaryKey
    : isStudyRecordClass(recordClass)
    ? getIdFromRecordClassName(recordClass.fullName)
    : undefined;
}

// TODO: Move to an appropriate utility directory/repo
function recordPageIsLoading(state) {
  return state.record.isLoading;
}

// TODO: Move to an appropriate utility directory/repo
// FIXME: The Download form redux should set "isLoading" to false
// FIXME: when an error occurs
function downloadFormIsLoading(state) {
  return state.downloadForm.isLoading && state.downloadForm.error;
}
