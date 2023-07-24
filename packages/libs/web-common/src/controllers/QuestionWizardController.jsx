import { mapValues, pick } from 'lodash';
import React from 'react';
import { connect } from 'react-redux';
import { setActiveField } from '@veupathdb/wdk-client/lib/Actions/FilterParamActions';
import {
  changeGroupVisibility,
  updateActiveQuestion,
  updateParamValue,
} from '@veupathdb/wdk-client/lib/Actions/QuestionActions';
import * as RouterActions from '@veupathdb/wdk-client/lib/Actions/RouterActions';
import * as StrategyActions from '@veupathdb/wdk-client/lib/Actions/StrategyActions';
import { Dialog, LoadingOverlay } from '@veupathdb/wdk-client/lib/Components';
import { ViewController } from '@veupathdb/wdk-client/lib/Controllers';
import {
  DEFAULT_STEP_WEIGHT,
  DEFAULT_STRATEGY_NAME,
} from '@veupathdb/wdk-client/lib/StoreModules/QuestionStoreModule';
import { wrappable } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { Seq } from '@veupathdb/wdk-client/lib/Utils/IterableUtils';
import { addStep } from '@veupathdb/wdk-client/lib/Utils/StrategyUtils';
import QuestionWizard from '../components/QuestionWizard';
import {
  constructParameterGroupUIs,
  setFilterPopupPinned,
  setFilterPopupVisiblity,
} from '../util/QuestionWizardState';

//  type State = {
//    activeGroup: Group;
//    groupUIState: Record<string, {
//      valid?: boolean;
//      loading?: boolean;
//      accumulatedTotal?: boolean;
//    }>;
//  }

/**
 * Controller for question wizard
 */
class QuestionWizardController extends ViewController {
  constructor(props) {
    super(props);
    this.state = {
      filterPopupState: {
        visible: false,
        pinned: false,
      },
      updatingParamName: undefined,
      submitting: undefined,
      customName: '',
    };
    this.wizardEventHandlers = mapValues(
      this.getWizardEventHandlers(),
      (handler) => handler.bind(this)
    );
    this.parameterEventHandlers = mapValues(
      this.getParameterEventHandlers(),
      (handler) => handler.bind(this)
    );

    this._activeGroupIx = this._activeGroupIx.bind(this);
    this._resetParameters = this._resetParameters.bind(this);
    this.onSelectFilterParamField = this.onSelectFilterParamField.bind(this);

    this.setCustomName = this.setCustomName.bind(this);
    this.componentStateFromLoadedQuestion =
      this.componentStateFromLoadedQuestion.bind(this);
  }

  getWizardEventHandlers() {
    return pick(this, [
      'onSelectGroup',
      'onFilterPopupVisibilityChange',
      'onFilterPopupPinned',
      'onParamValuesReset',
      'onSubmit',
    ]);
  }

  getParameterEventHandlers() {
    return pick(this, ['onSelectFilterParamField', 'onParamValueChange']);
  }

  loadQuestion() {
    const {
      dispatch,
      submissionMetadata,
      searchName,
      initialParamData,
      autoRun,
    } = this.props;

    const stepId =
      submissionMetadata.type === 'edit-step' ||
      submissionMetadata.type === 'submit-custom-form'
        ? submissionMetadata.stepId
        : undefined;

    dispatch(
      updateActiveQuestion({
        searchName,
        autoRun,
        initialParamData:
          autoRun && initialParamData == null ? {} : initialParamData,
        prepopulateWithLastParamValues: false,
        stepId,
      })
    );
  }
  async componentStateFromLoadedQuestion() {
    const {
      question,
      submissionMetadata,
      recordClassName,
      recordClasses,
      wdkService,
    } = this.props;

    const stepId =
      submissionMetadata.type === 'edit-step' ||
      submissionMetadata.type === 'submit-custom-form'
        ? submissionMetadata.stepId
        : undefined;

    if (stepId) {
      const step = await wdkService.findStep(submissionMetadata.stepId);
      if (step.customName) {
        this.setState({ customName: step.customName });
      }
    }

    const recordClass =
      recordClasses &&
      recordClasses.find(({ urlSegment }) => urlSegment === recordClassName);

    document.title = `Search for ${recordClass.displayName} by ${question.displayName}`;

    this.props.dispatch(
      changeGroupVisibility({
        searchName: this.props.searchName,
        groupName: '__total__',
        isVisible: true,
      })
    );
    this.onSelectGroup(0);
  }
  // Top level action creator methods
  // --------------------------------

