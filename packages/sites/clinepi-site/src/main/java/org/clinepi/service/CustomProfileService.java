package org.clinepi.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import javax.ws.rs.PathParam;

import org.apache.log4j.Logger;
import org.gusdb.fgputil.accountdb.UserPropertyName;
import org.gusdb.wdk.model.WdkModelException;
import org.gusdb.wdk.model.WdkUserException;
import org.gusdb.wdk.model.answer.AnswerValue;
import org.gusdb.wdk.model.answer.stream.FileBasedRecordStream;
import org.gusdb.wdk.model.answer.stream.RecordStream;
import org.gusdb.wdk.model.query.Query;
import org.gusdb.wdk.model.query.QueryInstance;
import org.gusdb.wdk.model.question.Question;
import org.gusdb.wdk.model.record.RecordInstance;
import org.gusdb.wdk.model.record.attribute.AttributeField;
import org.gusdb.wdk.model.user.User;
import org.gusdb.wdk.service.formatter.Keys;
import org.gusdb.wdk.service.formatter.UserFormatter;
import org.gusdb.wdk.service.service.user.ProfileService;
import org.json.JSONArray;
import org.json.JSONObject;

public class CustomProfileService extends ProfileService {
  private static final String APPROVED_STUDIES_KEY = "approvedStudies";
	private static final String APPROVED_STUDIES_QUESTION = "DatasetQuestions.DatasetsByUserId";
	private static final String USER_ID_PARAM = "user_id";
	private static final String STUDY_ATTR = "study_id";
	private static final String RESTR_LEVEL_ATTR = "restriction_level";
  
  @SuppressWarnings("unused")
  private static final Logger LOG = Logger.getLogger(CustomProfileService.class);

  public CustomProfileService(@PathParam(USER_ID_PATH_PARAM) String uid) {
    super(uid);
  }

  @Override
  protected JSONObject formatUser(User user, boolean isSessionUser, boolean includePrefs, List<UserPropertyName> propNames) throws WdkModelException {

    JSONObject basicUser = UserFormatter.getUserJson(user, isSessionUser, includePrefs, propNames);
    if (isSessionUser) {
      // append property telling which studies this user has special access to
      basicUser
        .getJSONObject(Keys.PROPERTIES)
        .put(APPROVED_STUDIES_KEY, new JSONArray(getApprovedStudies(user)));
    }
    return basicUser;
  }

  private List<String> getApprovedStudies(User user) throws WdkModelException {
		List<String> approvedStudies = new ArrayList<>();
		try {
			Question question = getWdkModel().getQuestion(APPROVED_STUDIES_QUESTION);
			Query query = question.getQuery();
			Map<String, String> params = new LinkedHashMap<String, String>();
			params.put(USER_ID_PARAM, Long.toString(user.getUserId()));
			QueryInstance<?> instance = query.makeInstance(user, params, true, 0, new LinkedHashMap<String, String>());
			AnswerValue answer = new AnswerValue(user, question, instance, 1, -1, null, null);
			List<AttributeField> fields = Arrays.asList(new String[] { RESTR_LEVEL_ATTR, STUDY_ATTR })
				.stream()
				.map(name -> question.getAttributeFieldMap().get(name))
				.collect(Collectors.toList());
			try (RecordStream records = new FileBasedRecordStream(answer,fields,Collections.emptyList())) {
					for( RecordInstance record : records ) {
						if ( record.getAttributeValue(RESTR_LEVEL_ATTR).getValue().toString().equals("public") ) 
							approvedStudies.add(record.getAttributeValue(STUDY_ATTR).getValue().toString());
					}
					return approvedStudies;
				}
		} catch (WdkUserException e) {
			throw new WdkModelException(e);
		}
	}
}
