package org.apidb.apicommon.controller;

import org.apache.struts.action.ActionForm;

public class ShowCommentForm extends ActionForm {

    /**
     * 
     */
    private static final long serialVersionUID = -4308700939338194047L;
    private String stableId;
    private String projectId;
    private String commentTargetId;

    public String getProjectId() {
        return projectId;
    }

    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }

    /**
     * @return the stableId
     */
    public String getStableId() {
        return stableId;
    }

    /**
     * @param stableId
     *          the stableId to set
     */
    public void setStableId(String stableId) {
        this.stableId = stableId;
    }

    public String getCommentTargetId() {
        return commentTargetId;
    }

    public void setCommentTargetId(String commentTargetId) {
        this.commentTargetId = commentTargetId;
    }
}
