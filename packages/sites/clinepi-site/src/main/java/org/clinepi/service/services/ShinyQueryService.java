package org.clinepi.service.services;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.QueryParam;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import javax.sql.DataSource;

import org.json.JSONArray;
import org.json.JSONObject;
import org.json.JSONException;
import org.apache.log4j.Logger;
import org.gusdb.fgputil.db.SqlUtils;
import org.gusdb.wdk.service.service.AbstractWdkService;
import org.gusdb.wdk.model.WdkModelException;

@Path("/shiny")
public class ShinyQueryService extends AbstractWdkService {

  @SuppressWarnings("unused")
  private static final Logger LOG = Logger.getLogger(ShinyQueryService.class);

  @GET
  @Path("Participant/{tblPrefix}/{sourceId}")
  @Produces(MediaType.APPLICATION_JSON)
  public Response getShinyParticipantData(
	 @PathParam("sourceId") String sourceId,
	 @PathParam("tblPrefix") String tblPrefix,
         @DefaultValue("none") @QueryParam("obsId") String obsId)
         throws WdkModelException {

    DataSource dataSource = getWdkModel().getAppDb().getDataSource();
    String query = "";
    if (obsId.equals("none")) { 
      query = " select name as Participant_Id, " + sourceId +
              " from apidbtuning." + tblPrefix + "Participants"; 
    } else {
      query = " select pa.name as Participant_Id" +
                   " , pa." + sourceId + 
                   " , oa." + obsId +
              " from apidbtuning." + tblPrefix + "Participants pa" +
                 " , apidbtuning." + tblPrefix + "Observations oa" +
                 " , apidbtuning." + tblPrefix + "PartObsIO io" +
              " where pa.pan_id = io.participant_id" +
              " and io.observation_id = oa.pan_id";
    }

    ResultSet resultSet = null;
    String results = "";

    try {
      resultSet = SqlUtils.executeQuery(dataSource, query, "getShinyParticipantData");
      results = resultSetToJSON(resultSet);
    } catch (SQLException e) {
      throw new WdkModelException("failed running SQL to fetch participant data: " + query + e);
    } finally {
      if (resultSet != null) {
        SqlUtils.closeResultSetAndStatement(resultSet, null);
      }
    } 

    return Response.ok(results).build();
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
    DataSource dataSource = getWdkModel().getAppDb().getDataSource();
    String query = "";
    if (obsId.equals("none")) {
      query = " with household as (" +
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
              " where i.isHouseOb = h.isHouseOb";
    } else {
      query = " with household as (" +
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
    }

    ResultSet resultSet = null;
    String results = "";

    try {
      resultSet = SqlUtils.executeQuery(dataSource, query, "getShinyHouseholdData");
      results = resultSetToJSON(resultSet);
    } catch (SQLException e) {
      throw new WdkModelException("failed running SQL to fetch household data: " + query + e);
    } finally {
      if (resultSet != null) {
        SqlUtils.closeResultSetAndStatement(resultSet, null);
      }
    }   
 
    return Response.ok(results).build();
  }

  @GET
  @Path("Observation/{tblPrefix}/{sourceId}")
  @Produces(MediaType.APPLICATION_JSON)
  public Response getShinyObservationData(
        @PathParam("sourceId") String sourceId,
        @PathParam("tblPrefix") String tblPrefix,
        @DefaultValue("none") @QueryParam("obsId") String obsId) 
        throws WdkModelException {

    DataSource dataSource = getWdkModel().getAppDb().getDataSource();
    String query = "";
    if (obsId.equals("none")) {
      query = " with obs as (" +
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
              " select * from subob o";
    } else {
      query = " with obs as (" +
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
    }

    ResultSet resultSet = null;
    String results = "";

    try {
      resultSet = SqlUtils.executeQuery(dataSource, query, "getShinyObservationData");
      //results = resultSetToString(resultSet);
      results = resultSetToJSON(resultSet);
    } catch (SQLException e) {
      throw new WdkModelException("failed running SQL to fetch observation data: " + query + e);
    } finally {
      if (resultSet != null) {
        SqlUtils.closeResultSetAndStatement(resultSet, null);
      }
    }   
 
    return Response.ok(results).build();
  }

