<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<%@ attribute name="displayValue"
              required="true"
              description="column value to be updated, passed from wdkAttribute"
%>

<c:choose>
<c:when test="${displayValue eq 'Y'}">
  <imp:image src="wdk/images/checkY-2.png" width="20px" />
</c:when>
<c:when test="${displayValue eq 'N'}">
  <imp:image src="wdk/images/checkN-2.png" width="20px" />
</c:when>
<c:otherwise>
  <wdk:updateDisplayValue displayValue = "${displayValue}" /> 
</c:otherwise>
</c:choose>
