package org.clinepi.service.accessRequest;

import java.util.Map;

public class AccessRequestParams {
  private final long userId;
  private final String datasetPresenterId;

  private final String datasetName;
  private final String restrictionLevel;
  private final String providerEmail;
  private final String bodyTemplate;
  private final int approvalType;

  private final Map<String, String> formFields;
  
  public AccessRequestParams(
      long userId,
      String datasetPresenterId,
      String datasetName,
      String restrictionLevel,
      String providerEmail,
      String bodyTemplate,
      int approvalType,
      Map<String, String> formFields) {
    this.userId = userId;
    this.datasetPresenterId = datasetPresenterId;

    this.datasetName = datasetName;
    this.restrictionLevel = restrictionLevel;
    this.providerEmail = providerEmail;
    this.bodyTemplate = bodyTemplate;
    this.approvalType = approvalType;

    this.formFields = formFields;
  }

  public long getUserId() {
    return userId;
  }

  public String getDatasetPresenterId() {
    return datasetPresenterId;
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

  public String getBodyTemplate() {
    return bodyTemplate;
  }

  public int getApprovalType() {
    return approvalType;
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
