package org.apidb.apicommon.controller.action;

import static org.apidb.apicommon.model.TranscriptUtil.TRANSCRIPT_RECORDCLASS;
import static org.apidb.apicommon.model.TranscriptUtil.isGeneRecordClass;
import static org.apidb.apicommon.model.TranscriptUtil.isTranscriptRecordClass;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.sql.DataSource;

import org.apache.struts.action.ActionForm;
import org.apache.struts.action.ActionForward;
import org.apache.struts.action.ActionMapping;
import org.gusdb.fgputil.db.SqlUtils;
import org.gusdb.wdk.controller.action.ProcessBasketAction;
import org.gusdb.wdk.controller.actionutil.ActionUtility;
import org.gusdb.wdk.model.WdkModelException;
import org.gusdb.wdk.model.WdkUserException;
import org.gusdb.wdk.model.jspwrap.RecordClassBean;
import org.gusdb.wdk.model.jspwrap.WdkModelBean;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class CustomProcessBasketAction extends ProcessBasketAction {
  
  private HttpServletRequest _request;
  
  @Override
  public ActionForward execute(ActionMapping mapping, ActionForm form,
      HttpServletRequest request, HttpServletResponse response)
      throws Exception {
    this._request = request;
    return super.execute(mapping, form, request, response);
  }
  
  /**
   * Return a Transcript RecordClassBean for Gene record classes. Since
   * source_id in the Gene record class is in the same position as gene_source_id
   * in the Transcript record class, this will have the effect of getRecords
   * expanding the gene record into the related transcript records.
   */
  @Override
  protected RecordClassBean getRecordClass(String type,
      WdkModelBean wdkModel) throws WdkModelException, WdkUserException {
    return isGeneRecordClass(type) ?
        wdkModel.getRecordClass(TRANSCRIPT_RECORDCLASS) :
        super.getRecordClass(type, wdkModel);
  }
  
  /**
   * The request has a set of transcript IDs.  Transform that into the set of all 
   * transcript IDs for the genes in the original set.
   */
  @Override
  protected List<String[]> getRecords(String data, RecordClassBean recordClass)
      throws JSONException, WdkUserException, WdkModelException {
    
    if (!isTranscriptRecordClass(recordClass.getRecordClass())) {
      return super.getRecords(data, recordClass);
    }
    
    if (isGeneRequest()) {
      JSONArray dataJson = new JSONArray(data);
      for (int i = 0; i < dataJson.length(); i++) {
        JSONObject obj = (JSONObject)dataJson.get(i);
        obj.put("gene_source_id", obj.get("source_id"));
      }
      data = dataJson.toString();
    }

    // construct a comma delimited string of the primary key columns for this record class
    StringBuilder pkString = new StringBuilder();
    int geneSourceIdColumn = getPrimaryKeyColString(pkString, recordClass);
   
    List<String[]> records = super.getRecords(data, recordClass);
    List<String[]> expandedRecords = new ArrayList<String[]>();

    WdkModelBean wdkModelBean = ActionUtility.getWdkModel(servlet);
    DataSource dataSource = wdkModelBean.getModel().getAppDb().getDataSource();
    
    // for up to 1000 gene IDs per batch, assemble a comma delimited string of gene IDs for an IN clause
    // for each batch, run the query to expand the transcripts
    StringBuilder geneIdsString = null;
    String sql1 = "select " + pkString + " from ApiDBTuning.TranscriptAttributes where gene_source_id in (";
    String sql2 = ")";
    int count = 0;
    for (String[] record : records) {
      if (count == 0)
        geneIdsString = new StringBuilder("'" + record[geneSourceIdColumn] + "'");
      else
        geneIdsString.append(", '" + record[geneSourceIdColumn] + "'");
      
      // run the query for this batch
      if (count++ == 1000) {
        count = 0;
        runBatch(dataSource, sql1 + geneIdsString + sql2, expandedRecords, recordClass.getPrimaryKeyColumns());
      }
    }
    if (count > 0) runBatch(dataSource, sql1 + geneIdsString + sql2, expandedRecords, recordClass.getPrimaryKeyColumns());
    
    return expandedRecords;
  }
  
  private int getPrimaryKeyColString(StringBuilder pkString, RecordClassBean recordClass) throws WdkModelException {
    String[] pkColumns = recordClass.getPrimaryKeyColumns();
    int geneSourceIdIndex =  -1;
    for (int i=0; i<pkColumns.length; i++) {
      pkString.append((i==0? "" :", ") + pkColumns[i]);
      if (pkColumns[i].toLowerCase().equals("gene_source_id")) geneSourceIdIndex = i;
    }
    if (geneSourceIdIndex == -1) throw new WdkModelException("Can't find primary key column 'gene_source_id' when trying to expand basket from genes to transcripts");
    return geneSourceIdIndex;
  }
  
  private void runBatch(DataSource dataSource, String sql, List<String[]> expandedRecords, String[] pkColumns) throws WdkModelException {
    ResultSet resultSet = null;
    try {
      resultSet = SqlUtils.executeQuery(dataSource, sql, "expand-basket-to-transcripts");
      while (resultSet.next()) {
	String[] row = new String[pkColumns.length];
        for (int i = 0; i<pkColumns.length; i++) row[i] = resultSet.getString(i+1);
        expandedRecords.add(row);
      }
    }
    catch (SQLException e) {
      throw new WdkModelException("failed running SQL to expand basket: " + sql + e);
    }
    finally {
      if (resultSet != null) SqlUtils.closeResultSetAndStatement(resultSet, null);
    }
 
  }
  
  private boolean isGeneRequest() {
    return "GeneRecordClasses.GeneRecordClass".equals(_request.getParameter("type"));
  }

}