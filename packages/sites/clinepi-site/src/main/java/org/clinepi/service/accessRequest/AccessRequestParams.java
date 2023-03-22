package org.clinepi.service.accessRequest;

import java.util.Map;

public class AccessRequestParams {
  private final boolean testing;

  private final int userId;
  private final String datasetId;

  private final String datasetName;
  private final String restrictionLevel;
  private final String providerEmail;
  private final String bccEmail;
  private final String bodyTemplate;
  private final int approvalType;

  private final Map<String, String> formFields;
  
  public AccessRequestParams(
      boolean testing,
      int userId,
      String datasetId,
      String datasetName,
      String restrictionLevel,
      String providerEmail,
      String bccEmail,
      String bodyTemplate,
      int approvalType,
      Map<String, String> formFields) {
    this.testing = testing;

    this.userId = userId;
    this.datasetId = datasetId;

    this.datasetName = datasetName;
    this.restrictionLevel = restrictionLevel;
    this.providerEmail = providerEmail;
    this.bccEmail = bccEmail;
    this.bodyTemplate = bodyTemplate;
    this.approvalType = approvalType;

    this.formFields = formFields;
  }

  public boolean inTestMode() {
    return testing;
  }

  public int getUserId() {
    return userId;
  }

  public String getDatasetId() {
    return datasetId;
  }

  public String getDatasetName() {
    return datasetName;
  }

  public String getRestrictionLevel() {
    return restrictionLevel;
  }

  public String getProviderEmail() {
    return providerEmail;
  }

  public String getBccEmail() {
    return bccEmail;
  }

  public String getBodyTemplate() {
    return bodyTemplate;
  }

  public int getApprovalType() {
    return approvalType;
  }
  
  public boolean approvalNeeded() {
    return approvalType != 0;
  }

  public Map<String, String> getFormFields() {
    return formFields;
  }

  public String getRequesterName() {
    return formFields.get("requester_name");
  }

  public String getRequesterEmail() {
    return formFields.get("requester_email");
  }

  public String getPurpose() {
    return formFields.get("purpose");
  }

  public String getPriorAuth() {
    return formFields.get("prior_auth");
  }

  public String getResearchQuestion() {
    return formFields.get("research_question");
  }

  public String getAnalysisPlan() {
    return formFields.get("analysis_plan");
  }

  public String getDisseminationPlan() {
    return formFields.get("dissemination_plan");
  }

}
