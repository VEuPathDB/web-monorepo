<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>

<!-- get wdkRecord from proper scope -->
<c:set value="${requestScope.wdkRecord}" var="wdkRecord"/>

<!-- display page header with recordClass type in banner -->
<c:set value="${wdkRecord.recordClass.displayName}" var="recordName"/>
<imp:pageFrame banner="${recordName}">

<h2 style="text-align: center;">
<imp:recordPageBasketIcon />
</h2>

<%-- quick tool-box for the record --%>
<imp:recordToolbox />

<table width="100%">

  <!-- Added by Jerric - Display primary key content -->
  <c:set value="${wdkRecord.primaryKey}" var="primaryKey"/>
  <c:set var="pkValues" value="${primaryKey.values}" />
  <c:forEach items="${pkValues}" var="pkValue">
    <tr>
      <td><b>${pkValue.key}</b></td>
      <td>${pkValue.value}</td>
    </tr>
  </c:forEach>

  <c:forEach items="${wdkRecord.attributes}" var="attr">
    <tr>
      <td><b>${attr.value.displayName}</b></td>
      <td><c:set var="fieldVal" value="${attr.value.value}"/>
        <!-- need to know if fieldVal should be hot linked -->
        <c:choose>
          <c:when test="${fieldVal.class.name eq 'org.gusdb.wdk.model.record.attribute.LinkValue'}">
            <a href="${fieldVal.url}">${fieldVal.visible}</a>
          </c:when>
          <c:otherwise>
            <font class="fixed"><w:wrap size="60">${fieldVal}</w:wrap></font>
          </c:otherwise>
        </c:choose>
      </td>
    </tr>
  </c:forEach>
</table>

<!-- show all tables for record -->
<c:forEach items="${wdkRecord.tables}"  var="tblEntry">
  <imp:wdkTable tblName="${tblEntry.key}" isOpen="true"/>
</c:forEach>

</imp:pageFrame>
