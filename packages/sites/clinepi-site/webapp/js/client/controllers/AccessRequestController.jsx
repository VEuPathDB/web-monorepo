import { get } from 'lodash';
import { connect } from 'react-redux';

import { PageController } from 'wdk-client/Controllers';

import { 
  SupportFormBase, 
  SupportFormBody
} from 'ebrc-client/components';

import { 
  onChangeFieldFactory, 
  submitForm 
} from '../action-creators/AccessRequestActionCreators';

import { 
  alreadyRequested,
  disableSubmit,
  submissionError,
  successfullySubmitted,
  loaded,
  notFound,
  fieldElements, 
  formValues,
  studyName,
  title
} from '../selectors/AccessRequestSelectors';

import AccessRequestView from './AccessRequestView';

import './AccessRequestController.scss';

class AccessRequestController extends PageController {
  getTitle() {
    return this.props.title;
  }

  isRenderDataLoaded() {
    return this.props.loaded;
  }

  isRenderDataNotFound() {
    return this.props.notFound;
  }

  renderView() {
    return (
      <AccessRequestView {...this.props} />
    );
  }
}

const mapStateToProps = ({ 
  accessRequest: accessRequestState, 
  globalData: globalDataState
}) => ({
  webAppUrl: get(globalDataState, 'siteConfig.webAppUrl', ''),
  location: get(globalDataState, 'location', ''),
  title: title(accessRequestState),
  loaded: loaded(accessRequestState),
  notFound: notFound(accessRequestState),
  successfullySubmitted: successfullySubmitted(accessRequestState),
  alreadyRequested: alreadyRequested(accessRequestState),
  disableSubmit: disableSubmit(accessRequestState),
  submissionError: submissionError(accessRequestState),
  fieldElements: fieldElements(accessRequestState),
  formTitle: title(accessRequestState),
  formValues: formValues(accessRequestState),
  studyName: studyName(accessRequestState)
});

const mapDispatchToProps = {
  onChangePurpose: onChangeFieldFactory('purpose'),
  onChangePriorAuth: onChangeFieldFactory('prior_auth'),
  onChangeResearchQuestion: onChangeFieldFactory('research_question'),
  onChangeAnalysisPlan: onChangeFieldFactory('analysis_plan'),
  onChangeDisseminationPlan: onChangeFieldFactory('dissemination_plan'),
  submitForm
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(AccessRequestController);
