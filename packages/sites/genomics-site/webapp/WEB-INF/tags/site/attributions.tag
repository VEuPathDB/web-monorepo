<%-- 

display the attributions.

--%>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="bean" uri="http://jakarta.apache.org/struts/tags-bean" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>

<%@ attribute name="caption"
              required="true"
              description="the caption for the attribution section"
%>

<%@ attribute name="attributions"
              required="true"
              type="java.lang.String[]"
              description="an array of attribution objects"
%>
<c:catch var="error">

<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>
<c:set var="xqSet" value="${wdkModel.xmlQuestionSetsMap['XmlQuestions']}"/>
<c:set var="dataSourcesQuestion" value="${xqSet.questionsMap['Datasets']}"/>
<c:set var="dsRecords" value="${dataSourcesQuestion.fullAnswer.recordInstanceMap}"/>

<c:set var="attributionKey" value="" />
<c:set var="hasItem" value="${false}" />
<c:forEach var="attribution" items="${attributions}">
    <c:choose>
        <c:when test="${hasItem == false}">
            <c:set var="hasItem" value="${true}" />
        </c:when>
        <c:otherwise>
            <c:set var="attributionKey" value="${attributionKey}," />
        </c:otherwise>
    </c:choose>
    <c:set var="dsRecord" value="${dsRecords[attribution]}"/>
    <c:set var="attributionKey" value="${attributionKey}${attribution}" />

</c:forEach>


<c:if test="${hasItem}">
  <div class="group-title h3left" style="padding-bottom:1em">${caption}</div>

    <ul>
    <c:forEach var="attribution" items="${attributions}">
      <c:set var="dsRecord" value="${dsRecords[attribution]}"/>
      <c:if test="${dsRecord.attributesMap['resource'] ne null and dsRecord.attributesMap['category'] ne 'ignore'}">
        <li>
          <c:url var="dataSourceUrl"
                 value="/getDataset.do?display=detail&datasets=${attributionKey}&title=Query#" />
          <a href="${dataSourceUrl}${attribution}">
            ${dsRecord.attributesMap['resource']}
          </a>
        </li>
      </c:if>
    </c:forEach>
  </ul>
</c:if>

</c:catch>
<c:if test="${error != null}">
<div class="group-title" style="padding-bottom:1em">Data sources</div> <span style="color:red">Not available (Parsing Error)</span>
</c:if>
