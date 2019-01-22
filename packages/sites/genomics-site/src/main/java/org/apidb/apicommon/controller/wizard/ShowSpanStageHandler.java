package org.apidb.apicommon.controller.wizard;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;
import org.gusdb.wdk.controller.CConstants;
import org.gusdb.wdk.controller.action.ShowQuestionAction;
import org.gusdb.wdk.controller.form.QuestionForm;
import org.gusdb.wdk.controller.form.WizardForm;
import org.gusdb.wdk.controller.wizard.StageHandler;
import org.gusdb.wdk.controller.wizard.StageHandlerUtility;
import org.gusdb.wdk.controller.wizard.WizardFormIfc;
import org.gusdb.wdk.model.WdkModel;
import org.gusdb.wdk.model.WdkModelException;
import org.gusdb.wdk.model.WdkUserException;
import org.gusdb.wdk.model.jspwrap.AnswerParamBean;
import org.gusdb.wdk.model.jspwrap.ParamBean;
import org.gusdb.wdk.model.jspwrap.QuestionBean;
import org.gusdb.wdk.model.jspwrap.StepBean;
import org.gusdb.wdk.model.jspwrap.WdkModelBean;

public abstract class ShowSpanStageHandler implements StageHandler {
  
    private static final String ATTR_PREVIOUS_STEP = "previousStep";
    private static final String ATTR_IMPORT_STEP = "importStep";
    private static final String ATTR_ENABLE_OUTPUT = "enableOuput";

    private static final String SPAN_QUESTION = CConstants.WDK_QUESTION_KEY;

    private static final Logger logger = Logger.getLogger(SpanFromQuestionStageHandler.class);

    protected abstract StepBean getChildStep(WdkModelBean wdkModel,
            HttpServletRequest request, HttpServletResponse response,
            WizardFormIfc wizardForm) throws Exception;

    @Override
    public Map<String, Object> execute(WdkModel wdkModelRaw,
            HttpServletRequest request, HttpServletResponse response,
            WizardFormIfc wizardForm) throws Exception {
        logger.debug("Entering ShowSpanStageHandler....");

        // get child step
        WdkModelBean wdkModel = new WdkModelBean(wdkModelRaw);
        StepBean childStep = getChildStep(wdkModel, request, response, wizardForm);

        // get a span logic question
        String spanQuestionName = ProcessSpanStageHandler.getSpanQuestion(childStep.getRecordClass().getFullName());
        QuestionBean spanQuestion = wdkModel.getQuestion(spanQuestionName);

        // initialize the wizardForm so that it has the param information
        QuestionForm questionForm = new QuestionForm();
        questionForm.setQuestion(spanQuestion);
        ShowQuestionAction.prepareQuestionForm(spanQuestion, request, questionForm);
        wizardForm.copyFrom(questionForm);

        Map<String, Object> attributes = new HashMap<String, Object>();
        attributes.put(ATTR_IMPORT_STEP, childStep);
        attributes.put(SPAN_QUESTION, spanQuestion);

        // determine the previous step
        String action = wizardForm.getAction();
        if (action.equals(WizardForm.ACTION_ADD)) {
            prepareAdd(request, wizardForm, childStep, attributes);
        } else if (action.equals(WizardForm.ACTION_INSERT)) {
            prepareInsert(request, wizardForm, childStep, attributes);
        } else if (action.equals(WizardForm.ACTION_REVISE)) {
            prepareRevise(request, wizardForm, childStep, attributes);
        } else {
            throw new WdkUserException("Unknown wizard action: " + action);
        }

        logger.debug("Leaving SpanFromQuestionStageHandler....");
        return attributes;
    }

