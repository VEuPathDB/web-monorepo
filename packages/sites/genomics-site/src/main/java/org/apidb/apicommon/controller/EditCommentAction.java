package org.apidb.apicommon.controller;

import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.struts.action.ActionForm;
import org.apache.struts.action.ActionForward;
import org.apache.struts.action.ActionMapping;
import org.apidb.apicommon.model.comment.Comment;
import org.apidb.apicommon.model.comment.CommentFactory;
import org.apidb.apicommon.model.comment.ExternalDatabase;
import org.apidb.apicommon.model.comment.Location;

public class EditCommentAction extends CommentAction {

    @Override
    public ActionForward execute(ActionMapping mapping, 
                                 ActionForm form,
                                 HttpServletRequest request, 
                                 HttpServletResponse response)
            throws Exception {

        // get the factory
        ServletContext context = servlet.getServletContext();
        CommentFactory factory = CommentFactoryManager.getCommentFactory(context);

        // get the comments for the (project_id, stable_id) tuple
        EditCommentForm editForm = (EditCommentForm) form;
        Comment comment = factory.getComment(Long.valueOf(editForm.getCommentId()).longValue());

        // set for the forwarding page
        String stableId  = editForm.getStableId();
        String projectId = editForm.getProjectId();
        String email = editForm.getEmail();
        String commentId = editForm.getCommentId();
        String commentTargetId = editForm.getCommentTargetId();

        Location[] locs = comment.getLocations();
        String locString = "";
        for(int i = 0; i < locs.length; i++) {
            locString += locs[i].toString() + ",";
        }

        if(locString.length() > 0) {

          locString = locString.substring(0, locString.lastIndexOf(","));
        }

        ExternalDatabase[] edbs =  comment.getExternalDbs();
        ExternalDatabase edb = edbs[0];

        long[] categoryIds = comment.getTargetCategoryIds();
        String categoryString = "";
        if (categoryIds != null && categoryIds.length > 0) {
          for(int i = 0; i < categoryIds.length; i++) {
           categoryString += "&targetCategory=" + categoryIds[i]; 
          }
        }

        String[] pmIds = comment.getPmIds();
        String pmIdString = "";
        if(pmIds != null && pmIds.length > 0) {
          pmIdString += "&pmIds=";
          for(int i = 0; i < pmIds.length; i++) {
            pmIdString += pmIds[i] + " "; 
          }
        }

        String[] dois = comment.getDois();
        String doiString = "";
        if(dois != null && dois.length > 0) {
          doiString += "&dois=";
          for(int i = 0; i < dois.length; i++) {
            doiString += dois[i] + " "; 
          }
        }

        String[] accessions = comment.getAccessions();
        String accessionsString = "";
        if(accessions != null && accessions.length > 0) {
          accessionsString += "&accessions=";
          for(int i = 0; i < accessions.length; i++) {
            accessionsString += accessions[i] + " "; 
          }
        }

        String[] associatedIds = comment.getAssociatedStableIds();
        String associatedString = "";

        if(associatedIds != null && associatedIds.length > 0) {
          associatedString += "&associatedStableIds=";
          for(int i = 0; i < associatedIds.length; i++) {
            associatedString += associatedIds[i] + " "; 
          }
        }

        String[] files = comment.getFiles();
        String fileString = "";
        if(files != null && files.length > 0) {
          
          for(int i = 0; i < files.length; i++) {
            fileString += "&files=" + files[i];
          }
        }

        String strand = "+";
        if(comment.getLocationString().matches("(.*)reverse(.*)")){
          strand = "-";
        }

        // LF \n- line feed URL-encoding %0A
        // CR \r - carriage return URL-encoding %0D
        String content = comment.getContent().replaceAll("(\\r|\\n)+", "%0A");
        fileString = fileString.replaceAll("(\\r|\\n)+", "%0A");

        String commentPage = "/addComment.do?projectId=" + projectId 
                             + "&stableId=" + stableId 
                             + "&commentTargetId=" + commentTargetId
                             + "&locType=" + "genomer"
                             + "&organism=" + comment.getOrganism()
                             + "&locations=" + locString
                             + "&externalDbName=" + edb.getExternalDbName()
                             + "&headline=" + comment.getHeadline()
                             + "&email=" + email
                             + pmIdString
                             + doiString
                             + accessionsString
                             + associatedString
                             + "&strand=" + strand
                             + "&commentId=" + commentId
                             + categoryString
                             + "&content=" + content
                             + "&reviewStatus=" + comment.getReviewStatus()
                             + fileString;

        // redirect to the show comments page
        return new ActionForward(commentPage, true);
    }
}
