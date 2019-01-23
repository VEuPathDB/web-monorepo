package org.apidb.apicommon.model.view;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.apache.log4j.Logger;
import org.apidb.apicommon.model.filter.RepresentativeTranscriptFilter;
import org.gusdb.fgputil.FormatUtil;
import org.gusdb.fgputil.functional.TreeNode;
import org.gusdb.wdk.controller.summary.ResultTablePaging;
import org.gusdb.wdk.controller.summary.SummaryTableUpdateProcessor;
import org.gusdb.wdk.model.FieldTree;
import org.gusdb.wdk.model.FieldTree.NameMatchPredicate;
import org.gusdb.wdk.model.SelectableItem;
import org.gusdb.wdk.model.WdkModel;
import org.gusdb.wdk.model.WdkModelException;
import org.gusdb.wdk.model.WdkUserException;
import org.gusdb.wdk.model.answer.AnswerValue;
import org.gusdb.wdk.model.answer.AnswerValueAttributes;
import org.gusdb.wdk.model.answer.SummaryViewHandler;
import org.gusdb.wdk.model.jspwrap.AnswerValueBean;
import org.gusdb.wdk.model.jspwrap.StepBean;
import org.gusdb.wdk.model.jspwrap.UserBean;
import org.gusdb.wdk.model.record.attribute.AttributeField;
import org.gusdb.wdk.model.user.Step;
import org.gusdb.wdk.model.user.User;
import org.gusdb.wdk.model.user.UserPreferences;

public class TranscriptViewHandler implements SummaryViewHandler {

  private static final Logger LOG = Logger.getLogger(TranscriptViewHandler.class);

  private static final String PRIMARY_KEY_FIELD = "primary_key";
  private static final String TRANSCRIPT_ID_FIELD = "transcript_link";
  private static final String TRANSCRIPT_FILTERED_STEP = "modifiedStep";

  @Override
  public Map<String, Object> process(Step step, Map<String, String[]> parameters,
      User user, WdkModel wdkModel) throws WdkModelException, WdkUserException {

    // check to see if this request is asking to write summary attributes, sorting, or paging?
    LOG.info("Call to " + getClass().getSimpleName() + " with params: " + FormatUtil.paramsToString(parameters));

    // customize step params and any filters (legacy, normal, view)
    step = RepresentativeTranscriptFilter.applyToStepFromUserPreference(step, user);

    // create beans for convenience
    UserBean userBean = new UserBean(user);
    StepBean stepBean = new StepBean(userBean, step);

    // get initial view answer value; we will customize it next
    AnswerValue answer = step.getViewAnswerValue();

    // set up paging based on request params
    Map<String, Object> model = ResultTablePaging.processPaging(
        parameters, stepBean.getQuestion(), userBean, new AnswerValueBean(answer));

    // get base available attributes 
    // (since this is not serving the Add Columns popup anymore we do not need a tree, could be a List)
    AnswerValueAttributes attributes = answer.getAttributes(); // all in record plus question specific
    FieldTree tree = attributes.getDisplayableAttributeTree();
    TreeNode<SelectableItem> root = tree.getRoot();

    // override summary attributes: 
    //   get the summary attrbs to be included in the results page for this *specific* step result,
    //   and trim off those NOT in root (which contains all model attributes, available to this view)
    //   this trimming will cleanup old attr in preferences
    AttributeField[] leftmostFields = getLeftmostFields(stepBean);
    Map<String, AttributeField> summaryFields = AnswerValueAttributes.buildSummaryAttributeFieldMap(
        user, step.getQuestion(), UserPreferences.DEFAULT_SUMMARY_VIEW_PREF_SUFFIX, leftmostFields);
    trimAttribsNotInTree(summaryFields, root, leftmostFields);
    attributes.overrideSummaryAttributeFieldMap(summaryFields);

    // assign currently selected columns to be selected nodes in Add Columns pop-up
    tree.setSelectedLeaves(new ArrayList<>(summaryFields.keySet()));
    attributes.overrideDisplayableAttributeTree(tree);

    // customize model (most likely assigning custom variable to a customized step
    // model contains the "model" for this view (does not relate to wdkModel)
    model.put(RepresentativeTranscriptFilter.FILTER_NAME,
        RepresentativeTranscriptFilter.shouldEngageFilter(stepBean.getUser().getUser()));
    // pass the new step to the JSP to be rendered instead of the normal step
    model.put(TRANSCRIPT_FILTERED_STEP, stepBean);

    return model;
  }

  @Override
  public String processUpdate(Step step, Map<String, String[]> parameters, User user, WdkModel wdkModel)
      throws WdkModelException, WdkUserException {
    return SummaryTableUpdateProcessor.processUpdates(step, parameters, user, wdkModel,
        UserPreferences.DEFAULT_SUMMARY_VIEW_PREF_SUFFIX);
  }

  private static void trimAttribsNotInTree(Map<String, AttributeField> attributes,
      TreeNode<SelectableItem> attributeTree, AttributeField[] leftmostFields) {
    List<String> origNames = new ArrayList<>(attributes.keySet());
    for (String name : origNames) {
      // remove if not in tree, but don't remove primary key or chosen leftmost field
      boolean skip = false;
      if (name.equals(PRIMARY_KEY_FIELD)) skip = true;
      for (AttributeField a : leftmostFields) {
        if (name.equals(a.getName())) skip = true;
      }
      if (skip) continue;
      if (attributeTree.findFirst(new NameMatchPredicate(name)) == null) {
        attributes.remove(name);
      }
    }
  }

  private static AttributeField[] getLeftmostFields(StepBean stepBean) throws WdkModelException {
    Map<String,AttributeField> fieldMap = stepBean.getStep().getQuestion().getRecordClass().getAttributeFieldMap();
    AttributeField[] myAttrFieldArray = new AttributeField[]{
        fieldMap.get(PRIMARY_KEY_FIELD), fieldMap.get(TRANSCRIPT_ID_FIELD)
    };
    for(int i=0; i < myAttrFieldArray.length; i++) {
      myAttrFieldArray[i] = myAttrFieldArray[i].clone();
      myAttrFieldArray[i].setRemovable(false);
    }
    return myAttrFieldArray;
  }

}
