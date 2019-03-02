package org.clinepi.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import javax.ws.rs.PathParam;

import org.gusdb.fgputil.accountdb.UserPropertyName;
import org.gusdb.fgputil.validation.ValidObjectFactory.RunnableObj;
import org.gusdb.wdk.core.api.JsonKeys;
import org.gusdb.wdk.model.WdkModelException;
import org.gusdb.wdk.model.WdkUserException;
import org.gusdb.wdk.model.answer.AnswerValue;
import org.gusdb.wdk.model.answer.factory.AnswerValueFactory;
import org.gusdb.wdk.model.answer.spec.AnswerSpec;
import org.gusdb.wdk.model.answer.stream.FileBasedRecordStream;
import org.gusdb.wdk.model.answer.stream.RecordStream;
import org.gusdb.wdk.model.record.RecordInstance;
import org.gusdb.wdk.model.record.attribute.AttributeField;
import org.gusdb.wdk.model.user.StepContainer;
import org.gusdb.wdk.model.user.User;
import org.gusdb.wdk.service.formatter.UserFormatter;
import org.gusdb.wdk.service.service.user.ProfileService;
import org.json.JSONArray;
import org.json.JSONObject;

public class CustomProfileService extends ProfileService {

  private static final String APPROVED_STUDIES_KEY = "approvedStudies";
  private static final String APPROVED_STUDIES_QUESTION = "DatasetQuestions.DatasetsByUserId";
  private static final String STUDY_ATTR = "study_id";
  private static final String RESTR_LEVEL_ATTR = "restriction_level";

  public CustomProfileService(@PathParam(USER_ID_PATH_PARAM) String uid) {
    super(uid);
  }

  @Override
  protected JSONObject formatUser(User user, boolean isSessionUser, boolean includePrefs,
      List<UserPropertyName> propNames) throws WdkModelException {

    JSONObject basicUser = UserFormatter.getUserJson(user, isSessionUser, includePrefs, propNames);
    if (isSessionUser) {
      // append property telling which studies this user has special access to
      basicUser.getJSONObject(JsonKeys.PROPERTIES).put(APPROVED_STUDIES_KEY,
          new JSONArray(getApprovedStudies(user)));
    }
    return basicUser;
  }

  private List<String> getApprovedStudies(User user) throws WdkModelException {
    List<String> approvedStudies = new ArrayList<>();
    try {
      RunnableObj<AnswerSpec> answerSpec = AnswerSpec
          .builder(getWdkModel())
          .setQuestionName(APPROVED_STUDIES_QUESTION)
          .buildRunnable(user, StepContainer.emptyContainer());
      AnswerValue answer = AnswerValueFactory.makeAnswer(user, answerSpec);
      answer.setPageToEntireResult();
      List<AttributeField> fields = Arrays
          .stream(new String[]{ RESTR_LEVEL_ATTR, STUDY_ATTR })
          .map(name -> answerSpec.get().getQuestion().getAttributeFieldMap().get(name))
          .collect(Collectors.toList());
      try (RecordStream records = new FileBasedRecordStream(answer, fields, Collections.emptyList())) {
        for (RecordInstance record : records) {
          if (record.getAttributeValue(RESTR_LEVEL_ATTR).getValue().toString().equals("public"))
            approvedStudies.add(record.getAttributeValue(STUDY_ATTR).getValue().toString());
        }
        return approvedStudies;
      }
    }
    catch (WdkUserException e) {
      throw new WdkModelException(e);
    }
  }
}
