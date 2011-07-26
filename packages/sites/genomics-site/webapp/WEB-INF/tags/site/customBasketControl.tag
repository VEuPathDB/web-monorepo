<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="bean" uri="http://jakarta.apache.org/struts/tags-bean" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<%-- get the current record class --%>
<c:set var="wdkStep" value="${requestScope.wdkStep}" />
<c:if test="${wdkStep == null}">
  <c:set var="baskets" value="${requestScope.baskets}" />
  <c:set var="wdkStep" value="${baskets[0]}" />
</c:if>
<c:set var="rcName" value="${wdkStep.answerValue.recordClass.fullName}" />

<%-- export basket to EuPathDB --%>
<c:set var="projectId" value="${applicationScope.wdkModel.projectId}" />
<c:if test="${projectId != 'EuPathDB'}">
  <input type="button" value="Export to EuPathDB" onclick="exportBasket('EuPathDB', '${rcName}')" />
</c:if>

