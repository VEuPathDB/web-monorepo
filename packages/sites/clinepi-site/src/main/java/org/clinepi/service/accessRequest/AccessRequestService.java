package org.clinepi.service.accessRequest;

import java.util.Map;

import javax.ws.rs.Consumes;
import javax.ws.rs.InternalServerErrorException;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import org.apache.log4j.Logger;
import org.gusdb.fgputil.json.JsonUtil;
import org.gusdb.wdk.model.Utilities;
import org.gusdb.wdk.service.service.AbstractWdkService;
import org.json.JSONObject;

@Path("/request-access/users/{user-id}/datasets/{dataset-presenter-id}")
public class AccessRequestService extends AbstractWdkService {
  
  private static final Logger LOG = Logger.getLogger(AccessRequestService.class);

  @POST
  @Consumes(MediaType.APPLICATION_JSON)
  @Produces(MediaType.TEXT_PLAIN)
  public Response buildResult(
      String body,
      @PathParam("user-id") long userId,
      @PathParam("dataset-presenter-id") String datasetPresenterId) {
    
    if (userId != this.getSessionUserId()) {
      return Response.status(Status.UNAUTHORIZED).build();
    }
    
    try {
      JSONObject bodyJson = new JSONObject(body);
      AccessRequestParams params = parseAccessRequestParams(userId, datasetPresenterId, bodyJson);

      AccessRequestSubmitter.submitAccessRequest(
        params, 
        this.getWdkModel(),
        Utilities::sendEmail
      );

      return Response.status(Status.NO_CONTENT).build();
    } 
    catch (Exception ex) {
      LOG.error("Error while submitting data access request", ex);
      throw new InternalServerErrorException(ex);
    }
  }

  public AccessRequestParams parseAccessRequestParams(long userId, String datasetPresenterId, JSONObject bodyJson) {
    String datasetName = bodyJson.getString("datasetName");
    String restrictionLevel = bodyJson.getString("restrictionLevel");
    String providerEmail = bodyJson.getString("providerEmail");
    String bodyTemplate = bodyJson.getString("bodyTemplate");
    boolean requestNeedsApproval = bodyJson.getBoolean("requestNeedsApproval");

    JSONObject formFieldsJson = JsonUtil.getJsonObjectOrDefault(bodyJson, "formFields", new JSONObject());
    Map<String, String> formFields = JsonUtil.parseProperties(formFieldsJson);

    return new AccessRequestParams(
      userId, 
      datasetPresenterId, 
      datasetName, 
      restrictionLevel, 
      providerEmail, 
      bodyTemplate, 
      requestNeedsApproval ? 1 : 0, 
      formFields
    );
  }

}