  @GET
  @Path("Sample/{tblPrefix}/{sourceId}")
  @Produces(MediaType.APPLICATION_JSON)
  public Response getShinySampleData(
	@PathParam("sourceId") String sourceId,
	@PathParam("tblPrefix") String tblPrefix,
        @DefaultValue("none") @QueryParam("obsId") String obsId)
        throws WdkModelException {

    DataSource dataSource = getWdkModel().getAppDb().getDataSource(); 
    String query = "";
    if (obsId.equals("none")) {
      query = " select pa.name as Participant_Id, sa." + sourceId +
              " from apidbtuning." + tblPrefix + "Participants pa" +
                  ", apidbtuning." + tblPrefix + "Samples sa "+
                  ", apidbtuning." + tblPrefix + "PartObsIO io" +
                  ", apidbtuning." + tblPrefix + "ObsSampleIO io2" +
              " where pa.pan_id = io.participant_id" +
              " and io.observation_id = io2.observation_id" +
              " and io2.sample_id = sa.pan_id"; 
    } else {
      query = " select pa.name as Participant_Id" +
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
    }

    ResultSet resultSet = null;
    String results = "";

    try {
      resultSet = SqlUtils.executeQuery(dataSource, query, "getShinySampleData");
      results = resultSetToJSON(resultSet);
    } catch (SQLException e) {
      throw new WdkModelException("failed running SQL to fetch sample data: " + query + e);
    } finally {
      if (resultSet != null) {
        SqlUtils.closeResultSetAndStatement(resultSet, null);
      }
    } 

    return Response.ok(results).build();
  }

  private static String resultSetToJSON(ResultSet resultSet) throws SQLException {

    JSONArray json = new JSONArray();

    ResultSetMetaData rsmd = resultSet.getMetaData();
    int numColumns = rsmd.getColumnCount();

    while(resultSet.next()) {
      JSONObject obj = new JSONObject();

      for (int i=1; i<numColumns+1; i++) {
        String column_name = rsmd.getColumnName(i);

        if(rsmd.getColumnType(i)==java.sql.Types.ARRAY){
         obj.put(column_name, resultSet.getArray(column_name));
        }
        else if(rsmd.getColumnType(i)==java.sql.Types.BIGINT){
         obj.put(column_name, resultSet.getInt(column_name));
        }
        else if(rsmd.getColumnType(i)==java.sql.Types.BOOLEAN){
         obj.put(column_name, resultSet.getBoolean(column_name));
        }
        else if(rsmd.getColumnType(i)==java.sql.Types.BLOB){
         obj.put(column_name, resultSet.getBlob(column_name));
        }
        else if(rsmd.getColumnType(i)==java.sql.Types.DOUBLE){
         obj.put(column_name, resultSet.getDouble(column_name)); 
        }
        else if(rsmd.getColumnType(i)==java.sql.Types.FLOAT){
         obj.put(column_name, resultSet.getFloat(column_name));
        }
        else if(rsmd.getColumnType(i)==java.sql.Types.INTEGER){
         obj.put(column_name, resultSet.getInt(column_name));
        }
        else if(rsmd.getColumnType(i)==java.sql.Types.NVARCHAR){
         obj.put(column_name, resultSet.getNString(column_name));
        }
        else if(rsmd.getColumnType(i)==java.sql.Types.VARCHAR){
         obj.put(column_name, resultSet.getString(column_name));
        }
        else if(rsmd.getColumnType(i)==java.sql.Types.TINYINT){
         obj.put(column_name, resultSet.getInt(column_name));
        }
        else if(rsmd.getColumnType(i)==java.sql.Types.SMALLINT){
         obj.put(column_name, resultSet.getInt(column_name));
        }
        else if(rsmd.getColumnType(i)==java.sql.Types.DATE){
         obj.put(column_name, resultSet.getDate(column_name));
        }
        else if(rsmd.getColumnType(i)==java.sql.Types.TIMESTAMP){
        obj.put(column_name, resultSet.getTimestamp(column_name));   
        }
        else{
         obj.put(column_name, resultSet.getObject(column_name));
        }
      }

      json.put(obj);
    }

    return(json.toString());
  }

}