  /**
   * Update selected group and its count.
   * Active group, and everything to the left, is "visible" for the purpose of maintaining the counts
   */
  onSelectGroup(activeGroupIx) {
    const prevActiveGroupIx = this._activeGroupIx();

    if (prevActiveGroupIx < activeGroupIx) {
      this.props.question.groups
        .slice(prevActiveGroupIx + 1, activeGroupIx + 1)
        .forEach((group) => {
          this.props.dispatch(
            changeGroupVisibility({
              searchName: this.props.searchName,
              groupName: group.name,
              isVisible: true,
            })
          );
        });
    } else if (prevActiveGroupIx > activeGroupIx) {
      this.props.question.groups
        .slice(activeGroupIx + 1, prevActiveGroupIx + 1)
        .forEach((group) => {
          this.props.dispatch(
            changeGroupVisibility({
              searchName: this.props.searchName,
              groupName: group.name,
              isVisible: false,
            })
          );
        });
    } else {
      return;
    }
  }

  onSelectFilterParamField(activeGroupIx, parameter, field) {
    this.onSelectGroup(activeGroupIx);

    this.props.dispatch(
      setActiveField({
        searchName: this.props.searchName,
        parameter,
        paramValues: this.props.paramValues,
        activeField: field.term,
      })
    );
  }

  onParamValueChange(parameter, paramValue, callback) {
    /*
     * Mark in the state that new parameter is expected
     * It is set back to null when props change with the new value.
     */
    const currentValue = this.props.paramValues[parameter.name];
    const updatingParamName =
      paramValue != currentValue ? parameter.name : null;

    this.setState({ updatingParamName }, () => {
      this.props.dispatch(
        updateParamValue({
          searchName: this.props.searchName,
          paramValues: this.props.paramValues,
          parameter,
          paramValue,
        })
      );
      if (callback) {
        callback();
      }
    });
  }

  /**
   * Set filter popup visiblity
   */
  onFilterPopupVisibilityChange(show) {
    this.setState((state) => setFilterPopupVisiblity(state, show));
  }

  /**
   * Set filter popup stickyness
   */
  onFilterPopupPinned(pinned) {
    this.setState((state) => setFilterPopupPinned(state, pinned));
  }

  /**
   * Set all params to default values, then update group counts and ontology term summaries
   */
  onParamValuesReset() {
    this._resetParameters(
      this.props.question.parameters
        .filter((parameter) => parameter.isVisible)
        .filter(
          (parameter) =>
            this.props.paramValues[parameter.name] !=
            this.props.defaultParamValues[parameter.name]
        )
    );
  }

  _resetParameters(parameters) {
    if (parameters.length === 0) {
      return;
    }
    let [parameter, ...otherParameters] = parameters;
    this.onParamValueChange(
      parameter,
      this.props.defaultParamValues[parameter.name],
      () => {
        this._resetParameters(otherParameters);
      }
    );
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

        const customName =
          this.state.customName || this.props.question.shortDisplayName;

        if (submissionMetadata.type === 'edit-step') {
          // update step's customName and searchConfig
          return StrategyActions.requestReviseStep(
            submissionMetadata.strategyId,
            submissionMetadata.stepId,
            {
              customName,
            },
            {
              ...submissionMetadata.previousSearchConfig,
              parameters: this.props.paramValues,
            }
          );
        }

        // Each case below requires a new step to be created...
        const searchSpec = {
          searchName: this.props.searchName,
          searchConfig: {
            parameters: this.props.paramValues,
            wdkWeight: DEFAULT_STEP_WEIGHT,
          },
          customName,
        };

        const stepResponse = await wdkService.createStep(searchSpec);

        if (submissionMetadata.type === 'create-strategy') {
          // create a new step, then new strategy, then go to the strategy panel
          const strategyReponse = await wdkService.createStrategy({
            isSaved: false,
            isPublic: false,
            stepTree: { stepId: stepResponse.id },
            name: DEFAULT_STRATEGY_NAME,
          });
          return [
            StrategyActions.fulfillCreateStrategy(
              strategyReponse.id,
              Date.now()
            ),
            RouterActions.transitionToInternalPage(
              `/workspace/strategies/${strategyReponse.id}/${stepResponse.id}`
            ),
          ];
        }

        if (submissionMetadata.type === 'add-binary-step') {
          // create steps and patch strategy's stepTree
          const strategy = await wdkService.getStrategy(
            submissionMetadata.strategyId
          );
          const { operatorQuestionState } = this.props;
          if (
            operatorQuestionState == null ||
            operatorQuestionState.questionStatus !== 'complete'
          ) {
            throw new Error(
              `Tried to create an operator step using a nonexistent or unloaded question: ${submissionMetadata.operatorSearchName}`
            );
          }
          const operatorParamValues = operatorQuestionState.paramValues;
          const operatorStepResponse = await wdkService.createStep({
            searchName: submissionMetadata.operatorSearchName,
            searchConfig: {
              parameters: operatorParamValues,
            },
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
          const strategy = await wdkService.getStrategy(
            submissionMetadata.strategyId
          );
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

        throw new Error(
          `Unknown submissionMetadata type: "${submissionMetadata.type}"`
        );
      } catch (error) {
        this.setState({ submitting: false });
        throw error;
      }
    });
  }

