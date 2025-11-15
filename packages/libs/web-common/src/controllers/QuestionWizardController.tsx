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
import { RootState } from '@veupathdb/wdk-client/lib/Core/State/Types';
import {
  Question,
  Parameter,
  ParameterGroup,
  RecordClass,
} from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { ParameterValues } from '@veupathdb/wdk-client/lib/Utils/WdkUser';
import { Dispatch } from 'redux';
import WdkService from '@veupathdb/wdk-client/lib/Core/WdkService';

type SubmissionMetadata =
  | { type: 'create-strategy' }
  | {
      type: 'add-binary-step';
      strategyId: number;
      addType: string;
      operatorSearchName: string;
    }
  | { type: 'add-unary-step'; strategyId: number; addType: string }
  | { type: 'submit-custom-form'; stepId: number }
  | {
      type: 'edit-step';
      strategyId: number;
      stepId: number;
      previousSearchConfig: { parameters: ParameterValues };
    };

interface FilterPopupState {
  visible: boolean;
  pinned: boolean;
}

interface GroupUIState {
  isVisible: boolean;
  filteredCountState: unknown;
}

interface QuestionState {
  questionStatus?: string;
  question?: Question;
  paramValues?: ParameterValues;
  defaultParamValues?: ParameterValues;
  groupUIState?: Record<string, GroupUIState>;
  paramUIState?: unknown;
}

interface OperatorQuestionState {
  questionStatus?: string;
  paramValues?: ParameterValues;
}

interface QuestionWizardControllerState {
  filterPopupState: FilterPopupState;
  updatingParamName: string | undefined;
  submitting: boolean | undefined;
  customName: string;
  error?: Error;
}

interface OwnProps {
  searchName: string;
  recordClassName: string;
  submissionMetadata: SubmissionMetadata;
  initialParamData?: ParameterValues;
  autoRun?: boolean;
  shouldChangeDocumentTitle?: boolean;
  submitButtonText?: string;
}

interface StateProps {
  wdkService: WdkService;
  recordClasses: RecordClass[] | undefined;
  questionStatus?: string;
  question?: Question;
  paramValues?: ParameterValues;
  defaultParamValues?: ParameterValues;
  groupUIState?: Record<string, GroupUIState>;
  paramUIState?: unknown;
  operatorQuestionState?: OperatorQuestionState;
}

interface DispatchProps {
  dispatch: Dispatch;
}

type QuestionWizardControllerProps = OwnProps & StateProps & DispatchProps;

interface WizardEventHandlers {
  onSelectGroup: (activeGroupIx: number) => void;
  onFilterPopupVisibilityChange: (show: boolean) => void;
  onFilterPopupPinned: (pinned: boolean) => void;
  onParamValuesReset: () => void;
  onSubmit: () => void;
}

interface ParameterEventHandlers {
  onSelectFilterParamField: (
    activeGroupIx: number,
    parameter: Parameter,
    field: { term: string }
  ) => void;
  onParamValueChange: (
    parameter: Parameter,
    paramValue: string,
    callback?: () => void
  ) => void;
}

/**
 * Controller for question wizard
 */
class QuestionWizardController extends ViewController<
  QuestionWizardControllerProps,
  QuestionWizardControllerState
