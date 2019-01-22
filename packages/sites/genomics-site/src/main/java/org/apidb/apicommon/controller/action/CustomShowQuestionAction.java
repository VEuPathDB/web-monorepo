package org.apidb.apicommon.controller.action;

import static org.gusdb.fgputil.functional.Functions.mapToList;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;
import org.apache.struts.action.ActionForm;
import org.apache.struts.action.ActionForward;
import org.apache.struts.action.ActionMapping;
import org.gusdb.wdk.controller.CConstants;
import org.gusdb.wdk.controller.action.ShowQuestionAction;
import org.gusdb.wdk.controller.actionutil.ActionUtility;
import org.gusdb.wdk.model.WdkModel;
import org.gusdb.wdk.model.answer.AnswerValue;
import org.gusdb.wdk.model.answer.stream.FileBasedRecordStream;
import org.gusdb.wdk.model.answer.stream.RecordStream;
import org.gusdb.wdk.model.jspwrap.AnswerValueBean;
import org.gusdb.wdk.model.jspwrap.CategoryBean;
import org.gusdb.wdk.model.jspwrap.QuestionBean;
import org.gusdb.wdk.model.jspwrap.RecordBean;
import org.gusdb.wdk.model.jspwrap.UserBean;
import org.gusdb.wdk.model.jspwrap.WdkModelBean;
import org.gusdb.wdk.model.record.RecordInstance;
import org.gusdb.wdk.model.record.TableField;
import org.gusdb.wdk.model.record.TableValue;
import org.gusdb.wdk.model.record.attribute.AttributeField;
import org.gusdb.wdk.model.record.attribute.AttributeValue;

public class CustomShowQuestionAction extends ShowQuestionAction {

    private static final String PARAM_QUESTION = "question_name";
    private static final String PARAM_QUESTION_FULL = "questionFullName";
    private static final String TABLE_REFERENCE = "References";
    private static final String TYPE_QUESTION = "question";
    private static final String ATTR_REFERENCE_QUESTIONS = "ds_ref_questions";
    private static final String ATTR_QUESTIONS_BY_DATASET = "questions_by_dataset_map";
    private static final String ATTR_DISPLAY_CATEGORIES = "display_categories";
    private static final String ATTR_UNCATEGORIZED_QUESTIONS = "uncategorized_questions_by_dataset_map";
    private static final String ATTR_MISSING_IN_MODEL_QUESTIONS = "missing_inModel_questions_by_dataset_map";

    private static final Logger logger = Logger.getLogger(CustomShowQuestionAction.class);

    public static void loadDatasets(WdkModel wdkModelRaw,
            HttpServletRequest request) throws Exception {
        WdkModelBean wdkModel = new WdkModelBean(wdkModelRaw);

        List<RecordBean> questionRefs = new ArrayList<RecordBean>();

        // if xml data source exists, bypass the process
        if (!GetDatasetAction.hasXmlDataset(wdkModel)) {

            // load the recordClass based data sources
            UserBean user = ActionUtility.getUser(request);
            String questionName = request.getParameter(PARAM_QUESTION_FULL);
            QuestionBean question;
            if (questionName == null) {
                question = (QuestionBean) request.getAttribute(CConstants.WDK_QUESTION_KEY);
                questionName = question.getFullName();
            } else {
                question = wdkModel.getQuestion(questionName);
            }

            // get the data source question
            QuestionBean dsQuestion = wdkModel.getQuestion(GetDatasetAction.DATA_SOURCE_BY_QUESTION);
            Map<String, String> params = new LinkedHashMap<String, String>();
            params.put(PARAM_QUESTION, questionName);
            AnswerValueBean answerValue = dsQuestion.makeAnswerValue(user, params, true, 0);

            // find all referenced attributes and tables;
            Iterator<RecordBean> dsRecords = answerValue.getRecords();
            while (dsRecords.hasNext()) {
                RecordBean dsRecord = dsRecords.next();
                TableValue tableValue = dsRecord.getTables().get(TABLE_REFERENCE);
                for (Map<String, AttributeValue> row : tableValue) {
                    String targetType = row.get("target_type").toString();
                    String targetName = row.get("target_name").toString();
                    if (targetType.equals(TYPE_QUESTION)
                            && targetName.equals(questionName)) {
                        questionRefs.add(dsRecord);
                        break;
                    }
                }
            }
        }

        request.setAttribute(ATTR_REFERENCE_QUESTIONS, questionRefs);
    }

