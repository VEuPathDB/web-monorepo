package org.clinepi.service.accessRequest;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static org.gusdb.fgputil.FormatUtil.escapeHtml;

import org.eupathdb.common.model.contact.EmailSender;
import org.gusdb.fgputil.db.SqlUtils;
import org.gusdb.wdk.model.WdkModel;
import org.gusdb.wdk.model.WdkModelException;

public class AccessRequestSubmitter {
  
  public enum SubmissionResult {
    SUCCESSFUL,
    ALREADY_REQUESTED
  }

  public static SubmissionResult submitAccessRequest(AccessRequestParams params, WdkModel wdkModel, EmailSender emailSender) throws SQLException, WdkModelException {
    boolean requestInitiated = false;

    // In one transaction... 
    //   (1) insert a DB record for the new request and 
    //   (2) email the request to the appropriate parties
    try (
        Connection conn = wdkModel.getUserDb().getDataSource().getConnection();
    ) {
      conn.setAutoCommit(false);
      String sql = insertRequestPreparedStatementBody();
      
      try (
          PreparedStatement ps = insertRequestPreparedStatement(conn, sql, params);
      ) {
        SqlUtils.executePreparedStatement(ps, sql, "write-access-request");
        boolean insertionPerformed = ps.getUpdateCount() == 1;

        if (insertionPerformed) {
          if (params.approvalNeeded() && !params.inTestMode()) {
            emailAccessRequest(emailSender, params, wdkModel);
          }

          requestInitiated = true;
        }

        if (!params.inTestMode()) {
          conn.commit();
        }     
      }
      // Either the DB update (SQLException) or email submission (WdkModelException) 
      // has failed, and so we roll back the record insertion
      catch (SQLException | WdkModelException ex) {
        conn.rollback();
        throw new WdkModelException(ex);
      }
    }

    return requestInitiated || params.inTestMode() ? SubmissionResult.SUCCESSFUL : SubmissionResult.ALREADY_REQUESTED;
  }

  private static String insertRequestPreparedStatementBody() {
    List<String> insertStatementColumns = Arrays.asList(
      "user_id",
      "dataset_presenter_id",
      "restriction_level",
      "purpose",
      "research_question",
      "analysis_plan",
      "dissemination_plan",
      "approval_status"
    );

    List<String> insertStatementPlaceholders = insertStatementColumns
      .stream()
      .map(x -> "?")
      .collect(Collectors.toList());

    return String.format(
      "INSERT INTO userlogins5.ValidDatasetUser (%s)    " + 
      "SELECT                                    %s     " +
      "FROM dual                                        " +
      "WHERE NOT EXISTS (                               " +
      "  SELECT user_id, dataset_presenter_id           " +
      "  FROM userlogins5.ValidDatasetUser              " +
      "  WHERE user_id = ? AND dataset_presenter_id = ? " +
      ")                                                ",
      String.join(", ", insertStatementColumns),
      String.join(", ", insertStatementPlaceholders)
    );
  }

  private static PreparedStatement insertRequestPreparedStatement(Connection conn, String psBody, AccessRequestParams params)
      throws SQLException {
    PreparedStatement ps = conn.prepareStatement(psBody);

    ps.setInt(1, params.getUserId());
    ps.setString(2, params.getDatasetId());
    ps.setString(3, params.getRestrictionLevel());
    ps.setString(4, params.getPurpose());
    ps.setString(5, params.getResearchQuestion());
    ps.setString(6, params.getAnalysisPlan());
    ps.setString(7, params.getDisseminationPlan());
    ps.setInt(8, params.getApprovalType());
    ps.setInt(9, params.getUserId());
    ps.setString(10, params.getDatasetId());

    return ps;
  }

  public static void emailAccessRequest(EmailSender emailSender, AccessRequestParams params, WdkModel wdkModel) throws WdkModelException {
    String requesterEmail = params.getRequesterEmail();
    String datasetName = params.getDatasetName();

    String bodyTemplate = params.getBodyTemplate();
    Map<String, String> formFields = params.getFormFields();

    String subject = String.format(
      "%s (%s) Requests Access to ClinEpiDB Dataset %s",
      params.getRequesterName(),
      requesterEmail,
      datasetName
    );
    String body = createAccessRequestEmailBody(bodyTemplate, formFields, datasetName);

    emailSender.sendEmail(
      wdkModel.getModelConfig().getSmtpServer(),
      params.getProviderEmail(),
      requesterEmail,
      subject,
      body,
      wdkModel.getProperties().get("CLINEPI_ACCESS_REQUEST_EMAIL"),
      params.getBccEmail(),
      null
    );
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

}
