package org.apidb.apicommon.controller;

import java.util.HashMap;
import java.util.Iterator;

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

public class UserFileUploadForm extends ActionForm {
    
	private static final long serialVersionUID = 1L;
	
	@SuppressWarnings("unused")
	private Logger logger = Logger.getLogger(UserFileUploadForm.class);
	private HashMap<Integer, FormFile> formFiles = null; 
	private HashMap<Integer, String> formNotes = null; 
    private FormFile file;
    private String notes;
    private String title;

	public UserFileUploadForm() {
		formFiles = new HashMap<Integer, FormFile>();
		formNotes = new HashMap<Integer, String>();
	}

    public void setFile(int indx, FormFile file) {
      //  if (file.getFileName().trim().length() == 0) return;
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
	public HashMap<Integer, FormFile> getFormFiles() {
        return formFiles;
	}
    
    public void setTitle(String title) {
        this.title = title;
    }

    public String getTitle() {
        return title;
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
	public HashMap<Integer, String> getFormNotes() {
        return formNotes;
	}

    /** the mapped.properties strings should go into a properties file?? **/
    @Override
    public ActionErrors validate(ActionMapping mapping, 
        HttpServletRequest request) { 
        ActionErrors errors = new ActionErrors();

        ModuleConfig mc = (ModuleConfig) request.getAttribute(Globals.MODULE_KEY);
        String maxFileSize = mc.getControllerConfig().getMaxFileSize();
        Boolean maxLengthExceeded = (Boolean) request.getAttribute(
                    MultipartRequestHandler.ATTRIBUTE_MAX_LENGTH_EXCEEDED);

        if (maxLengthExceeded != null && maxLengthExceeded.booleanValue()) {
            errors.add(ActionErrors.GLOBAL_MESSAGE, 
            new ActionMessage("mapped.properties", "file upload is larger than the allowed " +
                maxFileSize, "(total for all files) contact us for further instructions")); 
            return errors;
        }

        Iterator<Integer> it = formFiles.keySet().iterator();
        while (it.hasNext()) {
            Integer i = it.next();
            if (formFiles.get(i).getFileName().trim().length() == 0 && 
                  formNotes.get(i).trim().length() == 0) {
                it.remove();
                formNotes.remove(i);
            }
        }
        
        if (formFiles.size() == 0) {
              errors.add(ActionErrors.GLOBAL_MESSAGE, 
              new ActionMessage("mapped.properties", "file not found", "select a file for upload")); 
              return errors;        
        }
        
        for (Integer i : formFiles.keySet()) {
          if (formFiles.get(i) == null) {
              errors.add(ActionErrors.GLOBAL_MESSAGE, 
              new ActionMessage("mapped.properties", "file not found", "select a file for upload")); 
              return errors;
          }
  
          if (formFiles.get(i).getFileName() == null || formFiles.get(i).getFileName().trim().length() == 0) {
              errors.add(ActionErrors.GLOBAL_MESSAGE, 
              new ActionMessage("mapped.properties", "file not found", "select a file for upload")); 
          }
        }

        if (getTitle() == null || getTitle().trim().length() == 0) {
            errors.add(ActionErrors.GLOBAL_MESSAGE, 
            new ActionMessage("mapped.properties", "no title", "please add a title")); 
        }
    
        if (getTitle().trim().length() > 4000) {
            errors.add(ActionErrors.GLOBAL_MESSAGE, 
            new ActionMessage("mapped.properties", "title is too long (" + 
                getTitle().trim().length() + " characters)", 
                "please add a title no longer than 4000 characters (including spaces)")); 
        }

        for (Integer i : formNotes.keySet()) {
            if (formFiles.get(i) == null) continue;
            if (formNotes.get(i) == null || formNotes.get(i).trim().length() == 0) {
                errors.add(ActionErrors.GLOBAL_MESSAGE, 
                new ActionMessage("mapped.properties", "no description", "please add a description")); 
            }
        
            if (formNotes.get(i) != null && formNotes.get(i).trim().length() > 4000) {
                errors.add(ActionErrors.GLOBAL_MESSAGE, 
                new ActionMessage("mapped.properties", "description is too long (" + 
                    formNotes.get(i).trim().length() + " characters)", 
                    "please add a description no longer than 4000 characters (including spaces)")); 
            }
        }    
        return errors; 
    }

    @Override
	public void reset(ActionMapping mapping, HttpServletRequest request) {
		file = null;
	}

}
/**
validation:
    Notes <= 4000 chars
    filename <= 255 chars

**/
