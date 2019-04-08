package org.clinepi.service.services;

import static org.gusdb.fgputil.db.stream.ResultSetInputStream.getResultSetStream;

import javax.ws.rs.DefaultValue;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.apache.log4j.Logger;
import org.gusdb.fgputil.FormatUtil;
import org.gusdb.fgputil.db.stream.ResultSetToJsonConverter;
import org.gusdb.fgputil.functional.Functions;
import org.gusdb.wdk.model.WdkModelException;
import org.gusdb.wdk.service.service.AbstractWdkService;

@Path("/shiny")
public class ShinyQueryService extends AbstractWdkService {

  @SuppressWarnings("unused")
  private static final Logger LOG = Logger.getLogger(ShinyQueryService.class);

  private static class CustomJsonConverter extends ResultSetToJsonConverter {
    private static final byte[] EMPTY_BYTES = new byte[0];
    private static final byte[] NEWLINE_BYTES = FormatUtil.NL.getBytes();
    @Override public byte[] getHeader() { return EMPTY_BYTES; }
    @Override public byte[] getRowDelimiter() { return NEWLINE_BYTES; }
    @Override public byte[] getFooter() { return EMPTY_BYTES; }
  }

  private Response getStreamingResponse(String sql, String queryName, String errorMsgOnFail) throws WdkModelException {
    return Response.ok(
      Functions.mapException(
        () -> getResultSetStream(sql, queryName, getWdkModel().getAppDb().getDataSource(), new CustomJsonConverter()),
        e -> new WdkModelException(errorMsgOnFail + " SQL: " + sql, e)
      )
    ).build();
  }

  @GET
  @Path("Participant/{tblPrefix}/{sourceId}")
  @Produces(MediaType.APPLICATION_JSON)
  public Response getShinyParticipantData(
      @PathParam("sourceId") String sourceId,
      @PathParam("tblPrefix") String tblPrefix,
      @DefaultValue("none") @QueryParam("obsId") String obsId)
          throws WdkModelException {

    String sql = obsId.equals("none")
        ? " select name as Participant_Id, " + sourceId +
          " from apidbtuning." + tblPrefix + "Participants"
        : " select pa.name as Participant_Id" +
          "      , pa." + sourceId + 
          "      , oa." + obsId +
          " from apidbtuning." + tblPrefix + "Participants pa," +
          "      apidbtuning." + tblPrefix + "Observations oa," +
          "      apidbtuning." + tblPrefix + "PartObsIO io" +
          " where pa.pan_id = io.participant_id" +
          "   and io.observation_id = oa.pan_id";

    return getStreamingResponse(sql, "getShinyParticipantData",
        "Failed running SQL to fetch participant data.");
  }

  @GET
  @Path("Household/{tblPrefix}/{sourceId}")
  @Produces(MediaType.APPLICATION_JSON)
  public Response getShinyHouseholdData(
      @PathParam("sourceId") String sourceId,
      @PathParam("tblPrefix") String tblPrefix,
      @DefaultValue("none") @QueryParam("obsId") String obsId) 
          throws WdkModelException {

    // have to remember when calling this that obsId representing time is different for households
    // so ask for a different sourceId, the houseObs equivalent of obsId (ex: gems BFO_0000015->EUPATH_0015467)
    String query = obsId.equals("none")
            ? " with household as (" +
                " select distinct pa.name as Participant_Id," + 
                                " ha." + sourceId + ", 0 as isHouseOb" +
                " from apidbtuning." + tblPrefix + "Participants pa" +
                   " , apidbtuning." + tblPrefix + "Households ha" +
                   " , apidbtuning." + tblPrefix + "HousePartIO io" +
                " where pa.pan_id = io.participant_id" +
                " and io.household_id = ha.pan_id)," +
              " houseob as (" +
                " select distinct pa.name as Participant_Id," +
                                " ha." + sourceId + ", 1 as isHouseOb" +
                " from apidbtuning." + tblPrefix + "Participants pa" +
                  "  , apidbtuning." + tblPrefix + "Households ha" +
                  "  , apidbtuning." + tblPrefix + "HousePartIO io" +
                  "  , apidbtuning." + tblPrefix + "PanIO io2" +
                " where pa.pan_id = io.participant_id" +
                " and io.household_id = io2.input_pan_id" +
                " and io2.output_pan_id = ha.pan_id)," +
              " indicator as (" +
                " select CASE WHEN (count(*) > 0) THEN 0" +
                       " ELSE 1 END as isHouseOb" +
                " from apidbtuning." + tblPrefix + "HouseholdMD" + 
                " where ontology_term_name = '" + sourceId + "'" + 
                " and household_id = household_observation_id)" +
              " select h.Participant_id, h." + sourceId + 
              " from household h, indicator i" +
              " where i.isHouseOb = h.isHouseOb" +  
              " union all" + 
              " select h.Participant_Id, h." + sourceId + 
              " from houseob h, indicator i" +
              " where i.isHouseOb = h.isHouseOb"

            : " with household as (" +
                " select distinct pa.name as Participant_Id" +
                               ", ha." + sourceId + 
                               ", ha." + obsId +
                               ", 0 as isHouseOb" +
                " from apidbtuning." + tblPrefix + "Participants pa" +
                    ", apidbtuning." + tblPrefix + "Households ha" +
                    ", apidbtuning." + tblPrefix + "HousePartIO io" +
                " where pa.pan_id = io.participant_id" +
                " and io.household_id = ha.pan_id)," +
              " houseob as (" +
                " select distinct pa.name as Participant_Id" +
                               ", ha." + sourceId + 
                               ", ha." + obsId +
                               ", 1 as isHouseOb" +
                " from apidbtuning." + tblPrefix + "Participants pa" +
                  "  , apidbtuning." + tblPrefix + "Households ha" +
                  "  , apidbtuning." + tblPrefix + "HousePartIO io" +
                  "  , apidbtuning." + tblPrefix + "PanIO io2" +
                " where pa.pan_id = io.participant_id" +
                " and io.household_id = io2.input_pan_id" +
                " and io2.output_pan_id = ha.pan_id)," +
              " indicator as (" +
                " select CASE WHEN (count(*) > 0) THEN 0" +
                       " ELSE 1 END as isHouseOb" +
                " from apidbtuning." + tblPrefix + "HouseholdMD" +     
                " where ontology_term_name = '" + sourceId + "'" +     
                " and household_id = household_observation_id)" +
              " select h.Participant_id, h." + sourceId + 
                    ", h." + obsId +    
              " from household h, indicator i" +
              " where i.isHouseOb = h.isHouseOb" +     
              " union all" +     
              " select h.Participant_Id, h." + sourceId + 
                    ", h." + obsId +
              " from houseob h, indicator i" +
              " where i.isHouseOb = h.isHouseOb";

    return getStreamingResponse(query, "getShinyHouseholdData",
        "Failed running SQL to fetch household data.");
  }

