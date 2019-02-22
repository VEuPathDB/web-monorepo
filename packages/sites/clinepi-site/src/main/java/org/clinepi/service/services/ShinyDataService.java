package org.clinepi.service.services;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.apache.log4j.Logger;
import org.gusdb.wdk.service.service.AbstractWdkService;

@Path("/shiny")
public class ShinyDataService extends AbstractWdkService {

    @SuppressWarnings("unused")
    private static final Logger LOG = Logger.getLogger(ShinyDataService.class);

    //remove after testing
    @GET
    @Path("test")
    @Produces(MediaType.TEXT_PLAIN)
    public Response test() {
	String testString = "testing teststring 123";
        return Response.ok(testString).build();
    }

    @GET
    @Path("data/{datasetName}")
    @Produces(MediaType.TEXT_PLAIN)
    public Response getShinyDataset(@PathParam("datasetName") String datasetName) {
	String projectId = getWdkModel().getProjectId();
	String buildNumber = getWdkModel().getBuildNumber();
	String webservicesDir = getWdkModel().getProperties().get("WEBSERVICEMIRROR");
	String dataPath = webservicesDir + "/" + projectId + "/" + "build-" + buildNumber + "/" + datasetName + "/shiny/shiny_masterDataTable.txt";

	//String content = "";
	//try {
        //    content = new String ( Files.readAllBytes( Paths.get(dataPath) ) );
        //}
        //catch (IOException e) {
        //    e.printStackTrace();
        //}

	return Response.ok(dataPath).build();
    }

    @GET
    @Path("ontology/{datasetName}")
    @Produces(MediaType.TEXT_PLAIN)
    public Response getShinyOntology(@PathParam("datasetName") String datasetName) {
	String projectId = getWdkModel().getProjectId();
	String buildNumber = getWdkModel().getBuildNumber();
	String webservicesDir = getWdkModel().getProperties().get("WEBSERVICEMIRROR");
	String ontologyPath = webservicesDir + "/" + projectId + "/" + "build-" + buildNumber + "/" + datasetName + "/shiny/ontologyMetadata.tab";

	//String content = "";
        //try {
        //    content = new String ( Files.readAllBytes( Paths.get(ontologyPath) ) );
        //}
        //catch (IOException e) {
        //    e.printStackTrace();
        //}
	return Response.ok(ontologyPath).build();
    }

}
