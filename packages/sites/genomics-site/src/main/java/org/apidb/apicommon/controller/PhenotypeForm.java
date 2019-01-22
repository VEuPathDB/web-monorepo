package org.apidb.apicommon.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;

import org.apache.struts.Globals;
import org.apache.struts.action.ActionErrors;
import org.apache.struts.action.ActionForm;
import org.apache.struts.action.ActionMapping;
import org.apache.struts.action.ActionMessage;
import org.apache.struts.config.ModuleConfig;
import org.apache.struts.upload.FormFile;
import org.apache.struts.upload.MultipartRequestHandler;
import org.apache.struts.util.LabelValueBean;
import org.apidb.apicommon.model.comment.MultiBox;

public class PhenotypeForm extends ActionForm {

    private static final long serialVersionUID = 3050800220417843422L;
    private String headline;
    private String commentTarget;
    private String stableId;
    private String organism;

    private HashMap<Integer, FormFile> formFiles = null;
    private HashMap<Integer, String> formNotes = null;
    private FormFile file;
    private String notes;

    private String commentTargetId;
    private String externalDbName;
    private String externalDbVersion;
    private String[] targetCategory;
    private String pmIds;
    private String accessions;

    private String background;
    private String mutationMethod;
    private String mutationMethodDescription;
    private String[] marker;
    private String[] reporter;
    private String[] phenotypeCategory;
    private String phenotypeDescription;
    private String expression;
    private String mutantStatus;
    private String mutantMethod;
    private String mutationType;
    private String phenotypeLoc;

    private ArrayList<LabelValueBean> reporterList; 

    public ArrayList<LabelValueBean> getReporterList() {
        return reporterList;
    } 

    public PhenotypeForm() {

        try {
            formFiles = new HashMap<Integer, FormFile>();
            formNotes = new HashMap<Integer, String>(); 
        } catch (Exception e) {
            System.out.println(e.getMessage());
        }
    }

    public String getMutationType() {
        return mutationType;
    }

    public void setMutationType(String mutationType) {
        this.mutationType = mutationType;
    }

    public String getPhenotypeLoc() {
        return phenotypeLoc;
    }

    public void setPhenotypeLoc(String phenotypeLoc) {
        this.phenotypeLoc = phenotypeLoc;
    }

    public String getMutantMethod() {
        return mutantMethod;
    }

    public void setMutantMethod(String mutantMethod) {
        this.mutantMethod = mutantMethod;
    }

    public String getMutantStatus() {
        return mutantStatus;
    }

    public void setMutantStatus(String mutantStatus) {
        this.mutantStatus = mutantStatus;
    }

    public String getExpression() {
        return expression;
    }

    public void setExpression(String expression) {
        this.expression = expression;
    }

    public String getPhenotypeDescription() {
        return phenotypeDescription;
    }

    public void setPhenotypeDescription(String phenotypeDescription) {
        this.phenotypeDescription = phenotypeDescription;
    }

    public String[] getPhenotypeCategory() {
        return this.phenotypeCategory;
    }

    public void setPhenotypeCategory(String[] phenotypeCategory) {
        this.phenotypeCategory = phenotypeCategory;
    }

    public String[] getMarker() {
        return marker;
    }

    public void setMarker(String[] marker) {
        this.marker = marker;
    }

    public String[] getReporter() {
        return reporter;
    }

    public void setReporter(String[] reporter) {
        this.reporter = reporter;
    }

    public String getMutationMethod() {
        return mutationMethod;
    }

    public void setMutationMethod(String mutationMethod) {
        this.mutationMethod = mutationMethod;
    }

    public String getMutationMethodDescription() {
        return mutationMethodDescription;
    }

    public void setMutationMethodDescription(String mutationMethodDescription) {
        this.mutationMethodDescription = mutationMethodDescription;
    }

    public String getBackground() {
        return background;
    }

    public void setBackground(String background) {
        this.background = background;
    }

    public String getHeadline() {
        return headline;
    }

    public void setHeadline(String headline) {
        this.headline = headline;
    }

    /**
     * @return Returns the stableId.
     */
    public String getStableId() {
        return stableId;
    }

    /**
     * @param stableId
     *            The stableId to set.
     */
    public void setStableId(String stableId) {
        this.stableId = stableId;
    }

    /**
     * @return Returns the commentTarget.
     */
    public String getCommentTarget() {
        return commentTarget;
    }

