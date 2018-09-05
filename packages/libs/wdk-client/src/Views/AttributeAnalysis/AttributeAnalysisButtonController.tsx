import React from 'react';

import AbstractViewController from '../../Core/Controllers/AbstractViewController';
import { Action } from '../../Utils/ActionCreatorUtils';
import { wrappable } from '../../Utils/ComponentUtils';
import { Seq } from '../../Utils/IterableUtils';

import AttributeAnalysisButton from './AttributeAnalysisButton';
import { AttributeAnalysisStore, State } from './AttributeAnalysisStore';
import { ScopedAnalysisAction } from './BaseAttributeAnalysis/BaseAttributeAnalysisActions';

type ViewProps = {
  attributeName: string;
  questionName: string;
  recordClassName: string;
  reporterName: string;
  stepId: number;
}

class AttributeAnalysisButtonController extends AbstractViewController<
  State,
  AttributeAnalysisStore,
  {},
  ViewProps
> {

  getStoreClass() {
    return AttributeAnalysisStore;
  }

  getStateFromStore() {
    return this.store.getState();
  }

  plugin = this.props.locatePlugin('attributeAnalysis');

  renderView() {
    const { questionName, recordClassName, reporterName, stepId } = this.props;
    const { globalData, analyses } = this.state;

    const questionAttributes = Seq.from(globalData.questions)
      .filter(question => question.name === questionName)
      .flatMap(question => question.dynamicAttributes)

    const recordClassAttributes = Seq.from(globalData.recordClasses)
      .filter(recordClass => recordClass.name === recordClassName)
      .flatMap(recordClass => recordClass.attributes);

    const reporter = questionAttributes.concat(recordClassAttributes)
      .flatMap(attribute => attribute.formats)
      .find(format => format.name === reporterName);

    const key = `${stepId}__${reporterName}`;
    const analysis = analyses && analyses[key];

    if (reporter == null) return null;

    const context = {
      type: 'attributeAnalysis',
      name: reporter.type,
      recordClassName: recordClassName
    }

    const dispatch = (action: Action): any => {
      this.dispatchAction(ScopedAnalysisAction.create({ action, context, reporter, stepId }));
    }

    return (
      <AttributeAnalysisButton
        recordClassName={recordClassName}
        stepId={stepId}
        reporter={reporter}
        analysis={analysis}
        dispatch={dispatch}>
        {this.plugin.render(context, analysis, dispatch)}
      </AttributeAnalysisButton>
    );
  }

}

export default wrappable(AttributeAnalysisButtonController);
