package org.apidb.apicommon.controller.action;

import javax.servlet.ServletInputStream;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.struts.action.Action;
import org.apache.struts.action.ActionForm;
import org.apache.struts.action.ActionForward;
import org.apache.struts.action.ActionMapping;
import org.gusdb.wdk.model.WdkUserException;

public class ExportCytoscapeNetworkAction extends Action {

  private static final String PARAM_TYPE = "type";
  private static final String PARAM_NAME = "name";

  @Override
  public ActionForward execute(ActionMapping mapping, ActionForm form,
      HttpServletRequest request, HttpServletResponse response)
      throws Exception {

    String type = request.getParameter(PARAM_TYPE);
    String name = request.getParameter(PARAM_NAME);

    if (type == null) {
      throw new WdkUserException("A type must be specified.");
    }

    if("xgmml".equals(type)) {
      response.setContentType("text/xml");
    }

    if("png".equals(type)) {
      response.setContentType("image/png");
    }

    response.setHeader("Content-disposition",
        "attachment; filename=\"" + name + "." + type + "\"");

    ServletInputStream in = request.getInputStream();
    ServletOutputStream out = response.getOutputStream();

    byte[] b = new byte[16384];

    int i = 0;
    while ((i = in.read(b)) != -1) {
      out.write(b, 0, i);
    }

    out.flush();
    out.close();

    return null;
  }
}
