<%@ page contentType="text/xml" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<c:set value="${requestScope.wdkRecord}" var="wdkRecord" />
<c:set var="tbl" value="${wdkRecord.tables['CountryCount']}" />

<countrys>
  <c:forEach var="row" items="${tbl}" >
    <country>
    <name>${row['country'].value}</name>
    <count>${row['count'].value}</count>
    </country>
  </c:forEach>
</countrys>
