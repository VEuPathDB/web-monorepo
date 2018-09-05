import WdkStore, {BaseState} from "../../Core/State/Stores/WdkStore";
import {
  ErrorAction,
  InitializeAction,
  LoadingAction,
  SelectReporterAction,
  UiUpdateAction,
  UpdateAction
} from './DownloadFormActionCreators';
import WdkServiceJsonReporterForm from './WdkServiceJsonReporterForm';
import {UserPreferences, Step} from "../../Utils/WdkUser";
import {RecordClass, Question, Reporter} from "../../Utils/WdkModel";
import { ServiceError } from "../../Utils/WdkService";

export type State = BaseState & {
  step: Step,
  question: Question,
  recordClass: RecordClass,
  scope: string,
  availableReporters: Reporter[],
  isLoading: boolean,
  selectedReporter: string,
  formState: any,
  formUiState: any,
  error?: ServiceError
}

type Action = ErrorAction
            | InitializeAction
            | LoadingAction
            | SelectReporterAction
            | UiUpdateAction
            | UpdateAction;

export type SelectedReporter = {
  getInitialState(state: State): any
}

export default class DownloadFormStore extends WdkStore<State> {

  // defines the structure of this store's data
  getInitialState() {
    return Object.assign({

      // static data loaded automatically
      preferences: null,
      ontology: null,

      // 'static' data that should not change for the life of the page
      step: null,
      question: null,
      recordClass: null,
      scope: null,
      availableReporters: [],

      // 'dynamic' data that is updated with user actions
      isLoading: false,
      selectedReporter: null,
      formState: null,
      formUiState: null
    }, super.getInitialState());
  }

  // handleStaticDataItemAction(state: State, itemName: string, payload: any) {
  //   let newState = super.handleStaticDataItemAction(state, itemName, payload);
  //   return tryFormInit(this, newState);
  // }

  handleAction(state: State, action: Action) {

    if (this.globalDataStore.hasChanged()) {
      // FIXME: calling this for all global data actions means form state may reset
      //    if user changes preferences in one of the forms.  We don't have any
      //    forms like this now but may in the future and others may already.
      return tryFormInit(this, state);
    }

    switch(action.type) {

      case 'downloadForm/loading':
        return setFormLoading(state, true);

      case 'downloadForm/initialize':
        return initialize(this, state, action.payload);

      case 'downloadForm/selectReporter':
        return updateReporter(this, state, action.payload.selectedReporter);

      case 'downloadForm/formUpdate':
        return updateFormState(state, action.payload.formState);

      case 'downloadForm/formUiUpdate':
        return updateFormUiState(state, action.payload.formUiState);

      case 'downloadForm/error':
        return setError(state, action.payload.error);

      default:
        return state;
    }
  }

  // subclasses should override to enable reporters configured in WDK
  getSelectedReporter(selectedReporterName: string|null, recordClassName: string): SelectedReporter {
    return WdkServiceJsonReporterForm;
  }
}

function setFormLoading(state: State, isLoading: boolean) {
  return Object.assign({}, state, { isLoading });
}

function setError(state: State, error: Error) {
  return Object.assign({}, state, { error });
}

function initialize(
  thisStore: DownloadFormStore,
  state: State,
  { step, question, recordClass, scope }: InitializeAction["payload"]
) {

  // only use reporters configured for the report download page
  let availableReporters = recordClass.formats.filter(reporter => reporter.scopes.indexOf(scope) > -1);

  // set portion of static page state not loaded automatically
  let partialState = Object.assign({}, state, { step, question, recordClass, scope, availableReporters });

  return tryFormInit(thisStore, partialState);
}

function tryFormInit(thisStore: DownloadFormStore, state: State) {
  // try to calculate form state for WDK JSON reporter
  if (state.globalData.preferences != null && state.globalData.ontology != null && state.step != null) {
    // step, preferences, and ontology have been loaded;
    //    calculate state and set isLoading to false
    let selectedReporterName = (state.availableReporters.length == 1 ?
        state.availableReporters[0].name : null);
    return Object.assign({}, state, {
      isLoading: false,
      selectedReporter: selectedReporterName
    },
    thisStore.getSelectedReporter(selectedReporterName, state.recordClass.name).getInitialState(state));
  }

  // one of the initialize actions has not yet been sent
  return state;
}

function updateReporter(thisStore: DownloadFormStore, state: State, selectedReporter: string) {
  // selectedReporter may be undefined or invalid since we are now respecting a query param "preference"
  let reporterFound = state.availableReporters.findIndex(r => r.name === selectedReporter) != -1;
  return !reporterFound ? state :
    Object.assign({}, state, { selectedReporter },
      thisStore.getSelectedReporter(selectedReporter, state.recordClass.name).getInitialState(state));
}

function updateFormState(state: State, formState: any) {
  return Object.assign({}, state, { formState });
}

function updateFormUiState(state: State, formUiState: any) {
  return Object.assign({}, state, { formUiState });
}
