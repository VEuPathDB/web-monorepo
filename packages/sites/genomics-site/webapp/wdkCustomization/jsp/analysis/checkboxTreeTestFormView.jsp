<?xml version="1.0" encoding="UTF-8"?>
<jsp:root version="2.0"
    xmlns:jsp="http://java.sun.com/JSP/Page"
    xmlns:imp="urn:jsptagdir:/WEB-INF/tags/imp">
  <jsp:directive.page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"/>
  <jsp:useBean id="idgen" class="org.gusdb.wdk.model.jspwrap.NumberUtilBean" scope="application" />
  <html>
    <body>
      <div style="text-align:center">
        <form>
          <div style="display:inline-block">
            <imp:checkboxTree rootNode="${viewModel}" id="myTree-${idgen.nextId}" checkboxName="myTree"/><br/>
            <input type="submit" value="Submit"/>
          </div>
        </form>
      </div>
    </body>
  </html>
</jsp:root>