> {
  wizardEventHandlers: WizardEventHandlers;
  parameterEventHandlers: ParameterEventHandlers;

  constructor(props: QuestionWizardControllerProps) {
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
    ) as WizardEventHandlers;
    this.parameterEventHandlers = mapValues(
      this.getParameterEventHandlers(),
      (handler) => handler.bind(this)
    ) as ParameterEventHandlers;

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

    if (recordClass && question) {
      document.title = `Search for ${recordClass.displayName} by ${question.displayName}`;
    }

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
  onSelectGroup(activeGroupIx: number) {
    const prevActiveGroupIx = this._activeGroupIx();

    if (!this.props.question) return;

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

  onSelectFilterParamField(
    activeGroupIx: number,
    parameter: Parameter,
    field: { term: string }
  ) {
    this.onSelectGroup(activeGroupIx);

    if (!this.props.paramValues) return;

    this.props.dispatch(
      setActiveField({
        searchName: this.props.searchName,
        parameter,
        paramValues: this.props.paramValues,
        activeField: field.term,
      })
    );
  }

  onParamValueChange(
    parameter: Parameter,
    paramValue: string,
    callback?: () => void
  ) {
    /*
     * Mark in the state that new parameter is expected
     * It is set back to null when props change with the new value.
     */
    if (!this.props.paramValues) return;

    const currentValue = this.props.paramValues[parameter.name];
    const updatingParamName =
      paramValue !== currentValue ? parameter.name : undefined;

    this.setState({ updatingParamName }, () => {
      if (!this.props.paramValues) return;

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
  onFilterPopupVisibilityChange(show: boolean) {
    this.setState((state) => setFilterPopupVisiblity(state, show));
  }

  /**
   * Set filter popup stickyness
   */
  onFilterPopupPinned(pinned: boolean) {
    this.setState((state) => setFilterPopupPinned(state, pinned));
  }

  /**
   * Set all params to default values, then update group counts and ontology term summaries
   */
  onParamValuesReset() {
    if (
      !this.props.question ||
      !this.props.paramValues ||
      !this.props.defaultParamValues
    )
      return;

    this._resetParameters(
      this.props.question.parameters
        .filter((parameter) => parameter.isVisible)
        .filter(
          (parameter) =>
            this.props.paramValues![parameter.name] !==
            this.props.defaultParamValues![parameter.name]
        )
    );
  }

  _resetParameters(parameters: Parameter[]) {
    if (parameters.length === 0 || !this.props.defaultParamValues) {
      return;
    }
    const [parameter, ...otherParameters] = parameters;
    this.onParamValueChange(
      parameter,
      this.props.defaultParamValues[parameter.name],
      () => {
        this._resetParameters(otherParameters);
      }
    );
  }

  setCustomName(newCustomName: string) {
    this.setState({ customName: newCustomName });
  }

  onSubmit() {
    this.props.dispatch(async ({ wdkService }: { wdkService: WdkService }) => {
      try {
        this.setState({ submitting: true });
        const { submissionMetadata } = this.props;

        const customName =
          this.state.customName ||
          (this.props.question?.shortDisplayName ?? '');

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
              parameters: this.props.paramValues!,
            }
          );
        }

        // Each case below requires a new step to be created...
        const searchSpec = {
          searchName: this.props.searchName,
          searchConfig: {
            parameters: this.props.paramValues!,
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
          const operatorParamValues = operatorQuestionState.paramValues!;
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
          `Unknown submissionMetadata type: "${
            (submissionMetadata as SubmissionMetadata).type
          }"`
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

  async componentDidUpdate(prevProps: QuestionWizardControllerProps) {
    if (prevProps.searchName !== this.props.searchName) {
      this.loadQuestion();
    }
    if (
      prevProps.questionStatus !== 'complete' &&
      this.props.questionStatus === 'complete'
    ) {
      this.componentStateFromLoadedQuestion();
    }
    /*
    This only isn't a bug because we only set updatingParamName to non-null when updating to a different value
    */
    if (
      this.state.updatingParamName &&
      this.props.paramValues &&
      prevProps.paramValues &&
      prevProps.paramValues[this.state.updatingParamName] !==
        this.props.paramValues[this.state.updatingParamName]
    ) {
      this.setState({ updatingParamName: undefined });
    }
  }

  _activeGroupIx(): number {
    if (!this.props.question || !this.props.groupUIState) return -1;

    return this.props.question.groups
      .map((group) => this.props.groupUIState![group.name].isVisible)
      .lastIndexOf(true);
  }

  renderView() {
    const recordClass =
      this.props.recordClasses &&
      this.props.recordClasses.find(
        ({ urlSegment }) => urlSegment === this.props.recordClassName
      );
    const activeGroupIx = this._activeGroupIx();

    if (
      !this.props.question ||
      !this.props.paramValues ||
      !this.props.defaultParamValues ||
      !this.props.groupUIState ||
      !this.props.paramUIState
    ) {
      return null;
    }

    return (
      <React.Fragment>
        {this.state.error && (
          <Dialog
            open
            modal
            title="An error occurred"
            onClose={() => this.setState({ error: undefined })}
          >
            {Seq.from(this.state.error.stack?.split('\n') ?? []).flatMap(
              (line) => [line, <br key={line} />]
            )}
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
            showHelpText={this.props.submissionMetadata.type !== 'edit-step'}
            dispatch={this.props.dispatch}
          />
        )}
      </React.Fragment>
    );
  }
}

function mapStateToPropsPrevious(state: RootState, props: OwnProps) {
  const { submissionMetadata } = props;
  if (submissionMetadata.type === 'add-binary-step') {
    const operatorQuestionState =
      state.question.questions[submissionMetadata.operatorSearchName];
    return { operatorQuestionState };
  }
  return {};
}

function getQuestion(state: RootState, props: OwnProps): QuestionState {
  const { searchName } = props;
  const q = state.question.questions[searchName];
  return q || {};
}

const enhance = connect(
  (state: RootState, props: OwnProps): StateProps =>
    Object.assign(
      {},
      mapStateToPropsPrevious(state, props),
      {
        wdkService: (window as any).ebrc.context.wdkService,
        recordClasses: state.globalData.recordClasses,
      },
      getQuestion(state, props)
    ),
  (dispatch: Dispatch): DispatchProps => ({ dispatch }),
  (
    stateProps: StateProps,
    dispatchProps: DispatchProps,
    ownProps: OwnProps
  ): QuestionWizardControllerProps => ({
    ...stateProps,
    ...dispatchProps,
    ...ownProps,
  })
);

export default enhance(wrappable(QuestionWizardController as any));
