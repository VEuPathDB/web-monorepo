/**
 * 
 */
package org.apidb.apicommon.controller;

import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.struts.action.ActionForm;
import org.apache.struts.action.ActionForward;
import org.apache.struts.action.ActionMapping;
import org.apidb.apicommon.model.comment.Comment;
import org.gusdb.wdk.controller.CConstants;
import org.gusdb.wdk.controller.actionutil.ActionUtility;
import org.gusdb.wdk.model.jspwrap.UserBean;
import org.gusdb.wdk.model.jspwrap.WdkModelBean;

/**
 * @author xingao
 * 
 */
public class ProcessAddCommentAction extends CommentAction {

    @Override
    public ActionForward execute(ActionMapping mapping, ActionForm form,
            HttpServletRequest request, HttpServletResponse response)
            throws Exception {
        // get comment factory, and initialize it if necessary

        // get the referrer link
        String referer = request.getParameter(CConstants.WDK_REFERRER_URL_KEY);
        if (referer == null) referer = request.getHeader("referer");

        int index = referer.lastIndexOf("/");
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

        // get all the parameters
        // HTML sanitization need to be enabled only for headline and content.
        String headline = request.getParameter("headline");
        if (headline.trim().length() == 0) headline = null;
        else headline = BBCode.getInstance().convertBBCodeToHtml(headline);

        String content = BBCode.getInstance().convertBBCodeToHtml(
                request.getParameter("content"));

        if (headline == null && (content == null || content.length() == 0)) {
            request.setAttribute("submitStatus",
                    "Error: Comment cannot be empty.");
            return forward;
        }

        String commentTarget = request.getParameter("commentTargetId");
        String[] targetCategoryIds = request.getParameterValues("targetCategory");
        String pmIdStr = request.getParameter("pmids");
        String doiStr = request.getParameter("dois");
        String reviewStatus = request.getParameter("reviewStatus");
        String authorsStr = request.getParameter("authors");
        String accessionStr = request.getParameter("accessions");

        String stableId = request.getParameter("stableId");
        String organism = request.getParameter("organism");

        String extDbName = request.getParameter("externalDbName");
        String extDbVersion = request.getParameter("externalDbVersion");

        String locType = request.getParameter("locType");
        String coordinateType = null;
        boolean reversed = false;
        if (locType.startsWith("genome")) {
            coordinateType = LOCATION_COORDINATETYPE_GENOME;
            if (locType.endsWith("r")) reversed = true;
        } else coordinateType = LOCATION_COORDINATETYPE_PROTEIN;

        String locations = request.getParameter("locations");

        String projectName = wdkModel.getDisplayName();
        String projectVersion = wdkModel.getVersion();

        // create a comment instance
        Comment comment = new Comment(user.getUserId());
        comment.setCommentTarget(commentTarget);
        comment.setStableId(stableId);
        comment.setProjectName(projectName);
        comment.setProjectVersion(projectVersion);
        comment.setHeadline(headline);
        comment.setOrganism(organism);
        comment.setContent(content);
        comment.setReviewStatus(reviewStatus);

        if ((targetCategoryIds != null) && (targetCategoryIds.length > 0)) {
            long[] targetCategoryIdArray = new long[targetCategoryIds.length];
            for (int i = 0; i < targetCategoryIds.length; i++) {
                targetCategoryIdArray[i] = Long.valueOf(targetCategoryIds[i]).longValue();
            }
            comment.setTargetCategoryIds(targetCategoryIdArray);
        }

        if ((pmIdStr != null) && (pmIdStr.trim().length() != 0)) {
            String[] pmIds = pmIdStr.replaceAll(",", " ").split(" ");
            comment.setPmIds(pmIds);
        }

        if ((doiStr != null) && (doiStr.trim().length() != 0)) {
            String[] dois = doiStr.replaceAll(",", " ").split(" ");
            dois = NewCommentAction.parseDois(dois);
            comment.setDois(dois);
        }

        if ((authorsStr != null) && (authorsStr.trim().length() != 0)) {
            String[] authors = authorsStr.replaceAll(",", " ").split(" ");
            comment.setAuthors(authors);
        }

        if ((accessionStr != null) && (accessionStr.trim().length() != 0)) {
            String[] accessions = accessionStr.replaceAll(",", " ").split(" ");
            comment.setAccessions(accessions);
        }

        try {
            comment.setLocations(reversed, locations, coordinateType);
        } catch (Exception e) {
            request.setAttribute(
                    "submitStatus",
                    "Error in Location format. "
                            + "Please refer to the format examples on the Add Comment page");
            return forward;
        }
        comment.addExternalDatabase(extDbName, extDbVersion);

        // add the comment
        ServletContext context = servlet.getServletContext();
        CommentFactoryManager.getCommentFactory(context).addComment(comment);

        // redirect back to the referer page
        request.setAttribute("submitStatus", "success");
        return forward;
    }
}
