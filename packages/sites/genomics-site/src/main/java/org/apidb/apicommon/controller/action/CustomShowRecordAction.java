package org.apidb.apicommon.controller.action;

import static org.apidb.apicommon.model.TranscriptUtil.GENE_RECORDCLASS;
import static org.apidb.apicommon.model.TranscriptUtil.isTranscriptRecordClass;

import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;
import org.apache.struts.action.ActionForm;
import org.apache.struts.action.ActionForward;
import org.apache.struts.action.ActionMapping;
import org.eupathdb.common.model.ProjectMapper;
import org.gusdb.wdk.controller.action.ShowRecordAction;
import org.gusdb.wdk.controller.actions.client.RecordPageAdapter;
import org.gusdb.wdk.controller.actionutil.ActionUtility;
import org.gusdb.wdk.model.WdkModelException;
import org.gusdb.wdk.model.WdkUserException;
import org.gusdb.wdk.model.jspwrap.AnswerValueBean;
import org.gusdb.wdk.model.jspwrap.QuestionBean;
import org.gusdb.wdk.model.jspwrap.RecordBean;
import org.gusdb.wdk.model.jspwrap.RecordClassBean;
import org.gusdb.wdk.model.jspwrap.UserBean;
import org.gusdb.wdk.model.jspwrap.WdkModelBean;
import org.gusdb.wdk.model.record.TableValue;
import org.gusdb.wdk.model.record.attribute.AttributeValue;

public class CustomShowRecordAction extends ShowRecordAction {

    private static final String PARAM_NAME = "name";
    private static final String PARAM_PRIMARY_KEY = "primary_key";
    private static final String PARAM_SOURCE_ID = "source_id";
    private static final String PARAM_GENE_SOURCE_ID = "gene_source_id";
    private static final String PARAM_PROJECT_ID = "project_id";
    private static final String PARAM_RECORD_CLASS = "record_class";

    private static final String TABLE_REFERENCE = "References";
    private static final String TYPE_ATTRIBTUE = "attribute";
    private static final String TYPE_PROFILE_GRAPH = "profile_graph";
    private static final String TYPE_TABLE = "table";

    private static final String ATTR_REFERENCE_ATTRIBUTES = "ds_ref_attributes";
    private static final String ATTR_REFERENCE_TABLES = "ds_ref_tables";
    private static final String ATTR_REFERENCE_PROFILE_GRAPHS = "ds_ref_profile_graphs";

    private static final String PATTERN_SOURCE_ID = "\\$\\{SOURCE_ID\\}";

    private static final String FORWARD_ID_QUESTION = "run-question";

    private static final Map<String, String> recordClassMap = new HashMap<String, String>();

    private static final Logger logger = Logger.getLogger(CustomShowRecordAction.class);

    @Override
    public ActionForward execute(ActionMapping mapping, ActionForm form,
            HttpServletRequest request, HttpServletResponse response)
            throws Exception {
        logger.info("Entering CustomShowRecordAction...");

        // need to check if the old record is mapped to more than one records
        WdkModelBean wdkModel = ActionUtility.getWdkModel(servlet);
        
        String rcName = getRecordClassName(request);
        wdkModel.validateRecordClassName(rcName);
        
        String sourceId = request.getParameter(PARAM_SOURCE_ID);
        if (sourceId == null) sourceId = request.getParameter(PARAM_PRIMARY_KEY);
        
        String geneSourceId = request.getParameter(PARAM_GENE_SOURCE_ID);
				logger.debug("rcName is: " + rcName +  ", source_id is: " + sourceId + ", gene_source_id is: " + geneSourceId + " \n" );

        // if the action is used EuPathDB, we will redirect record page to component project.
        if (wdkModel.getProjectId().equals("EuPathDB")) {
          String projectId = request.getParameter(PARAM_PROJECT_ID);
          if (projectId != null) 
	      return redirectByProject(wdkModel, rcName, projectId, sourceId, geneSourceId);
        }

        ActionForward forward;
        if (!rcName.startsWith("AjaxRecordClasses.")) {
          Map<String, String[]> myParams = new HashMap<String, String[]>();
          myParams.putAll(request.getParameterMap()); //shallow copy
          if (isTranscriptRecordClass(rcName)) {
            myParams.put(PARAM_SOURCE_ID, myParams.get(PARAM_GENE_SOURCE_ID)); 
            rcName = GENE_RECORDCLASS;
          }
          RecordClassBean recordClassBean = wdkModel.getRecordClass(rcName);
          String clientUrl = RecordPageAdapter.createUrl(recordClassBean, myParams);
          forward = new ActionForward("/app" + clientUrl, true);
        }
        
        else if (hasMultipleRecords(request, wdkModel, rcName, sourceId, geneSourceId)) {
            // the old id is mapped to multiple ids, run a id question to get
            // the result.
            forward = mapping.findForward(FORWARD_ID_QUESTION);
            String url = forward.getPath().replaceAll(PATTERN_SOURCE_ID,
                    sourceId);
            forward = new ActionForward(url, false);
        }
        
        else { // map to single Id, load data sources & go to record page.
            // run execute from parent
            forward = super.execute(mapping, form, request, response);

            // if xml data source exists, bypass the process
            logger.debug("has xml dataset: " + GetDatasetAction.hasXmlDataset(wdkModel));
            if (!GetDatasetAction.hasXmlDataset(wdkModel)) {
                loadDatasets(request, wdkModel, rcName);
            }
        }
 
        logger.info("Leaving CustomShowRecordAction...");
        return forward;
    }
    
