import { get } from 'lodash';
import React from 'react';
import { connect } from 'react-redux';

import { PageController } from '@veupathdb/wdk-client/lib/Controllers';

import { 
  loadStudy,
  onChangeFieldFactory, 
  submitForm,
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
  requestNeedsApproval,
  downloadLink,
  title
} from '../selectors/AccessRequestSelectors';

import AccessRequestView from './AccessRequestView';

import './AccessRequestController.scss';

class AccessRequestController extends PageController {
  getTitle() {
    return this.props.title;
  }

  loadData(prevProps) {
    if (
      prevProps == null ||
      (
        prevProps.datasetId !==
        this.props.datasetId
      )
    ) {
      this.props.loadStudy(this.props.datasetId);
    }
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
  studyName: studyName(accessRequestState),
  requestNeedsApproval: requestNeedsApproval(accessRequestState),
  downloadLink: downloadLink(accessRequestState)
});

const mapDispatchToProps = {
  loadStudy,
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
