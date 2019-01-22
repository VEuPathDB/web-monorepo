package org.apidb.apicommon.controller;

import org.apache.struts.action.ActionForm;

public class DeleteCommentForm extends ActionForm {

	private static final long serialVersionUID = 1L;

	private String stableId;
    private String projectId;
    private String commentTargetId;
    private String commentId;
    private String email;

    public String getProjectId() {
        return projectId;
    }

    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }

    public String getStableId() {
        return stableId;
    }

    public void setStableId(String stableId) {
        this.stableId = stableId;
    }

    public String getCommentTargetId() {
        return commentTargetId;
    }

    public void setCommentTargetId(String commentTargetId) {
        this.commentTargetId = commentTargetId;
    }

    public String getCommentId() {
        return commentId;
    }

    public void setCommentId(String commentId) {
        this.commentId = commentId;
    } 

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
