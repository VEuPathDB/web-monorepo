package org.clinepi.service;

import org.gusdb.wdk.model.WdkModelException;
import org.gusdb.wdk.service.service.ProjectService;
import org.json.JSONObject;

public class CustomProjectService extends ProjectService {

  @Override
  protected JSONObject addSupplementalProjectInfo(JSONObject projectJson) throws WdkModelException {
    return projectJson.put("showUnreleasedData", Boolean.valueOf(getWdkModel().getProperties().get("SHOW_UNRELEASED_DATA")));
  }
}
