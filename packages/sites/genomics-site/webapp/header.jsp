<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<c:set var="props" value="${applicationScope.wdkModel.properties}" />
<c:set var="project" value="${props['PROJECT_ID']}" />

<c:set var="ftype" value="Error Page"/>
<c:if test="${!empty param.ftype}">
  <c:set var="ftype" value="${param.ftype} Files"/>
</c:if>

<%-- used by gbrowse and error pages directly, and by community files and download files pages via /html/include/fancy*IndexHeader.shtml ----%>
<imp:header banner="${project} ${ftype}" />

