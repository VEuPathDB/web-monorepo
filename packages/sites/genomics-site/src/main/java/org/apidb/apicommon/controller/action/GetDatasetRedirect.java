package org.apidb.apicommon.controller.action;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.struts.action.Action;
import org.apache.struts.action.ActionForm;
import org.apache.struts.action.ActionForward;
import org.apache.struts.action.ActionMapping;

public class GetDatasetRedirect extends Action {

  private static final String DATA_SOURCE_ALL = "AllDatasets";
  public static final String DATA_SOURCE_BY_QUESTION = "DatasetsByQuestionName";
  public static final String DATA_SOURCE_BY_NAMES = "DatasetsByDatasetNames";
  public static final String DATA_SOURCE_BY_REFERENCE = "DatasetsByReferenceName";
  public static final String DATA_SOURCE_BY_RECORD_CLASS = "DatasetsByRecordClass";

  private static final String PARAM_QUESTION = "question";
  private static final String PARAM_REFERENCE = "reference";
  private static final String PARAM_DATASETS = "datasets";
  private static final String PARAM_RECORD_CLASS = "recordClass";

  /**
   * Forward client to new datasets page
   */
  @Override
  public ActionForward execute(ActionMapping mapping, ActionForm form, HttpServletRequest request,
      HttpServletResponse response) throws Exception {
    String questionName = request.getParameter(PARAM_QUESTION);
    String reference = request.getParameter(PARAM_REFERENCE);
    String datasets = request.getParameter(PARAM_DATASETS);
    String rcName = request.getParameter(PARAM_RECORD_CLASS);

    String path = questionName != null ? getPath(DATA_SOURCE_BY_QUESTION, "question_name=" + questionName)
                : datasets != null     ? getPath(DATA_SOURCE_BY_NAMES, "dataset_name=" + datasets)
                : reference != null    ? getPath(DATA_SOURCE_BY_REFERENCE, "reference_name=" + reference +
                                                 (rcName == null ? "" : "&record_class=" + rcName))
                : /* default */          getPath(DATA_SOURCE_ALL, null);
    response.sendRedirect(request.getContextPath() + path);
    return null;
  }
  
  private static String getPath(String questionName, String queryParam) {
    return "/app/search/dataset/" + questionName + "/result" +
        (queryParam != null ? "?" + queryParam : "");
  }
}