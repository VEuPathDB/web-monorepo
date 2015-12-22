<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="pg" uri="http://jsptags.com/tags/navigation/pager" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>

<%@ attribute name="attributeValue"
              type="org.gusdb.wdk.model.record.attribute.AttributeValue"
              required="true"
              description="the attribute value to be rendered."
%>

<%@ attribute name="truncate"
              required="false"
              description="truncate the result"
%>

<%@ attribute name="recordName"
              required="false"
              description="The full name of the record class, to be used to render primary key attribute"
%> 

<c:set var="toTruncate" value="${truncate != null && truncate == 'true'}" />
<c:set var="attributeField" value="${attributeValue.attributeField}" />
<c:set var="align" value="align='${attributeField.align}'" />
<c:set var="nowrap">
  <c:if test="${attributeField.nowrap}">white-space:nowrap;</c:if>
</c:set>
<c:set var="displayValue">
  <c:choose>
    <c:when test="${toTruncate}">${attributeValue.briefDisplay}</c:when>
    <c:otherwise>${attributeValue.value}</c:otherwise>
  </c:choose>
</c:set>
<c:if test="${displayValue eq 'Y' || displayValue eq 'N' }">
  <c:set var="align" value="align='center'" />
</c:if>

<td style="padding:2px;vertical-align:middle">
  <div class="attribute-summary" ${align} style="${nowrap}padding:3px 2px">   
  <!-- need to know if fieldVal should be hot linked -->
  <c:choose>

    <c:when test="${displayValue == null || fn:length(displayValue) == 0}">
      <span style="color:gray;">N/A</span>
    </c:when>

   <c:when test="${displayValue eq 'Y'}">
      <imp:image src="wdk/images/checkY-2.png" width="20px" />
    </c:when>
   <c:when test="${displayValue eq 'N'}">
      <imp:image src="wdk/images/checkN-2.png" width="20px" />
    </c:when>

    <c:when test="${attributeValue.class.name eq 'org.gusdb.wdk.model.record.attribute.PrimaryKeyAttributeValue'}">
      <!-- store the primary key pairs here - used by basket link -->
      <div class="primaryKey" fvalue="${briefValue}" style="display:none;">
        <c:forEach items="${attributeValue.values}" var="pkValue">
          <span key="${pkValue.key}">${pkValue.value}</span>
        </c:forEach>
      </div>

      <!-- display a link to record page -->
      <imp:recordLink
        primaryKeyAttributeValue="${attributeValue}"
        recordName="${recordName}"
      />
    </c:when>

    <c:when test="${attributeValue.class.name eq 'org.gusdb.wdk.model.record.attribute.LinkAttributeValue'}">
      <c:set var="target">
        <c:if test="${attributeField.newWindow}">target="_blank"</c:if>
      </c:set>
      <a ${target} href="${attributeValue.url}">${attributeValue.displayText}</a>
    </c:when>
    <c:otherwise>
      ${displayValue}
    </c:otherwise>
  </c:choose>

</div>
</td>