  isRenderDataLoaded() {
    return this.props.questionStatus === 'complete' && this.props.paramValues;
  }

  isRenderDataLoadError() {
    return this.props.question == null && this.state.error != null;
  }

  componentDidMount() {
    this.loadQuestion();
  }

  async componentDidUpdate(prevProps) {
    if (prevProps.searchName !== this.props.searchName) {
      this.loadQuestion();
    }
    if (
      prevProps.questionStatus !== 'complete' &&
      this.props.questionStatus == 'complete'
    ) {
      this.componentStateFromLoadedQuestion();
    }
    /*
    This only isn't a bug because we only set updatingParamName to non-null when updating to a different value
    */
    if (
      this.state.updatingParamName &&
      prevProps.paramValues[this.state.updatingParamName] !==
        this.props.paramValues[this.state.updatingParamName]
    ) {
      this.setState({ updatingParamName: null });
    }
  }

  _activeGroupIx() {
    return this.props.question.groups
      .map((group) => this.props.groupUIState[group.name].isVisible)
      .lastIndexOf(true);
  }

  renderView() {
    const recordClass =
      this.props.recordClasses &&
      this.props.recordClasses.find(
        ({ urlSegment }) => urlSegment === this.props.recordClassName
      );
    const activeGroupIx = this._activeGroupIx();

    return (
      <React.Fragment>
        {this.state.error && (
          <Dialog
            open
            modal
            title="An error occurred"
            onClose={() => this.setState({ error: undefined })}
          >
            {Seq.from(this.state.error.stack.split('\n')).flatMap((line) => [
              line,
              <br />,
            ])}
          </Dialog>
        )}
        {this.state.submitting && (
          <LoadingOverlay>Running search...</LoadingOverlay>
        )}
        {this.props.question && (
          <QuestionWizard
            searchName={this.props.searchName}
            recordClassName={this.props.recordClassName}
            wizardState={{
              activeGroupIx,
              defaultParamValues: this.props.defaultParamValues,
              filterPopupState: this.state.filterPopupState,
              parameterGroupUIs: constructParameterGroupUIs(
                this.props.question,
                this.props.paramValues,
                this.props.defaultParamValues,
                this.props.groupUIState,
                activeGroupIx
              ),
              initialCount:
                this.props.groupUIState['__total__'].filteredCountState,
              paramUIState: this.props.paramUIState,
              paramValues: this.props.paramValues,
              question: this.props.question,
              recordClass,
              updatingParamName: this.state.updatingParamName,
            }}
            wizardEventHandlers={this.wizardEventHandlers}
            parameterEventHandlers={this.parameterEventHandlers}
            customName={this.state.customName}
            setCustomName={this.setCustomName}
            isAddingStep={this.props.submissionMetadata.type.startsWith('add-')}
            showHelpText={!this.props.submissionMetadata.type === 'edit-step'}
            dispatch={this.props.dispatch}
          />
        )}
      </React.Fragment>
    );
  }
}

function mapStateToPropsPrevious(state, props) {
  const { submissionMetadata } = props;
  if (submissionMetadata.type === 'add-binary-step') {
    const operatorQuestionState =
      state.question.questions[submissionMetadata.operatorSearchName];
    return { operatorQuestionState };
  }
  return {};
}
function getQuestion(state, props) {
  const { searchName } = props;
  const q = state.question.questions[searchName];
  /*
   * Triggers this error, I don't know how to get rid of it:
   * webapp/wdkCustomization/js/client/plugins/QuestionWizardPlugin.tsx:16:7 - error TS2322: Type '{ searchName: string; recordClassName: string; submissionMetadata: SubmissionMetadata; shouldChangeDocumentTitle: boolean | undefined; submitButtonText: string | undefined; }' is not assignable to type 'IntrinsicAttributes & Pick<any, never>'.
  Property 'searchName' does not exist on type 'IntrinsicAttributes & Pick<any, never>'.

16       searchName={props.searchName}
         ~~~~~~~~~~

*/
  return q || {};
}
const enhance = connect(
  (state, props) =>
    Object.assign(
      {},
      mapStateToPropsPrevious(state, props),
      {
        wdkService: window.ebrc.context.wdkService,
        recordClasses: state.globalData.recordClasses,
      },
      getQuestion(state, props)
    ),
  (dispatch) => ({ dispatch }),
  (stateProps, dispatchProps, ownProps) => ({
    ...stateProps,
    ...dispatchProps,
    ...ownProps,
  })
);
export default enhance(wrappable(QuestionWizardController));