  @GET
  @Path("Observation/{tblPrefix}/{sourceId}")
  @Produces(MediaType.APPLICATION_JSON)
  public Response getShinyObservationData(
      @PathParam("sourceId") String sourceId,
      @PathParam("tblPrefix") String tblPrefix,
      @DefaultValue("none") @QueryParam("obsId") String obsId) 
          throws WdkModelException {

    String query = obsId.equals("none")
            ? " with obs as (" +
                " select distinct pa.name as Participant_Id," + 
                                " oa." + sourceId +
                " from apidbtuning." + tblPrefix + "Participants pa" +
                   " , apidbtuning." + tblPrefix + "Observations oa" +
                   " , apidbtuning." + tblPrefix + "PartObsIO io" +
                " where pa.pan_id = io.participant_id" +
                " and io.observation_id = oa.pan_id)," +
              " subob as (" +
                " select distinct pa.name as Participant_Id," +
                                " oa." + sourceId +
                " from apidbtuning." + tblPrefix + "Participants pa" +
                  "  , apidbtuning." + tblPrefix + "Observations oa" +
                  "  , apidbtuning." + tblPrefix + "PartObsIO io" +
                  "  , apidbtuning." + tblPrefix + "ObsObsIO io2" +
                " where pa.pan_id = io.participant_id" +
                " and io.observation_id = io2.observation_id" +
                " and io2.sub_observation_id = oa.pan_id)" +
              " select * from obs o" +
              " union" + 
              " select * from subob o"
            : " with obs as (" +
                " select distinct pa.name as Participant_Id" +     
                                ", oa." + sourceId + 
                                ", oa." + obsId +
                " from apidbtuning." + tblPrefix + "Participants pa" +
                    ", apidbtuning." + tblPrefix + "Observations oa" +
                    ", apidbtuning." + tblPrefix + "PartObsIO io" +
                " where pa.pan_id = io.participant_id" +
                " and io.observation_id = oa.pan_id)," +
              " subob as (" +
                " select distinct pa.name as Participant_Id" +
                               ", oa." + sourceId + 
                               ", oa." + obsId +
                " from apidbtuning." + tblPrefix + "Participants pa" +
                    ", apidbtuning." + tblPrefix + "Observations oa" +
                    ", apidbtuning." + tblPrefix + "PartObsIO io" +
                    ", apidbtuning." + tblPrefix + "ObsObsIO io2" +
                " where pa.pan_id = io.participant_id" +
                " and io.observation_id = io2.observation_id" +
                " and io2.sub_observation_id = oa.pan_id)" +
              " select * from obs" +
              " union" +     
              " select * from subob";

    return getStreamingResponse(query, "getShinyObservationData",
        "Failed running SQL to fetch observation data.");
  }

  @GET
  @Path("Sample/{tblPrefix}/{sourceId}")
  @Produces(MediaType.APPLICATION_JSON)
  public Response getShinySampleData(
      @PathParam("sourceId") String sourceId,
      @PathParam("tblPrefix") String tblPrefix,
      @DefaultValue("none") @QueryParam("obsId") String obsId)
          throws WdkModelException {

    String query = obsId.equals("none")
            ? " select pa.name as Participant_Id, sa." + sourceId +
              " from apidbtuning." + tblPrefix + "Participants pa" +
                  ", apidbtuning." + tblPrefix + "Samples sa "+
                  ", apidbtuning." + tblPrefix + "PartObsIO io" +
                  ", apidbtuning." + tblPrefix + "ObsSampleIO io2" +
              " where pa.pan_id = io.participant_id" +
              " and io.observation_id = io2.observation_id" +
              " and io2.sample_id = sa.pan_id"
            : " select pa.name as Participant_Id" +
                    ", sa." + sourceId +
                    ", oa." + obsId +
              " from apidbtuning." + tblPrefix + "Participants pa" +
                  ", apidbtuning." + tblPrefix + "Observations oa" +
                  ", apidbtuning." + tblPrefix + "Samples sa "+
                  ", apidbtuning." + tblPrefix + "PartObsIO io" +
                  ", apidbtuning." + tblPrefix + "ObsSampleIO io2" +
              " where pa.pan_id = io.participant_id" +
              " and io.observation_id = oa.pan_id" +
              " and io.observation_id = io2.observation_id" +
              " and io2.sample_id = sa.pan_id";

    return getStreamingResponse(query, "getShinySampleData",
        "Failed running SQL to fetch sample data.");
  }
}
