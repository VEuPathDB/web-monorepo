import { WdkPageController } from 'wdk-client/Controllers';

import { 
  SupportFormBase, 
  SupportFormBody
} from 'ebrc-client/components';

import { 
  onChangeFieldFactory, 
  submitForm 
} from '../action-creators/AccessRequestActionCreators';

import { 
  webAppUrl,
  alreadyRequested,
  submissionError,
  successfullySubmitted,
  loaded,
  notFound,
  fieldElements, 
  formValues,
  studyName,
  title
} from '../selectors/AccessRequestSelectors';

import AccessRequestStore from '../stores/AccessRequestStore';

import AccessRequestView from './AccessRequestView';

import './AccessRequestController.scss';

export default class AccessRequestController extends WdkPageController {
  getStoreClass() {
    return AccessRequestStore;
  }

  getActionCreators() {
    return {
      onChangePurpose: onChangeFieldFactory('purpose'),
      onChangeResearchQuestion: onChangeFieldFactory('research_question'),
      onChangeAnalysisPlan: onChangeFieldFactory('analysis_plan'),
      onChangeDisseminationPlan: onChangeFieldFactory('dissemination_plan'),
      submitForm
    };
  }

  getStateFromStore() {
    return {
      webAppUrl: webAppUrl(this.store.getState()),
      successfullySubmitted: successfullySubmitted(this.store.getState()),
      alreadyRequested: alreadyRequested(this.store.getState()),
      submissionError: submissionError(this.store.getState()),
      fieldElements: fieldElements(this.store.getState()),
      formTitle: title(this.store.getState()),
      formValues: formValues(this.store.getState()),
      studyName: studyName(this.store.getState())
    };
  }

  getTitle() {
    return title(this.store.getState());
  }

  isRenderDataLoaded() {
    return loaded(this.store.getState());
  }

  isRenderDataNotFound() {
    return notFound(this.store.getState());
  }

  renderView() {
    return (
      <AccessRequestView
        {...this.props}
        {...this.state}
        {...this.eventHandlers}
      />
    );
  }
}
