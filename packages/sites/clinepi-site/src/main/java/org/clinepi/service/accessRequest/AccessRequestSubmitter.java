package org.clinepi.service.accessRequest;

import java.sql.SQLException;
import java.sql.SQLIntegrityConstraintViolationException;
import java.util.Map;

import static org.gusdb.fgputil.FormatUtil.escapeHtml;

import org.eupathdb.common.model.contact.EmailSender;
import org.gusdb.fgputil.db.SqlUtils;
import org.gusdb.wdk.model.WdkModel;
import org.gusdb.wdk.model.WdkModelException;

public class AccessRequestSubmitter {

  private static String columns = String.join(
    ", ",
    "user_id",
    "dataset_presenter_id",
    "restriction_level",
    "purpose",
    "research_question",
    "analysis_plan",
    "dissemination_plan",
    "approval_status"
  );

  public static void submitAccessRequest(AccessRequestParams params, WdkModel wdkModel, EmailSender emailSender) throws WdkModelException {
    emailAccessRequest(params, wdkModel, emailSender);
    recordAccessRequest(params, wdkModel);
  }

  public static void emailAccessRequest(AccessRequestParams params, WdkModel wdkModel, EmailSender emailSender) throws WdkModelException {
    String bodyTemplate = params.getBodyTemplate();
    Map<String, String> formFields = params.getFormFields();

    String datasetName = params.getDatasetName();
    String requesterName = params.getRequesterName();

    String providerEmail = params.getProviderEmail();
    String requesterEmail = params.getRequesterEmail();
    String clinEpiEmail = wdkModel.getProperties().get("CLINEPI_ACCESS_REQUEST_EMAIL");

    String smtpServer = wdkModel.getModelConfig().getSmtpServer();

    String subject = String.format(
      "%s (%s) Requests Access to ClinEpiDB Dataset %s",
      requesterName,
      requesterEmail,
      datasetName
    );
    String body = createAccessRequestEmailBody(bodyTemplate, formFields, datasetName);

    emailSender.sendEmail(
      smtpServer,
      providerEmail,
      requesterEmail,
      subject,
      body,
      clinEpiEmail,
      null
    );
  }

  public static void recordAccessRequest(AccessRequestParams params, WdkModel wdkModel) throws WdkModelException {
    try {
      SqlUtils.executeUpdate(
        wdkModel.getUserDb().getDataSource(),
        insertRequestQuery(params), 
        "record-access-request"
      );
    } 
    catch (SQLException ex) {
      // A SQLIntegrityConstraintViolationException is OK - it indicates
      // that there is already an outstanding access request for this user-dataset pair,
      // and so a new record should not be added to the ValidDatasetUser table
      if (!(ex.getCause() instanceof SQLIntegrityConstraintViolationException)) {
        throw new WdkModelException(ex);
      }
    }
  }

  private static String createAccessRequestEmailBody(String bodyTemplate, Map<String, String> formFields, String datasetName) {
    String bodyWithFilledOutFormFields = formFields.entrySet().stream().reduce(
      bodyTemplate,
      (body, entry) -> body.replaceAll(
        "\\$\\$" + entry.getKey().toUpperCase() + "\\$\\$", 
        escapeHtml(entry.getValue())
      ),
      String::concat
    );

    return bodyWithFilledOutFormFields.replaceAll(
      "\\$\\$DATASET_NAME\\$\\$",
      escapeHtml(datasetName)
    );
  }

  private static String insertRequestQuery(AccessRequestParams params) {
    String userId = Long.toString(params.getUserId());
    String datasetPresenterId = sqlString(params.getDatasetPresenterId());
    String restrictionLevel = sqlString(params.getRestrictionLevel());
    String purpose = sqlString(params.getPurpose());
    String researchQuestion = sqlString(params.getResearchQuestion());
    String analysisPlan = sqlString(params.getAnalysisPlan());
    String disseminationPlan = sqlString(params.getDisseminationPlan());
    String approvalType = Integer.toString(params.getApprovalType());
    
    String values = String.join(
      ", ",
      userId,
      datasetPresenterId,
      restrictionLevel,
      purpose,
      researchQuestion,
      analysisPlan,
      disseminationPlan,
      approvalType
    );

    return String.format(
      "INSERT INTO userlogins5.ValidDatasetUser (%s) " + 
      "VALUES                                   (%s) ",
      columns,
      values
    );
  }

  private static String sqlString(String str) {
    return "'" + str + "'";
  }

}
