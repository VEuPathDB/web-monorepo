package org.apidb.apicommon.controller;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;
import org.apache.struts.action.Action;
import org.apache.struts.action.ActionForm;
import org.apache.struts.action.ActionForward;
import org.apache.struts.action.ActionMapping;
import org.apache.struts.upload.FormFile;
import org.apidb.apicommon.model.userfile.UserFile;
import org.apidb.apicommon.model.userfile.UserFileFactory;
import org.gusdb.wdk.controller.CConstants;
import org.gusdb.wdk.controller.actionutil.ActionUtility;
import org.gusdb.wdk.model.jspwrap.UserBean;
import org.gusdb.wdk.model.jspwrap.WdkModelBean;

public class UserFileUploadAction extends Action {
    
  private Logger logger = Logger.getLogger(UserFileFactory.class);
  
  @Override
  public ActionForward execute(ActionMapping mapping,
                               ActionForm form,
                               HttpServletRequest request,
                               HttpServletResponse response) throws Exception {

    String referer = request.getParameter(CConstants.WDK_REFERRER_URL_KEY);
    if (referer == null) referer = request.getHeader("referer");

    int index = referer.lastIndexOf("/");
    referer = referer.substring(index);
    ActionForward forward = new ActionForward(referer, false);

    UserFileUploadForm cuForm = (UserFileUploadForm)form;
    HashMap<Integer, FormFile> formSet = cuForm.getFormFiles();
    HashMap<Integer, String> noteSet = cuForm.getFormNotes();

    for(Integer i : formSet.keySet()) {
      FormFile formFile = formSet.get(i);

      if (formFile == null) continue;
      
      String notes       = noteSet.get(i).trim();
      String title       = cuForm.getTitle().trim();
      String contentType = formFile.getContentType();
      String fileName    = formFile.getFileName();
      byte[] fileData    = formFile.getFileData();

      WdkModelBean wdkModel = ActionUtility.getWdkModel(servlet);
      UserBean user = ActionUtility.getUser(request);
      if (user == null || user.isGuest()) {
          return forward;
      }


      String email = user.getEmail().trim().toLowerCase();
      String userUID = user.getSignature().trim();
      String projectName = wdkModel.getDisplayName();
      String projectVersion = wdkModel.getVersion();        

      UserFile userFile = new UserFile(userUID);
      userFile.setFileName(fileName);
      userFile.setFileData(fileData);
      userFile.setContentType(contentType);
      userFile.setEmail(email);
      userFile.setUserUID(userUID);
      userFile.setTitle(title);
      userFile.setNotes(notes);
      userFile.setProjectName(projectName);
      userFile.setProjectVersion(projectVersion);

      UserFileFactoryManager.getUserFileFactory(getServlet().getServletContext()).addUserFile(userFile);
      
      logger.debug("contentType " + userFile.getContentType());
      logger.debug("fileName " + userFile.getFileName());
      logger.debug("notes " + userFile.getNotes());
      logger.debug("owner " + email);
      logger.debug("ownerUID " + userFile.getUserUID());
      logger.debug("projectName " + userFile.getProjectName());
      logger.debug("projectVersion " + userFile.getProjectVersion());
      
    }
    return new ActionForward("/communityUploadResult.jsp",true);
  }
}

