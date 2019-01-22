package org.apidb.apicommon.controller;

import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.struts.action.ActionForm;
import org.apache.struts.action.ActionForward;
import org.apache.struts.action.ActionMapping;
import org.apidb.apicommon.model.comment.Comment;
import org.apidb.apicommon.model.comment.CommentFactory;
import org.gusdb.wdk.controller.actionutil.ActionUtility;

public class DeleteCommentAction extends CommentAction {

    @Override
    public ActionForward execute(ActionMapping mapping, ActionForm form,
            HttpServletRequest request, HttpServletResponse response)
            throws Exception {

        // get the factory
        ServletContext context = servlet.getServletContext();
        CommentFactory factory = CommentFactoryManager.getCommentFactory(context);

        // get the comments for the (project_id, stable_id) tuple
        DeleteCommentForm commentForm = (DeleteCommentForm) form;
        int commentId = Integer.parseInt(commentForm.getCommentId());
        Comment commentToDelete = factory.getComment(commentId);
        
        // ensure user has permission to delete comment (only owner has permission)
        if (ActionUtility.getUser(request).getUserId() == commentToDelete.getUserId()) {
        	factory.deleteComment(commentForm.getCommentId());
        }
        
        // set for the forwarding page
        String stableId  = commentForm.getStableId();
        String projectId = commentForm.getProjectId();
        String commentTargetId = commentForm.getCommentTargetId();

        String commentPage = "showComment.do?projectId=" + projectId 
                             + "&stableId=" + stableId 
                             + "&commentTargetId=" + commentTargetId;

        // redirect to the show comments page
        return new ActionForward(commentPage, true);
    }
}
