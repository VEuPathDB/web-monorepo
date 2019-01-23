package org.apidb.apicommon.controller.wizard;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.gusdb.wdk.controller.wizard.StageHandlerUtility;
import org.gusdb.wdk.controller.wizard.WizardFormIfc;
import org.gusdb.wdk.model.jspwrap.StepBean;
import org.gusdb.wdk.model.jspwrap.WdkModelBean;

public class SpanFromReviseStageHandler extends ShowSpanStageHandler {

    @Override
    protected StepBean getChildStep(WdkModelBean wdkModel,
            HttpServletRequest request, HttpServletResponse response,
            WizardFormIfc wizardForm) throws Exception {
        StepBean currentStep = StageHandlerUtility.getCurrentStep(request);
        return currentStep.getChildStep();
    }

}
