package org.apidb.apicommon.controller;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;

import org.apache.log4j.Logger;
import org.apache.struts.Globals;
import org.apache.struts.action.ActionErrors;
import org.apache.struts.action.ActionForm;
import org.apache.struts.action.ActionMapping;
import org.apache.struts.action.ActionMessage;
import org.apache.struts.config.ModuleConfig;
import org.apache.struts.upload.FormFile;
import org.apache.struts.upload.MultipartRequestHandler;
import org.apache.struts.util.LabelValueBean;
import org.apidb.apicommon.model.GeneIdValidator;
import org.apidb.apicommon.model.comment.MultiBox;
import org.gusdb.wdk.controller.actionutil.ActionUtility;
import org.gusdb.wdk.model.jspwrap.WdkModelBean;

public class NewCommentForm extends ActionForm {

    private static final Logger LOG = Logger.getLogger(NewCommentForm.class);

    private static final long serialVersionUID = -4386250615887166981L;

    private String headline;
    private String content;
    private String commentTarget;
    private String stableId;
    private String reversed;
    private String locations;
    private String refererUrl;
    private String organism;
    private String strand;

    private Map<Integer, FormFile> formFiles = null;
    private Map<Integer, String> formNotes = null;
    private FormFile file;
    private String notes;

    private String[] files; // file string id|name|description
    private String[] existingFiles; // file string id|name|description

    private String commentTargetId;
    private String externalDbName;
    private String externalDbVersion;
    private String locType;
    private String[] targetCategory;
    private String pmIds;
    private String dois;
    private String accessions;
    private String associatedStableIds;
    private String contig;
    private String authors;
    private String commentId = null;
    private String email;
    private String sequence;
    private String reviewStatus;

    private ArrayList<LabelValueBean> categoryList = new ArrayList<LabelValueBean>(); 

    public ArrayList<LabelValueBean> getCategoryList() {
        return categoryList;
    } 

    public NewCommentForm() {
        try {

            formFiles = new HashMap<Integer, FormFile>();
            formNotes = new HashMap<Integer, String>(); 

            // populate checkbox in reset(), why?
            // if not, it will thorw "No Collection found" exception,
            // the following code has already been handled in reset.
            // revisit this later
            //ServletContext context = servlet.getServletContext();
            //String targetId = request.getParameter("commentTargetId"); 
            //String targetId = getCommentTargetId(); 

            //ArrayList<MultiBox> list = CommentActionUtility.getCommentFactory(context).getMultiBoxData("category", "target_category_id", "TargetCategory", "comment_target_id='" + targetId + "'" ); 

        } catch (Exception e) {
            LOG.error(e.getMessage());
        } 
    } 

    private GeneIdValidator getGeneIdValidator() {
        try {
            WdkModelBean wdkModelBean = ActionUtility.getWdkModel(getServlet());

            GeneIdValidator validator = new GeneIdValidator(wdkModelBean.getModel());
            return validator;
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return null;
        }
    }

    /**
     * @return Returns the content.
     */
    public String getContent() {
        return content;
    }

