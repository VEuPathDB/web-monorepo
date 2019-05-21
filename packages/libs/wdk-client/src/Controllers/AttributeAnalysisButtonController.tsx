import React from "react";
import { connect } from "react-redux";

import { requestStrategy } from "wdk-client/Actions/StrategyActions";
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
  requestStrategy: typeof requestStrategy,
  openAttributeAnalysis: typeof openAttributeAnalysis,
  closeAttributeAnalysis: typeof closeAttributeAnalysis,
};

type OwnProps = {
  attributeName: string;
  reporterType: string;
  stepId: number;
  strategyId: number;
};

type Props = OwnProps & StateProps & DispatchProps;


class AttributeAnalysisButtonController extends ViewController<Props> {

  loadData() {
    // FIXME Add loading, etc, status to step store and check here
    if (this.props.step == null)
      this.props.requestStrategy(+this.props.strategyId);
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
  const { attributeName, reporterType, stepId, strategyId } = props;
  const strategyEntry = state.strategies.strategies[strategyId];
  const step = strategyEntry && strategyEntry.status === 'success' && strategyEntry.strategy.steps[stepId]? strategyEntry.strategy.steps[stepId] : undefined;
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
  { openAttributeAnalysis, closeAttributeAnalysis, requestStrategy }
)(wrappable(AttributeAnalysisButtonController));
