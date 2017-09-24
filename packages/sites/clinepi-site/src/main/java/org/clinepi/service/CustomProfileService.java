package org.clinepi.service;

import static org.gusdb.fgputil.FormatUtil.join;

import java.util.Collections;
import java.util.List;

import org.gusdb.fgputil.accountdb.UserPropertyName;
import org.gusdb.wdk.model.WdkModel;
import org.gusdb.wdk.model.user.User;
import org.gusdb.wdk.service.formatter.Keys;
import org.gusdb.wdk.service.formatter.UserFormatter;
import org.gusdb.wdk.service.service.user.ProfileService;
import org.json.JSONObject;

public class CustomProfileService extends ProfileService {

  private static final String APPROVED_STUDIES_KEY = "approvedStudies";

  public CustomProfileService(String uid) {
    super(uid);
  }

  @Override
  protected JSONObject formatUser(User user, boolean isSessionUser, boolean includePrefs, List<UserPropertyName> propNames) {
    JSONObject basicUser = UserFormatter.getUserJson(user, isSessionUser, includePrefs, propNames);
    if (isSessionUser) {
      // append property telling which studies this user has special access to
      basicUser
        .getJSONObject(Keys.PROPERTIES)
        .put(APPROVED_STUDIES_KEY, join(getApprovedStudies(user.getUserId(), getWdkModel()), ","));
    }
    return basicUser;
  }

  private static List<String> getApprovedStudies(long userId, WdkModel wdkModel) {
    // TODO: Read DB table to determine approved study list for this user
    return Collections.EMPTY_LIST;
  }
}
