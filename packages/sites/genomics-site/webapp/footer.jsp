<?xml version="1.0" encoding="UTF-8"?>
<jsp:root version="2.0"
    xmlns:jsp="http://java.sun.com/JSP/Page"
    xmlns:imp="urn:jsptagdir:/WEB-INF/tags/imp">
  <jsp:directive.page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"/>

    <!-- There are 5 closing div tags, even though header.jsp only creaates 4. -->
    <!-- In gbrowse, there appears to be an imbalanced tag, so we're compensating here. -->
  <![CDATA[</div></div></div></div></div>]]>
  <imp:dialogs/>
  <imp:footer refer="gbrowse"/>
  <![CDATA[</body></html>]]>

</jsp:root>
