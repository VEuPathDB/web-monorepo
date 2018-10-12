package org.clinepi.service.accessRequest;

import java.sql.SQLException;
import java.util.List;

import javax.ws.rs.BadRequestException;
import javax.ws.rs.Consumes;
import javax.ws.rs.NotFoundException;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import org.apache.log4j.Logger;
import org.clinepi.service.accessRequest.AccessRequestSubmitter.SubmissionResult;
import org.gusdb.fgputil.json.JsonUtil;
import org.gusdb.wdk.model.WdkModelException;
import org.gusdb.wdk.model.WdkUserException;
import org.gusdb.wdk.model.record.PrimaryKeyValue;
import org.gusdb.wdk.model.record.RecordClass;
import org.gusdb.wdk.model.record.RecordInstance;
import org.gusdb.wdk.service.request.RecordRequest;
import org.gusdb.wdk.service.request.exception.ConflictException;
import org.gusdb.wdk.service.request.exception.DataValidationException;
import org.gusdb.wdk.service.service.RecordService;
import org.gusdb.wdk.service.service.user.UserService;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class AccessRequestService extends UserService {
  
  private static final Logger LOG = Logger.getLogger(AccessRequestService.class);
  private static final String DATASET_RECORD_CLASS = "DatasetRecordClasses.DatasetRecordClass";

  interface DatasetAccessRequestAttributes {
    public String getStudyAccess() throws WdkModelException, WdkUserException;
    public String getDisplayName() throws WdkModelException, WdkUserException;
    public String getRequestEmail() throws WdkModelException, WdkUserException;
    public String getRequestEmailBody() throws WdkModelException, WdkUserException;
    public Integer getRequestNeedsApproval() throws WdkModelException, WdkUserException;
  }

  public AccessRequestService(@PathParam(USER_ID_PATH_PARAM) String userId) {
    super(userId);
  }

  // N.B.: 
  // Arguably, this endpoint should not be a PUT, as it is not idempotent.
  // Indeed, if a pre-existing record is found, we report a 409 - Resource Conflict
  // instead of updating said record.
  @PUT
  @Path("access-request/{dataset-id}")
  @Consumes(MediaType.APPLICATION_JSON)
  public Response buildAccessRequest(
      String body,
      @PathParam(USER_ID_PATH_PARAM) int userId,
      @PathParam("dataset-id") String datasetId) throws WdkModelException, ConflictException, DataValidationException {
    LOG.info("Handling an access request for user id " + userId + " and dataset id " + datasetId + "...");

    if (userId != this.getSessionUserId() || this.getSessionUser().isGuest()) {
      return Response.status(Status.UNAUTHORIZED).build();
    }

    try {
      JSONObject requestJson = new JSONObject(body);
      DatasetAccessRequestAttributes datasetAttributes = retrieveDatasetRecordInstance(datasetId);
      AccessRequestParams params = parseAccessRequestParams(userId, datasetId, requestJson, datasetAttributes);

      SubmissionResult result = AccessRequestSubmitter.submitAccessRequest(
        params, 
        this.getWdkModel(),
        Utilities::sendEmail
      );
      
      if (result == SubmissionResult.ALREADY_REQUESTED) {
        throw new ConflictException("The user with id " + userId + " already has an outstanding request for the dataset with id " + datasetId);
      }

      return Response.accepted().build();
    }
    catch (JSONException ex) {
      throw new BadRequestException(ex);
    }
    // Due to our checks in retrieveDatasetRecordParams, a WdkUserException should not be thrown
    catch (SQLException | WdkUserException ex) {
      throw new WdkModelException(ex);
    }
  }

  public DatasetAccessRequestAttributes retrieveDatasetRecordInstance(String datasetId) throws DataValidationException, WdkModelException {
    RecordClass datasetRecordClass = RecordService.getRecordClassOrNotFound(
      DATASET_RECORD_CLASS, 
      getWdkModel()
    );

    List<RecordInstance> records = RecordClass.getRecordInstances(
      getSessionUser(), 
      createPrimaryKeyValue(datasetRecordClass, datasetId)
    );

    if (records.size() != 1) {
      throw new NotFoundException(formatNotFound("Could not find a unique dataset with id " + datasetId));
    }

    return new DatasetAccessRequestAttributes() {
      private RecordInstance record = records.get(0);
      
      private String getAttributeValueString(String key) throws WdkModelException, WdkUserException {
        return record.getAttributeValue(key).getDisplay();
      }

      public String getStudyAccess() throws WdkModelException, WdkUserException {
      // return getAttributeValueString("restriction_level");
      // the form does not currently include the user request for a specific study access, we always grant public access
        return "public";
      }

      public String getDisplayName() throws WdkModelException, WdkUserException {
        return getAttributeValueString("display_name");
      }
      
      public String getRequestEmail() throws WdkModelException, WdkUserException {
        return getAttributeValueString("request_email");
      }

      public String getRequestEmailBody() throws WdkModelException, WdkUserException {
        return getAttributeValueString("request_email_body");
      }

      public Integer getRequestNeedsApproval() throws NumberFormatException, WdkModelException, WdkUserException {
        return Integer.parseInt(getAttributeValueString("request_needs_approval"));
      }
    };
  }

  public static PrimaryKeyValue createPrimaryKeyValue(RecordClass datasetRecordClass, String datasetId) throws DataValidationException, WdkModelException {
    JSONObject primaryKeyJson = new JSONObject()
      .put("name", "dataset_id")
      .put("value", datasetId);

    return RecordRequest.parsePrimaryKey(
      new JSONArray().put(primaryKeyJson), 
      datasetRecordClass
    );
  }

  public static AccessRequestParams parseAccessRequestParams(
      int userId, 
      String datasetId, 
      JSONObject requestJson, 
      DatasetAccessRequestAttributes datasetAttributes) throws WdkModelException, WdkUserException {
    return new AccessRequestParams(
      JsonUtil.getBooleanOrDefault(requestJson, "testing", false),
      userId, 
      datasetId,
      datasetAttributes.getDisplayName(),
      datasetAttributes.getStudyAccess(),
      datasetAttributes.getRequestEmail(),
      datasetAttributes.getRequestEmailBody(),
      datasetAttributes.getRequestNeedsApproval(),
      JsonUtil.parseProperties(requestJson)
    );
  }

}
