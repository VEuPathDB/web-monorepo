package org.apidb.apicommon.controller.wizard;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;
import org.gusdb.wdk.controller.action.ShowQuestionAction;
import org.gusdb.wdk.controller.form.QuestionForm;
import org.gusdb.wdk.controller.wizard.StageHandler;
import org.gusdb.wdk.controller.wizard.StageHandlerUtility;
import org.gusdb.wdk.controller.wizard.WizardFormIfc;
import org.gusdb.wdk.model.WdkModel;
import org.gusdb.wdk.model.WdkUserException;
import org.gusdb.wdk.model.jspwrap.AnswerParamBean;
import org.gusdb.wdk.model.jspwrap.ParamBean;
import org.gusdb.wdk.model.jspwrap.QuestionBean;
import org.gusdb.wdk.model.jspwrap.StepBean;
import org.gusdb.wdk.model.jspwrap.WdkModelBean;

public class ShowOrthologStageHandler implements StageHandler {

    private static final String PARAM_QUESTION_NAME = "questionFullName";

    private static final String ATTR_QUESTION = "question";

    private static final Logger logger = Logger
            .getLogger(ShowOrthologStageHandler.class);

    @Override
    public Map<String, Object> execute(WdkModel wdkModelRaw,
            HttpServletRequest request, HttpServletResponse response,
            WizardFormIfc wizardForm) throws Exception {
        logger.debug("Entering ShowOrthologStageHandler....");

        // determine where to add the ortholog. If the current step is the root
        // step of a strategy, then we add it to the end; otherwise, we insert
        // the ortholog after current step.
        //
        // The above 2 use cases can be simplified into the following:
        // 1) create a ortholog transform using the current step as input
        // 2) revise the current step by replacing the current step with the new
        // ortholog step.
        StepBean currentStep = StageHandlerUtility.getCurrentStep(request);

        // get a span logic question
        WdkModelBean wdkModel = new WdkModelBean(wdkModelRaw);
        String questionName = request.getParameter(PARAM_QUESTION_NAME);
        QuestionBean question = wdkModel.getQuestion(questionName);
        AnswerParamBean answerParam = null;
        for (ParamBean<?> param : question.getParams()) {
            if (param instanceof AnswerParamBean) {
                answerParam = (AnswerParamBean) param;
                break;
            }
        }

        // set the action to revise, and set the current step id as the input id
        // of the ortholog query.
        if (answerParam == null)
            throw new WdkUserException("the ortholog transform doesn't have "
                    + "any answerParam:" + questionName);

        long inputStepId = currentStep.getStepId();
        // the name here is hard-coded, it will be used by
        // ShowQuestionAction.
        request.setAttribute(ShowQuestionAction.PARAM_INPUT_STEP,
                Long.toString(inputStepId));

        // prepare question form
        logger.debug("Preparing form for question: " + questionName);
        QuestionForm questionForm = new QuestionForm();
        ShowQuestionAction.prepareQuestionForm(question, request, questionForm);
        wizardForm.copyFrom(questionForm);
        logger.debug("wizard form: " + wizardForm);

        Map<String, Object> attributes = new HashMap<String, Object>();
        attributes.put(ATTR_QUESTION, question);

        // check the custom form
        ShowQuestionAction.checkCustomForm(wizardForm.getServletContext(), request, question);

        logger.debug("Leaving ShowOrthologStageHandler....");
        return attributes;
    }
}
