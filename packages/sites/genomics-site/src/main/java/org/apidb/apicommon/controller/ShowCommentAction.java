package org.apidb.apicommon.controller;

import java.io.File;

import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.struts.action.ActionForm;
import org.apache.struts.action.ActionForward;
import org.apache.struts.action.ActionMapping;
import org.apidb.apicommon.model.comment.Comment;
import org.apidb.apicommon.model.comment.CommentFactory;

public class ShowCommentAction extends CommentAction {

    public static final String DEFAULT_COMMENT_PAGE = "showComments.jsp";
    public static final String CUSTOM_COMMENT_PAGE = "customShowComments.jsp";

    public static final String STABLE_ID_KEY = "stable_id";
    public static final String PROJECT_ID_KEY = "project_id";
    public static final String COMMENT_ID_KEY = "comment_id";
    public static final String COMMENT_TARGET_ID_KEY = "comment_target_id";
    public static final String COMMENT_LIST_KEY = "comments";

    @Override
    public ActionForward execute(ActionMapping mapping, ActionForm form,
            HttpServletRequest request, HttpServletResponse response)
            throws Exception {

        // get the factory
        ServletContext context = servlet.getServletContext();
        CommentFactory factory = CommentFactoryManager.getCommentFactory(context);

        // get the comments for the (project_id, stable_id) tuple
        ShowCommentForm commentForm = (ShowCommentForm) form;
        Comment[] comments = factory.queryComments(null,
                commentForm.getProjectId(), commentForm.getStableId(), null,
                null, null, commentForm.getCommentTargetId());

        // set for the forwarding page
        request.setAttribute(COMMENT_LIST_KEY, comments);
        request.setAttribute(STABLE_ID_KEY, commentForm.getStableId());
        request.setAttribute(PROJECT_ID_KEY, commentForm.getProjectId());
        request.setAttribute(COMMENT_TARGET_ID_KEY, commentForm.getCommentTargetId());

        // construct url
        /** not sure why it caused the problem of not showing comment page.
            it may due to wdk refactoring, r32856 commit need to revisit
            comment out the following block and remove the custome page.
        */
         
         /**  2/10/2010
  String customViewDir = application.getAttribute(CConstants.WDK_CUSTOM_VIEW_DIR).toString()
      + File.separator + application.getAttribute(CConstants.WDK_PAGES_DIR).toString();
        String commentPage = customViewDir + File.separator
                + CUSTOM_COMMENT_PAGE;
         */

        // check if custom comment page exist; if not, use the default one
        //if (!ApplicationInitListener.resourceExists(commentPage, application)) {
         String commentPage = File.separator + DEFAULT_COMMENT_PAGE;
        //}

        // redirect to the show comments page
        return new ActionForward(commentPage, false);
    }
}
