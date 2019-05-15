import React from "react";
import { connect } from "react-redux";

import { requestStep } from "wdk-client/Actions/StepActions";
import {
  closeAttributeAnalysis,
  openAttributeAnalysis
} from "wdk-client/Actions/AttributeAnalysisActions";
import ViewController from "wdk-client/Core/Controllers/ViewController";
import { RootState } from "wdk-client/Core/State/Types";
import { wrappable } from "wdk-client/Utils/ComponentUtils";
import { Seq } from "wdk-client/Utils/IterableUtils";

import AttributeAnalysisButton from "wdk-client/Views/AttributeAnalysis/AttributeAnalysisButton";
import { Plugin, PluginEntryContext } from "wdk-client/Utils/ClientPlugin";
import { Step } from "wdk-client/Utils/WdkUser";
import { Reporter } from "wdk-client/Utils/WdkModel";

type StateProps = {
  step?: Step;
  reporter?: Reporter;
  isOpen: boolean;
};

type DispatchProps = {
  requestStep: typeof requestStep,
  openAttributeAnalysis: typeof openAttributeAnalysis,
  closeAttributeAnalysis: typeof closeAttributeAnalysis,
};

type OwnProps = {
  attributeName: string;
  reporterType: string;
  stepId: number;
};

type Props = OwnProps & StateProps & DispatchProps;


class AttributeAnalysisButtonController extends ViewController<Props> {

  loadData() {
    // FIXME Add loading, etc, status to step store and check here
    if (this.props.step == null)
      this.props.requestStep(+this.props.stepId);
  }

  renderView() {
    const {
      stepId,
      attributeName,
      reporterType,
      step,
      reporter,
      isOpen,
      openAttributeAnalysis,
      closeAttributeAnalysis
    } = this.props;

    if ( reporter == null || step == null) return null;

    const context: PluginEntryContext = {
      type: 'attributeAnalysis',
      name: reporter.type,
      recordClassName: step.recordClassName,
      searchName: step.searchName
    }

    const pluginProps = {
      stepId,
      attributeName,
      reporterType
    };

    return (
      <AttributeAnalysisButton
        stepId={stepId}
        reporter={reporter}
        isOpen={isOpen}
        onOpen={openAttributeAnalysis}
        onClose={closeAttributeAnalysis}
      >
        <Plugin
          context={context}
          pluginProps={pluginProps}
        />
      </AttributeAnalysisButton>
    );
  }

}

function mapStateToProps(state: RootState, props: OwnProps): StateProps {
  const { attributeName, reporterType, stepId } = props;
  const stepEntry = state.steps.steps[stepId];
  const step = stepEntry && stepEntry.status === 'success' ? stepEntry.step : undefined;
  const { questions, recordClasses } = state.globalData;

  if (
    step == null ||
    questions == null ||
    recordClasses == null
  ) return { isOpen: false };

  const reporterName = `${attributeName}-${reporterType}`;

  const questionAttributes = Seq.from(questions)
    .filter(question => question.urlSegment === step.searchName)
    .flatMap(question => question.dynamicAttributes)

  const recordClassAttributes = Seq.from(recordClasses)
    .filter(recordClass => recordClass.fullName === step.recordClassName)
    .flatMap(recordClass => recordClass.attributes);

  const reporter = questionAttributes.concat(recordClassAttributes)
    .flatMap(attribute => attribute.formats)
    .find(format => format.name === reporterName);

  const {
    activeAnalysis,
  } = state.attributeAnalysis.report;

  const isOpen = (
    activeAnalysis != null &&
    activeAnalysis.stepId == +props.stepId &&
    activeAnalysis.reporterName === reporterName
  );

  return {
    step,
    reporter,
    isOpen
  };
}

export default connect(
  mapStateToProps,
  { openAttributeAnalysis, closeAttributeAnalysis, requestStep }
)(wrappable(AttributeAnalysisButtonController));
