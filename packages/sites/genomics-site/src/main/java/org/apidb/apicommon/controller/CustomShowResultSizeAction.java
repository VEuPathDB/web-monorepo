package org.apidb.apicommon.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.log4j.Logger;
import org.apidb.apicommon.model.TranscriptUtil;
import org.gusdb.fgputil.FormatUtil;
import org.gusdb.fgputil.FormatUtil.Style;
import org.gusdb.fgputil.cache.ValueProductionException;
import org.gusdb.fgputil.db.runner.SQLRunner;
import org.gusdb.fgputil.validation.ValidObjectFactory.RunnableObj;
import org.gusdb.fgputil.validation.ValidationLevel;
import org.gusdb.wdk.cache.CacheMgr;
import org.gusdb.wdk.cache.FilterSizeCache.AllSizesFetcher;
import org.gusdb.wdk.cache.FilterSizeCache.FilterSizeGroup;
import org.gusdb.wdk.controller.action.ShowResultSizeAction;
import org.gusdb.wdk.controller.actionutil.ActionUtility;
import org.gusdb.wdk.model.Utilities;
import org.gusdb.wdk.model.WdkModel;
import org.gusdb.wdk.model.WdkModelException;
import org.gusdb.wdk.model.WdkUserException;
import org.gusdb.wdk.model.answer.AnswerFilterInstance;
import org.gusdb.wdk.model.answer.AnswerValue;
import org.gusdb.wdk.model.answer.factory.AnswerValueFactory;
import org.gusdb.wdk.model.answer.spec.AnswerSpec;
import org.gusdb.wdk.model.query.Query;
import org.gusdb.wdk.model.query.SqlQuery;
import org.gusdb.wdk.model.user.Step;

/**
 * Loads filter result sizes using a custom query defined in the model
 * 
 * @author rdoherty
 */
public class CustomShowResultSizeAction extends ShowResultSizeAction {

  private static final Logger LOG = Logger.getLogger(CustomShowResultSizeAction.class);

  // Query set where custom query lives
  private static final String CUSTOM_FILTER_SIZE_QUERY_SET = "GeneSummaries";

  // Custom query name
  private static final String CUSTOM_FILTER_SIZE_QUERY_NAME = "bulkAnswerFilterCounts";

  // column of custom query result that contains filter name (or species param to filter)
  private static final String FILTER_NAME_COLUMN = "filter_name";

  // column of custom query result that contains result size for that filter
  private static final String FILTER_SIZE_COLUMN = "count";

  public static class CustomAllSizesFetcher extends AllSizesFetcher {
    
    public CustomAllSizesFetcher(WdkModel wdkModel) {
      super(wdkModel);
    }

    @Override
    public FilterSizeGroup getUpdatedValue(Long stepId, FilterSizeGroup previousVersion)
        throws ValueProductionException {
      try {
        RunnableObj<Step> step = _wdkModel.getStepFactory()
            .getStepById(stepId, ValidationLevel.RUNNABLE)
            .orElseThrow(() -> new WdkUserException("Could not find step with ID: " + stepId))
            .getRunnable()
            .getOrThrow(s -> new WdkUserException("Step with ID " + stepId + " is not valid."));
        AnswerValue answerValue = AnswerValueFactory.makeAnswer(step);
        if (!TranscriptUtil.isTranscriptQuestion(answerValue.getAnswerSpec().getQuestion())) {
          return super.getUpdatedValue(stepId, previousVersion);
        }
        previousVersion.sizeMap = getAllFilterDisplaySizes(answerValue, _wdkModel);
        previousVersion.allFiltersLoaded = true;
        return previousVersion;
      }
      catch (WdkUserException | WdkModelException e) {
        throw new ValueProductionException(e);
      }
    }
  }

  private static Map<String, Integer> getAllFilterDisplaySizes(AnswerValue answerValue, WdkModel wdkModel)
      throws WdkModelException {
    Map<String, Integer> queryResults = getSizesFromCustomQuery(answerValue, wdkModel);
    LOG.debug("Bulk query returned: " + FormatUtil.prettyPrint(queryResults, Style.MULTI_LINE));
    Map<String, Integer> finalResults = new HashMap<>();
    List<String> unfoundFilters = new ArrayList<>();
    // build list of actual results from query results and get list of filters not provided by query
    for (AnswerFilterInstance filterInstance : answerValue.getAnswerSpec().getQuestion().getRecordClass().getFilterInstances()) {
      String filterName = filterInstance.getName();
      Map<String, String> answerFilterParams = filterInstance.getParamValueMap();
      Object firstParamValue = answerFilterParams.isEmpty() ? null : answerFilterParams.values().iterator().next();
      if (queryResults.containsKey(filterName)) {
        finalResults.put(filterName, queryResults.get(filterName));
      }
      // hack since query results may contain a count value keyed on filter param value instead of name
      else if (firstParamValue != null && queryResults.containsKey(firstParamValue)) {
        finalResults.put(filterName, queryResults.get(firstParamValue));
      }
      else {
        // custom size query did not return result for this filter; add to list of remaining filters
        unfoundFilters.add(filterName);
      }
    }
    // get filter sizes not found by custom query in the traditional way (each costs us a trip to the DB)
    finalResults.putAll(answerValue.getResultSizeFactory().getFilterDisplaySizes(unfoundFilters));
    LOG.debug("Generated " + finalResults.size() + " from bulk filter size query and individual queries: " +
        FormatUtil.prettyPrint(finalResults, Style.MULTI_LINE));
    return finalResults;
  }

  private static Map<String, Integer> getSizesFromCustomQuery(AnswerValue answerValue, WdkModel wdkModel)
      throws WdkModelException {
    Query query = wdkModel.getQuerySet(CUSTOM_FILTER_SIZE_QUERY_SET).getQuery(CUSTOM_FILTER_SIZE_QUERY_NAME);
    AnswerValue clone = AnswerValueFactory.makeAnswer(answerValue, AnswerSpec
        .builder(answerValue.getAnswerSpec())
        .setLegacyFilterName(null)
        .buildRunnable(answerValue.getUser(), answerValue.getAnswerSpec().getStepContainer()));
    String sql = ((SqlQuery)query).getSql().replace(Utilities.MACRO_ID_SQL, clone.getIdSql());
    LOG.debug("Running query: " + query.getFullName() + " with SQL: " + sql);
    return new SQLRunner(wdkModel.getAppDb().getDataSource(), sql, CUSTOM_FILTER_SIZE_QUERY_NAME)
        .executeQuery(rs -> {
      Map<String, Integer> querySizes = new HashMap<>();
      while (rs.next()) {
        querySizes.put(rs.getString(FILTER_NAME_COLUMN), rs.getInt(FILTER_SIZE_COLUMN));
      }
      LOG.debug("Loaded " + querySizes.size() + " from bulk filter size query: " +
          FormatUtil.prettyPrint(querySizes, Style.MULTI_LINE));
      return querySizes;
    });
  }

  // no filter is specified, will return all (legacy) filter sizes for the given step
  @Override
  protected String getFilterResultSizes(int stepId)
      throws WdkModelException, WdkUserException {
    LOG.debug("Loading result sizes for step " + stepId);
    WdkModel wdkModel = ActionUtility.getWdkModel(getServlet()).getModel();
    Map<String, Integer> sizes = CacheMgr.get().getFilterSizeCache()
        .getFilterSizes(stepId, new CustomAllSizesFetcher(wdkModel));
    return getFilterSizesJson(sizes);
  }
}