    /**
     * @param commentTarget
     *            The commentTarget to set.
     */
    public void setCommentTarget(String commentTarget) {
        this.commentTarget = commentTarget;
    }

    /**
     * @return the organism
     */
    public String getOrganism() {
        return organism;
    }

    /**
     * @param organism
     *            the organism to set
     */
    public void setOrganism(String organism) {
        this.organism = organism;
    }

    public void setCommentTargetId(String id) {
        this.commentTargetId = id;
    }

    public String getCommentTargetId() {
        return this.commentTargetId;
    }

    public void setExternalDbName(String id) {
        this.externalDbName = id;
    }

    public String getExternalDbName() {
        return this.externalDbName;
    }

    public void setExternalDbVersion(String id) {
        this.externalDbVersion = id;
    }

    public String getExternalDbVersion() {
        return this.externalDbVersion;
    }

    public void setTargetCategory(String[] id) {
        this.targetCategory = id;
    }

    public String[] getTargetCategory() {
        return this.targetCategory;
    }

    public void setPmIds(String id) {
        this.pmIds = id;
    }

    public String getPmIds() {
        return this.pmIds;
    }

    public void setAccessions(String id) {
        this.accessions = id;
    }

    public String getAccessions() {
        return this.accessions;
    }

    public void setFile(int indx, FormFile file) {
        this.file = file;
        setFormFiles(indx, file);
    }

    /**
     * @param idx not used; only one file field
     * @return
     */
    public FormFile getFile(int idx) {
        return file;
    }

    public void setFormFiles(int indx, FormFile file) {
        this.formFiles.put(indx, file);
    }

    public Map<Integer, FormFile> getFormFiles() {
        return formFiles;
    }

    public void setNotes(int indx, String notes) {
        this.notes = notes;
        setFormNotes(indx, notes);
    }

    /**
     * @param idx not used; only one notes field
     * @return
     */
    public String getNotes(int idx) {
        return notes;
    }

    public void setFormNotes(int indx, String notes) {
        this.formNotes.put(indx, notes);
    }

    public Map<Integer, String> getFormNotes() {
        return formNotes;
    }

    /** the mapped.properties strings should go into a properties file?? **/
    @Override
    public ActionErrors validate(ActionMapping mapping,
            HttpServletRequest request) {
        ActionErrors errors = new ActionErrors();

        ModuleConfig mc = (ModuleConfig) request.getAttribute(Globals.MODULE_KEY);
        String maxFileSize = mc.getControllerConfig().getMaxFileSize();
        Boolean maxLengthExceeded = (Boolean) request.getAttribute(MultipartRequestHandler.ATTRIBUTE_MAX_LENGTH_EXCEEDED);

        if (maxLengthExceeded != null && maxLengthExceeded.booleanValue()) {
            errors.add(
                    ActionErrors.GLOBAL_MESSAGE,
                    new ActionMessage("mapped.properties",
                            "file upload is larger than the allowed "
                                    + maxFileSize,
                            "(total for all files) contact us for further instructions"));
            return errors;
        }

        if ((getHeadline() == null) || (getHeadline().trim().equals(""))) {
            errors.add(ActionErrors.GLOBAL_MESSAGE, new ActionMessage(
                    "mapped.properties", "no headline ", "no headline !!!!"));
            return errors;
        }

        if ((getPhenotypeDescription() == null)
                || (getPhenotypeDescription().trim().equals(""))) {
            errors.add(ActionErrors.GLOBAL_MESSAGE, new ActionMessage(
                    "mapped.properties", "No Phenotype Description ",
                    "No Phenotype Description !!!!"));
            return errors;
        }

        return errors;
    }

    @Override
    public void reset(ActionMapping mapping, HttpServletRequest request) {
        file = null;
        formFiles.clear();
        formNotes.clear();

        headline = null;
        commentTarget = null;

        targetCategory = null;
        pmIds = null;
        accessions = null;
        reporter = null;

        ServletContext context = servlet.getServletContext(); 
        ArrayList<MultiBox> list = CommentFactoryManager.getCommentFactory(context)
            .getMultiBoxData("mutant_reporter", "mutant_reporter_id", "MutantReporter", null);

        reporterList = new ArrayList<LabelValueBean>();
        for(MultiBox c : list) { 
           reporterList.add(new LabelValueBean(c.getName(), c.getValue()));
        } 

    }
}
