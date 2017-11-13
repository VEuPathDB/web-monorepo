package org.clinepi.service;

import java.util.ArrayList;
import java.util.List;

import javax.ws.rs.PathParam;

import org.apache.log4j.Logger;
import org.gusdb.fgputil.accountdb.UserPropertyName;
import org.gusdb.wdk.model.WdkModelException;
import org.gusdb.wdk.model.user.User;
import org.gusdb.wdk.model.xml.XmlAnswerValue;
import org.gusdb.wdk.model.xml.XmlQuestion;
import org.gusdb.wdk.model.xml.XmlRecordInstance;
import org.gusdb.wdk.service.formatter.Keys;
import org.gusdb.wdk.service.formatter.UserFormatter;
import org.gusdb.wdk.service.service.user.ProfileService;
import org.json.JSONArray;
import org.json.JSONObject;

public class CustomProfileService extends ProfileService {

  private static final String APPROVED_STUDIES_KEY = "approvedStudies";
  private static final String APPROVED_STUDIES_QUESTION = "XmlQuestions.StudyApproval";
  
  private static final String USER_ID_ATTR = "user_id";
  private static final String STUDY_ATTR = "study";
  
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
        .put(APPROVED_STUDIES_KEY, new JSONArray(getApprovedStudies(user.getUserId())));
    }
    return basicUser;
  }

  private List<String> getApprovedStudies(long userId) throws WdkModelException {
	List<String> approvedStudies = new ArrayList<>();
	XmlQuestion xmlQuestion = getWdkModel().getXmlQuestionByFullName(APPROVED_STUDIES_QUESTION);
	XmlAnswerValue xmlAnswer = xmlQuestion.getFullAnswer();
	for(XmlRecordInstance record : xmlAnswer.getRecordInstances()) {
      String value = record.getAttribute(USER_ID_ATTR).getValue();
      if(Long.toString(userId).equals(value))
        approvedStudies.add(record.getAttribute(STUDY_ATTR).getValue());
	}  
    return approvedStudies;
  }

}