    /**
     * @param content
     *            The content to set.
     */
    public void setContent(String content) {
        this.content = content;
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

    public String getReviewStatus() {
       return reviewStatus;
    }

    public void setReviewStatus(String reviewStatus) {
       this.reviewStatus = reviewStatus;
    }

    public String getSequence() {
       return this.sequence;
    }

    public void setSequence(String sequence) {
       this.sequence = sequence;
    }

    /**
     * @return Returns the headline.
     */
    public String getHeadline() {
        return headline;
    }

    /**
     * @param headline
     *            The headline to set.
     */
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
     * @return Returns the locations.
     */
    public String getLocations() {
        return this.locations;
    }

    /**
     * @param locations
     *            The locations to set.
     */
    public void setLocations(String locations) {
        this.locations = locations;
    }

    /**
     * @return Returns the reversed.
     */
    public String getReversed() {
        return reversed;
    }

    /**
     * @param reversed
     *            The reversed to set.
     */
    public void setReversed(String reversed) {
        this.reversed = reversed;
    }

    /**
     * @return Returns the refererUrl.
     */
    public String getRefererUrl() {
        return refererUrl;
    }

    /**
     * @param refererUrl
     *            The refererUrl to set.
     */
    public void setRefererUrl(String refererUrl) {
        this.refererUrl = refererUrl;
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

    public String getStrand() {
        return strand;
    }

    public void setStrand(String strand) {
        this.strand = strand;
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

    public void setLocType(String id) {
        this.locType = id;
    }

    public String getLocType() {
        return this.locType;
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

    public void setDois(String id) {
        this.dois = id;
    }

    public String getDois() {
        return this.dois;
    }

    public void setContig(String contig) {
        this.contig = contig;
    }

    public String getContig() {
        return this.contig;
    }

    public void setAccessions(String id) {
        this.accessions = id;
    }

    public String getAccessions() {
        return this.accessions;
    }

    public void setAssociatedStableIds(String id) {
        this.associatedStableIds = id;
    }

    public String getAssociatedStableIds() {
        return this.associatedStableIds;
    }

    public String getAuthors() {
        return this.authors;
    }

    public void setAuthors(String authors) {
        this.authors = authors;
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

    public void setFiles(String[] files) {
        this.files = files;
    }

    public String[] getFiles() {
        return this.files;
    } 

    public void setExistingFiles(String[] existingFiles) {
        this.existingFiles = existingFiles;
    }

    public String[] getExistingFiles() {
        return this.existingFiles;
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

        if ((getStableId() == null) || (getStableId().trim().equals(""))) {
            errors.add(
                    ActionErrors.GLOBAL_MESSAGE,
                    new ActionMessage(
                            "mapped.properties",
                            "No gene name ",
                            "This is probably due to browse session reset. Please go back to that gene page and start it again!"));
            return errors;
        }

        if ((getHeadline() == null) || (getHeadline().trim().equals(""))) {
            errors.add(ActionErrors.GLOBAL_MESSAGE, new ActionMessage(
                    "mapped.properties", "No headline ",
                    "headline is required!"));
            return errors;
        }

        if ((getContent() == null) || (getContent().trim().equals(""))) {
            errors.add(ActionErrors.GLOBAL_MESSAGE, new ActionMessage(
                    "mapped.properties", "No content ", "content is required!"));
            return errors;
        }

        GeneIdValidator validator = getGeneIdValidator();
        if(associatedStableIds != null) {
          String[] related_ids_dup = Pattern.compile("[\\s,;]").matcher(
                associatedStableIds).replaceAll(" ").split(" ");

          // removing duplicates
          Set<String> stringSet = new HashSet<>(Arrays.asList(related_ids_dup));
          String[] related_ids = stringSet.toArray(new String[0]);
            
          for (String related_id : related_ids) {
            if (related_id.trim().equals("")) {
                continue;
            }

            if (!validator.checkStableIds(related_id)) {
                errors.add(
                        ActionErrors.GLOBAL_MESSAGE,
                        new ActionMessage(
                                "mapped.properties",
                                "Invalid Gene Identifier",
                                "In Part III, Gene Identifier \""
                                        + related_id
                                        + "\" is not a valid gene id! Please correct it and try again."));
            }
				 	}
        }

        List<Integer> toBeRemoved = new ArrayList<Integer>();
        for (int i : formFiles.keySet()) {
            if (formFiles.get(i).getFileName().trim().length() == 0
                    && formNotes.get(i).trim().length() == 0) {
                toBeRemoved.add(i);
                formNotes.remove(i);
            }
        }
        for (Integer i : toBeRemoved) {
            formFiles.remove(i);
        }

        for (Integer i : formFiles.keySet()) {
            if (formFiles.get(i) == null) {
                errors.add(ActionErrors.GLOBAL_MESSAGE, new ActionMessage(
                        "mapped.properties", "File not found",
                        "select a file for upload"));
                return errors;
            }

            if (formFiles.get(i).getFileName() == null
                    || formFiles.get(i).getFileName().trim().length() == 0) {
                errors.add(ActionErrors.GLOBAL_MESSAGE, new ActionMessage(
                        "mapped.properties", "File not found",
                        "select a file for upload"));
            }
        }

        for (Integer i : formNotes.keySet()) {
            if (formFiles.get(i) == null) continue;
            if (formNotes.get(i) == null
                    || formNotes.get(i).trim().length() == 0) {
                errors.add(ActionErrors.GLOBAL_MESSAGE, new ActionMessage(
                        "mapped.properties", "No description",
                        "please add a description"));
            }

            if (formNotes.get(i) != null
                    && formNotes.get(i).trim().length() > 4000) {
                errors.add(
                        ActionErrors.GLOBAL_MESSAGE,
                        new ActionMessage("mapped.properties",
                                "description is too long ("
                                        + formNotes.get(i).trim().length()
                                        + " characters)",
                                "please add a description no longer than 4000 characters (including spaces)"));
            }
        }

        return errors;
    }

    @Override
    public void reset(ActionMapping mapping, HttpServletRequest request) {
        file = null;
        formFiles.clear();
        formNotes.clear();

        // populate checkbox in reset(), why?
        // if not, it will thorw "No Collection found" exception,
        // revisit this later
        ServletContext context = servlet.getServletContext(); 

        String targetId = getCommentTargetId(); 
        //String targetId = request.getParameter("commentTargetId"); 
        if(targetId == null) {
           targetId = request.getParameter("commentTargetId"); 
        }

        ArrayList<MultiBox> list = CommentFactoryManager.getCommentFactory(context)
            .getMultiBoxData("category", "target_category_id", "TargetCategory",
                "comment_target_id='" + targetId + "'" );

        categoryList = new ArrayList<LabelValueBean>();
        for(MultiBox c : list) { 
           categoryList.add(new LabelValueBean(c.getName(), c.getValue()));
        } 

        commentId = null;
        headline = null;
        content = null;
        commentTarget = null;
        reversed = null;
        locations = null;

        files = null;
        commentTargetId = null;

        locType = null;
        targetCategory = null;
        pmIds = null;
        dois = null;
        accessions = null;
        associatedStableIds = null;
        reviewStatus = null;
    }
}
