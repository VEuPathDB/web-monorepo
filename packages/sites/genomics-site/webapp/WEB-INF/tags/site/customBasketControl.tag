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
<c:set var="recordClass" value="${wdkStep.answerValue.recordClass}" />
<c:set var="projectId" value="${applicationScope.wdkModel.projectId}" />

<%-- export basket --%>
<div id="export-basket">
  Export ${recordClass.type} basket to:
  <select id="to-project">
    <c:choose>
      <c:when test="${project == 'EuPathDB'}">
        <option value="AmoebaDB" selected="selected">AmoebaDB</option>
        <option value="CryptoDB">CryptoDB</option>
        <option value="GiardiaDB">GiardiaDB</option>
        <option value="MicrosporidiaDB">MicrosporidiaDB</option>
        <option value="PlasmoDB">PlasmoDB</option>
        <option value="ToxoDB">ToxoDB</option>
        <option value="TrichDB">TrichDB</option>
        <option value="TriTrypDB">TriTrypDB</option>
      </c:when>
      <c:otherwise>
        <option value="EuPathDB" selected="selected">EuPathDB</option>
      </c:otherwise>
    </c:choose>
  </select>
  <input type="button" value="Export" onclick="exportBasket('${recordClass.fullName}')" />
</div>

