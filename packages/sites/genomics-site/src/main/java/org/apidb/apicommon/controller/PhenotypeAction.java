package org.apidb.apicommon.controller;

import java.util.ArrayList;
import java.util.Map;

import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.struts.action.ActionForm;
import org.apache.struts.action.ActionForward;
import org.apache.struts.action.ActionMapping;
import org.apache.struts.upload.FormFile;
import org.apidb.apicommon.model.comment.Comment;
import org.apidb.apicommon.model.userfile.UserFile;
import org.gusdb.wdk.controller.CConstants;
import org.gusdb.wdk.controller.actionutil.ActionUtility;
import org.gusdb.wdk.model.Utilities;
import org.gusdb.wdk.model.jspwrap.UserBean;
import org.gusdb.wdk.model.jspwrap.WdkModelBean;

public class PhenotypeAction extends CommentAction {

    @Override
    public ActionForward execute(ActionMapping mapping, ActionForm form,
            HttpServletRequest request, HttpServletResponse response)
            throws Exception {

        String referer = request.getParameter(CConstants.WDK_REFERRER_URL_KEY);
        if (referer == null) referer = request.getHeader("referer");

        int index = referer.lastIndexOf("/");
        String host = referer.substring(0, index);
        referer = referer.substring(index);

        ActionForward forward = new ActionForward(referer, false);
        // forward.setRedirect(true);

        WdkModelBean wdkModel = ActionUtility.getWdkModel(servlet);
        UserBean user = ActionUtility.getUser(request);

        // if the user is null or is a guest, fail
        if (user == null || user.isGuest()) {
            // This is the case where the session times out while the user is on
            // the
            // comment form page, or someone maliciously trying to post to the
            // comment form
            // action directly. Return to the add comments page, where it is
            // handled correctly.
            return forward;
        }

        PhenotypeForm cuForm = (PhenotypeForm) form;

        String email = user.getEmail().trim().toLowerCase();
        long userId = user.getUserId();
        String projectName = wdkModel.getDisplayName();
        String projectVersion = wdkModel.getVersion();
        String stableId = cuForm.getStableId();
        String commentTarget = cuForm.getCommentTargetId();
        String organism = cuForm.getOrganism();
        String headline = cuForm.getHeadline().trim();
        String extDbName = cuForm.getExternalDbName();
        String extDbVersion = cuForm.getExternalDbVersion();
        String content = cuForm.getPhenotypeDescription();
        String pmIdStr = cuForm.getPmIds();
        String mutantStatus = cuForm.getMutantStatus();
        String background = cuForm.getBackground();
        String mutationType = cuForm.getMutationType();
        String mutationMethod = cuForm.getMutationMethod();
        String mutationMethodDesc = cuForm.getMutationMethodDescription();
        String phenotypeLoc = cuForm.getPhenotypeLoc();
        String mutantExpression = cuForm.getExpression();
        String[] markers = cuForm.getMarker();
        String[] reporters = cuForm.getReporter();
        String[] phenotypeCategory = cuForm.getPhenotypeCategory(); 

        // create a comment instance
        Comment comment = new Comment(userId);
        comment.setCommentTarget(commentTarget);
        comment.setStableId(stableId);
        comment.setProjectName(projectName);
        comment.setProjectVersion(projectVersion);
        comment.setHeadline(headline);
        comment.setOrganism(organism);
        comment.setContent(content); // phenotype description
        comment.setBackground(background);
        comment.setMutantStatus(Integer.parseInt(mutantStatus));
        comment.setMutationType(Integer.parseInt(mutationType));
        comment.setMutationMethod(Integer.parseInt(mutationMethod));
        comment.setMutantExpression(Integer.parseInt(mutantExpression));
        comment.setPhenotypeLoc(Integer.parseInt(phenotypeLoc));

        comment.addExternalDatabase(extDbName, extDbVersion);

        if ((pmIdStr != null) && (pmIdStr.trim().length() != 0)) {
            String[] pmIds = pmIdStr.replaceAll(",", " ").split(" ");
            comment.setPmIds(pmIds);
        }

        if ((markers != null) && (markers.length > 0)) {
            int[] markersArray = new int[markers.length];
            for (int i = 0; i < markers.length; i++) {
                markersArray[i] = Integer.valueOf(markers[i]).intValue();
            }
            comment.setMutantMarkers(markersArray);
        }

        if ((reporters != null) && (reporters.length > 0)) {
            int[] reportersArray = new int[reporters.length];
            for (int i = 0; i < reporters.length; i++) {
                reportersArray[i] = Integer.valueOf(reporters[i]).intValue();
            }
            comment.setMutantReporters(reportersArray);
        }

        if ((phenotypeCategory != null) && (phenotypeCategory.length > 0)) {
            int[] categoryArray = new int[phenotypeCategory.length];
            for (int i = 0; i < phenotypeCategory.length; i++) {
                categoryArray[i] = Integer.valueOf(phenotypeCategory[i]).intValue();
            }
            comment.setPhenotypeCategory(categoryArray);
        }

        Map<Integer, FormFile> formSet = cuForm.getFormFiles();
        Map<Integer, String> noteSet = cuForm.getFormNotes();

        String userUID = user.getSignature().trim();

        ArrayList<String> files = new ArrayList<String>();

        for (Integer i : formSet.keySet()) {

            FormFile formFile = formSet.get(i);

            if ((formFile.getFileName() == null)
                    || (formFile.getFileName().length() == 0)) continue;

            String notes = noteSet.get(i).trim();
            String contentType = formFile.getContentType();
            String fileName = formFile.getFileName();
            int fileSize = formFile.getFileSize();
            byte[] fileData = formFile.getFileData();

            UserFile userFile = new UserFile(userUID);
            userFile.setFileName(fileName);
            userFile.setFileData(fileData);
            userFile.setContentType(contentType);
            userFile.setFileSize(fileSize);
            userFile.setEmail(email);
            userFile.setUserUID(userUID);
            userFile.setTitle(headline);
            userFile.setNotes(notes);
            userFile.setProjectName(projectName);
            userFile.setProjectVersion(projectVersion);

            UserFileFactoryManager.getUserFileFactory(getServlet().getServletContext()).addUserFile(userFile);

            long fileId = userFile.getUserFileId();
            String fileStr = fileId + "|" + fileName + "|" + notes;

            files.add(fileStr);
        }

        if (files.size() > 0) {

            String[] f = new String[files.size()];
            comment.setFiles(files.toArray(f));
        }

        // add the comment
        ServletContext context = servlet.getServletContext();
        CommentFactoryManager.getCommentFactory(context).addComment(comment);

        String projectId = getServlet().getServletContext().getInitParameter(Utilities.ARGUMENT_PROJECT_ID);
        long commentId = comment.getCommentId();
        String link = host + "/showComment.do?projectId=" + projectId + "&stableId=" + stableId + "&commentTargetId=" + commentTarget + "#" + commentId; 

        Comment c = CommentFactoryManager.getCommentFactory(context).getComment(commentId);

        StringBuffer body = new StringBuffer();
        body.append("Thanks for your pheontype comment on " + stableId + "!\n");
        body.append("Comment Link: " + link + "\n\n");
        body.append("-------------------------------------------------------\n"); 
        body.append("Headline: " + headline + "\n");
        body.append("Target: " + commentTarget + "\n");
        body.append("Source_Id: " + stableId + "\n");
        body.append("Organism: " + organism + "\n");
        body.append("Mutant Status: " + c.getMutantStatusName() + "\n");
        body.append("Genetic Background: " + background + "\n");
        body.append("Mutant Type: " + c.getMutantTypeName() + "\n");
        body.append("Mutation Method: " + c.getMutationMethodName() + "\n");
        body.append("Mutation Method Description: " + mutationMethodDesc + "\n");
        body.append("Phenotype Description: " + content + "\n");
        body.append("Phenotype Test in: " + c.getPhenotypeLocName() + "\n");
        body.append("Mutant Expression: " + c.getMutantExpressionName() + "\n");
        body.append("PMID: " + pmIdStr + "\n");
        body.append("Email: " + email + "\n");
        body.append("DB Name: " + extDbName + "\n");
        body.append("DB Version: " + extDbVersion + "\n");
        body.append("-------------------------------------------------------\n"); 

        request.setAttribute("submitStatus", "success");
        request.setAttribute("subject", headline);
        request.setAttribute("body", body.toString());

        forward = new ActionForward("/addPhenotype.jsp", false);
        return forward;
    }
}