    private ActionForward redirectByProject(WdkModelBean wdkModel,
					    String recordClass, String projectId, String sourceId, String geneSourceId) 
            throws WdkModelException {
      // get project mapper
      ProjectMapper mapper = ProjectMapper.getMapper(wdkModel.getModel());
      String url = (geneSourceId == null)?
	  mapper.getRecordUrl(recordClass, projectId, sourceId) :
	  mapper.getRecordUrl(GENE_RECORDCLASS, projectId, sourceId, geneSourceId);
      return new ActionForward(url, true);
    }

    private boolean hasMultipleRecords(HttpServletRequest request,
				       WdkModelBean wdkModel, String rcName, String sourceId, String geneSourceId)
            throws WdkModelException, WdkUserException {
        UserBean user = ActionUtility.getUser(request);
        RecordClassBean recordClass = wdkModel.getRecordClass(rcName);
        Map<String, Object> pkValues = new LinkedHashMap<String, Object>();
        pkValues.put("source_id", sourceId);
        if (geneSourceId != null) pkValues.put("gene_source_id", geneSourceId);
        pkValues.put("project_id", wdkModel.getProjectId());
        return recordClass.hasMultipleRecords(user, pkValues);
    }

    private void loadDatasets(HttpServletRequest request,
            WdkModelBean wdkModel, String rcName) throws Exception {
        Map<String, String> profileGraphRefs = new LinkedHashMap<String, String>();
        Map<String, String> attributeRefs = new LinkedHashMap<String, String>();
        Map<String, String> tableRefs = new LinkedHashMap<String, String>();

        // load the recordClass based data sources
        UserBean user = ActionUtility.getUser(request);

        // get the data source question
        QuestionBean question = wdkModel.getQuestion(GetDatasetAction.DATA_SOURCE_BY_RECORD_CLASS);
        Map<String, String> params = new LinkedHashMap<String, String>();
        params.put(PARAM_RECORD_CLASS, rcName);
        AnswerValueBean answerValue = question.makeAnswerValue(user, params, true, 0);

        // find all referenced attributes and tables;
        Iterator<RecordBean> dsRecords = answerValue.getRecords();
        while (dsRecords.hasNext()) {
            RecordBean dsRecord = dsRecords.next();
            TableValue tableValue = dsRecord.getTables().get(TABLE_REFERENCE);
            for (Map<String, AttributeValue> row : tableValue) {
                String recordType = row.get("record_type").toString();

                if (recordType.equals(rcName)) {
                    String targetType = row.get("target_type").toString();
                    String targetName = row.get("target_name").toString();
                    
                    if (targetType.equals(TYPE_ATTRIBTUE)) {
                        attributeRefs.put(targetName, targetName);
                    } else if (targetType.equals(TYPE_PROFILE_GRAPH)) {
                        profileGraphRefs.put(targetName, targetName);
                    } else if (targetType.equals(TYPE_TABLE)) {
                        tableRefs.put(targetName, targetName);
                    }
                }
            }
        }

        request.setAttribute(ATTR_REFERENCE_PROFILE_GRAPHS, profileGraphRefs);
        request.setAttribute(ATTR_REFERENCE_ATTRIBUTES, attributeRefs);
        request.setAttribute(ATTR_REFERENCE_TABLES, tableRefs);
    }
    
    private String getRecordClassName(HttpServletRequest request) {
      String rcName = request.getParameter(PARAM_NAME);
      if (recordClassMap.containsKey(rcName)) {
        return recordClassMap.get(rcName);
      }
      return rcName;
    }
}