    private void prepareInsert(HttpServletRequest request, WizardFormIfc wizardForm,
                StepBean childStep, Map<String, Object> attributes)
            throws NumberFormatException, WdkModelException, WdkUserException {
        StepBean currentStep = StageHandlerUtility.getCurrentStep(request);
        StepBean previousStep, nextStep;
        String nextParam = null;
        if (currentStep.isCombined()) { // insert before a combined step
            previousStep = StageHandlerUtility.getPreviousStep(request, wizardForm);
            nextStep = currentStep;
            nextParam = currentStep.getPreviousStepParam();
        } else { // insert before the first step
            previousStep = childStep;
            childStep = currentStep;
            nextStep = currentStep.getNextStep();
            if (nextStep == null) {
                nextStep = currentStep.getParentStep();
                if (nextStep != null) nextParam = nextStep.getChildStepParam();
            } else {
                nextParam = nextStep.getPreviousStepParam();
            }
        }
        String enableOutput = enableOutput(previousStep, childStep, nextStep,
                nextParam);
        attributes.put(ATTR_ENABLE_OUTPUT, enableOutput);
        attributes.put(ATTR_PREVIOUS_STEP, previousStep);

        // also set the step ids as the default of the the input params
        wizardForm.setValue("span_a", previousStep.getStepId());
        wizardForm.setValue("span_b", childStep.getStepId());
    }

    private void prepareRevise(
            HttpServletRequest request, WizardFormIfc wizardForm,
            StepBean childStep, Map<String, Object> attributes)
            throws WdkModelException {
        StepBean currentStep = StageHandlerUtility.getCurrentStep(request);
        StepBean previousStep = currentStep.getPreviousStep();
        StepBean nextStep = currentStep.getNextStep();
        String nextParam = null;
        if (nextStep == null) {
            nextStep = currentStep.getParentStep();
            if (nextStep != null) nextParam = nextStep.getChildStepParam();
        } else {
            nextParam = nextStep.getPreviousStepParam();
        }

        String enableOutput = enableOutput(previousStep, childStep, nextStep,
                nextParam);
        attributes.put(ATTR_ENABLE_OUTPUT, enableOutput);
        attributes.put(ATTR_PREVIOUS_STEP, previousStep);

        // also set the step ids as the default of the the input params
        wizardForm.setValue("span_a", previousStep.getStepId());
        wizardForm.setValue("span_b", childStep.getStepId());
    }

    private void prepareAdd(HttpServletRequest request,
            WizardFormIfc wizardForm, StepBean childStep,
            Map<String, Object> attributes) throws NumberFormatException,
            WdkUserException, WdkModelException {
        StepBean rootStep = StageHandlerUtility.getRootStep(request, wizardForm);
        StepBean previousStep = rootStep;
        StepBean nextStep = rootStep.getNextStep();
        String nextParam = null;
        if (nextStep == null) {
            nextStep = rootStep.getParentStep();
            if (nextStep != null) nextParam = nextStep.getChildStepParam();
        } else {
            nextParam = nextStep.getPreviousStepParam();
        }
        String enableOutput = enableOutput(previousStep, childStep, nextStep,
                nextParam);
        attributes.put(ATTR_ENABLE_OUTPUT, enableOutput);
        attributes.put(ATTR_PREVIOUS_STEP, previousStep);

        // also set the step ids as the default of the the input params
        wizardForm.setValue("span_a", previousStep.getStepId());
        wizardForm.setValue("span_b", childStep.getStepId());
    }

    private String enableOutput(StepBean previousStep, StepBean childStep,
            StepBean nextStep, String nextParam) throws WdkModelException {
        if (nextStep == null) return "ab";

        QuestionBean question = nextStep.getQuestion();
        Map<String, ParamBean<?>> params = question.getParamsMap();
        AnswerParamBean param = (AnswerParamBean) params.get(nextParam);

        String previousType = previousStep.getRecordClass().getFullName();
        String childType = childStep.getRecordClass().getFullName();

        String output = "";
        if (param.allowRecordClass(previousType)) output += "a";
        if (param.allowRecordClass(childType)) output += "b";
        return output;
    }
}
