package org.apidb.apicommon.controller.action;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;
import org.apache.struts.action.Action;
import org.apache.struts.action.ActionForm;
import org.apache.struts.action.ActionForward;
import org.apache.struts.action.ActionMapping;
import org.gusdb.wdk.controller.actionutil.ActionUtility;
import org.gusdb.wdk.model.WdkModelException;
import org.gusdb.wdk.model.WdkUserException;
import org.gusdb.wdk.model.jspwrap.AnswerValueBean;
import org.gusdb.wdk.model.jspwrap.QuestionBean;
import org.gusdb.wdk.model.jspwrap.RecordBean;
import org.gusdb.wdk.model.jspwrap.UserBean;
import org.gusdb.wdk.model.jspwrap.WdkModelBean;
import org.gusdb.wdk.model.jspwrap.XmlQuestionSetBean;
import org.gusdb.wdk.model.record.attribute.AttributeValue;

public class GetDatasetAction extends Action {

    private static final String DATA_SOURCE_ALL = "DatasetQuestions.AllDatasets";
    public static final String DATA_SOURCE_BY_QUESTION = "DatasetQuestions.DatasetsByQuestionName";
    public static final String DATA_SOURCE_BY_NAMES = "DatasetQuestions.DatasetsByDatasetNames";
    public static final String DATA_SOURCE_BY_REFERENCE = "DatasetQuestions.DatasetsByReferenceName";
    public static final String DATA_SOURCE_BY_RECORD_CLASS = "DatasetQuestions.DatasetsByRecordClass";

    private static final String PARAM_QUESTION = "question";
    private static final String PARAM_REFERENCE = "reference";
    private static final String PARAM_DATASETS = "datasets";
    private static final String PARAM_DISPLAY_TYPE = "display";
    private static final String PARAM_RECORD_CLASS = "recordClass";

    private static final String VALUE_DISPLAY_LIST = "list";
    private static final String VALUE_DISPLAY_DETAIL = "detail";

    private static final String ATTR_DATA_SOURCES = "datasets";

    private static final String FORWARD_XML_LIST = "show_xml_list";
    private static final String FORWARD_XML_DETAIL = "show_xml_detail";
    private static final String FORWARD_LIST = "show_list";
    private static final String FORWARD_DETAIL = "show_detail";

    private static final Logger logger = Logger.getLogger(GetDatasetAction.class);

    public static boolean hasXmlDataset(WdkModelBean wdkModel) {
        XmlQuestionSetBean questionSet = wdkModel.getXmlQuestionSetsMap().get(
                "XmlQuestions");
        if (questionSet == null)
            return false;
        return questionSet.getQuestionsMap().containsKey("Datasets");
    }

    @Override
    public ActionForward execute(ActionMapping mapping, ActionForm form,
            HttpServletRequest request, HttpServletResponse response)
            throws Exception {
        WdkModelBean wdkModel = ActionUtility.getWdkModel(servlet);
        UserBean user = ActionUtility.getUser(request);

        String questionName = request.getParameter(PARAM_QUESTION);
        String reference = request.getParameter(PARAM_REFERENCE);
        String datasets = request.getParameter(PARAM_DATASETS);
        String displayType = request.getParameter(PARAM_DISPLAY_TYPE);
        String rcName = request.getParameter(PARAM_RECORD_CLASS);

        String forwardList, forwardDetail;

        // check if xml data source exists, if so, redirect to it
        if (hasXmlDataset(wdkModel)) {
            forwardList = FORWARD_XML_LIST;
            forwardDetail = FORWARD_XML_DETAIL;
        } else {
            // xml data source doesn't exist, query from database
            forwardList = FORWARD_LIST;
            forwardDetail = FORWARD_DETAIL;

            QuestionBean question;
            Map<String, String> params = new LinkedHashMap<String, String>();
            if (questionName != null) {
                logger.debug("Getting data sources by question: " + questionName);
                question = wdkModel.getQuestion(DATA_SOURCE_BY_QUESTION);
                params.put("question_name", questionName);
            } else if (datasets != null) {
              logger.debug("Getting data sources by names: " + datasets);
              question = wdkModel.getQuestion(DATA_SOURCE_BY_NAMES);
              params.put("dataset_name", datasets);
            } else if (reference != null) {
              logger.debug("Getting data sources by reference: " + reference);
              question = wdkModel.getQuestion(DATA_SOURCE_BY_REFERENCE);
              params.put("reference_name", reference);
              if (rcName != null) params.put("record_class", rcName);
            } else {
                logger.debug("Getting all data sources: ");
                question = wdkModel.getQuestion(DATA_SOURCE_ALL);
            }
            AnswerValueBean answerValue = question.makeAnswerValue(user,
                    params, true, 0);

            Map<String, List<RecordBean>> categories = formatAnswer(answerValue);
            request.setAttribute(ATTR_DATA_SOURCES, categories);
        }

        if (displayType == null || displayType.length() == 0)
            displayType = VALUE_DISPLAY_DETAIL;

        if (displayType.equals(VALUE_DISPLAY_LIST))
            return mapping.findForward(forwardList);
        else if (displayType.equals(VALUE_DISPLAY_DETAIL))
            return mapping.findForward(forwardDetail);
        else
            throw new WdkUserException("Unknown display type: " + displayType);
    }

    /**
     * Group data sources by category
     * 
     * @param request
     * @param answerValue
     * @throws WdkUserException 
     */
    private Map<String, List<RecordBean>> formatAnswer(
            AnswerValueBean answerValue) throws WdkModelException, WdkUserException {
        Map<String, List<RecordBean>> categories = new LinkedHashMap<String, List<RecordBean>>();
        Iterator<RecordBean> records = answerValue.getRecords();
        while (records.hasNext()) {
            RecordBean record = records.next();
            Map<String, AttributeValue> attributeValues = record
                    .getAttributes();
            String category = attributeValues.get("category").toString();
            List<RecordBean> list = categories.get(category);
            if (list == null) {
                list = new ArrayList<RecordBean>();
                categories.put(category, list);
            }
            list.add(record);
        }
        return categories;
    }
}
