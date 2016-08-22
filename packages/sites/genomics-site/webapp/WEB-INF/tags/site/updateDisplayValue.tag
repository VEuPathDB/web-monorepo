<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<%@ attribute name="displayValue"
              required="true"
              description="column value to be updated, passed from wdkAttribute"
%>
<%@ attribute name="columnName"
              required="false"
              description="name of the column"
%>

<c:choose>
<%-- transcript result dynamic column --%>
<c:when test="${columnName eq 'matched_result'}">
  <c:if test="${displayValue eq 'Y'}">
    <imp:image src="wdk/images/checkY-2.png" width="20px" />
  </c:if>
  <c:if test="${displayValue eq 'N'}">
     <imp:image src="wdk/images/checkN-2.png" width="20px" />
  </c:if>
</c:when>
<c:otherwise>
  <wdk:updateDisplayValue displayValue = "${displayValue}" /> 
</c:otherwise>

</c:choose>
