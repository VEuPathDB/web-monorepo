package org.apidb.apicommon.controller.wizard;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;
import org.apidb.apicommon.model.TranscriptUtil;
import org.gusdb.wdk.controller.actionutil.ActionUtility;
import org.gusdb.wdk.controller.wizard.StageHandler;
import org.gusdb.wdk.controller.wizard.WizardFormIfc;
import org.gusdb.wdk.model.WdkModel;
import org.gusdb.wdk.model.WdkUserException;
import org.gusdb.wdk.model.jspwrap.StepBean;
import org.gusdb.wdk.model.jspwrap.UserBean;

public class ProcessSpanStageHandler implements StageHandler {

    public static String PARAM_OUTPUT = "span_output";
    public static String PARAM_VALUE_OUTPUT_A = "a";
    public static String PARAM_SPAN_A = "span_a";
    public static String PARAM_SPAN_B = "span_b";

    private static final String ATTR_QUESTION_NAME = "questionFullName";

    private static final Logger logger = Logger.getLogger(ProcessSpanStageHandler.class);

    // maps record class to the matching span question
    public static String getSpanQuestion(String type) throws WdkUserException {
      switch(type) {
        case TranscriptUtil.TRANSCRIPT_RECORDCLASS:     return "SpanQuestions.GenesBySpanLogic";
        case "OrfRecordClasses.OrfRecordClass":         return "SpanQuestions.OrfsBySpanLogic";
        case "IsolateRecordClasses.IsolateRecordClass": return "SpanQuestions.IsolatesBySpanLogic";
        case "SnpRecordClasses.SnpRecordClass":         return "SpanQuestions.SnpsBySpanLogic";
        case "SnpChipRecordClasses.SnpChipRecordClass": return "SpanQuestions.SnpsChipsBySpanLogic";
        case "DynSpanRecordClasses.DynSpanRecordClass": return "SpanQuestions.DynSpansBySpanLogic";
        case "SageTagRecordClasses.SageTagRecordClass": return "SpanQuestions.DynSpansBySpanLogic";
        default:
          throw new WdkUserException("The record type " + type + " is not supported in Span Logic operation.");
      }
    }

    @Override
    public Map<String, Object> execute(WdkModel wdkModel,
            HttpServletRequest request, HttpServletResponse response,
            WizardFormIfc wizardForm) throws Exception {
        logger.debug("Entering ProcessSpanStageHandler....");

        String output = (String) wizardForm.getValueOrArray(PARAM_OUTPUT);

        String span = output.equals(PARAM_VALUE_OUTPUT_A) ? PARAM_SPAN_A
                : PARAM_SPAN_B;
        String strStepId = (String) wizardForm.getValueOrArray(span);
        long stepId = Long.valueOf(strStepId);

        UserBean user = ActionUtility.getUser(request);
        StepBean step = user.getStep(stepId);
        String questionName = ProcessSpanStageHandler.getSpanQuestion(step.getRecordClass().getFullName());

        Map<String, Object> results = new HashMap<String, Object>();
        results.put(ATTR_QUESTION_NAME, questionName);

        computeRegion(request, wizardForm, "a");
        computeRegion(request, wizardForm, "b");

        logger.debug("Leaving ProcessSpanStageHandler....");
        return results;
    }

    private void computeRegion(HttpServletRequest request,
            WizardFormIfc wizardForm, String region) {
        String option = wizardForm.getValue("region_" + region).toString();
        if (option.equals("exact")) {
            // use exact region of the feature
            wizardForm.setValue("span_begin_" + region, "start");
            wizardForm.setValue("span_begin_direction_" + region, "+");
            wizardForm.setValue("span_begin_offset_" + region, "0");
            wizardForm.setValue("span_end_" + region, "stop");
            wizardForm.setValue("span_end_direction_" + region, "+");
            wizardForm.setValue("span_end_offset_" + region, "0");
        } else if (option.equals("upstream")) {
            // use upstream region of the feature
            String length = request.getParameter("upstream_region_" + region);
            wizardForm.setValue("span_begin_" + region, "start");
            wizardForm.setValue("span_begin_direction_" + region, "-");
            wizardForm.setValue("span_begin_offset_" + region, length);
            wizardForm.setValue("span_end_" + region, "start");
            wizardForm.setValue("span_end_direction_" + region, "+");
            wizardForm.setValue("span_end_offset_" + region, "0");
        } else if (option.equals("downstream")) {
            // use the downstream region of the feature
            String length = request.getParameter("downstream_region_" + region);
            wizardForm.setValue("span_begin_" + region, "stop");
            wizardForm.setValue("span_begin_direction_" + region, "+");
            wizardForm.setValue("span_begin_offset_" + region, "0");
            wizardForm.setValue("span_end_" + region, "stop");
            wizardForm.setValue("span_end_direction_" + region, "+");
            wizardForm.setValue("span_end_offset_" + region, length);
        } else {
            // use custom region, the values are filled in the expected fields.
            // do nothing here
        }
    }
}