    public static void loadQuestionsByDataset(WdkModel wdkModelRaw,
            HttpServletRequest request) throws Exception {
        WdkModelBean wdkModel = new WdkModelBean(wdkModelRaw);
        UserBean user = ActionUtility.getUser(request);

        //eg:  InternalGeneDatasetQuestions.GenesByRNASeqEvidence
        String questionName = request.getParameter(PARAM_QUESTION_FULL);
        QuestionBean question;
        if (questionName == null) {
            question = (QuestionBean) request.getAttribute(CConstants.WDK_QUESTION_KEY);
            questionName = question.getFullName();
        } else {
            question = wdkModel.getQuestion(questionName);
        }

        // Internal questions (eg: InternalGeneDatasetQuestions.GenesByRNASeqEvidence) have 2 properties in the model
        //   "datasetType" value (eg: RNASeq) corresponds to their category in ontology?
        //   "datasetSubtype" value (eg: rnaseq) corresponds to ?
        // The specific expr searches have a property in the model 
        //   "displayCategory" value (eg: "fold_change") corresponds to the category of the specific expr searches in categories.xml scope datasets
        String[] datasetCategories = question.getPropertyList("datasetCategory");
        String[] datasetSubtypes = question.getPropertyList("datasetSubtype");
        logger.debug(" ******** datasetCategory: " + Arrays.toString(datasetCategories) );
        logger.debug(" ******** datasetSubtypes: " + Arrays.toString(datasetSubtypes) );

        // in questions other than these internal ones we leave the action..
        // skip if no datasetType defined
        if (datasetCategories.length == 0) return;


        // set 3 data structures that will be passed to jsp in request
        // { dataset => { type => question, ... }, ... }
        Map<RecordBean, Map<String, List<QuestionBean>>> questionsByDataset = new LinkedHashMap<>();
        Map<RecordBean, List<QuestionBean>> uncatQuestionsMap = new LinkedHashMap<>();
        Map<RecordBean, List<String>> missQuestionsMap = new LinkedHashMap<>();
        Set<CategoryBean> displayCategorySet = new TreeSet<>((c1,c2) -> c1.getName().compareTo(c2.getName()));

        // 1- Obtain "datasets by category/subtype"
        String dsQuestionName = "DatasetQuestions.DatasetsByCategoryAndSubtype";
        Map<String, String> params = new LinkedHashMap<String, String>();
        params.put("dataset_category", datasetCategories[0]);
        params.put("dataset_subtype", datasetSubtypes[0]);

        QuestionBean dsQuestion = wdkModel.getQuestion(dsQuestionName);
        AnswerValue answerValue = dsQuestion.getQuestion().makeAnswerValue(user.getUser(), params, true, 0);
        answerValue.setPageToEntireResult();

        // make a list of attribute fields we need to expose
        String[] attributeNames = { "dataset_name", "display_name", "organism_prefix",
            "short_attribution", "dataset_id", "summary", "description", "build_number_introduced" };
        String[] tableNames = { TABLE_REFERENCE, "Publications" };

        List<AttributeField> attributes = mapToList(Arrays.asList(attributeNames), name ->
            dsQuestion.getQuestion().getRecordClass().getAttributeFieldMap().get(name));
        List<TableField> tables = mapToList(Arrays.asList(tableNames), name ->
            dsQuestion.getQuestion().getRecordClass().getTableFieldMap().get(name));

        // get file based stream since fetching tables
        try (RecordStream dsRecords = new FileBasedRecordStream(answerValue, attributes, tables)) {

          // iterate through records
          for (RecordInstance record : dsRecords) {
            RecordBean dsRecord = new RecordBean(user.getUser(), record);

            // checking on a dataset record table that provides wdk references... 
            // we need the references for this dataset, with correct record_class and target_type "question"
            TableValue tableValue = record.getTableValue(TABLE_REFERENCE);
            Map<String, List<QuestionBean>> internalQuestionsMap = new LinkedHashMap<>();
            List<QuestionBean> uncatQuestions = new ArrayList<QuestionBean>();
            List<String> missQuestions = new ArrayList<String>();

            // iterate through table rows
            for (Map<String, AttributeValue> row : tableValue) {

              String targetType = row.get("target_type").toString();
              String targetName = row.get("target_name").toString();
              logger.debug("targetType is: " + targetType + " and targetName is: " + targetName);

              if (targetType.equals(TYPE_QUESTION)) {
                try {
                  // internalQuestion is the expression search
                  QuestionBean internalQuestion = wdkModel.getQuestion(targetName);

                  if (!internalQuestion.getRecordClass().getFullName().equals(question.getRecordClass().getFullName())) {
                    // filter questions to match recordType
                    continue;
                  }

                  logger.debug("Adding question bean for " + targetName +
                      " referenced by data set " + dsRecord.getAttributes().get("dataset_name"));

                  // String[] displayCategories =
                  //         internalQuestion.getPropertyList("displayCategory");

                  List<CategoryBean> displayCategories =
                      //  internalQuestion.getDatasetCategories();
                      //in the ontology these searches appear under webservices scope
                      internalQuestion. getWebServiceCategories(); 
                  logger.debug("Dataset categories: " + displayCategories.size());

                  if (displayCategories.size() == 1) {
                    displayCategorySet.add(displayCategories.get(0));
                    String catName = displayCategories.get(0).getName();
                    logger.debug("**** category:" + catName);

                    List<QuestionBean> internalQuestions = internalQuestionsMap.get(catName);
                    if (internalQuestions == null) {
                      internalQuestions = new ArrayList<QuestionBean>();
                      internalQuestionsMap.put(catName, internalQuestions);
                    }
                    internalQuestions.add(internalQuestion);
                  }
                  else {
                    // Track uncategorized questions
                    uncatQuestions.add(internalQuestion);
                    logger.debug("Found an uncategorized question: " + internalQuestion.getFullName());
                  }
                }
                catch  (Exception ex)  {
                  logger.debug("****** FOUND MISSING QUESTION SKIPPING: " + targetName);
                  missQuestions.add(targetName);
                  continue;
                }
              }
            } // end loop through table rows

            // purge the table from the dataset record to free memory; not used in JSP
            dsRecord.removeTableValue(TABLE_REFERENCE);

            // add record and associated data to model objects made available to JSP
            if (internalQuestionsMap.size() > 0) {
              questionsByDataset.put(dsRecord, internalQuestionsMap);
            }
            if (uncatQuestions.size() > 0) {
              uncatQuestionsMap.put(dsRecord, uncatQuestions);
            }
            if (missQuestions.size() > 0) {
              missQuestionsMap.put(dsRecord, missQuestions);
            }
          } // end loop through dataset records
        } // close dataset record stream

        // logger.debug("\n**********\n" + questionsByDataset + "\n**********\n");
        request.setAttribute(ATTR_QUESTIONS_BY_DATASET, questionsByDataset);
        request.setAttribute(ATTR_UNCATEGORIZED_QUESTIONS, uncatQuestionsMap);
        request.setAttribute(ATTR_DISPLAY_CATEGORIES, displayCategorySet);
        request.setAttribute(ATTR_MISSING_IN_MODEL_QUESTIONS, missQuestionsMap);
    }

    public static void loadReferences(WdkModel wdkModel,
            HttpServletRequest request) throws Exception {
        loadQuestionsByDataset(wdkModel, request);
        //logger.debug("\n\n MOVING TO LOAD DATASETS \n\n");
        loadDatasets(wdkModel, request);
    }

    @Override
    public ActionForward execute(ActionMapping mapping, ActionForm form,
            HttpServletRequest request, HttpServletResponse response)
            throws Exception {
        // run execute from parent
        ActionForward forward = super.execute(mapping, form, request, response);
        WdkModel wdkModel = ActionUtility.getWdkModel(servlet).getModel();
        loadReferences(wdkModel, request);

        logger.info("*****CustomShowQuestionAction going to: " + forward);
        return forward;
    }

}
